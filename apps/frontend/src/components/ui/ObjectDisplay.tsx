import { useState, useMemo } from 'react';
import ObjectViewer from './ObjectViewer';

interface ObjectDisplayProps {
  data: any;
  height?: string;
  maxHeight?: string;
}

const ObjectDisplay = ({ data, height = 'auto', maxHeight = '300px' }: ObjectDisplayProps) => {
  const [viewMode, setViewMode] = useState<'tree' | 'json'>('tree');
  
  // Format JSON string with indentation for the text view
  const formattedJson = JSON.stringify(data, null, 2);
  
  return (
    <div className="w-full">      
      {/* View toggle buttons */}
      <div className="flex mb-2 text-xs">
        <button
          className={`px-2 py-1 rounded-l ${viewMode === 'tree' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
          onClick={() => setViewMode('tree')}
        >
          Tree View
        </button>
        <button
          className={`px-2 py-1 rounded-r ${viewMode === 'json' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
          onClick={() => setViewMode('json')}
        >
          JSON View
        </button>
      </div>
      
      {/* Object display area */}
      <div 
        className="border rounded bg-white text-xs overflow-auto"
        style={{ height, maxHeight }}
      >
        {viewMode === 'tree' ? (
          <div className="p-2">
            <ObjectViewer data={data} initialExpanded={true} />
          </div>
        ) : (
          <pre className="p-2 whitespace-pre-wrap">{formattedJson}</pre>
        )}
      </div>
    </div>
  );
};

export default ObjectDisplay; 