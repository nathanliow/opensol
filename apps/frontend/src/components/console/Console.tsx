import { memo, useCallback, useState, useEffect } from 'react';
import { useNodes, useEdges } from '@xyflow/react';
import CodeDisplay from '../code/CodeDisplay';

interface ConsoleProps {
  className?: string;
  output?: string;
  code?: string;
  debug?: string;
  onLabelSelect?: (labelId: string) => void;
  onClear?: () => void;
}

const Console = memo(({ className = '', output = '', code = '', debug = '', onLabelSelect, onClear }: ConsoleProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [size, setSize] = useState({ width: 600, height: 400 });

  // Set initial size based on viewport after mount
  useEffect(() => {
    setSize({
      width: Math.min(window.innerWidth / 2, 600),
      height: Math.min(window.innerHeight / 2, 400)
    });
  }, []);

  const [activeTab, setActiveTab] = useState<'debug' | 'output' | 'code'>('output');
  const [selectedLabel, setSelectedLabel] = useState<string>('');
  const nodes = useNodes();
  const edges = useEdges();

  // Get all label nodes
  const labelNodes = nodes.filter(n => n.type === 'LABEL');

  const handleClear = useCallback(() => {
    if (onClear) {
      onClear();
    }
  }, [onClear]);

  const handleLabelSelect = useCallback((labelId: string) => {
    setSelectedLabel(labelId);
    handleClear();
    onLabelSelect?.(labelId);
  }, [onLabelSelect, handleClear]);

  // Optimized resize with RAF
  const handleResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = size.width;
    const startHeight = size.height;
    
    const handleResizeMove = (e: MouseEvent) => {
      requestAnimationFrame(() => {
        const deltaX = startX - e.clientX;
        const deltaY = startY - e.clientY;
        setSize({
          width: Math.max(300, startWidth + deltaX),
          height: Math.max(200, startHeight + deltaY)
        });
      });
    };

    const handleResizeEnd = () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  }, [size]);

  // Get all nodes connected to a label
  const getConnectedNodes = useCallback((labelId: string) => {
    const connectedNodes = new Set<string>();
    const nodesToProcess = [labelId];

    while (nodesToProcess.length > 0) {
      const currentId = nodesToProcess.pop()!;
      connectedNodes.add(currentId);
      
      edges.forEach(edge => {
        if (edge.source === currentId && !connectedNodes.has(edge.target)) {
          connectedNodes.add(edge.target);
          nodesToProcess.push(edge.target);
        }
        // Also include nodes that connect to this node
        if (edge.target === currentId && !connectedNodes.has(edge.source)) {
          connectedNodes.add(edge.source);
          nodesToProcess.push(edge.source);
        }
      });
    }

    return connectedNodes;
  }, [edges]);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <div
      className={`${className} bg-[#1E1E1E] text-white rounded-lg shadow-lg overflow-hidden ${
        isCollapsed ? 'h-10' : ''
      }`}
      style={!isCollapsed ? { 
        width: size.width, 
        height: size.height,
        maxWidth: 'calc(50vw - 20px)',
        maxHeight: 'calc(50vh - 20px)'
      } : undefined}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-2 bg-[#252525] border-b border-[#333333]">
        <div className="flex items-center gap-4">
          {!isCollapsed && (
            <div
              className="cursor-nw-resize p-1 hover:bg-[#333333] rounded transition-colors"
              onMouseDown={handleResize}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M4 12L12 4M8 12L12 8M4 8L8 4" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
          )}

          {!isCollapsed && (
            <select
              value={selectedLabel}
              onChange={(e) => handleLabelSelect(e.target.value)}
              className="px-2 py-1 bg-[#333333] text-sm rounded border border-[#4B5563] min-w-[150px]"
            >
              <option value="">Select Label</option>
              {labelNodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.data && typeof node.data === 'object' && 'name' in node.data 
                    ? String(node.data.name) 
                    : 'Untitled Label'}
                </option>
              ))}
            </select>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('output')}
              className={`px-3 py-1 rounded ${
                activeTab === 'output'
                  ? 'bg-[#2D2D2D] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Output
            </button>
            <button
              onClick={() => setActiveTab('debug')}
              className={`px-3 py-1 rounded ${
                activeTab === 'debug'
                  ? 'bg-[#2D2D2D] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Debug
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1 rounded ${
                activeTab === 'code'
                  ? 'bg-[#2D2D2D] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Code
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            className="p-1 hover:bg-[#333333] rounded transition-colors"
            title="Clear console"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          <button
            onClick={toggleCollapse}
            className="p-1 hover:bg-[#333333] rounded transition-colors"
          >
            <svg
              className={`transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M8 12L3 6H13L8 12Z" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="flex flex-col h-[calc(100%-40px)]">
          <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
            {activeTab === 'output' && (
              <pre className="whitespace-pre-wrap">{output}</pre>
            )}
            {activeTab === 'debug' && (
              <pre className="whitespace-pre-wrap">{debug}</pre>
            )}
            {activeTab === 'code' && (
              <CodeDisplay code={code.replace(/const HELIUS_API_KEY = ".*";/, 'const HELIUS_API_KEY = process.env.HELIUS_API_KEY;')} />
            )}
          </div>
        </div>
      )}
    </div>
  );
});

Console.displayName = 'Console';

export default Console;