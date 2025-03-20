import { memo, useCallback, useState, useMemo } from 'react';
import { useEdges, useNodes } from '@xyflow/react';
import TemplateNode from './TemplateNode';
import { InputDefinition } from '../../types/InputTypes';
import { nodeTypesData } from '../../types/NodeTypes';
import blockTemplateService from '../services/blockTemplateService';
import { CustomHandle } from '../../types/HandleTypes';
import { useConfig } from '../../contexts/ConfigContext';

interface GetNodeData {
  label: string;
  selectedFunction?: string;
  parameters?: Record<string, string>;
}

interface GetNodeProps {
  id: string;
  data: GetNodeData;
}

const GetNode = memo(({ id, data }: GetNodeProps) => {
  const [selectedFunction, setSelectedFunction] = useState<string>(data.selectedFunction || '');
  const [parameters, setParameters] = useState<Record<string, string>>(data.parameters || {});
  const blockTemplates = blockTemplateService.getTemplatesByType('GET');
  const edges = useEdges();
  const nodes = useNodes();
  const { network, getApiKey } = useConfig();
  
  const nodeType = nodeTypesData['GET'];
  const backgroundColor = nodeType?.backgroundColor || 'bg-[#2563EB]';
  const borderColor = nodeType?.borderColor || 'border-gray-700';
  const primaryColor = nodeType?.primaryColor || 'blue-500';
  const secondaryColor = nodeType?.secondaryColor || 'blue-700';
  const textColor = nodeType?.textColor || 'text-gray-200';

  const getConnectedValue = useCallback((paramName: string) => {
    const edge = edges.find(e => 
      e.target === id && 
      e.targetHandle === `param-${paramName}`
    );
    
    if (!edge) return null;
    const sourceNode = nodes.find(n => n.id === edge.source);
    if (!sourceNode) return null;
    
    // Support both STRING and CONST nodes
    if (sourceNode.type === 'STRING') {
      return sourceNode.data.value || null;
    } else if (sourceNode.type === 'CONST') {
      return sourceNode.data.value !== undefined ? sourceNode.data.value : null;
    }
    return null;
  }, [edges, id, nodes]);

  const handleFunctionChange = useCallback((value: string) => {
    setSelectedFunction(value);
    
    // Initialize parameters
    const newParameters: Record<string, string> = {};
    
    // Add Helius API key if this is getUserSolBalance
    if (value === 'getUserSolBalance') {
      const apiKey = getApiKey('helius');
      if (apiKey) {
        newParameters['apiKey'] = apiKey;
      }
      // Also set the network parameter
      newParameters['network'] = network;
    }
    
    setParameters(newParameters);
    // Update node data
    data.selectedFunction = value;
    data.parameters = newParameters;
  }, [data, getApiKey, network]);

  const handleParameterChange = useCallback((paramName: string, value: string) => {
    const newParameters = { ...parameters };
    
    // Add Helius API key if this is a GET node that requires it
    if (selectedFunction === 'getUserSolBalance' && paramName === 'address') {
      const apiKey = getApiKey('helius');
      if (apiKey) {
        newParameters['apiKey'] = apiKey;
      }
      // Also ensure network is set
      newParameters['network'] = network;
    }
    
    newParameters[paramName] = value;
    setParameters(newParameters);
    // Update node data
    data.parameters = newParameters;
  }, [parameters, data, selectedFunction, getApiKey, network]);

  const currentTemplate = selectedFunction ? blockTemplates.find(t => t.metadata.name === selectedFunction) : null;

  // Convert function options into dropdown options
  const functionOptions = useMemo(() => {
    return [
      { value: '', label: 'Select Function' },
      ...blockTemplates.map(template => ({
        value: template.metadata.name,
        label: template.metadata.name
      }))
    ];
  }, [blockTemplates]);

  // Create dynamic inputs based on selected function
  const inputs: InputDefinition[] = useMemo(() => {
    const baseInputs: InputDefinition[] = [{
      id: 'function',
      label: 'Function',
      type: 'dropdown',
      options: functionOptions,
      defaultValue: selectedFunction
    }];
    
    if (currentTemplate) {
      const paramInputs = currentTemplate.metadata.parameters
        .filter(param => param.name !== 'apiKey') // Skip API key parameter
        .map(param => ({
          id: param.name,
          label: param.name,
          type: 'text' as const,
          defaultValue: parameters[param.name] || '',
          description: param.description,
          getConnectedValue: () => getConnectedValue(param.name),
          handleId: `param-${param.name}`,
        }));
      return [...baseInputs, ...paramInputs];
    }
    
    return baseInputs;
  }, [currentTemplate, functionOptions, parameters, selectedFunction, getConnectedValue]);

  const handleInputChange = useCallback((inputId: string, value: any) => {
    if (inputId === 'function') {
      handleFunctionChange(value);
    } else {
      handleParameterChange(inputId, value);
    }
  }, [handleFunctionChange, handleParameterChange]);

  // Define custom handles
  const customHandles: CustomHandle[] = useMemo(() => ([
    { type: 'target', position: 'top', id: 'top-target' },
    { type: 'source', position: 'bottom', id: 'bottom-source' }
  ]), []);

  return (
    <TemplateNode
      id={id}
      title="GET"
      backgroundColor={backgroundColor}
      borderColor={borderColor}
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
      textColor={textColor}
      inputs={inputs}
      data={data}
      onInputChange={handleInputChange}
      customHandles={customHandles}
    />
  );
});

GetNode.displayName = 'GetNode';

export default GetNode;