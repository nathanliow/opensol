import { useState, useEffect, useMemo, FC, useRef, ReactNode } from 'react';
import { Handle, useUpdateNodeInternals, useEdges, useNodes } from '@xyflow/react';
import { Position } from '@xyflow/system';
import { InputDefinition, FileInputDefinition, Inputs } from '../../types/InputTypes';
import { Output, OutputDefinition } from '../../types/OutputTypes';
import { CustomHandle } from '../../types/HandleTypes';
import SearchableDropdown from '../ui/SearchableDropdown';
import { NodeTypeMetadata } from '../../types/NodeTypes';
import { nodeUtils } from '../../utils/nodeUtils';

// Template node props interface
export interface TemplateNodeProps {
  id: string;
  metadata: NodeTypeMetadata;
  inputs: InputDefinition[];
  output?: OutputDefinition;  
  data: {
    inputs: Inputs,
    output: Output
  };
  onInputChange?: (inputId: string, value: any, fromConnection?: boolean) => void;
  onOutputChange?: (outputId: string, value: any) => void;
  hideTopHandle?: boolean;
  hideBottomHandle?: boolean;
  hideInputHandles?: boolean;
  hideOutputHandle?: boolean;
  customHandles?: CustomHandle[];
  additionalContent?: ReactNode;
  disableConnectionHandling?: boolean;
}

/**
 * File Input component for handling file uploads
 */
