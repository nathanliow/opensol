import { memo, useCallback } from 'react';
import { useNodes, useEdges } from '@xyflow/react';
import { FlowCompiler } from '../../../../backend/src/packages/compiler/src/FlowCompiler';
import blockTemplateService from '../services/blockTemplateService';
import { FlowNode, FlowEdge } from '../../../../backend/src/packages/compiler/src/types';
import { BlockTemplate } from '../services/blockTemplateService';
import { useConfig } from '../../contexts/ConfigContext';

interface RunButtonProps {
  onOutput: (output: string) => void;
  onCodeGenerated: (code: string) => void;
  onDebugGenerated: (debug: string) => void;
  selectedFunction: string;
}

const RunButton = memo(({ onOutput, onCodeGenerated, onDebugGenerated, selectedFunction }: RunButtonProps) => {
  const nodes = useNodes();
  const edges = useEdges();
  const { apiKeys } = useConfig();

  const handleRun = useCallback(() => {
    try {
      if (!selectedFunction) {
        onOutput('Error: Please select a function to run');
        return;
      }
      // Transform nodes to the format expected by FlowCompiler
      const transformedNodes: FlowNode[] = nodes.map(node => {
        if (!node.type) {
          throw new Error('Node type is undefined');
        }
        
        // For GET nodes, process string inputs and add API key
        if (node.type === 'GET') {
          const parameters: any = node.data?.parameters || {};
          // Add Helius API key to parameters
          parameters.apiKey = apiKeys['helius'] || '';
          
          return {
            id: node.id,
            type: node.type,
            position: node.position,
            data: {
              ...node.data,
              parameters
            }
          };
        }

        // For CONST nodes, ensure proper data structure
        if (node.type === 'CONST') {
          return {
            id: node.id,
            type: node.type,
            position: node.position,
            data: {
              dataType: node.data?.dataType || 'string',
              value: node.data?.value
            }
          };
        }

        // For other nodes, pass through as is
        return {
          id: node.id,
          type: node.type,
          position: node.position,
          data: {
            ...node.data,
            parameters: node.data?.parameters || {}
          }
        };
      });

      // Transform edges to the format expected by FlowCompiler
      const transformedEdges: FlowEdge[] = edges.map(edge => ({
        id: edge.id || `${edge.source}-${edge.target}`,
        source: edge.source || '',
        target: edge.target || '',
        sourceHandle: edge.sourceHandle || '',
        targetHandle: edge.targetHandle || ''
      }));

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
      const relevantNodes = transformedNodes.filter(node => connectedNodes.has(node.id));
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
      const templates: Record<string, BlockTemplate> = Object.entries(blockTemplateService.getTemplates()).reduce((acc, [_, template]) => {
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
      }, {} as Record<string, BlockTemplate>);

      // Compile and execute the flow
      console.log('relevantNodes', relevantNodes);
      console.log('relevantEdges', relevantEdges);
      const compiler = new FlowCompiler(relevantNodes, relevantEdges, templates);
      const { execute, functionCode, displayCode } = compiler.compile();
      
      // Update code tab with display version
      onCodeGenerated(displayCode);
      
      // Execute the flow with actual API key
      const executeWithContext = new Function(`
        return async function() {
          ${functionCode}
          return await execute();
        }
      `)();

      executeWithContext()
        .then((result: any) => {
          onOutput(`Result: ${JSON.stringify(result.output, null, 2)}`);
        })
        .catch((error: any) => {
          onOutput(`Execution Error: ${error.message}`);
        });
    } catch (error: any) {
      onOutput(`Compilation Error: ${error.message}`);
    }
  }, [nodes, edges, selectedFunction, onOutput, onCodeGenerated, onDebugGenerated, apiKeys]);

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

export default RunButton;