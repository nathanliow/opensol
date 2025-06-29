import { memo, useCallback, useState, useEffect, useRef, useMemo } from 'react';
import React from 'react';
import { useNodes, useEdges, Panel } from '@xyflow/react';
import { RunButton } from '../canvas/RunButton';
import { Icons } from '../icons/icons';
import { LLMInput } from '../llm/LLMInput';
import { LoadingDots } from '../ui/LoadingDots';
import { callLLM } from '../../services/llmService';
import { useConfig } from '../../contexts/ConfigContext';
import { FlowNode } from '../../../../backend/src/packages/compiler/src/types';
import { functionDisplayStringMap } from '@/code-strings';
import { CodeContent, CodeTab } from './CodeContent';
import { OutputContent } from './OutputContent';
import { DebugContent } from './DebugContent';

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

export const Console = memo(({ 
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
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [size, setSize] = useState({ width: 600, height: 400 });
  const [restorePoints, setRestorePoints] = useState<RestorePoint[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messageIdCounter, setMessageIdCounter] = useState(0);
  const nodes = useNodes() as FlowNode[];
  const edges = useEdges();
  const { apiKeys } = useConfig();

  // Track the previous forceCollapse value
  const prevForceCollapseRef = useRef(forceCollapse);
  
  useEffect(() => {
    if (forceCollapse && !prevForceCollapseRef.current) {
      setIsCollapsed(true);
    }
    
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
  const [activeCodeTab, setActiveCodeTab] = useState<string>('main');

  // Get all function nodes
  const functionNodes = nodes.filter((n: FlowNode) => n.type === 'FUNCTION');

  // Extract import statements and create code tabs
  const codeTabs = useMemo<CodeTab[]>(() => {
    const tabs: CodeTab[] = [
      { id: 'main', name: 'main.ts', content: code }
    ];    
    
    // Extract import statements using regex
    const importRegex = /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]([^'"]+)['"]/g;
    let matches;
    
    while ((matches = importRegex.exec(code)) !== null) {
      const imports = matches[1].split(',').map(s => s.trim());
      const importPath = matches[2];
      
      imports.forEach(importName => {
        // Add tab for each imported function if it doesn't exist
        if (!tabs.some(tab => tab.id === importName)) {
          // Use the mapping to get the function code, or fallback to generic template
          const functionCode = functionDisplayStringMap[importName] || `// ${importName} implementation from ${importPath}
export async function ${importName}(params: any) {
  try {
    // Function implementation would be here
    console.log('Executing ${importName} with params:', params);
    
    // Return example result
    return { success: true, result: 'Function executed successfully' };
  } catch (error) {
    console.error('Error in ${importName}:', error);
    throw error;
  }
}`;
          
          tabs.push({
            id: importName,
            name: `${importName}.ts`,
            content: functionCode
          });
        }
      });
    }
    
    return tabs;
  }, [code]);

  // Reset activeCodeTab to 'main' when code changes
  const codeRef = useRef(code);
  useEffect(() => {
    if (code !== codeRef.current) {
      // Code has changed, switch back to main tab
      setActiveCodeTab('main');
      codeRef.current = code;
    }
  }, [code]);

  const getActiveCodeContent = useCallback(() => {
    const tab = codeTabs.find(tab => tab.id === activeCodeTab);
    return tab ? tab.content : code;
  }, [codeTabs, activeCodeTab, code]);

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
                  {functionNodes.map((node: FlowNode) => (
                    <option key={node.id} value={node.id}>
                      {node.data && node.data.inputs && node.data.inputs.name
                        ? String(node.data.inputs.name.value) 
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
                <Icons.FiArrowDown />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col h-[calc(100%-40px)]">
            <div className="flex-1 overflow-y-auto p-4 font-mono text-sm whitespace-pre">
              {activeTab === 'output' && (
                <OutputContent output={output} />
              )}
              {activeTab === 'debug' && (
                <DebugContent debug={debug} />
              )}
              {activeTab === 'code' && (
                <CodeContent 
                  codeTabs={codeTabs}
                  activeCodeTab={activeCodeTab}
                  setActiveCodeTab={setActiveCodeTab}
                  getActiveCodeContent={getActiveCodeContent}
                />
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
                        const result = await callLLM(prompt, nodes, edges, apiKeys.openai?.key || '');

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