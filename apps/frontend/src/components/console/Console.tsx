import { memo, useCallback, useState, useEffect, useRef } from 'react';
import { useNodes, useEdges, Panel } from '@xyflow/react';
import CodeDisplay from '../code/CodeDisplay';
import RunButton from '../canvas/RunButton';
import { Icons } from '../icons/icons';
import LLMInput from '../llm/LLMInput';
import { LoadingDots } from '../ui/LoadingDots';
import { callLLM } from '../../services/llmService';
import { enhanceCode } from '../../services/codeEnhanceService';
import { useConfig } from '../../contexts/ConfigContext';

interface ConsoleProps {
  className?: string;
  output?: string;
  code?: string;
  debug?: string;
  onOutput: (output: string) => void;
  onCodeGenerated: (code: string) => void;
  onDebugGenerated: (debug: string) => void;
  onClear?: () => void;
  onRestoreFlow?: (nodes: any[], edges: any[]) => void;
  forceCollapse?: boolean;
}

interface RestorePoint {
  timestamp: string;
  nodes: any[];
  edges: any[];
  messageIndex: number;
}

interface Message {
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  id: string;
  error?: boolean;
}

const Console = memo(({ 
  className = '', 
  output = '', 
  code = '', 
  debug = '', 
  onOutput,
  onCodeGenerated,
  onDebugGenerated,
  onClear,
  onRestoreFlow,
  forceCollapse = false
}: ConsoleProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [size, setSize] = useState({ width: 600, height: 400 });
  const [restorePoints, setRestorePoints] = useState<RestorePoint[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messageIdCounter, setMessageIdCounter] = useState(0);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const nodes = useNodes();
  const edges = useEdges();
  const { apiKeys } = useConfig();

  // Track the previous forceCollapse value
  const prevForceCollapseRef = useRef(forceCollapse);
  
  // Update when forceCollapse changes
  useEffect(() => {
    // If menu was opened (forceCollapse changed from false to true)
    if (forceCollapse && !prevForceCollapseRef.current) {
      setIsCollapsed(true);
    }
    
    // Update the ref with current value for next comparison
    prevForceCollapseRef.current = forceCollapse;
  }, [forceCollapse]);

  // Set initial size based on viewport after mount
  useEffect(() => {
    setSize({
      width: window.innerWidth / 2,
      height: Math.min(window.innerHeight / 2, 400)
    });
  }, []);

  const [activeTab, setActiveTab] = useState<'debug' | 'output' | 'code' | 'ai'>('output');
  const [selectedFunction, setSelectedFunction] = useState<string>('');

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

  const handleEnhanceCode = async () => {
    if (!code || isEnhancing || !apiKeys.openai) return;
    
    setIsEnhancing(true);
    try {
      const enhancedCode = await enhanceCode(code, apiKeys.openai);
      onCodeGenerated(enhancedCode);
    } catch (error) {
      console.error('Error enhancing code:', error);
    } finally {
      setIsEnhancing(false);
    }
  };

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
                  <button
                    onClick={() => setActiveTab('ai')}
                    className={`px-3 py-1 rounded ${
                      activeTab === 'ai'
                        ? 'bg-[#2D2D2D] text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    AI
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
            <div className="flex-1 overflow-y-auto p-4 font-mono text-sm whitespace-pre">
              {activeTab === 'output' && (
                <div className="flex-1 overflow-y-auto p-4 font-mono text-sm whitespace-pre">
                  {output}
                </div>
              )}
              {activeTab === 'debug' && (
                <pre className="whitespace-pre-wrap">{debug}</pre>
              )}
              {activeTab === 'code' && (
                <div className="flex flex-col h-full">
                  <div className="flex justify-end items-center mb-2 gap-2">
                    <button
                      onClick={handleEnhanceCode}
                      disabled={isEnhancing}
                      className={`p-2 rounded ${isEnhancing ? 'opacity-50' : 'hover:bg-gray-700'} transition-colors`}
                      title="Enhance variable names"
                    >
                      <Icons.WandIcon className={`w-4 h-4 ${isEnhancing ? 'animate-pulse' : ''}`} />
                    </button>
                    <button
                      onClick={() => navigator.clipboard.writeText(code)}
                      className="p-2 rounded hover:bg-gray-700 transition-colors"
                      title="Copy to clipboard"
                    >
                      <Icons.CopyIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <CodeDisplay code={code.replace(/const HELIUS_API_KEY = ".*";/, 'const HELIUS_API_KEY = process.env.HELIUS_API_KEY;')} />
                </div>
              )}
              {activeTab === 'ai' && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto">
                    {messages.map((message) => (
                      <div key={message.id} className="mb-4">
                        <div className={`flex gap-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`px-4 py-2 rounded-lg max-w-[80%] ${
                            message.type === 'user' 
                              ? 'bg-[#2563EB] text-white' 
                              : message.error 
                                ? 'bg-[#2D2D2D] text-red-400'
                                : 'bg-[#2D2D2D] text-white'
                          }`}>
                            {message.content}
                            {message.type === 'ai' && message.content === 'Processing...' && (
                              <div className="mt-1">
                                <LoadingDots />
                              </div>
                            )}
                          </div>
                        </div>
                        {message.type === 'ai' && message.content !== 'Processing...' && !message.error && (
                          <div className="mt-2 ml-2">
                            <button
                              onClick={() => {
                                const messageIndex = messages.indexOf(message);
                                const point = restorePoints.find(p => p.messageIndex === messageIndex);
                                console.log('messageIndex', messageIndex, 'restorePoints', restorePoints);
                                if (point && onRestoreFlow) {
                                  onRestoreFlow(point.nodes, point.edges);
                                  setMessages(prev => prev.slice(0, messageIndex + 1));
                                  setRestorePoints(prev => prev.filter(p => p.messageIndex <= messageIndex));
                                }
                              }}
                              className="px-2 py-1 text-xs bg-[#2D2D2D] text-gray-400 rounded border border-[#333333] hover:bg-[#3D3D3D] hover:text-white transition-colors"
                            >
                              Restore {new Date(message.timestamp).toLocaleTimeString()}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <LLMInput
                    disabled={isProcessing}
                    onSubmit={async (prompt) => {
                      setIsProcessing(true);
                      const timestamp = new Date().toISOString();
                      const currentMessageIndex = messages.length;
                      
                      const userMessageId = `message-${messageIdCounter}`;
                      setMessageIdCounter(prev => prev + 1);
                      setMessages(prev => [...prev, {
                        type: 'user',
                        content: prompt,
                        timestamp,
                        id: userMessageId
                      }]);

                      const aiMessageId = `message-${messageIdCounter + 1}`;
                      setMessageIdCounter(prev => prev + 2);
                      setMessages(prev => [...prev, {
                        type: 'ai',
                        content: 'Processing...',
                        timestamp: new Date().toISOString(),
                        id: aiMessageId
                      }]);

                      try {
                        const result = await callLLM(prompt, nodes, edges, apiKeys['openai'] || '');

                        setMessages(prev => [
                          ...prev.slice(0, -1),
                          {
                            type: 'ai',
                            content: result.success ? 'Done! Flow has been updated.' : result.message,
                            timestamp: new Date().toISOString(),
                            id: aiMessageId,
                            error: !result.success
                          }
                        ]);

                        if (result.success && result.nodes && result.edges && onRestoreFlow) {
                          onRestoreFlow(result.nodes, result.edges);
                          
                          const newRestorePoint: RestorePoint = {
                            timestamp: new Date().toISOString(),
                            nodes: [...result.nodes],
                            edges: [...result.edges],
                            messageIndex: currentMessageIndex + 1
                          };
                          setRestorePoints(prev => [...prev, newRestorePoint]);
                        }
                      } catch (error) {
                        setMessages(prev => [
                          ...prev.slice(0, -1),
                          {
                            type: 'ai',
                            content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
                            timestamp: new Date().toISOString(),
                            id: aiMessageId,
                            error: true
                          }
                        ]);
                      } finally {
                        setIsProcessing(false);
                      }
                    }}
                  />
                </div>
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