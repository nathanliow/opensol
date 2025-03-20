import { NodeCategory, NodeType } from "../../types/nodeTypes";
import { Panel } from "@xyflow/react";
import { useState } from "react";
import { Icons } from "../icons/icons";

interface ToolbarProps {
  showNodeTypes: boolean;
  toggleNodeTypesDropdown: () => void;
  nodeTypesData: Record<string, NodeType>;
  addNewNode: (type: any, position?: { x: number; y: number }) => void;
  selectionMode: boolean;
  toggleSelectionMode: () => void;
}

export default function Toolbar({
  showNodeTypes,
  toggleNodeTypesDropdown,
  nodeTypesData,
  addNewNode,
  selectionMode,
  toggleSelectionMode,
}: ToolbarProps) {
  const [activeTab, setActiveTab] = useState<NodeCategory>('Default');

  // Filter node types by active category
  const filteredNodeTypes = Object.values(nodeTypesData).filter(type => type.category === activeTab);

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Panel position="top-center">
      <div className="flex bg-[#1E1E1E] rounded-lg items-center py-1 px-4 space-x-4">
        <button
          onClick={toggleSelectionMode}
          className={`flex items-center justify-center w-10 h-10 ${
            selectionMode 
              ? 'bg-[#3D3D3D] text-white' 
              : 'bg-[#1E1E1E] hover:bg-[#2D2D2D] text-gray-300'
          } rounded-lg shadow-lg`}
          title="Selection Tool"
        >
          <Icons.FiMousePointer size={18} />
        </button>

        <div className="relative">
          <button
            onClick={toggleNodeTypesDropdown}
            className="flex items-center justify-center w-10 h-10 bg-[#1E1E1E] hover:bg-[#2D2D2D] rounded-lg shadow-lg text-white"
            title="Add Node"
          >
            <Icons.FaRegSquare size={20} /> 
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
                    <div
                      key={type.id}
                      className="flex flex-col items-center p-2 hover:bg-gray-700 rounded transition cursor-grab"
                      onClick={() => addNewNode(type.id)}
                      draggable
                      onDragStart={(event) => onDragStart(event, type.id)}
                    >
                      <div className={`w-[70px] h-[40px] flex items-center justify-center ${type.backgroundColor} rounded border ${type.borderColor}`}>
                        <span className={`text-xs ${type.textColor} font-medium`}>{type.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}