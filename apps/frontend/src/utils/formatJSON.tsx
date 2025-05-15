import React from 'react';

export const formatJSON = (text: string): React.ReactNode | string => {
  try {
    // Check if the text is JSON
    const parsed = JSON.parse(text);
    
    // Use recursive component to render objects
    const RenderObject = ({ data, indent = 0 }: { data: any, indent?: number }) => {
      if (data === null) return <span className="text-gray-400">null</span>;
      if (data === undefined) return <span className="text-gray-400">undefined</span>;
      
      if (Array.isArray(data)) {
        if (data.length === 0) return <span className="text-gray-400">[]</span>;
        return (
          <div style={{ marginLeft: `${indent * 20}px` }}>
            <span className="text-blue-400">[</span>
            <div>
              {data.map((item, i) => (
                <div key={i} style={{ marginLeft: '20px' }}>
                  <RenderObject data={item} indent={indent + 1} />
                  {i < data.length - 1 && <span className="text-gray-400">,</span>}
                </div>
              ))}
            </div>
            <span className="text-blue-400">]</span>
          </div>
        );
      }
      
      if (typeof data === 'object') {
        const entries = Object.entries(data);
        if (entries.length === 0) return <span className="text-gray-400">{'{}'}</span>;
        return (
          <div style={{ marginLeft: `${indent * 20}px` }}>
            <span className="text-yellow-400">{'{'}</span>
            <div>
              {entries.map(([key, value], i) => (
                <div key={key} style={{ marginLeft: '20px' }}>
                  <span className="text-green-400">"{key}"</span>
                  <span className="text-gray-400">: </span>
                  <RenderObject data={value} indent={indent + 1} />
                  {i < entries.length - 1 && <span className="text-gray-400">,</span>}
                </div>
              ))}
            </div>
            <span className="text-yellow-400">{'}'}</span>
          </div>
        );
      }
      
      if (typeof data === 'string') return <span className="text-white-400">"{data}"</span>;
      if (typeof data === 'number') return <span className="text-purple-400">{data}</span>;
      if (typeof data === 'boolean') return <span className="text-blue-400">{String(data)}</span>;
      
      return String(data);
    };
    
    return <RenderObject data={parsed} />;
  } catch (e) {
    // If it's not valid JSON, return the original text
    return text;
  }
};

