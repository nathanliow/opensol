import { memo, useCallback, useState, useEffect } from 'react';
import { useNodes, useEdges, Panel } from '@xyflow/react';
import CodeDisplay from '../code/CodeDisplay';
import RunButton from '../canvas/RunButton';
import { Icons } from '../icons/icons';

interface ConsoleProps {
  className?: string;
  output?: string;
  code?: string;
  debug?: string;
  onOutput: (output: string) => void;
  onCodeGenerated: (code: string) => void;
  onDebugGenerated: (debug: string) => void;
  onClear?: () => void;
}

const Console = memo(({ 
  className = '', 
  output = '', 
  code = '', 
  debug = '', 
  onOutput,
  onCodeGenerated,
  onDebugGenerated,
  onClear 
}: ConsoleProps) => {
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
  const [selectedFunction, setSelectedFunction] = useState<string>('');
  const nodes = useNodes();
  const edges = useEdges();

  // Get all function nodes
  const functionNodes = nodes.filter(n => n.type === 'FUNCTION');

  const handleClear = useCallback(() => {
    if (onClear) {
      onClear();
    }
  }, [onClear]);

  const handleFunctionSelect = useCallback((functionId: string) => {
    setSelectedFunction(functionId);
    handleClear();
  }, [handleClear]);

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
          width: Math.max(300, Math.min(window.innerWidth - 20, startWidth + deltaX)),
          height: Math.max(200, Math.min(window.innerHeight - 20, startHeight + deltaY))
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

  // Get all nodes connected to a function
  const getConnectedNodes = useCallback((functionId: string) => {
    const connectedNodes = new Set<string>();
    const nodesToProcess = [functionId];

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
    <Panel position="bottom-right">
      {isCollapsed ? (
        // Circular button when collapsed
        <div 
          onClick={toggleCollapse}
          className="w-12 h-12 rounded-full bg-[#1E1E1E] text-white shadow-lg flex items-center justify-center cursor-pointer hover:bg-[#2D2D2D] transition-colors border border-[#333333]"
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px'
          }}
        >
          <Icons.FaTerminal />
        </div>
      ) : (
        // Full console when expanded
        <div 
          className={`${className} bg-[#1E1E1E] text-white rounded-lg shadow-lg overflow-hidden`}
          style={{ 
            width: size.width, 
            height: size.height,
            maxWidth: 'calc(100vw - 20px)',
            maxHeight: 'calc(100vh - 20px)'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-[#252525] border-b border-[#333333]">
            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
              <div className="flex items-center gap-4 p-2 min-w-[650px]">
                <div
                  className="cursor-nw-resize p-1 hover:bg-[#333333] rounded transition-colors flex-shrink-0"
                  onMouseDown={handleResize}
                >
                  <Icons.ResizeIcon />
                </div>

                <select
                  value={selectedFunction}
                  onChange={(e) => handleFunctionSelect(e.target.value)}
                  className="px-2 py-1 bg-[#333333] text-sm rounded border border-[#4B5563] min-w-[150px] flex-shrink-0"
                >
                  <option value="">Select Function</option>
                  {functionNodes.map((node) => (
                    <option key={node.id} value={node.id}>
                      {node.data && typeof node.data === 'object' && 'name' in node.data 
                        ? String(node.data.name) 
                        : 'Untitled Function'}
                    </option>
                  ))}
                </select>

                <RunButton
                  onOutput={onOutput}
                  onCodeGenerated={onCodeGenerated}
                  onDebugGenerated={onDebugGenerated}
                  selectedFunction={selectedFunction}
                />

                <button
                  onClick={handleClear}
                  className="flex items-center gap-2 px-4 py-2 text-white rounded-lg shadow-lg border transition-colors bg-[#1E1E1E] hover:bg-[#2D2D2D] border-[#333333] flex-shrink-0"
                >
                  <Icons.ClearIcon />
                  {/* Clear */}
                </button>

                <div className="flex gap-2 flex-shrink-0">
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
            </div>

            <div className="flex items-center pr-2 flex-shrink-0 p-2">
              <button
                onClick={toggleCollapse}
                className="p-1 hover:bg-[#333333] rounded transition-colors"
                title="Collapse console"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M3 8L8 3L13 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
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
        </div>
      )}
    </Panel>
  );
});

Console.displayName = 'Console';

export default Console;