import { useCallback, useMemo, useState, useEffect } from 'react';
import { useNodes, useReactFlow, useEdges } from '@xyflow/react';
import TemplateNode from '../TemplateNode';
import { InputDefinition, InputValueTypeString, createInputDefinition } from '../../../types/InputTypes';
import { nodeTypes } from '../../../types/NodeTypes';
import { CustomHandle } from '../../../types/HandleTypes';
import { OutputDefinition } from '@/types/OutputTypes';
import { nodeUtils } from '@/utils/nodeUtils';
import { FlowNode } from '../../../../../backend/src/packages/compiler/src/types';
import SearchableDropdown from '../../ui/SearchableDropdown';

interface ConditionalNodeProps {
  id: string;
}

// Common condition operators
const CONDITION_OPERATORS = [
  { value: '>', label: '> (Greater than)' },
  { value: '<', label: '< (Less than)' },
  { value: '>=', label: '>= (Greater than or equal)' },
  { value: '<=', label: '<= (Less than or equal)' },
  { value: '===', label: '=== (Equal to)' },
  { value: '!==', label: '!== (Not equal to)' },
  { value: '&&', label: '&& (And)' },
  { value: '||', label: '|| (Or)' },
  { value: 'includes', label: 'includes (Contains)' },
  { value: 'startsWith', label: 'startsWith (Starts with)' },
  { value: 'endsWith', label: 'endsWith (Ends with)' },
];

const DATA_TYPE_OPTIONS = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
];

