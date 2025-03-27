import { usePrivy } from "@privy-io/react-auth";
import { Panel } from "@xyflow/react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConfig, Network } from "../../contexts/ConfigContext";
import { Icons } from "../icons/icons";
import { createProject, copyProject } from "@/lib/projects";
import { useUserAccountContext } from "@/app/providers/UserAccountContext";
import { signOut } from "@/lib/auth";
import { useReactFlow } from "@xyflow/react";

interface MenuProps {
  onExport: () => any;
  onImport: (flowData: any) => void;
  projectId?: string | null;
  onProjectChange?: () => void;
  isProjectOwner?: boolean;
  projectData?: any;
  onMenuToggle?: (isOpen: boolean) => void;
}

const Menu = ({ onExport, onImport, projectId, onProjectChange, isProjectOwner = true, projectData, onMenuToggle }: MenuProps) => {
  const { login, logout } = usePrivy();
  const { userAddress, supabaseUser } = useUserAccountContext();
  const { network, setNetwork, apiKeys, setApiKey } = useConfig();
  const [isOpen, setIsOpen] = useState(false);
  const [heliusApiKey, setHeliusApiKey] = useState(apiKeys['helius'] || '');
  const [openaiApiKey, setOpenaiApiKey] = useState(apiKeys['openai'] || '');
  const [birdeyeApiKey, setBirdeyeApiKey] = useState(apiKeys['birdeye'] || '');
  const [isPublic, setIsPublic] = useState(projectData?.is_public || false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const reactFlowInstance = useReactFlow();
  
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  useEffect(() => {
    // Update isPublic when projectData changes
    if (projectData) {
      setIsPublic(projectData.is_public || false);
    }
  }, [projectData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        event.preventDefault();
        event.stopPropagation();
        setIsOpen(false);
        
        if (onMenuToggle) {
          onMenuToggle(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside, true);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside, true);
      };
    }
  }, [isOpen, onMenuToggle]);


  const handleNetworkChange = (newNetwork: Network) => {
    setNetwork(newNetwork);
  };

  const toggleMenu = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    if (onMenuToggle) {
      onMenuToggle(newIsOpen);
    }
  };

  const handleApiKeySave = (provider: string, key: string) => {
    setApiKey(provider, key);
  };

  const toggleProjectPublic = async () => {
    if (!projectId || !supabaseUser) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/toggle-public`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPublic: !isPublic }),
      });

      if (response.ok) {
        setIsPublic(!isPublic);
      } else {
        console.error('Failed to update project visibility');
      }
    } catch (error) {
      console.error('Error toggling project visibility:', error);
    }
  };

  const saveFile = (file: File) => {
    const fileReader = new FileReader();
    fileReader.onloadend = () => {
      try {
        if (typeof fileReader.result === 'string') {
          const flowData = JSON.parse(fileReader.result);
          onImport(flowData);
        }
      } catch (error) {
        console.error('Error parsing flow file:', error);
        alert('Could not parse flow file. Make sure it is a valid JSON file.');
      }
    };
    fileReader.readAsText(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      saveFile(file);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleExportClick = () => {
    setIsOpen(false);
    
    try {
      const flowData = onExport();
      const dataStr = JSON.stringify(flowData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const exportName = 'flow-' + new Date().getTime() + '.json';

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportName);
      linkElement.click();
    } catch (error) {
      console.error('Error exporting flow:', error);
      alert('Error exporting flow. Please try again.');
    }
  };

  const handleSaveProject = async () => {
    if (!supabaseUser) {
      alert('Please log in to save your project');
      return;
    }

    try {
      const flowData = onExport();
      const projectName = prompt('Enter a name for your project:', 'Untitled Project');
      if (!projectName) return;

      const newProject = await createProject({
        name: projectName,
        description: '',
        nodes: flowData.nodes,
        edges: flowData.edges,
        user_id: supabaseUser.id,
        stars: 0
      });

      localStorage.setItem('currentProjectId', newProject.id);
      setIsOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project. Please try again.');
    }
  };
  
  const createNewProject = async () => {
    if (!supabaseUser) {
      alert('Please log in to create a project');
      return;
    }
    
    if (!newProjectName.trim()) {
      alert('Please enter a project name');
      return;
    }
    
    try {
      localStorage.removeItem('currentProjectId');
      
      if (reactFlowInstance) {
        reactFlowInstance.setNodes([]);
        reactFlowInstance.setEdges([]);
      }
      
      const newProject = await createProject({
        name: newProjectName,
        description: newProjectDescription,
        nodes: [],
        edges: [],
        user_id: supabaseUser.id,
        stars: 0
      });
      
      localStorage.setItem('currentProjectId', newProject.id);
      
      setShowNewProjectModal(false);
      setIsOpen(false);
      
      setNewProjectName('');
      setNewProjectDescription('');
      
      localStorage.setItem('forceProjectReload', 'true');
      
      if (onProjectChange) {
        onProjectChange();
      }
      
      router.push('/');
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      logout();
      localStorage.removeItem('currentProjectId');
      setIsOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navigateToDashboard = () => {
    setIsOpen(false);
    router.push('/dashboard');
  };

  const handleCopyProject = async () => {
    if (!projectId || !supabaseUser || !projectData) return;
    
    try {
      const newProject = await copyProject(projectId, supabaseUser.id);
      
      // Save the new project ID to localStorage
      localStorage.setItem('currentProjectId', newProject.id);
      localStorage.setItem('forceProjectReload', 'true');
      
      // Trigger project change to reload the canvas
      if (onProjectChange) {
        onProjectChange();
      }
      
      // Close the menu
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to copy project:', error);
    }
  };

  return (
    <>
      <Panel position="top-right">
        <div ref={menuRef}>
          <button
            onClick={toggleMenu}
            className="flex items-center justify-center w-10 h-10 bg-[#1E1E1E] hover:bg-[#2D2D2D] border border-[#333333] rounded-lg shadow-lg text-white"
            aria-label="Toggle menu"
          >
            {isOpen ? <Icons.FiX size={20} /> : <Icons.FiMenu size={20} />}
          </button>

          {isOpen && (
            <div className="absolute top-12 right-0 w-64 max-h-[calc(100vh-150px)] overflow-y-auto p-4 space-y-4 bg-[#1E1E1E] border border-[#333333] rounded-lg shadow-lg z-50">
              {/* Project info section */}
              {projectId && projectData && (
                <div className="bg-[#1E1E1E] p-4 rounded-lg border border-[#333333] mb-4">
                  <h3 className="font-semibold text-lg truncate">{projectData.name}</h3>
                  {projectData.description && (
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">{projectData.description}</p>
                  )}
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Icons.FiUser className="mr-1" />
                      {projectData.user_id === supabaseUser?.id ? 'You' : 'Another User'}
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
                  
                  {/* Public/Private toggle moved here */}
                  {isProjectOwner && (
                    <div className="mt-3 flex items-center justify-between p-2 bg-[#2D2D2D] rounded-md">
                      <span className="flex items-center text-xs text-gray-300">
                        <Icons.FiGlobe className="mr-1" />
                        {isPublic ? 'Public project' : 'Private project'}
                      </span>
                      <button
                        onClick={toggleProjectPublic}
                        className="flex items-center"
                        aria-label={isPublic ? 'Make Private' : 'Make Public'}
                      >
                        <div className={`w-8 h-4 ${isPublic ? 'bg-green-500' : 'bg-gray-600'} rounded-full relative transition-colors`}>
                          <div className={`absolute w-3 h-3 bg-white rounded-full top-0.5 transition-transform ${isPublic ? 'right-0.5' : 'left-0.5'}`}></div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              )}
              {userAddress && (
                <div className="p-3 border-b border-[#333333] text-xs">
                  <div className="font-medium text-gray-300">Connected Wallet</div>
                  <div className="mt-1 font-mono text-gray-400 truncate">{userAddress}</div>
                </div>
              )}
              <div className="p-2">
                {supabaseUser && (
                  <>
                    <button
                      onClick={handleCopyProject}
                      className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#2D2D2D] rounded-md flex items-center gap-2"
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
                    <button
                      onClick={navigateToDashboard}
                      className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#2D2D2D] rounded-md flex items-center gap-2"
                    >
                      <Icons.FiFolder size={16} />
                      Go to Dashboard
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
                  style={{ display: 'none' }} 
                  accept=".json"
                />
                <button
                  onClick={handleExportClick}
                  className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#2D2D2D] rounded-md flex items-center gap-2"
                >
                  <Icons.FiDownload size={16} />
                  Export Flow
                </button>
                <div className="border-t border-[#333333] mt-2 pt-2">
                  <div className="text-xs text-gray-400 px-3 pb-1">Network</div>
                  <div className="flex flex-col gap-1">
                    <button
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-md ${network === 'mainnet' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-[#2D2D2D]'}`}
                      onClick={() => handleNetworkChange('mainnet')}
                    >
                      Mainnet
                    </button>
                    <button
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-md ${network === 'devnet' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-[#2D2D2D]'}`}
                      onClick={() => handleNetworkChange('devnet')}
                    >
                      Devnet
                    </button>
                  </div>
                </div>

                {/* API Keys */}
                <div className="border-t border-[#333333] mt-2 pt-2">
                  <div className="text-xs text-gray-400 px-3 pb-1">API Keys</div>
                  <div className="px-3 pb-2">
                    <div className="mb-1.5 mt-1">
                      <label className="block text-xs text-gray-400 mb-1 flex items-center" htmlFor="helius">
                        Helius API Key
                        <a href="https://dev.helius.xyz/dashboard/app" target="_blank" rel="noopener noreferrer" className="inline-flex ml-1">
                          <Icons.FiInfo size={12} />
                        </a>
                      </label>
                      <input 
                        id="helius"
                        type="password" 
                        className="w-full text-xs px-2 py-1 bg-[#2D2D2D] border border-[#333333] rounded-md focus:outline-none focus:border-blue-500" 
                        value={heliusApiKey}
                        onChange={(e) => {
                          setHeliusApiKey(e.target.value);
                          handleApiKeySave('helius', heliusApiKey);
                        }}
                        onBlur={() => handleApiKeySave('helius', heliusApiKey)}
                        placeholder="Your Helius API key"
                      />
                    </div>
                    <div className="mb-1.5">
                      <label className="block text-xs text-gray-400 mb-1 flex items-center" htmlFor="openai">
                        OpenAI API Key
                        <a href="https://platform.openai.com/account/api-keys" target="_blank" rel="noopener noreferrer" className="inline-flex ml-1">
                          <Icons.FiInfo size={12} />
                        </a>
                      </label>
                      <input 
                        id="openai"
                        type="password" 
                        className="w-full text-xs px-2 py-1 bg-[#2D2D2D] border border-[#333333] rounded-md focus:outline-none focus:border-blue-500" 
                        value={openaiApiKey}
                        onChange={(e) => {
                          setOpenaiApiKey(e.target.value);
                          handleApiKeySave('openai', openaiApiKey);
                        }}
                        onBlur={() => handleApiKeySave('openai', openaiApiKey)}
                        placeholder="Your OpenAI API key"
                      />
                    </div>
                    <div className="mb-1.5">
                      <label className="block text-xs text-gray-400 mb-1 flex items-center" htmlFor="birdeye">
                        Birdeye API Key
                        <a href="https://docs.birdeye.so/reference/overview" target="_blank" rel="noopener noreferrer" className="inline-flex ml-1">
                          <Icons.FiInfo size={12} />
                        </a>
                      </label>
                      <input 
                        id="birdeye"
                        type="password" 
                        className="w-full text-xs px-2 py-1 bg-[#2D2D2D] border border-[#333333] rounded-md focus:outline-none focus:border-blue-500" 
                        value={birdeyeApiKey}
                        onChange={(e) => {
                          setBirdeyeApiKey(e.target.value); 
                          handleApiKeySave('birdeye', birdeyeApiKey);
                        }}
                        onBlur={() => handleApiKeySave('birdeye', birdeyeApiKey)}
                        placeholder="Your Birdeye API key"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#333333] pt-2">
                  {!supabaseUser && (
                    <button
                      onClick={login}
                      className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#2D2D2D] rounded-md"
                    >
                      Connect Wallet
                    </button>
                  )}
                  {supabaseUser && (
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#2D2D2D] rounded-md flex items-center gap-2"
                    >
                      <Icons.FiLogOut size={16} />
                      Disconnect Wallet
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Panel>
      
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#1E1E1E] border border-[#333333] rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Create New Project</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="projectName">
                Project Name *
              </label>
              <input
                id="projectName"
                type="text"
                className="w-full px-3 py-2 bg-[#2D2D2D] border border-[#333333] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-white"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="My Project"
                autoFocus
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="projectDescription">
                Description (Optional)
              </label>
              <textarea
                id="projectDescription"
                className="w-full px-3 py-2 bg-[#2D2D2D] border border-[#333333] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-white h-24 resize-none"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder="Project description..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="px-4 py-2 border border-gray-600 rounded-md text-white hover:bg-[#2D2D2D]"
              >
                Cancel
              </button>
              <button
                onClick={createNewProject}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Menu;