const FileInput: FC<{
  input: FileInputDefinition;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
}> = ({ input, value, onChange, disabled }) => {
  const [preview, setPreview] = useState<string | null>(input.previewUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Clear file input when disabled changes
  useEffect(() => {
    if (disabled && fileInputRef.current) {
      fileInputRef.current.value = '';
      setPreview(null);
    }
  }, [disabled]);

  // Update preview when previewUrl changes
  useEffect(() => {
    if (input.previewUrl) {
      setPreview(input.previewUrl);
    }
  }, [input.previewUrl]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (input.accept && !file.type.match(input.accept.replace(/\*/g, '.*'))) {
      alert(`File type not accepted. Please upload ${input.accept} files.`);
      return;
    }
    
    // Validate file size
    if (input.maxSize && file.size > input.maxSize) {
      alert(`File too large. Maximum size is ${(input.maxSize / 1024 / 1024).toFixed(2)}MB.`);
      return;
    }
    
    // Create preview for images
    if (input.previewType === 'image' && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
    
    // Call the onChange handler with the file
    onChange(file);
    
    // Call the onFileSelect callback if provided
    if (input.onFileSelect) {
      input.onFileSelect(file);
    }
  };
  
  const handleRemoveFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setPreview(null);
    onChange(null);
    
    // Call the onFileRemove callback if provided
    if (input.onFileRemove) {
      input.onFileRemove();
    }
  };
  
  return (
    <div className="w-full">
      <div className="flex items-center mb-1">
        <input
          ref={fileInputRef}
          type="file"
          accept={input.accept}
          onChange={handleFileChange}
          disabled={disabled}
          className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:text-xs file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          multiple={input.multiple}
        />
        {preview && (
          <button 
            type="button" 
            onClick={handleRemoveFile}
            className="ml-1 text-xs text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        )}
      </div>
      
      {/* Image preview */}
      {preview && input.previewType === 'image' && (
        <div className="mt-1 relative w-full h-24 bg-gray-100 rounded-md overflow-hidden">
          <img 
            src={preview} 
            alt="Preview" 
            className="h-full object-contain mx-auto"
          />
        </div>
      )}
    </div>
  );
};

/**
 * Input rendering component
 */
const NodeInput: FC<{
  input: InputDefinition;
  value: any;
  onChange: (value: any) => void;
  textColor: string;
  backgroundColor: string;
  isConnected: boolean;
}> = ({ input, value, onChange, textColor, backgroundColor, isConnected }) => {
  
  // If there's a custom component provided, use it
  if (input.component) {
    return <>{input.component}</>;
  }
  
  switch (input.type) {
    case 'dropdown':
      return (
        <SearchableDropdown
          options={input.options}
          value={value || ''}
          onChange={onChange}
          disabled={isConnected || input.disabled}
          placeholder={input.placeholder || 'Select an option'}
          searchable={input.searchable}
          clearable={input.clearable}
        />
      );
    case 'textarea':
      return (
        <div className="relative">
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={isConnected || input.disabled}
            rows={input.rows || 3}
            maxLength={input.maxLength}
            className={`w-full p-1 text-xs rounded border resize-none ${isConnected ? 'bg-gray-100' : 'bg-white'} text-black`}
            placeholder={input.placeholder}
          />
          {isConnected && (
            <div className={`absolute inset-0 flex items-center justify-center text-xs ${textColor} bg-opacity-75 ${backgroundColor}`}>
              {String(value)}
            </div>
          )}
        </div>
      );
    case 'text':
      return (
        <div className="relative flex-1">
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={isConnected || input.disabled}
            maxLength={input.maxLength}
            className={`w-full p-1 text-xs rounded-md border text-black ${isConnected ? 'opacity-0' : 'bg-white border-gray-300'}`}
            placeholder={input.placeholder}
          />
          {isConnected && (
            <div className={`absolute inset-0 flex items-center px-1 text-xs text-black bg-blue-50/30 rounded-md border border-blue-200/50 truncate`}>
              {String(value)}
            </div>
          )}
        </div>
      );
    case 'number':
      return (
        <div className="relative flex-1">
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.valueAsNumber || e.target.value)}
            disabled={isConnected || input.disabled}
            min={input.min}
            max={input.max}
            step={input.step}
            className={`w-full p-1 text-xs rounded-md border text-black ${isConnected ? 'opacity-0' : 'bg-white border-gray-300'}`}
            placeholder={input.placeholder}
          />
          {isConnected && (
            <div className={`absolute inset-0 flex items-center px-1 text-xs text-black bg-blue-50/30 rounded-md border border-blue-200/50 truncate`}>
              {String(value)}
            </div>
          )}
        </div>
      );
    case 'display':
      const formattedValue = input.format ? input.format(value) : String(value || '');
      return (
        <div className="text-xs bg-gray-100 p-1 rounded border border-gray-200 text-black">
          {formattedValue}
        </div>
      );
    case 'file':
      return (
        <FileInput
          input={input}
          value={value}
          onChange={onChange}
          disabled={isConnected || input.disabled}
        />
      );
    default:
      return null;
  }
};

/**
 * Flow handle component
 */
const FlowHandle: FC<{
  type: 'source' | 'target';
  position: Position;
  id: string;
  style?: React.CSSProperties;
  hidden?: boolean;
}> = ({ type, position, id, style, hidden }) => {
  if (hidden) return null;
  
  const handlePosition = position === Position.Top ? 'top' : 'bottom';
  const baseStyle = nodeUtils.getHandleStyle(handlePosition);
  
  return (
    <Handle
      type={type}
      position={position}
      style={{...baseStyle, ...style}}
      id={id}
      isValidConnection={nodeUtils.validateFlowConnection}
    />
  );
};

/**
 * Input handle component
 */
const InputHandle: FC<{
  input: InputDefinition;
  hidden?: boolean;
}> = ({ input, hidden }) => {
  if (hidden || input.type === 'dropdown') return null;
  
  return (
    <Handle
      id={input.handleId || input.id}
      type="target"
      position={Position.Left}
      style={nodeUtils.getHandleStyle('left')}
    />
  );
};

/**
 * Custom handle component
 */
const CustomHandleComponent: FC<{
  handle: CustomHandle;
}> = ({ handle }) => {
  const position = nodeUtils.toReactFlowPosition(handle.position);
  
  // Combine base style with custom style and offsetY
  const handleStyle = {
    ...nodeUtils.getHandleStyle(handle.position),
    ...handle.style,
    ...(handle.offsetY && { [handle.position]: handle.offsetY })
  };
  
  return (
    <Handle
      key={handle.id}
      type={handle.type}
      position={position}
      style={handleStyle}
      id={handle.id}
      className={handle.className}
      isValidConnection={
        handle.id === 'flow-then' || handle.id === 'flow-else' || handle.id === 'flow-loop' ? nodeUtils.validateFlowConnection : nodeUtils.validateOutputConnection
      }
    />
  );
};

/**
 * Output handle component
 */
const OutputHandle: FC<{
  output: OutputDefinition;
  hidden?: boolean;
  nodeHeight?: number;
  totalOutputs?: number;
  outputIndex?: number;
}> = ({ output, hidden, nodeHeight = 0, totalOutputs = 1, outputIndex = 0 }) => {
  if (hidden) return null;
  
  let offsetY;
  
  if (totalOutputs === 1) {
    // Position in the middle for a single output
    offsetY = nodeHeight * 0.5;
  } else {
    // Distribute evenly for multiple outputs
    // Leave some padding at top and bottom (10%)
    const availableHeight = nodeHeight * 0.8;
    const step = availableHeight / (totalOutputs - 1 || 1);
    offsetY = (nodeHeight * 0.1) + (step * outputIndex);
  }
  
  return (
    <Handle
      type="source"
      position={Position.Right}
      style={{
        ...nodeUtils.getHandleStyle('right'),
        // top: -offsetY
      }}
      id={output.handleId || output.id}
      isValidConnection={nodeUtils.validateOutputConnection}
    />
  );
};

/**
 * Hook for managing input state
 */
const useNodeInputs = (
  inputs: InputDefinition[], 
  data: {
    inputs: Inputs,
    output: Output
  },
  onInputChange?: (inputId: string, value: any, fromConnection?: boolean) => void
) => {
  // Track if we've initialized from data
  const initializedRef = useRef(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize values from data or defaults
  const initialValues = useMemo(() => {
    const values: Record<string, any> = {};
    inputs.forEach(input => {
      values[input.id] = nodeUtils.getValue(data.inputs, input.id, input.defaultValue);
    });
    return values;
  }, [inputs, data]);
  
  const [inputValues, setInputValues] = useState<Record<string, any>>(initialValues);
  
  // Update when data changes or on initial load
  useEffect(() => {
    if (!initializedRef.current) {
      const newValues: Record<string, any> = {};
      inputs.forEach(input => {
        newValues[input.id] = nodeUtils.getValue(data.inputs, input.id, input.defaultValue);
      });
      setInputValues(newValues);
      initializedRef.current = true;
    }
  }, [data, inputs]);

  // Update connected values
  useEffect(() => {
    const newValues = {...inputValues};
    let hasChanged = false;
    
    inputs.forEach(input => {
      if (nodeUtils.isInputConnected(input)) {
        const connectedValue = nodeUtils.getConnectedValue(input);
        if (connectedValue !== null && connectedValue !== undefined && connectedValue !== inputValues[input.id]) {
          newValues[input.id] = connectedValue;
          hasChanged = true;
        }
      }
    });
    
    if (hasChanged) {
      setInputValues(newValues);
    }
  }, [inputs, inputValues]);
  
  const handleInputChange = (inputId: string, value: any) => {
    const input = inputs.find(i => i.id === inputId);
    
    if (input && nodeUtils.isInputConnected(input)) {
      return;
    }
    
    setInputValues(prev => ({ ...prev, [inputId]: value }));
    
    const shouldDebounce = input && (input.type === 'text' || input.type === 'textarea' || input.type === 'number');
    
    if (onInputChange) {
      if (shouldDebounce) {
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
        
        debounceTimeoutRef.current = setTimeout(() => {
          onInputChange(inputId, value);
        }, 500); // 500ms delay for text inputs
      } else {
        onInputChange(inputId, value);
      }
    }
  };
  
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);
  
  return { inputValues, handleInputChange };
};

/**
 * TemplateNode component
 */
const TemplateNode: FC<TemplateNodeProps> = ({
  id,
  metadata,
  inputs,
  output,
  data,
  onInputChange,
  onOutputChange,
  hideInputHandles = false,
  hideTopHandle = false,
  hideBottomHandle = false,
  hideOutputHandle = false,
  customHandles = [],
  additionalContent = null,
  disableConnectionHandling = false,
}) => {
  const { inputValues, handleInputChange } = useNodeInputs(inputs, data, onInputChange);
  const updateNodeInternals = useUpdateNodeInternals();
  const nodeRef = useRef<HTMLDivElement>(null);
  const [nodeHeight, setNodeHeight] = useState(0);
  const edges = useEdges();
  const nodes = useNodes();
  
  // Track connected inputs
  const [connectedInputIds, setConnectedInputIds] = useState<string[]>([]);
  
  // Update node internals when inputs or outputs change to reposition handles
  useEffect(() => {
    if (id) {
      updateNodeInternals(id);
    }
  }, [id, updateNodeInternals, inputs.length]);
  
  // Measure node height for positioning outputs
  useEffect(() => {
    if (nodeRef.current) {
      setNodeHeight(nodeRef.current.clientHeight);
    }
  }, [inputs.length, inputValues]);

  // Handle connected inputs if enabled
  useEffect(() => {
    if (disableConnectionHandling || !id || !onInputChange) return;
    
    // Find inputs with connections
    const connected = inputs.filter(input => nodeUtils.isInputConnected(input));
    setConnectedInputIds(connected.map(input => input.id));
    
    // Update values for connected inputs
    connected.forEach(input => {
      const connectedValue = nodeUtils.getConnectedValue(input);
      if (connectedValue !== null && connectedValue !== undefined) {
        const currentValue = inputValues[input.id];
        if (connectedValue !== currentValue) {
          // Call onInputChange with the fromConnection flag set to true
          onInputChange(input.id, connectedValue, true);
        }
      }
    });
  }, [edges, nodes, inputs, id, onInputChange, inputValues, disableConnectionHandling]);

  return (
    <div 
      ref={nodeRef}
      className={`${metadata.backgroundColor} p-1 rounded-md border ${metadata.borderColor}`}
      style={{ 
        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className={`text-center font-bold ${metadata.textColor} mb-2 border-b ${metadata.borderColor} pb-1`}>
        {metadata.label}
      </div>

      {/* Flow handles */}
      <FlowHandle
        type="target"
        position={Position.Top}
        id="flow-top"
        hidden={hideTopHandle}
      />

      <FlowHandle
        type="source"
        position={Position.Bottom}
        id="flow-bottom"
        hidden={hideBottomHandle}
      />
      
      {/* Inputs and handles */}
      <div className="text-xs text-gray-700">
        {inputs.map((input) => (
          <div key={input.id} className="flex items-center mb-2 relative">
            <div className={`ml-1 font-medium ${metadata.textColor} w-[90px]`}>
              {input.label}:
            </div>
            <div className="w-full mr-1 max-w-[200px]">
              <NodeInput
                input={input}
                value={inputValues[input.id]}
                onChange={(value) => handleInputChange(input.id, value)}
                textColor={metadata.textColor}
                backgroundColor={metadata.backgroundColor}
                isConnected={connectedInputIds.includes(input.id)}
              />
            </div>
            
            <InputHandle input={input} hidden={hideInputHandles} />
          </div>
        ))}
      </div>

      {/* Custom handles */}
      {customHandles.map(handle => (
        <CustomHandleComponent key={handle.id} handle={handle} />
      ))}
      
      {/* Output handles */}
      {!hideOutputHandle && (
        <Handle
          type="source"
          position={Position.Right}
          style={{ 
          ...nodeUtils.getHandleStyle('right'),
          }}
          id={output?.handleId || output?.id}
          isValidConnection={nodeUtils.validateOutputConnection}
        />
      )}

      {/* Additional content */}
      {additionalContent}
    </div>
  );
};

export default TemplateNode;