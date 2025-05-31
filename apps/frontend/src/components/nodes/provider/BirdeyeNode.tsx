import { useCallback, useState, useMemo, useEffect } from 'react';
import { useEdges, useNodes, useReactFlow } from '@xyflow/react';
import TemplateNode from '../TemplateNode';
import { InputDefinition, createInputDefinition } from '../../../types/InputTypes';
import { nodeTypes } from '../../../types/NodeTypes';
import blockTemplateService from '../../services/blockTemplateService';
import { useConfig } from '../../../contexts/ConfigContext';
import { OutputDefinition } from '@/types/OutputTypes';
import { nodeUtils } from '@/utils/nodeUtils';
import { FlowNode } from '../../../../../backend/src/packages/compiler/src/types';

interface BirdeyeNodeProps {
  id: string;
}

export default function BirdeyeNode({ id }: BirdeyeNodeProps) {
  const { setNodes } = useReactFlow();
  const [selectedFunction, setSelectedFunction] = useState<string>('');
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const blockFunctionTemplates = blockTemplateService.getTemplatesByType('BIRDEYE');
  const edges = useEdges();
  const nodes = useNodes() as FlowNode[];
  const { network } = useConfig();

  useEffect(() => {
    const nodeData = nodeUtils.getNodeData(nodes, id);
    const existingFunction = nodeData.inputs?.function?.value;
    
    if (existingFunction && typeof existingFunction === 'string' && existingFunction !== selectedFunction) {
      setSelectedFunction(existingFunction);
      
      // Initialize parameters from existing node data
      const newParameters: Record<string, string> = { 
        network: String(nodeData.inputs?.network?.value || network || 'devnet')
      };
      
      const functionTemplate = blockFunctionTemplates.find(t => t.metadata.name === existingFunction);
      if (functionTemplate) {
        functionTemplate.metadata.parameters.forEach((param) => {
          const existingValue = nodeData.inputs?.[param.name]?.value;
          if (existingValue) {
            newParameters[param.name] = String(existingValue);
          }
        });
      }
      
      setParameters(newParameters);
    }
  }, [nodes, id, selectedFunction, blockFunctionTemplates, network]);

  const handleFunctionChange = useCallback((value: string) => {
    setSelectedFunction(value);
    const newParameters: Record<string, string> = { 
      network: network || 'devnet'  
    }; 
    setParameters(newParameters);

    // Update node data
    nodeUtils.updateNodeInput(id, 'function', 'input-function', 'string', value, setNodes);
    nodeUtils.updateNodeInput(id, 'network', 'input-network', 'string', network || 'devnet', setNodes);
    const functionTemplate = blockFunctionTemplates.find(t => t.metadata.name === value);
    if (functionTemplate) {
      functionTemplate.metadata.parameters.forEach((param) => {
        nodeUtils.updateNodeInput(id, param.name, `input-${param.name}`, 'string', '', setNodes);
      });
    }
  }, [network, id, setNodes, blockFunctionTemplates]);

  const handleParameterChange = useCallback((inputId: string, value: string, fromConnection: boolean = false) => {
    // Extract the actual parameter name
    const paramMatch = inputId.match(/^input-(.+)$/);
    if (paramMatch) {
      const actualParamName = paramMatch[1];
      
      const newParameters: Record<string, string> = { 
        ...parameters, 
        network: network || 'devnet',
        [actualParamName]: value
      };
      
      setParameters(newParameters);
      
      // Update node data using nodeUtils
      nodeUtils.updateNodeInput(id, actualParamName, inputId, 'string', value, setNodes);
    }
  }, [parameters, network, id, setNodes]);

  // Convert function options into dropdown options
  const functionOptions = useMemo(() => {
    return [
      { value: '', label: 'Select Function' },
      ...blockFunctionTemplates.map(functionTemplate => ({
        value: functionTemplate.metadata.name,
        label: functionTemplate.metadata.name
      }))
    ];
  }, [blockFunctionTemplates]);

  // Create dynamic inputs based on selected function
  const inputs: InputDefinition[] = useMemo(() => {
    // Base function dropdown
    const baseInputs: InputDefinition[] = [
      createInputDefinition.dropdown({
        id: 'input-function',
        label: 'Function',
        options: functionOptions,
        defaultValue: selectedFunction,
        searchable: true
      })
    ];
    
    if (selectedFunction) {
      const functionTemplate = blockFunctionTemplates.find(t => t.metadata.name === selectedFunction);
      if (functionTemplate) {
        const paramInputs = functionTemplate.metadata.parameters
          .filter(param => param.name !== 'apiKey' && param.name !== 'network')
          .map(param => {
            // Check the parameter type and create appropriate input
            if (param.type === 'dropdown' && param.options) {
              return createInputDefinition.dropdown({
                id: `input-${param.name}`,
                label: param.name,
                defaultValue: parameters[param.name] || param.defaultValue || '',
                description: param.description,
                options: param.options.map(option => ({ value: option, label: option })),
                getConnectedValue: nodeUtils.createConnectionGetter(edges, nodes, id, param.name),
                handleId: `input-${param.name}`,
              });
            } else if (param.type === 'number') {
              return createInputDefinition.number({
                id: `input-${param.name}`,
                label: param.name,
                defaultValue: parameters[param.name] || param.defaultValue || 0,
                description: param.description,
                getConnectedValue: nodeUtils.createConnectionGetter(edges, nodes, id, param.name),
                handleId: `input-${param.name}`,
              });
            } else {
              return createInputDefinition.text({
                id: `input-${param.name}`,
                label: param.name,
                defaultValue: parameters[param.name] || param.defaultValue || '',
                description: param.description,
                getConnectedValue: nodeUtils.createConnectionGetter(edges, nodes, id, param.name),
                handleId: `input-${param.name}`,
              });
            }
          });
          
        return [...baseInputs, ...paramInputs];
      }
    }
    
    return baseInputs;
  }, [blockFunctionTemplates, selectedFunction, parameters, functionOptions, edges, nodes, id]);

  // Get output type from selected template
  const output: OutputDefinition = useMemo(() => {
    if (selectedFunction) {
      const functionTemplate = blockFunctionTemplates.find(t => t.metadata.name === selectedFunction);
      if (functionTemplate?.metadata.output) {
        return {
          id: 'output',
          label: 'Result',
          type: functionTemplate.metadata.output.type as any,
          description: functionTemplate.metadata.output.description
        };
      }
    }
    return {
      id: 'output',
      label: 'Result',
      type: 'object',
      description: 'Birdeye API result'
    };
  }, [selectedFunction, blockFunctionTemplates]);

  return (
    <TemplateNode
      id={id}
      metadata={nodeTypes['BIRDEYE'].metadata}
      inputs={inputs}
      data={nodeUtils.getNodeData(nodes, id)}
      onInputChange={(inputId, value, fromConnection) => {
        if (inputId === 'input-function') {
          handleFunctionChange(value);
        } else {
          handleParameterChange(inputId, value, fromConnection);
        }
      }}
      output={output}
    />
  );
}
