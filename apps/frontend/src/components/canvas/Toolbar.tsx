import { NodeCategory, NodeType } from "../../types/nodeTypes";
import { Panel } from "@xyflow/react";
import { useState } from "react";

interface ToolbarProps {
  showNodeTypes: boolean;
  toggleNodeTypesDropdown: () => void;
  nodeTypesData: Record<string, NodeType>;
  addNewNode: (type: any) => void;
}

export default function Toolbar({
  showNodeTypes,
  toggleNodeTypesDropdown,
  nodeTypesData,
  addNewNode,
}: ToolbarProps) {
  const [activeTab, setActiveTab] = useState<NodeCategory>('Default');

  // Filter node types by active category
  const filteredNodeTypes = Object.values(nodeTypesData).filter(type => type.category === activeTab);

  return (
    <Panel position="top-center" className="bg-[#121212] rounded-b-md p-2 shadow-md">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <button
            onClick={toggleNodeTypesDropdown}
            className={`p-2 rounded hover:bg-gray-700 transition ${
              showNodeTypes ? 'bg-gray-700' : ''
            }`}
            title="Add Node"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="white" strokeWidth="2" />
            </svg>
          </button>

          {showNodeTypes && (
            <div className="absolute top-full left-0 mt-2 w-[320px] bg-[#1e1e1e] rounded shadow-lg z-10 overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-gray-700">
                {['Default', 'DeFi', 'Misc'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as NodeCategory)}
                    className={`flex-1 px-4 py-2 text-sm ${
                      activeTab === tab 
                        ? 'bg-gray-700 text-white' 
                        : 'text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Node grid */}
              <div className="max-h-[300px] overflow-y-auto p-2">
                <div className="grid grid-cols-3 gap-2">
                  {filteredNodeTypes.map((type) => (
                    <button
                      key={type.id}
                      className="flex flex-col items-center p-2 hover:bg-gray-700 rounded transition"
                      onClick={() => addNewNode(type.id)}
                    >
                      <div className={`w-[60px] h-[40px] flex items-center justify-center ${type.backgroundColor} rounded border ${type.borderColor}`}>
                        <span className={`text-xs ${type.textColor} font-medium`}>{type.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          className="p-2 rounded hover:bg-gray-700 transition"
          title="Run (Coming Soon)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 4L19 12L5 20V4Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </Panel>
  );
}