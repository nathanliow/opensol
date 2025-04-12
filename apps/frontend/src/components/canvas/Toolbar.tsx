import { 
  useState, 
  useRef, 
  useEffect 
} from "react";
import { Panel } from "@xyflow/react";
import { Icons } from "../icons/icons";
import { useRouter } from "next/navigation";
import { useUserAccountContext } from "@/app/providers/UserAccountContext";
import { useUSDCTransfer } from "@/lib/usdc";
import { 
  createProject, 
  copyProject, 
} from "@/lib/projects";
import { Project } from "@/types/ProjectTypes";
import { usePrivy } from "@privy-io/react-auth";

interface ToolbarProps {
  selectionMode: boolean;
  toggleSelectionMode: () => void;
  isReadOnly?: boolean;
  onExport: () => any;
  onImport: (flowData: any) => void;
  projectId?: string | null;
  onProjectChange?: () => void;
  projectData?: Project | null;
  onProjectMenuToggle?: (isOpen: boolean) => void;
}

export const Toolbar = ({
  selectionMode,
  toggleSelectionMode,
  isReadOnly = false,
  onExport,
  onImport,
  projectId,
  onProjectChange,
  projectData,
  onProjectMenuToggle,
}: ToolbarProps) => {
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(projectData?.is_public || false);
  const projectMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);
  const [tipAmount, setTipAmount] = useState(0);
  const [isTipping, setIsTipping] = useState(false);
  const router = useRouter();
  const { supabaseUser } = useUserAccountContext();
  const { login } = usePrivy();
  const { sendUSDC } = useUSDCTransfer();

  useEffect(() => {
    // Update isPublic when projectData changes
    if (projectData) {
      setIsPublic(projectData.is_public || false);
    }
  }, [projectData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (projectMenuOpen && projectMenuRef.current && !projectMenuRef.current.contains(event.target as Node)) {
        event.preventDefault();
        event.stopPropagation();
        setProjectMenuOpen(false);
        
        // Notify parent when menu is closed by clicking outside
        if (onProjectMenuToggle) {
          onProjectMenuToggle(false);
        }
      }
    };

    if (projectMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside, true);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside, true);
      };
    }
  }, [projectMenuOpen, onProjectMenuToggle]);

  const toggleProjectMenu = () => {
    const newState = !projectMenuOpen;
    setProjectMenuOpen(newState);
    
    // Notify parent when menu is toggled
    if (onProjectMenuToggle) {
      onProjectMenuToggle(newState);
    }
  };

  const toggleProjectPublic = async () => {
    if (!projectId || !supabaseUser || isTogglingVisibility) return;

    setIsTogglingVisibility(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/toggle-public`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPublic: !isPublic }),
      });

      if (response.ok) {
        setIsPublic(!isPublic);
      } else {
        console.error("Failed to update project visibility");
      }
    } catch (error) {
      console.error("Error toggling project visibility:", error);
    } finally {
      setIsTogglingVisibility(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileReader = new FileReader();
      fileReader.onloadend = () => {
        try {
          if (typeof fileReader.result === "string") {
            const flowData = JSON.parse(fileReader.result);
            onImport(flowData);
          }
        } catch (error) {
          console.error("Error parsing flow file:", error);
          alert("Could not parse flow file. Make sure it is a valid JSON file.");
        }
      };
      fileReader.readAsText(file);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
    setProjectMenuOpen(false);
    
    // Notify parent when menu is closed
    if (onProjectMenuToggle) {
      onProjectMenuToggle(false);
    }
  };

  const handleExportClick = () => {
    setProjectMenuOpen(false);
    
    // Notify parent when menu is closed
    if (onProjectMenuToggle) {
      onProjectMenuToggle(false);
    }

    try {
      const flowData = onExport();
      const dataStr = JSON.stringify(flowData, null, 2);
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
      const exportName = "flow-" + new Date().getTime() + ".json";

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportName);
      linkElement.click();
    } catch (error) {
      console.error("Error exporting flow:", error);
      alert("Error exporting flow. Please try again.");
    }
  };

  const handleSaveProject = async () => {
    if (!supabaseUser) {
      alert("Please log in to save your project");
      return;
    }

    try {
      const flowData = onExport();
      const projectName = prompt("Enter a name for your project:", "Untitled Project");
      if (!projectName) return;

      const newProject: Project = await createProject({
        name: projectName,
        description: "",
        nodes: flowData.nodes,
        edges: flowData.edges,
        user_id: supabaseUser.id,
        stars: 0,
        earnings: 0,
      });

      localStorage.setItem("currentProjectId", newProject.id || '');
      setProjectMenuOpen(false);
      
      // Notify parent when menu is closed
      if (onProjectMenuToggle) {
        onProjectMenuToggle(false);
      }
      
      router.push("/");
    } catch (error) {
      console.error("Failed to create project:", error);
      alert("Failed to create project. Please try again.");
    }
  };

  const handleCopyProject = async () => {
    if (!projectId || !supabaseUser || !projectData) return;

    try {
      const newProject = await copyProject(projectId, supabaseUser.id);

      // Save the new project ID to localStorage
      localStorage.setItem("currentProjectId", newProject.id || '');
      localStorage.setItem("forceProjectReload", "true");

      // Trigger project change to reload the canvas
      if (onProjectChange) {
        onProjectChange();
      }

      // Close the menu
      setProjectMenuOpen(false);
      
      // Notify parent when menu is closed
      if (onProjectMenuToggle) {
        onProjectMenuToggle(false);
      }
    } catch (error) {
      console.error("Failed to copy project:", error);
    }
  };

  const handleTipProject = async () => {
    try {
      if (!supabaseUser) {
        await login();
        return;
      }

      if (!projectId || !projectData || !tipAmount) {
        console.error('Missing required data for tipping');
        return;
      }

      setIsTipping(true);

      // Get the recipient's wallet address from the API
      const response = await fetch(`/api/projects/${projectId}/tip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ amount: tipAmount }),
      });

      if (!response.ok) {
        throw new Error('Failed to get recipient wallet address');
      }

      const { recipientWallet } = await response.json();
      console.log('Recipient wallet:', recipientWallet);

      // Send USDC tip
      await sendUSDC(tipAmount, recipientWallet);
      alert('Tip sent successfully!');
      setTipAmount(0);
    } catch (error) {
      console.error('Error sending tip:', error);
      alert('Failed to send tip. Please make sure your wallet is connected and try again.');
    } finally {
      setIsTipping(false);
    }
  };

  const isProjectOwner = projectData?.user_id === supabaseUser?.id;

  return (
    <Panel position="top-center">
      <div className="flex bg-[#1E1E1E] rounded-lg items-center py-1 px-4 space-x-4">
        <button
          onClick={toggleSelectionMode}
          className={`flex items-center justify-center w-10 h-10 transition-colors ${selectionMode ? 'bg-[#3D3D3D] text-white cursor-pointer' : 'bg-[#1E1E1E] hover:bg-[#2D2D2D] text-gray-300 cursor-pointer '} rounded-lg shadow-lg`}
        >
          <Icons.FiMousePointer size={18} />
        </button>

        {/* Project Menu Button */}
        <div ref={projectMenuRef} className="relative">
          <button
            onClick={toggleProjectMenu}
            className="flex items-center justify-center bg-[#1E1E1E] hover:bg-[#2D2D2D] text-white rounded-lg shadow-lg h-10 px-3 space-x-1 cursor-pointer transition-colors"
            title="Project Menu"
          >
            <Icons.FiFolder size={16} />
          </button>

          {projectMenuOpen && (
            <div className="absolute top-12 left-0 w-64 bg-[#1E1E1E] border border-[#333333] rounded-lg shadow-lg z-50 overflow-hidden">
              {/* Project info section */}
              {projectId && projectData && (
                <div className="p-4 border-b border-[#333333]">
                  <h3 className="font-semibold text-lg truncate text-white">{projectData.name}</h3>
                  {projectData.description && (
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">{projectData.description}</p>
                  )}
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Icons.FiUser className="mr-1" />
                      {isProjectOwner ? "You" : "Another User"}
                    </div>
                    {projectData.is_public && (
                      <div className="flex items-center ml-3">
                        <Icons.FiGlobe className="mr-1" />
                        Public
                      </div>
                    )}
                  </div>
                  {!isProjectOwner && (
                    <div className="mt-3 bg-amber-900/20 border border-amber-900/30 rounded-md p-2 text-xs text-amber-400 flex items-center">
                      <Icons.FiAlertTriangle className="mr-1 flex-shrink-0" size={14} />
                      <span>View-only mode</span>
                    </div>
                  )}

                  {/* Public/Private toggle */}
                  {isProjectOwner && (
                    <div className="mt-3 flex items-center justify-between p-2 bg-[#1E1E1E] rounded-md">
                      <span className="flex items-center text-xs text-gray-300">
                        <Icons.FiGlobe className="mr-1" />
                        {isPublic ? "Public project" : "Private project"}
                      </span>
                      <button
                        onClick={toggleProjectPublic}
                        className={`flex items-center ${isTogglingVisibility ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                        aria-label={isPublic ? "Make Private" : "Make Public"}
                        disabled={isTogglingVisibility}
                      >
                        <div className={`w-8 h-4 ${isPublic ? "bg-green-500" : "bg-gray-600"} rounded-full relative transition-colors`}>
                          {isTogglingVisibility ? (
                            <div className="absolute w-3 h-3 bg-white rounded-full top-0.5 left-0.5 animate-pulse"></div>
                          ) : (
                            <div className={`absolute w-3 h-3 bg-white rounded-full top-0.5 transition-transform ${isPublic ? "right-0.5" : "left-0.5"}`}></div>
                          )}
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Project action buttons */}
              <div className="p-2">
                {supabaseUser && (
                  <>
                    <button
                      onClick={handleCopyProject}
                      className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#2D2D2D] rounded-md flex items-center gap-2"
                      disabled={!projectId}
                    >
                      <Icons.FiCopy size={16} />
                      Copy Project
                    </button>
                    <button
                      onClick={handleSaveProject}
                      className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#2D2D2D] rounded-md flex items-center gap-2"
                    >
                      <Icons.FiSave size={16} />
                      Save as Project
                    </button>
                  </>
                )}
                <button
                  onClick={handleImportClick}
                  className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#2D2D2D] rounded-md flex items-center gap-2"
                >
                  <Icons.FiUpload size={16} />
                  Import Flow
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  style={{ display: "none" }}
                  accept=".json"
                />
                <button
                  onClick={handleExportClick}
                  className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#2D2D2D] rounded-md flex items-center gap-2"
                >
                  <Icons.FiDownload size={16} />
                  Export Flow
                </button>
                {supabaseUser && (
                  <div className="flex flex-row items-center gap-2">
                    <div
                      className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#2D2D2D] rounded-md flex items-center gap-2"
                    >
                      <Icons.FiDollarSign size={16} />
                      Tip
                    </div>
                    <input
                        type="number"
                        value={tipAmount}
                        onChange={(e) => setTipAmount(Number(e.target.value))}
                        className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#2D2D2D] rounded-md flex items-center gap-2"
                      />
                      <button
                        onClick={handleTipProject}
                        className="bg-blue-500 w-full text-left px-3 py-2 text-sm text-white hover:bg-[#2D2D2D] rounded-md flex items-center gap-2"
                        disabled={!projectId || !projectData || isProjectOwner || isTipping}
                      >
                        Tip
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {isReadOnly && (
          <div className="flex items-center bg-amber-700/20 text-amber-400 px-2 py-1 rounded-md text-xs">
            <Icons.FiEyeOff className="mr-1" size={14} />
            View Only
          </div>
        )}
      </div>
    </Panel>
  );
}