const ConditionalNode = ({ id }: ConditionalNodeProps) => {
  const { setNodes } = useReactFlow();
  const nodes = useNodes() as FlowNode[];
  const edges = useEdges();
  
  // Get initial values from node data
  const nodeData = nodeUtils.getNodeData(nodes, id);
  const [xValue, setXValue] = useState(String(nodeData.inputs.x?.value || ''));
  const [xType, setXType] = useState(String(nodeData.inputs.xType?.value || 'string'));
  const [yValue, setYValue] = useState(String(nodeData.inputs.y?.value || ''));
  const [yType, setYType] = useState(String(nodeData.inputs.yType?.value || 'string'));

  // Check if inputs are connected
  const isXConnected = nodeUtils.isInputConnectedInFlow(edges, id, 'input-x');
  const isYConnected = nodeUtils.isInputConnectedInFlow(edges, id, 'input-y');

  // Get connected values
  const connectedXValue = nodeUtils.getConnectedValueById(edges, nodes, id, 'x');
  const connectedYValue = nodeUtils.getConnectedValueById(edges, nodes, id, 'y');

  // Sync state with node data changes and connected values
  useEffect(() => {
    const currentNodeData = nodeUtils.getNodeData(nodes, id);
    
    // Use connected values if available, otherwise use stored values
    const newXValue = isXConnected && connectedXValue !== null 
      ? String(connectedXValue) 
      : String(currentNodeData.inputs.x?.value || '');
    const newYValue = isYConnected && connectedYValue !== null 
      ? String(connectedYValue) 
      : String(currentNodeData.inputs.y?.value || '');
    
    setXValue(newXValue);
    setXType(String(currentNodeData.inputs.x?.type || 'string'));
    setYValue(newYValue);
    setYType(String(currentNodeData.inputs.y?.type || 'string'));
  }, [nodes, edges, id, isXConnected, isYConnected, connectedXValue, connectedYValue]);

  const handleVariableChange = useCallback((variable: string, value: string) => {
    // Don't update if connected
    if ((variable === 'x' && isXConnected) || (variable === 'y' && isYConnected)) {
      return;
    }
    
    nodeUtils.updateNodeInput(id, variable, `input-${variable}`, undefined, value, setNodes);
    if (variable === 'x') {
      setXValue(value);
    } else if (variable === 'y') {
      setYValue(value);
    }
  }, [id, setNodes, isXConnected, isYConnected]);

  const handleTypeChange = useCallback((variable: string, value: string) => {
    nodeUtils.updateNodeInput(id, variable, `input-${variable}`, value as InputValueTypeString, undefined, setNodes);
    if (variable === 'x') {
      setXType(value);
    } else if (variable === 'y') {
      setYType(value);
    }
  }, [id, setNodes]);

  const handleOperatorChange = useCallback((value: string) => {
    nodeUtils.updateNodeInput(id, 'operator', 'input-operator', 'string', value, setNodes);
  }, [id, setNodes]);

  // Custom component for Variable X with type dropdown and connection display
  const VariableXComponent = useMemo(() => (
    <div className="flex gap-2 w-full items-center">
      <div className="flex-1 relative">
        <input
          type="text"
          value={xValue}
          onChange={(e) => handleVariableChange('x', e.target.value)}
          disabled={isXConnected}
          className={`w-full p-1 text-xs rounded-md border text-black min-w-0 ${
            isXConnected ? 'opacity-0' : 'bg-white border-gray-300'
          }`}
          placeholder="Enter value"
        />
        {isXConnected && (
          <div className="absolute inset-0 flex items-center px-1 text-xs text-black bg-blue-50/30 rounded-md border border-blue-200/50 truncate">
            {String(xValue)}
          </div>
        )}
      </div>
      <div className="w-24 flex-shrink-0">
        <SearchableDropdown
          value={xType}
          onChange={(value) => handleTypeChange('x', value)}
          options={DATA_TYPE_OPTIONS}
          placeholder="Type"
          searchable={false}
          clearable={false}
        />
      </div>
    </div>
  ), [xValue, xType, handleVariableChange, handleTypeChange, isXConnected]);

  // Custom component for Variable Y with type dropdown and connection display
  const VariableYComponent = useMemo(() => (
    <div className="flex gap-2 w-full items-center">
      <div className="flex-1 relative">
        <input
          type="text"
          value={yValue}
          onChange={(e) => handleVariableChange('y', e.target.value)}
          disabled={isYConnected}
          className={`w-full p-1 text-xs rounded-md border text-black min-w-0 ${
            isYConnected ? 'opacity-0' : 'bg-white border-gray-300'
          }`}
          placeholder="Enter value"
        />
        {isYConnected && (
          <div className="absolute inset-0 flex items-center px-1 text-xs text-black bg-blue-50/30 rounded-md border border-blue-200/50 truncate">
            {String(yValue)}
          </div>
        )}
      </div>
      <div className="w-24 flex-shrink-0">
        <SearchableDropdown
          value={yType}
          onChange={(value) => handleTypeChange('y', value)}
          options={DATA_TYPE_OPTIONS}
          placeholder="Type"
          searchable={false}
          clearable={false}
        />
      </div>
    </div>
  ), [yValue, yType, handleVariableChange, handleTypeChange, isYConnected]);

  const inputs: InputDefinition[] = useMemo(() => [
    // Variable X with inline type dropdown
    createInputDefinition.text({
      id: 'input-x',
      label: 'Variable X',
      description: 'First value to compare',
      placeholder: 'Connect or enter value',
      defaultValue: '',
      component: VariableXComponent,
      getConnectedValue: nodeUtils.createConnectionGetter(edges, nodes, id, 'x'),
    }),
    createInputDefinition.dropdown({
      id: 'input-operator',
      label: 'Condition',
      description: 'Comparison operator',
      options: CONDITION_OPERATORS,
      placeholder: 'Select operator...',
      defaultValue: '>',
      required: true,
    }),
    // Variable Y with inline type dropdown
    createInputDefinition.text({
      id: 'input-y',
      label: 'Variable Y',
      description: 'Second value to compare',
      placeholder: 'Connect or enter value',
      defaultValue: '',
      component: VariableYComponent,
      getConnectedValue: nodeUtils.createConnectionGetter(edges, nodes, id, 'y'),
    }),
  ], [VariableXComponent, VariableYComponent, edges, nodes, id]);

  const output: OutputDefinition = {
    id: 'output',
    label: 'Output',
    type: 'any',
    description: 'Result of the conditional execution'
  };

  // Define custom handles for the then/else branches with proper spacing
  const customHandles: CustomHandle[] = useMemo(() => [
    {
      id: 'flow-then',
      label: 'Then',
      description: 'Execute when condition is true',
      position: 'bottom',
      type: 'source',
      offsetY: -10, // Move down from bottom edge
      style: {
        backgroundColor: '#10B981',
        borderColor: '#10B981',
        left: '75%',
        transform: 'translateX(-50%)',
      }
    },
    {
      id: 'flow-else',
      label: 'Else', 
      description: 'Execute when condition is false',
      position: 'bottom',
      type: 'source',
      offsetY: -10, // Move down from bottom edge
      style: {
        backgroundColor: '#EF4444',
        borderColor: '#EF4444',
        left: '25%',
        transform: 'translateX(-50%)',
      }
    }
  ], []);

  // Additional content to show handle labels
  const additionalContent = (
    <div className="mt-2 text-xs text-gray-600">
      <div className="flex justify-between items-center px-15">
        <span className="text-red-600 font-medium">Else</span>
        <span className="text-green-600 font-medium">Then</span>
      </div>
    </div>
  );

  return (
    <TemplateNode
      id={id}
      metadata={nodeTypes['CONDITIONAL'].metadata}
      inputs={inputs}
      output={output}
      data={nodeUtils.getNodeData(nodes, id)}
      onInputChange={(inputId, value) => {
        if (inputId === 'input-operator') {
          handleOperatorChange(value);
        }
      }}
      customHandles={customHandles}
      hideBottomHandle={true}
      hideOutputHandle={true}
      additionalContent={additionalContent}
    />
  );
};

export default ConditionalNode;
