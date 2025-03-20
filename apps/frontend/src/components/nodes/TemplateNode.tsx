import { useState, useEffect, useMemo } from 'react';
import { Handle, useUpdateNodeInternals } from '@xyflow/react';
import { Position } from '@xyflow/system';
import { InputDefinition } from '../../types/inputTypes';
import { CustomHandle, HandlePosition } from '@/types/handleTypes';

export interface TemplateNodeProps {
  id: string;
  title: string;
  backgroundColor: string;
  borderColor: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  inputs: InputDefinition[];
  data: Record<string, any>;
  onInputChange?: (inputId: string, value: any) => void;
  hideInputHandles?: boolean;
  customHandles?: CustomHandle[];
}

export default function TemplateNode({
  id,
  title,
  backgroundColor,
  borderColor,
  primaryColor,
  secondaryColor,
  textColor,
  inputs,
  data,
  onInputChange,
  hideInputHandles = false,
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
    updateNodeInternals(id);
  }, [id, updateNodeInternals, inputs.length]);
  
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
  
  const renderInput = (input: InputDefinition) => {
    if (input.component) {
      return input.component;
    }
    
    // Check if this input has a connected value
    const connectedValue = input.getConnectedValue ? input.getConnectedValue() : null;
    const isConnected = connectedValue !== null;
    const displayValue = isConnected ? connectedValue : inputValues[input.id];
    
    switch (input.type) {
      case 'dropdown':
        return (
          <select
            value={displayValue || ''}
            onChange={(e) => handleInputChange(input.id, e.target.value)}
            className={`w-full p-1 rounded bg-${primaryColor} border border-${secondaryColor} text-sm ${textColor}`}
            disabled={isConnected}
          >
            {input.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'text':
        return (
          <input
            type="text"
            value={displayValue || ''}
            onChange={(e) => handleInputChange(input.id, e.target.value)}
            placeholder={input.placeholder}
            disabled={isConnected}
            className={`h-5 w-full ${
              isConnected
                ? 'bg-[#2D2D2D]/50 border-pink-800/50 text-pink-300/70 cursor-not-allowed'
                : `${backgroundColor} border-${borderColor}`
            } rounded border text-sm px-1 ${textColor}`}
          />
        );
      case 'textarea':
        return (
          <textarea
            value={displayValue || ''}
            onChange={(e) => handleInputChange(input.id, e.target.value)}
            placeholder={input.placeholder}
            disabled={isConnected}
            rows={input.rows || 3}
            className={`w-full resize-none ${
              isConnected
                ? 'bg-[#2D2D2D]/50 border-pink-800/50 text-pink-300/70 cursor-not-allowed'
                : `${backgroundColor} border-${borderColor}`
            } rounded border text-sm px-1 py-1 ${textColor}`}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={displayValue || 0}
            onChange={(e) => handleInputChange(input.id, parseFloat(e.target.value))}
            disabled={isConnected}
            className={`h-5 w-full ${backgroundColor} rounded border border-${borderColor} text-sm px-1 ${textColor}`}
          />
        );
      case 'display':
        return (
          <div className={`h-5 flex-1 ${backgroundColor} rounded border border-${borderColor} px-1 overflow-hidden text-ellipsis whitespace-nowrap ${textColor}`}>
            {displayValue ? String(displayValue) : ''}
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className={`${backgroundColor} p-3 rounded-md shadow-md border ${borderColor} min-w-[180px]`}>
      <div className={`text-center font-bold ${textColor} mb-2 border-b ${borderColor} pb-1`}>
        {title}
      </div>
      
      {/* Inputs and handles */}
      <div className="text-xs text-gray-700">
        {inputs.map((input) => (
          <div key={input.id} className="flex justify-between items-center mb-2 relative">
            <div className="font-medium mr-2">{input.label}:</div>
            <div className="flex-1">
              {renderInput(input)}
            </div>
            {!hideInputHandles && (
              <Handle
                id={input.handleId || input.id}
                type="target"
                position={Position.Left}
                style={{ 
                  left: -8, 
                  top: '50%',
                  background: `var(--color-${secondaryColor})`,
                  borderColor: `var(--color-${borderColor})`,
                  backgroundColor: `var(--color-${secondaryColor})`
                }}
                className={`w-3 h-3 -ml-1 border-2 transition-colors ${
                  input.getConnectedValue && input.getConnectedValue() !== null 
                    ? 'border-pink-500 bg-pink-700' 
                    : `border-${borderColor} bg-${secondaryColor}`
                }`}
              />
            )}
          </div>
        ))}
      </div>
      
      {/* Default output handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ right: 6, background: `var(--color-${secondaryColor})` }}
        id="output"
      />
      
      {/* Custom handles */}
      {customHandles.map(handle => (
        <Handle
          key={handle.id}
          type={handle.type}
          position={positionToReactFlowPosition(handle.position)}
          id={handle.id}
          className={handle.className || `w-3 h-3 bg-${secondaryColor} border-2 border-${borderColor}`}
        />
      ))}
    </div>
  );
} 