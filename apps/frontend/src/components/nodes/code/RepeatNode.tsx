import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { useNodes, useReactFlow, useEdges } from '@xyflow/react';
import TemplateNode from '../TemplateNode';
import { InputDefinition, createInputDefinition } from '../../../types/InputTypes';
import { nodeTypes } from '../../../types/NodeTypes';
import { CustomHandle } from '../../../types/HandleTypes';
import { OutputDefinition } from '@/types/OutputTypes';
import { nodeUtils } from '@/utils/nodeUtils';
import { FlowNode } from '../../../../../backend/src/packages/compiler/src/types';

interface RepeatNodeProps {
  id: string;
}

const LOOP_TYPE_OPTIONS = [
  { value: 'for', label: 'For Loop (count)' },
  { value: 'forEach', label: 'For Each (array)' },
];

export default function RepeatNode({ id }: RepeatNodeProps) {
  const { setNodes } = useReactFlow();
  const nodes = useNodes() as FlowNode[];
  const edges = useEdges();
  
  // Debounce refs for count input
  const countDebounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get initial values from node data
  const nodeData = nodeUtils.getNodeData(nodes, id);
  const [loopType, setLoopType] = useState(String(nodeData.inputs.loopType?.value || 'for'));
  const [countValue, setCountValue] = useState(String(nodeData.inputs.count?.value || '10'));
  const [arrayValue, setArrayValue] = useState(String(nodeData.inputs.array?.value || ''));
  const [iteratorName, setIteratorName] = useState(String(nodeData.inputs.iteratorName?.value || 'i'));

  // Check if inputs are connected
  const isCountConnected = nodeUtils.isInputConnectedInFlow(edges, id, 'input-count');
  const isArrayConnected = nodeUtils.isInputConnectedInFlow(edges, id, 'input-array');

  // Get connected values
  const connectedCountValue = nodeUtils.getConnectedValueById(edges, nodes, id, 'count');
  const connectedArrayValue = nodeUtils.getConnectedValueById(edges, nodes, id, 'array');

  // Sync state with node data changes and connected values
  useEffect(() => {
    const currentNodeData = nodeUtils.getNodeData(nodes, id);
    
    // Use connected values if available, otherwise use stored values
    const newCountValue = isCountConnected && connectedCountValue !== null 
      ? String(connectedCountValue) 
      : String(currentNodeData.inputs.count?.value || '10');
    const newArrayValue = isArrayConnected && connectedArrayValue !== null 
      ? String(connectedArrayValue) 
      : String(currentNodeData.inputs.array?.value || '');
    
    setCountValue(newCountValue);
    setArrayValue(newArrayValue);
    setLoopType(String(currentNodeData.inputs.loopType?.value || 'for'));
    setIteratorName(String(currentNodeData.inputs.iteratorName?.value || 'i'));
  }, [nodes, edges, id, isCountConnected, isArrayConnected, connectedCountValue, connectedArrayValue]);

  const handleLoopTypeChange = useCallback((value: string) => {
    setLoopType(value);
    nodeUtils.updateNodeInput(id, 'loopType', 'input-loopType', 'string', value, setNodes);
    
    // Reset iterator name based on loop type
    const defaultIterator = value === 'for' ? 'i' : 'item';
    setIteratorName(defaultIterator);
    nodeUtils.updateNodeInput(id, 'iteratorName', 'input-iteratorName', 'string', defaultIterator, setNodes);
  }, [id, setNodes]);

  const handleCountChange = useCallback((value: string) => {
    if (isCountConnected) return;
    
    setCountValue(value);
    
    if (countDebounceTimeoutRef.current) {
      clearTimeout(countDebounceTimeoutRef.current);
    }
    
    countDebounceTimeoutRef.current = setTimeout(() => {
      nodeUtils.updateNodeInput(id, 'count', 'input-count', 'number', value, setNodes);
    }, 500); 
  }, [id, setNodes, isCountConnected]);

  const handleArrayChange = useCallback((value: string) => {
    if (isArrayConnected) return;
    setArrayValue(value);
    nodeUtils.updateNodeInput(id, 'array', 'input-array', 'string', value, setNodes);
  }, [id, setNodes, isArrayConnected]);

  const handleIteratorNameChange = useCallback((value: string) => {
    setIteratorName(value);
    nodeUtils.updateNodeInput(id, 'iteratorName', 'input-iteratorName', 'string', value, setNodes);
  }, [id, setNodes]);

  useEffect(() => {
    return () => {
      if (countDebounceTimeoutRef.current) {
        clearTimeout(countDebounceTimeoutRef.current);
      }
    };
  }, []);

  const CountComponent = useMemo(() => (
    <div className="flex-1 relative">
      <input
        type="number"
        value={countValue}
        onChange={(e) => handleCountChange(e.target.value)}
        disabled={isCountConnected}
        min="1"
        className={`w-full p-1 text-xs rounded-md border text-black ${
          isCountConnected ? 'opacity-0' : 'bg-white border-gray-300'
        }`}
        placeholder="Enter count"
      />
      {isCountConnected && (
        <div className="absolute inset-0 flex items-center px-1 text-xs text-black bg-blue-50/30 rounded-md border border-blue-200/50 truncate">
          {String(countValue)}
        </div>
      )}
    </div>
  ), [countValue, handleCountChange, isCountConnected]);

  const ArrayComponent = useMemo(() => (
    <div className="flex-1 relative">
      <input
        type="text"
        value={arrayValue}
        onChange={(e) => handleArrayChange(e.target.value)}
        disabled={isArrayConnected}
        className={`w-full p-1 text-xs rounded-md border text-black ${
          isArrayConnected ? 'opacity-0' : 'bg-white border-gray-300'
        }`}
        placeholder="Connect array or enter [1,2,3]"
      />
      {isArrayConnected && (
        <div className="absolute inset-0 flex items-center px-1 text-xs text-black bg-blue-50/30 rounded-md border border-blue-200/50 truncate">
          {String(arrayValue)}
        </div>
      )}
    </div>
  ), [arrayValue, handleArrayChange, isArrayConnected]);

  const inputs: InputDefinition[] = useMemo(() => {
    const baseInputs: InputDefinition[] = [
      createInputDefinition.dropdown({
        id: 'input-loopType',
        label: 'Loop Type',
        description: 'Type of loop to execute',
        options: LOOP_TYPE_OPTIONS,
        placeholder: 'Select loop type...',
        defaultValue: 'for',
        required: true,
      }),
    ];

    if (loopType === 'for') {
      baseInputs.push(
        createInputDefinition.number({
          id: 'input-count',
          label: 'Count',
          description: 'Number of iterations',
          placeholder: 'Connect or enter count',
          defaultValue: 10,
          min: 1,
          component: CountComponent,
          getConnectedValue: nodeUtils.createConnectionGetter(edges, nodes, id, 'count'),
        })
      );
    } else {
      baseInputs.push(
        createInputDefinition.text({
          id: 'input-array',
          label: 'Array',
          description: 'Array to iterate over',
          placeholder: 'Connect array or enter [1,2,3]',
          defaultValue: '',
          component: ArrayComponent,
          getConnectedValue: nodeUtils.createConnectionGetter(edges, nodes, id, 'array'),
        })
      );
    }

    baseInputs.push(
      createInputDefinition.text({
        id: 'input-iteratorName',
        label: 'Iterator',
        description: 'Variable name for current iteration',
        placeholder: 'Variable name',
        defaultValue: loopType === 'for' ? 'i' : 'item',
        required: true,
      })
    );

    return baseInputs;
  }, [loopType, CountComponent, ArrayComponent, edges, nodes, id]);

  const output: OutputDefinition = {
    id: 'output',
    label: 'Output',
    type: 'any',
    description: 'Result of the loop execution'
  };

  const customHandles: CustomHandle[] = useMemo(() => [
    {
      id: 'flow-loop',
      label: 'Loop Body',
      description: 'Execute for each iteration',
      position: 'bottom',
      type: 'source',
      offsetY: -10,
      style: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
        right: '0%',
        transform: 'translateX(100%)',
      }
    }
  ], []);

  // Additional content to show handle label
  const additionalContent = (
    <div className="mt-2 text-xs text-gray-600 w-full">
      <div className="flex justify-end items-right w-full">
        <span className="text-black font-medium pr-6">Loop Body</span>
      </div>
    </div>
  );

  return (
    <TemplateNode
      id={id}
      metadata={nodeTypes['REPEAT'].metadata}
      inputs={inputs}
      output={output}
      data={nodeUtils.getNodeData(nodes, id)}
      onInputChange={(inputId, value) => {
        if (inputId === 'input-loopType') {
          handleLoopTypeChange(value);
        } else if (inputId === 'input-iteratorName') {
          handleIteratorNameChange(value);
        }
      }}
      customHandles={customHandles}
      hideBottomHandle={false}
      hideOutputHandle={true}
      additionalContent={additionalContent}
    />
  );
};