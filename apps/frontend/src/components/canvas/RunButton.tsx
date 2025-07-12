import { memo, useCallback } from 'react';
import { useNodes, useEdges, useReactFlow } from '@xyflow/react';
import { FlowCompiler } from '../../../../backend/src/packages/compiler/src/FlowCompiler';
import blockTemplateService from '../services/blockTemplateService';
import { FlowNode, FlowEdge } from '../../../../backend/src/packages/compiler/src/types';
import { BlockFunctionTemplate } from '../services/blockTemplateService';
import { useConfig } from '../../contexts/ConfigContext';
import { OutputValueType } from '@/types/OutputTypes';
import { nodeUtils } from '@/utils/nodeUtils';

// Function imports
import { createFileFromUrl } from '../../utils/createFileFromUrl';
import { useSolanaOperations } from '../../hooks/useSolanaOperations';
import { uploadImageToPinata } from '../../ipfs/uploadImageToPinata';
import { uploadMetadataToPinata } from '../../ipfs/uploadMetadataToPinata';

interface RunButtonProps {
  onOutput: (output: string) => void;
  onCodeGenerated: (code: string) => void;
  onDebugGenerated: (debug: string) => void;
  selectedFunction: string;
}

export const RunButton = memo(({ onOutput, onCodeGenerated, onDebugGenerated, selectedFunction }: RunButtonProps) => {
  const nodes = useNodes() as FlowNode[];
  const edges = useEdges();
  const { apiKeys, network } = useConfig();
  const reactFlowInstance = useReactFlow();
  
  const { executeSolanaOperation } = useSolanaOperations();

  const handleRun = useCallback(() => {
    try {
      if (!selectedFunction) {
        onOutput('Error: Please select a function to run');
        return;
      }

      // Transform edges to the format expected by FlowCompiler
      const transformedEdges: FlowEdge[] = edges.map(edge => ({
        id: edge.id || `${edge.source}-${edge.target}`,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle || undefined,
        targetHandle: edge.targetHandle || undefined
      } as FlowEdge));

      // Get all nodes connected to the selected function
      const connectedNodes = new Set<string>();
      const nodesToProcess = [selectedFunction];

      while (nodesToProcess.length > 0) {
        const currentId = nodesToProcess.pop()!;
        connectedNodes.add(currentId);
        
        // Add source nodes (nodes that provide input)
        transformedEdges.forEach(edge => {
          if (edge.target === currentId && !connectedNodes.has(edge.source)) {
            connectedNodes.add(edge.source);
            nodesToProcess.push(edge.source);
          }
        });

        // Add target nodes (nodes that receive output)
        transformedEdges.forEach(edge => {
          if (edge.source === currentId && !connectedNodes.has(edge.target)) {
            connectedNodes.add(edge.target);
            nodesToProcess.push(edge.target);
          }
        });
      }

      // Filter nodes and edges to only include connected ones
      const relevantNodes = nodes.filter((node: FlowNode) => connectedNodes.has(node.id));
      const relevantEdges = transformedEdges.filter(edge => 
        connectedNodes.has(edge.source) && connectedNodes.has(edge.target)
      );

      // Generate debug info
      const debugInfo = {
        selectedFunction,
        nodes: relevantNodes.map(node => ({
          id: node.id,
          type: node.type,
          data: node.data,
          connections: {
            inputs: relevantEdges
              .filter(e => e.target === node.id)
              .map(e => ({
                from: e.source,
                type: relevantNodes.find(n => n.id === e.source)?.type,
                handleId: e.targetHandle
              })),
            outputs: relevantEdges
              .filter(e => e.source === node.id)
              .map(e => ({
                to: e.target,
                type: relevantNodes.find(n => n.id === e.target)?.type,
                handleId: e.sourceHandle
              }))
          }
        })),
        edges: relevantEdges.map(edge => ({
          from: {
            id: edge.source,
            type: relevantNodes.find(node => node.id === edge.source)?.type
          },
          to: {
            id: edge.target,
            type: relevantNodes.find(node => node.id === edge.target)?.type
          },
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle
        }))
      };

      // Update debug info
      onDebugGenerated(JSON.stringify(debugInfo, null, 2));

      // Get templates from service
      const templates: Record<string, BlockFunctionTemplate> = Object.entries(blockTemplateService.getTemplates()).reduce((acc, [_, template]) => {
        acc[template.metadata.name] = {
          metadata: { 
            name: template.metadata.name,
            description: template.metadata.description,
            blockCategory: template.metadata.blockCategory,
            blockType: template.metadata.blockType,
            parameters: template.metadata.parameters,
            requiredKeys: template.metadata.requiredKeys,
            output: template.metadata.output
          },
          execute: template.execute
        };
        return acc;
      }, {} as Record<string, BlockFunctionTemplate>);

      // Configure compiler options to not use imports
      const compilerOptions = {
        noImports: true
      };
      
      // Pass apiKeys and network to the FlowCompiler
      const compiler = new FlowCompiler(relevantNodes, relevantEdges, templates, apiKeys, network, compilerOptions);
      const { functionName, execute, functionCode, displayCode } = compiler.compile();
      
      // Update code tab with display version
      onCodeGenerated(displayCode);
      
      // Store execution results for updating node outputs (nodeId => result)
      const executionResults = new Map<string, OutputValueType>();
      
      // Prepare the function code by removing any import statements
      const cleanedFunctionCode = functionCode.replace(/import\s+.*?from\s+.*?;/g, '');
      
      // Execute the flow with function injection
      const executeWithContext = new Function(
        'executeSolanaOperation',
        'createFileFromUrl',
        'uploadImageToPinata',
        'uploadMetadataToPinata',
        'network',
        'updateNodeOutput',
        `
        return async function() {
          try {
            ${cleanedFunctionCode}
            
            return await ${functionName}Function();
          } catch (error) {
            console.error("Execution error:", error);
            return { output: "Execution Error: " + error.message };
          }
        }
      `)(
        executeSolanaOperation, 
        createFileFromUrl, 
        uploadImageToPinata, 
        uploadMetadataToPinata, 
        network,
        (nodeId: string, result: OutputValueType) => {
          if (nodeId && result) {
            executionResults.set(nodeId, result);
            
            // Find the node and update its output immediately
            const node = relevantNodes.find(n => n.id === nodeId);
            if (node) {
              nodeUtils.updateNodeOutput(
                node.id,
                node.data.output?.type || 'object',
                result,
                reactFlowInstance.setNodes
              );
            }
          }
        }
      );

      executeWithContext()
        .then((result: any) => {
          // Format the output by parsing and re-stringifying with proper spacing
          let formattedOutput;
          try {
            const parsed = JSON.parse(result.output);
            formattedOutput = JSON.stringify(parsed, null, 2);
          } catch {
            formattedOutput = result.output || JSON.stringify(result, null, 2);
          }
          
          onOutput(formattedOutput);
        })
        .catch((error: any) => {
          onOutput(`Execution Error: ${error.message}`);
        });
    } catch (error: any) {
      onOutput(`Compilation Error: ${error.message}`);
    }
  }, [nodes, edges, selectedFunction, onOutput, onCodeGenerated, onDebugGenerated, apiKeys, network, executeSolanaOperation, reactFlowInstance]);

  return (
    <button
      onClick={handleRun}
      disabled={!selectedFunction}
      className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg shadow-lg border transition-colors ${
        selectedFunction
          ? 'bg-[#1E1E1E] hover:bg-[#2D2D2D] border-[#333333]'
          : 'bg-[#1E1E1E] border-[#333333] opacity-50 cursor-not-allowed'
      }`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 2L12 8L4 14V2Z"
          fill={selectedFunction ? "#10B981" : "#6B7280"}
          stroke={selectedFunction ? "#10B981" : "#6B7280"}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      {/* Run */}
    </button>
  );
});

RunButton.displayName = 'RunButton';