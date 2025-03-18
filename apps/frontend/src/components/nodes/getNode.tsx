import { useState, useEffect } from 'react';
import { Handle, useUpdateNodeInternals } from '@xyflow/react';
import { Position } from '@xyflow/system';

// Sample functions with parameters
const availableFunctions = [
  { 
    name: 'getUserTokenBalances', 
    parameters: ['address'] 
  },
  { 
    name: 'getTokenMetadata', 
    parameters: ['tokenAddress'] 
  },
  { 
    name: 'getTokenPriceInSol', 
    parameters: ['tokenAddress'] 
  },
  { 
    name: 'getTokenPriceInUsd', 
    parameters: ['tokenAddress'] 
  }
];

interface GetNodeProps {
  id: string;
  data: { 
    selectedFunction?: string;
    label?: string;
  };
}

export default function GetNode({ id, data }: GetNodeProps) {
  const [selectedFunction, setSelectedFunction] = useState(
    data.selectedFunction || availableFunctions[0].name
  );
  const updateNodeInternals = useUpdateNodeInternals();
  
  // Find the current function object
  const currentFunction = availableFunctions.find(fn => fn.name === selectedFunction) || availableFunctions[0];
  
  // Update node internals when parameters change
  useEffect(() => {
    updateNodeInternals(id);
  }, [id, selectedFunction, updateNodeInternals]);
  
  const handleFunctionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFunction(e.target.value);
  };

  return (
    <div className="bg-blue-200 p-3 rounded-md shadow-md border border-blue-400 min-w-[180px]">
      <div className="text-center font-bold text-gray-800 mb-2 border-b border-blue-400 pb-1">GET</div>
      
      <div className="mb-3">
        <select 
          className="w-full p-1 rounded bg-blue-100 border border-blue-400 text-sm text-black"
          value={selectedFunction}
          onChange={handleFunctionChange}
        >
          {availableFunctions.map(fn => (
            <option key={fn.name} value={fn.name}>
              {fn.name}
            </option>
          ))}
        </select>
      </div>
      
      {/* Parameters and handles */}
      <div className="text-xs text-gray-700">
        {currentFunction.parameters.map((param, index) => (
          <div key={param} className="flex justify-between items-center mb-2 relative">
            <div className="font-medium">{param}:</div>
            <div className="h-5 w-20 bg-blue-100 rounded border border-blue-400"></div>
            <Handle
              id={`param-${index}`}
              type="target"
              position={Position.Left}
              style={{ left: -8, top: `${50}%`, background: '#60A5FA' }}
            />
          </div>
        ))}
      </div>
      
      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ right: 6, background: '#60A5FA' }}
      />
    </div>
  );
}