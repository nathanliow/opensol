import { NodeCategory, NodeType } from "../../types/NodeTypes";
import { Panel } from "@xyflow/react";
import { useState, useRef, useEffect } from "react";
import { Icons } from "../icons/icons";

interface ToolbarProps {
  showNodeTypes: boolean;
  toggleNodeTypesDropdown: () => void;
  nodeTypesData: Record<string, NodeType>;
  addNewNode: (type: any, position?: { x: number; y: number }) => void;
  selectionMode: boolean;
  toggleSelectionMode: () => void;
  isReadOnly?: boolean; 
}

export default function Toolbar({
  showNodeTypes,
  toggleNodeTypesDropdown,
  nodeTypesData,
  addNewNode,
  selectionMode,
  toggleSelectionMode,
  isReadOnly = false, 
}: ToolbarProps) {
  const [activeTab, setActiveTab] = useState<NodeCategory>('Default');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showNodeTypes && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        event.preventDefault();
        event.stopPropagation();
        toggleNodeTypesDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside, true); 
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [showNodeTypes, toggleNodeTypesDropdown]);

  const filteredNodeTypes = Object.values(nodeTypesData).filter(type => type.category === activeTab);

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    if (isReadOnly) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Panel position="top-center">
      <div className="flex bg-[#1E1E1E] rounded-lg items-center py-1 px-4 space-x-4">
        <button
          onClick={toggleSelectionMode}
          className={`flex items-center justify-center w-10 h-10 ${isReadOnly ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : selectionMode ? 'bg-[#3D3D3D] text-white' : 'bg-[#1E1E1E] hover:bg-[#2D2D2D] text-gray-300'} rounded-lg shadow-lg`}
          title={isReadOnly ? "Viewing Only - Cannot Edit" : "Selection Tool"}
          disabled={isReadOnly}
        >
          <Icons.FiMousePointer size={18} />
        </button>

        {isReadOnly && (
          <div className="flex items-center bg-amber-700/20 text-amber-400 px-2 py-1 rounded-md text-xs">
            <Icons.FiEyeOff className="mr-1" size={14} />
            View Only
          </div>
        )}

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={isReadOnly ? undefined : toggleNodeTypesDropdown}
            className={`flex items-center justify-center w-10 h-10 rounded-lg shadow-lg ${isReadOnly ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-[#1E1E1E] hover:bg-[#2D2D2D] text-white'}`}
            title={isReadOnly ? "Cannot add nodes in view mode" : "Add Node"}
            disabled={isReadOnly}
          >
            <Icons.FaRegSquare size={20} /> 
          </button>

          {showNodeTypes && !isReadOnly && (
            <div className="absolute top-full left-0 mt-2 w-[320px] bg-[#1e1e1e] rounded shadow-lg z-10 overflow-hidden">
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