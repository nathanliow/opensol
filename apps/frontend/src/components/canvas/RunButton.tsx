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
  selectedLabel: string;
}

const RunButton = memo(({ onOutput, onCodeGenerated, onDebugGenerated, selectedLabel }: RunButtonProps) => {
  const nodes = useNodes();
  const edges = useEdges();
  const { apiKeys } = useConfig();

  const handleRun = useCallback(() => {
    try {
      if (!selectedLabel) {
        onOutput('Error: Please select a label to run');
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
          
          // Find all string nodes connected to this GET node's parameters
          edges.forEach(edge => {
            if (edge.target === node.id && edge.targetHandle?.startsWith('param-')) {
              const sourceNode = nodes.find(n => n.id === edge.source);
              if (sourceNode?.type === 'STRING') {
                const paramName = edge.targetHandle.replace('param-', '');
                parameters[paramName] = sourceNode.data?.value || '';
              }
            }
          });

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

      // Filter out STRING nodes since we've already processed their values
      const nodesWithoutStrings = transformedNodes.filter(node => node.type !== 'STRING');
      const relevantEdges = transformedEdges.filter(edge => 
        nodesWithoutStrings.find(node => node.id === edge.source) && nodesWithoutStrings.find(node => node.id === edge.target)
      );

      // Get all nodes connected to the selected label
      const connectedNodes = new Set<string>();
      const nodesToProcess = [selectedLabel];

      while (nodesToProcess.length > 0) {
        const currentId = nodesToProcess.pop()!;
        connectedNodes.add(currentId);
        
        relevantEdges.forEach(edge => {
          if (edge.source === currentId && !connectedNodes.has(edge.target)) {
            connectedNodes.add(edge.target);
            nodesToProcess.push(edge.target);
          }
        });
      }

      // Filter nodes to only include connected ones
      const relevantNodes: FlowNode[] = transformedNodes.filter(node => connectedNodes.has(node.id)) as FlowNode[];

      // Generate debug info
      const debugInfo = {
        selectedLabel,
        nodes: relevantNodes.map(node => ({
          id: node.id,
          type: node.type,
          data: node.data,
          connections: {
            inputs: relevantEdges
              .filter(e => e.target === node.id)
              .map(e => ({
                from: e.source,
                type: nodesWithoutStrings.find(n => n.id === e.source)?.type,
                handleId: e.targetHandle
              })),
            outputs: relevantEdges
              .filter(e => e.source === node.id)
              .map(e => ({
                to: e.target,
                type: nodesWithoutStrings.find(n => n.id === e.target)?.type,
                handleId: e.sourceHandle
              }))
          }
        })),
        edges: relevantEdges.map(edge => ({
          from: {
            id: edge.source,
            type: nodesWithoutStrings.find(node => node.id === edge.source)?.type
          },
          to: {
            id: edge.target,
            type: nodesWithoutStrings.find(node => node.id === edge.target)?.type
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
  }, [nodes, edges, selectedLabel, onOutput, onCodeGenerated, onDebugGenerated, apiKeys]);

  return (
    <button
      onClick={handleRun}
      disabled={!selectedLabel}
      className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg shadow-lg border transition-colors ${
        selectedLabel
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
          fill={selectedLabel ? "#10B981" : "#6B7280"}
          stroke={selectedLabel ? "#10B981" : "#6B7280"}
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