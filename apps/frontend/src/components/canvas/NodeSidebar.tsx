import { useState } from "react";
import { Panel } from "@xyflow/react";
import { NodeCategory, NodeType } from "../../types/NodeTypes";
import { Icons } from "../icons/icons";

interface NodeSidebarProps {
  nodeTypesData: Record<string, NodeType>;
  addNewNode: (type: any, position?: { x: number; y: number }) => void;
  isReadOnly?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export default function NodeSidebar({
  nodeTypesData,
  addNewNode,
  isReadOnly = false,
  onDragStart,
  onDragEnd,
}: NodeSidebarProps) {
  const [activeTab, setActiveTab] = useState<NodeCategory>("Default");
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const categories: NodeCategory[] = ["Default", "DeFi", "Misc"];
  
  const filteredNodeTypes = Object.values(nodeTypesData).filter(
    (type) => type.category === activeTab
  );

  const onDragStartHandler = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    if (isReadOnly) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
    
    // Notify parent component that dragging has started
    if (onDragStart) {
      onDragStart();
    }
  };

  const onDragEndHandler = () => {
    // Notify parent component that dragging has ended
    if (onDragEnd) {
      onDragEnd();
    }
  };

  const onDragOverHandler = (event: React.DragEvent<HTMLDivElement>) => {
    // Prevent default to allow drop and set dropEffect
    event.preventDefault();
    event.dataTransfer.dropEffect = 'none';
  };

  const onDropHandler = (event: React.DragEvent<HTMLDivElement>) => {
    // Prevent default and stop propagation to cancel the drop
    event.preventDefault();
    event.stopPropagation();
    
    // Reset drag state
    if (onDragEnd) {
      onDragEnd();
    }
  };

  return (
    <Panel position="top-left" className="ml-2 pt-[10px]">
      <div 
        id="node-sidebar-container" 
        className="flex h-[calc(100vh-60px)]"
        onDragOver={onDragOverHandler}
        onDrop={onDropHandler}
      >
        {/* Collapsed state - just show expand button */}
        {!isOpen && (
          <button
            onClick={toggleSidebar}
            className="bg-[#1E1E1E] text-white hover:bg-[#2D2D2D] p-2 rounded-lg shadow-lg"
            title="Expand Nodes Panel"
          >
            <Icons.FiArrowRight size={16} />
          </button>
        )}

        {/* Expanded state - show full sidebar */}
        {isOpen && (
          <div className="flex flex-col bg-[#1E1E1E] rounded-lg shadow-lg h-full">
            {/* Sidebar Header */}
            <div className="flex justify-between items-center p-3 border-b border-gray-700">
              <h3 className="text-white font-medium">Nodes</h3>
              <button
                onClick={toggleSidebar}
                className="text-gray-400 hover:text-white"
                title="Collapse Nodes Panel"
              >
                <Icons.FiX size={16} />
              </button>
            </div>

            {/* Two-column layout */}
            <div className="flex flex-row flex-1 min-h-0">
              {/* Categories Column - Independently scrollable */}
              <div className="w-24 border-r border-gray-700 overflow-y-auto flex-shrink-0">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveTab(category)}
                    className={`w-full px-2 py-3 text-xs text-center transition-colors ${
                      activeTab === category
                        ? "bg-gray-700 text-white"
                        : "text-gray-400 hover:bg-gray-800"
                    } flex flex-col items-center`}
                  >
                    <span className="block mb-1">{getCategoryIcon(category)}</span>
                    <span>{category}</span>
                  </button>
                ))}
              </div>

              {/* Node Items - Independently scrollable */}
              <div className="flex-1 flex flex-col w-28">
                {/* Node List */}
                <div className="overflow-y-auto p-2 flex-1">
                  <div className="grid grid-cols-1 gap-2">
                    {filteredNodeTypes.map((type) => (
                      <div
                        key={type.id}
                        className={`flex flex-col items-center p-2 rounded transition-colors ${
                          isReadOnly
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-gray-700 cursor-grab"
                        }`}
                        onClick={isReadOnly ? undefined : () => addNewNode(type.id)}
                        draggable={!isReadOnly}
                        onDragStart={
                          isReadOnly 
                            ? undefined 
                            : (event) => onDragStartHandler(event, type.id)
                        }
                        onDragEnd={isReadOnly ? undefined : onDragEndHandler}
                      >
                        <div
                          className={`w-full h-[40px] flex items-center justify-center ${type.backgroundColor} rounded border ${type.borderColor}`}
                        >
                          <span
                            className={`text-xs ${type.textColor} font-medium`}
                          >
                            {type.label}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Read-Only Notice (if applicable) */}
                {isReadOnly && (
                  <div className="flex items-center justify-center bg-amber-700/20 text-amber-400 px-2 py-2 mx-2 mb-2 rounded-md text-xs">
                    <Icons.FiEyeOff className="mr-1" size={14} />
                    View Only - Cannot Add Nodes
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}

// Helper function to get appropriate icons for categories
function getCategoryIcon(category: NodeCategory) {
  switch (category) {
    case "Default":
      return <Icons.FiBox size={14} />;
    case "DeFi":
      return <Icons.FiDatabase size={14} />;
    case "Misc":
      return <Icons.FiGitMerge size={14} />;
    default:
      return <Icons.FiBox size={14} />;
  }
} 