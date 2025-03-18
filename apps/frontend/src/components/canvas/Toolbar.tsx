import { Panel } from "@xyflow/react";

interface ToolbarProps {
  showNodeTypes: boolean;
  toggleNodeTypesDropdown: () => void;
  availableNodeTypes: any[];
  addNewNode: (type: any) => void;
}

export default function Toolbar({
  showNodeTypes,
  toggleNodeTypesDropdown,
  availableNodeTypes,
  addNewNode,
}: ToolbarProps) {
  // Helper function to get the appropriate SVG for each node type
  const getNodeTypeSvg = (type: string) => {
    switch (type) {
      case 'GET':
        return (
          <>
            <rect width="50" height="30" rx="2" fill="#60A5FA" stroke="#000" strokeWidth="1" />
            <text x="25" y="20" textAnchor="middle" fill="black" fontSize="10">
              GET
            </text>
          </>
        );
      case 'START':
        return (
          <>
            <rect width="50" height="30" rx="2" fill="#FFA500" stroke="#000" strokeWidth="1" />
            <text x="25" y="20" textAnchor="middle" fill="black" fontSize="10">
              START
            </text>
          </>
        );
      default:
        return (
          <>
            <rect width="50" height="30" rx="2" fill="#6B7280" stroke="#000" strokeWidth="1" />
            <text x="25" y="20" textAnchor="middle" fill="white" fontSize="10">
              {type}
            </text>
          </>
        );
    }
  };

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
            <div className="absolute top-full left-0 mt-2 w-[320px] bg-[#1e1e1e] rounded shadow-lg z-10 max-h-[300px] overflow-y-auto p-2">
              <div className="grid grid-cols-3 gap-2">
                {availableNodeTypes.map((type) => (
                  <button
                    key={type.id}
                    className="flex flex-col items-center p-2 hover:bg-gray-700 rounded transition"
                    onClick={() => addNewNode(type.id)}
                  >
                    <svg width="60" height="40" viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {getNodeTypeSvg(type.id)}
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* <button
          onClick={togglePanMode}
          className={`p-2 rounded hover:bg-gray-700 transition ${
            isPanMode ? 'bg-gray-700' : ''
          }`}
          title="Pan Mode"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 4V8M15 8V12M15 8H11M15 8H19" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <path d="M9 11V15M9 15V19M9 15H5M9 15H13" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button> */}
        
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