import { useState, useEffect, useMemo } from 'react';
import { Handle, useUpdateNodeInternals } from '@xyflow/react';
import { Position } from '@xyflow/system';
import { InputDefinition } from '../../types/InputTypes';
import { CustomHandle, HandlePosition } from '@/types/HandleTypes';
import SearchableDropdown from '../ui/SearchableDropdown';
import { NodeTypeMetadata } from '@/types/NodeTypes';

export interface NodeOutput {
  type: 'string' | 'number' | 'boolean' | 'object' | 'any' | 'string[]' | 'number[]' | 'boolean[]';
  description: string;
}

export interface TemplateNodeProps {
  metadata: NodeTypeMetadata;
  inputs: InputDefinition[];
  output?: NodeOutput;
  data: Record<string, any>;

  onInputChange?: (inputId: string, value: any) => void;
  hideTopHandle?: boolean;
  hideBottomHandle?: boolean;
  hideInputHandles?: boolean;
  hideOutputHandle?: boolean;
  customHandles?: CustomHandle[];
}

export default function TemplateNode({
  metadata,
  inputs,
  output,
  data,

  onInputChange,
  hideInputHandles = false,
  hideTopHandle = false,
  hideBottomHandle = false,
  hideOutputHandle = false,
  customHandles = [],
}: TemplateNodeProps) {
  const initialValues = useMemo(() => {
    const values: Record<string, any> = {};
    inputs.forEach(input => {
      values[input.id] = data[input.id] !== undefined 
        ? data[input.id] 
        : input.defaultValue;
    });
    return values;
  }, [inputs, data]);
  
  const [inputValues, setInputValues] = useState<Record<string, any>>(initialValues);
  const updateNodeInternals = useUpdateNodeInternals();
  
  // Only update when specific input values change in data
  useEffect(() => {
    let hasChanged = false;
    const newValues = {...inputValues};
    
    inputs.forEach(input => {
      if (data[input.id] !== undefined && data[input.id] !== inputValues[input.id]) {
        newValues[input.id] = data[input.id];
        hasChanged = true;
      }
    });
    
    if (hasChanged) {
      setInputValues(newValues);
    }
  }, [data, inputs, inputValues]);
  
  // Update node internals when inputs change to reposition handles
  useEffect(() => {
    updateNodeInternals(metadata.id);
  }, [metadata.id, updateNodeInternals, inputs.length]);
  
  const handleInputChange = (inputId: string, value: any) => {
    setInputValues(prev => ({ ...prev, [inputId]: value }));
    if (onInputChange) {
      onInputChange(inputId, value);
    }
  };
  
  const positionToReactFlowPosition = (position: HandlePosition): Position => {
    switch (position) {
      case 'left': return Position.Left;
      case 'right': return Position.Right;
      case 'top': return Position.Top;
      case 'bottom': return Position.Bottom;
      default: return Position.Left;
    }
  };

  const positionToReactFlowWidth = (position: HandlePosition): number => {
    switch (position) {
      case 'left': return 15;
      case 'right': return 15;
      case 'top': return 40;
      case 'bottom': return 40;
      default: return 15;
    }
  };

  const positionToReactFlowHeight = (position: HandlePosition): number => {
    switch (position) {
      case 'left': return 20;
      case 'right': return 20;
      case 'top': return 15;
      case 'bottom': return 15;
      default: return 15;
    }
  };
  
  const renderInput = (input: InputDefinition) => {
    if (input.component) {
      return input.component;
    }

    const displayValue = input.getConnectedValue?.();
    const isConnected = displayValue !== null && displayValue !== undefined;

    switch (input.type) {
      case 'dropdown':
        return (
          <SearchableDropdown
            options={input.options || []}
            value={inputValues[input.id] || ''}
            onChange={(value) => handleInputChange(input.id, value)}
            disabled={isConnected}
            placeholder={input.placeholder || 'Select an option'}
          />
        );
      case 'textarea':
        return (
          <div className="relative">
            <textarea
              value={inputValues[input.id] || ''}
              onChange={(e) => handleInputChange(input.id, e.target.value)}
              disabled={isConnected}
              rows={input.rows || 3}
              className={`w-full p-1 text-xs rounded border resize-none ${isConnected ? 'bg-gray-100' : 'bg-white'} text-black`}
              placeholder={input.placeholder}
            />
            {isConnected && (
              <div className={`absolute inset-0 flex items-center justify-center text-xs ${metadata.textColor} bg-opacity-75 ${metadata.backgroundColor}`}>
                {String(displayValue)}
              </div>
            )}
          </div>
        );
      case 'text':
      case 'number':
        return (
          <div className="relative flex-1">
            <input
              type={input.type}
              value={inputValues[input.id] || ''}
              onChange={(e) => handleInputChange(input.id, e.target.value)}
              disabled={isConnected}
              className={`w-full p-1 text-xs rounded-md border text-black ${isConnected ? 'opacity-0' : 'bg-white border-gray-300'}`}
              placeholder={input.placeholder}
            />
            {isConnected && (
              <div className={`absolute inset-0 flex items-center px-1 text-xs text-black bg-blue-50/30 rounded-md border border-blue-200/50 truncate`}>
                {String(displayValue)}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className={`${metadata.backgroundColor} p-1 rounded-md border ${metadata.borderColor}`}
      style={{ 
        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className={`text-center font-bold ${metadata.textColor} mb-2 border-b ${metadata.borderColor} pb-1`}>
        {metadata.label}
      </div>

      {/* Flow handles (top and bottom) */}
      {!hideTopHandle && (
        <Handle
          type="target"
          position={Position.Top}
          style={{ 
            top: -3,
            background: `#343434`,
            borderColor: `#343434`,
            backgroundColor: `#343434`,
            width: positionToReactFlowWidth('top'),
            height: positionToReactFlowHeight('top'),
            borderRadius: 5,
            zIndex: -1
          }}
          id="flow-top"
          isValidConnection={(connection) => {  
            return connection.targetHandle === 'flow-bottom';
          }}
        />
      )}

      {!hideBottomHandle && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ 
            bottom: -3,
            background: `#343434`,
            borderColor: `#343434`,
            backgroundColor: `#343434`,
            width: positionToReactFlowWidth('bottom'),
            height: positionToReactFlowHeight('bottom'),
            borderRadius: 5,
            zIndex: -1
          }}
          id="flow-bottom"
          isValidConnection={(connection) => {  
            return connection.targetHandle === 'flow-top';
          }}
        />
      )}
      
      {/* Inputs and handles */}
      <div className="text-xs text-gray-700">
        {inputs.map((input) => (
          <div key={input.id} className="flex items-center mb-2 relative">
            <div className={`ml-1 font-medium ${metadata.textColor} w-[90px]`}>{input.label}:</div>
            <div className="w-full mr-1 max-w-[150px]">
              {renderInput(input)}
            </div>
            {!hideInputHandles && input.type !== 'dropdown' && (
              <Handle
                id={input.handleId || input.id}
                type="target"
                position={Position.Left}
                style={{ 
                  left: -5, 
                  background: `#343434`,
                  borderColor: `#343434`,
                  backgroundColor: `#343434`,
                  width: positionToReactFlowWidth('left'),
                  height: positionToReactFlowHeight('left'),
                  borderRadius: 5,
                  zIndex: -1
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Custom handles */}
      {customHandles?.map((handle) => (
        <Handle
          key={handle.id}
          type={handle.type}
          position={positionToReactFlowPosition(handle.position)}
          style={{ 
            [handle.position === Position.Left ? 'left' : 'right']: -8,
            background: `#343434`,
            borderColor: `#343434`,
            backgroundColor: `#343434`,
            width: positionToReactFlowWidth(handle.position),
            height: positionToReactFlowHeight(handle.position),
            borderRadius: 5,
            zIndex: -1
          }}
          id={handle.id}
        />
      ))}
      
      {/* Output handle - only show if output type exists */}
      {!hideOutputHandle && output?.type && (
        <Handle
          type="source"
          position={Position.Right}
          style={{ 
            right: -1, 
            background: `#343434`,
            borderColor: `#343434`,
            backgroundColor: `#343434`,
            width: positionToReactFlowWidth('right'),
            height: positionToReactFlowHeight('right'),
            borderRadius: 5,
            zIndex: -1
          }}
          id="output"
          isValidConnection={(connection) => {
            // Allow connections to param-* handles and flow inputs
            return connection.targetHandle?.startsWith('param-') || connection.targetHandle === 'flow' || connection.targetHandle === 'template';
          }}
        />
      )}
    </div>
  );
}