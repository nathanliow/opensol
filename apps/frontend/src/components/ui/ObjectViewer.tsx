import { useState } from 'react';

interface ObjectViewerProps {
  data: any;
  initialExpanded?: boolean;
  depth?: number;
  maxDepth?: number;
}

const ObjectViewer = ({ data, initialExpanded = false, depth = 0, maxDepth = 10 }: ObjectViewerProps) => {
  const [expanded, setExpanded] = useState(initialExpanded || depth === 0);
  
  if (data === null || data === undefined) {
    return <span className="text-gray-500 italic">null</span>;
  }
  
  // Handle primitive values
  if (typeof data !== 'object' || data === null) {
    if (typeof data === 'string') {
      return <span className="text-green-600">"{data}"</span>;
    }
    if (typeof data === 'number') {
      return <span className="text-blue-600">{data}</span>;
    }
    if (typeof data === 'boolean') {
      return <span className="text-amber-600">{String(data)}</span>;
    }
    return <span>{String(data)}</span>;
  }
  
  // Handle arrays
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return <span className="text-gray-500">[]</span>;
    }
    
    return (
      <div className="ml-1">
        <div 
          className="cursor-pointer flex items-center text-blue-700 hover:text-blue-900 group"
          onClick={() => setExpanded(!expanded)}
        >
          <span className="inline-block w-4 h-4 mr-1 text-blue-500 group-hover:text-blue-700 transition-colors">
            {expanded ? '▼' : '►'}
          </span>
          <span className="font-mono text-blue-600">
            Array<span className="text-gray-500">[{data.length}]</span>
          </span>
        </div>
        
        {expanded && (
          <div className="ml-4 border-l border-blue-200 pl-2 pt-1">
            {data.map((item, index) => (
              <div key={index} className="my-1">
                <span className="text-gray-500 mr-1 font-mono">{index}:</span>
                {depth + 1 < maxDepth ? (
                  <ObjectViewer 
                    data={item} 
                    depth={depth + 1} 
                    maxDepth={maxDepth}
                  />
                ) : (
                  <span className="text-gray-500 italic">Max depth reached</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  
  // Handle objects
  const entries = Object.entries(data);
  if (entries.length === 0) {
    return <span className="text-gray-500">{"{}"}</span>;
  }
  
  return (
    <div className="ml-1">
      <div 
        className="cursor-pointer flex items-center text-purple-700 hover:text-purple-900 group"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="inline-block w-4 h-4 mr-1 text-purple-500 group-hover:text-purple-700 transition-colors">
          {expanded ? '▼' : '►'}
        </span>
        <span>
          <span className="font-mono text-purple-600">Object</span>
          <span className="text-gray-500 font-mono"> {"{"}{entries.length} props{"}"}</span>
        </span>
      </div>
      
      {expanded && (
        <div className="ml-4 border-l border-purple-200 pl-2 pt-1">
          {entries.map(([key, value]) => (
            <div key={key} className="my-1">
              <span className="text-purple-700 font-mono mr-1">{key}:</span>
              {depth + 1 < maxDepth ? (
                <ObjectViewer 
                  data={value} 
                  depth={depth + 1} 
                  maxDepth={maxDepth}
                />
              ) : (
                <span className="text-gray-500 italic">Max depth reached</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ObjectViewer; 