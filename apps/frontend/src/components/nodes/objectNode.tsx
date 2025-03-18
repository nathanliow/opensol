import { useState } from 'react';
import { Handle } from '@xyflow/react';
import { Position } from '@xyflow/system';

interface ObjectNodeProps {
  id: string;
  data: {
    label?: string;
    object?: Record<string, any>;
  };
}

export default function ObjectNode({ id, data }: ObjectNodeProps) {
  // Default object if none provided
  const [objectData] = useState<Record<string, any>>(
    data.object || {
      id: "123",
      name: "Sample Object",
      status: "active",
      createdAt: "2023-05-15",
      count: 42,
    }
  );

  // Get all keys from the object
  const objectKeys = Object.keys(objectData);

  return (
    <div className="bg-purple-200 p-3 rounded-md shadow-md border border-purple-400 min-w-[200px]">
      <div className="text-center font-bold text-gray-800 mb-2 border-b border-purple-400 pb-1">
        OBJECT
      </div>
      
      {/* Object fields */}
      <div className="text-xs text-gray-700">
        {objectKeys.map((key) => (
          <div key={key} className="flex justify-between items-center mb-2">
            <div className="font-medium mr-2">{key}:</div>
            <div className="flex-1 h-5 bg-purple-100 rounded border border-purple-400 px-1 overflow-hidden text-ellipsis whitespace-nowrap">
              {typeof objectData[key] === 'object' 
                ? JSON.stringify(objectData[key]) 
                : String(objectData[key])}
            </div>
          </div>
        ))}
      </div>
      
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ left: -8, background: '#9F7AEA' }}
      />
      
      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ right: -8, background: '#9F7AEA' }}
      />
    </div>
  );
}
