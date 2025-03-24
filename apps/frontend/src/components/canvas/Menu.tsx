import { usePrivy } from "@privy-io/react-auth";
import { Panel } from "@xyflow/react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConfig, Network } from "../../contexts/ConfigContext";
import { Icons } from "../icons/icons";
import { Info } from 'lucide-react';
import { createProject } from "@/lib/projects";
import { useUserAccountContext } from "@/app/providers/UserAccountContext";
import { signOut } from "@/lib/auth";
import { useReactFlow } from "@xyflow/react";

interface MenuProps {
  onExport: () => any;
  onImport: (flowData: any) => void;
  projectId?: string | null;
  onProjectChange?: () => void;
}

const Menu = ({ onExport, onImport, projectId, onProjectChange }: MenuProps) => {
  const { login, logout } = usePrivy();
  const { userAddress, supabaseUser } = useUserAccountContext();
  const { network, setNetwork, apiKeys, setApiKey } = useConfig();
  const [isOpen, setIsOpen] = useState(false);
  const [heliusApiKey, setHeliusApiKey] = useState(apiKeys['helius'] || '');
  const [openaiApiKey, setOpenaiApiKey] = useState(apiKeys['openai'] || '');
  const [birdeyeApiKey, setBirdeyeApiKey] = useState(apiKeys['birdeye'] || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const reactFlowInstance = useReactFlow();
  
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        event.preventDefault();
        event.stopPropagation();
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside, true);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside, true);
      };
    }
  }, [isOpen]);

  const handleNetworkChange = (newNetwork: Network) => {
    setNetwork(newNetwork);
  };

  const toggleMenu = () => {
    setIsOpen(prev => !prev);
  };

  const handleAPIKeySave = () => {
    const newKeys = { ...apiKeys };
    if (heliusApiKey) newKeys['helius'] = heliusApiKey;
    if (openaiApiKey) newKeys['openai'] = openaiApiKey;
    if (birdeyeApiKey) newKeys['birdeye'] = birdeyeApiKey;

    setApiKey(newKeys);
    setIsOpen(false);
    alert('API keys saved!');
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
        user_id: supabaseUser.id
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
        user_id: supabaseUser.id
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

  const navigateToProjects = () => {
    setIsOpen(false);
    router.push('/projects');
  };

  const loadNewCanvas = () => {
    setIsOpen(false);
    setShowNewProjectModal(true);
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
            <div className="absolute top-12 right-0 w-60 max-h-[calc(35vh)] bg-[#1E1E1E] border border-[#333333] rounded-lg shadow-lg overflow-hidden overflow-y-auto z-50">
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
                      onClick={loadNewCanvas}
                      className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#2D2D2D] rounded-md flex items-center gap-2"
                    >
                      <Icons.FiPlusCircle size={16} />
                      New Canvas
                    </button>
                    <button
                      onClick={handleSaveProject}
                      className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#2D2D2D] rounded-md flex items-center gap-2"
                    >
                      <Icons.FiSave size={16} />
                      Save as Project
                    </button>
                    <button
                      onClick={navigateToProjects}
                      className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#2D2D2D] rounded-md flex items-center gap-2"
                    >
                      <Icons.FiFolder size={16} />
                      My Projects
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

                <div className="border-t border-[#333333] mt-2 pt-2">
                  <div className="text-xs text-gray-400 px-3 pb-1">API Keys</div>
                  <div className="px-3 pb-2">
                    <div className="mb-1.5 mt-1">
                      <label className="block text-xs text-gray-400 mb-1" htmlFor="helius">
                        Helius API Key
                        <a href="https://dev.helius.xyz/dashboard/app" target="_blank" rel="noopener noreferrer" className="inline-flex ml-1">
                          <Info size={12} />
                        </a>
                      </label>
                      <input 
                        id="helius"
                        type="password" 
                        className="w-full text-xs px-2 py-1 bg-[#2D2D2D] border border-[#333333] rounded-md focus:outline-none focus:border-blue-500" 
                        value={heliusApiKey}
                        onChange={(e) => setHeliusApiKey(e.target.value)}
                        placeholder="Your Helius API key"
                      />
                    </div>
                    <div className="mb-1.5">
                      <label className="block text-xs text-gray-400 mb-1" htmlFor="openai">
                        OpenAI API Key
                        <a href="https://platform.openai.com/account/api-keys" target="_blank" rel="noopener noreferrer" className="inline-flex ml-1">
                          <Info size={12} />
                        </a>
                      </label>
                      <input 
                        id="openai"
                        type="password" 
                        className="w-full text-xs px-2 py-1 bg-[#2D2D2D] border border-[#333333] rounded-md focus:outline-none focus:border-blue-500" 
                        value={openaiApiKey}
                        onChange={(e) => setOpenaiApiKey(e.target.value)}
                        placeholder="Your OpenAI API key"
                      />
                    </div>
                    <div className="mb-1.5">
                      <label className="block text-xs text-gray-400 mb-1" htmlFor="birdeye">
                        Birdeye API Key
                        <a href="https://docs.birdeye.so/reference/overview" target="_blank" rel="noopener noreferrer" className="inline-flex ml-1">
                          <Info size={12} />
                        </a>
                      </label>
                      <input 
                        id="birdeye"
                        type="password" 
                        className="w-full text-xs px-2 py-1 bg-[#2D2D2D] border border-[#333333] rounded-md focus:outline-none focus:border-blue-500" 
                        value={birdeyeApiKey}
                        onChange={(e) => setBirdeyeApiKey(e.target.value)}
                        placeholder="Your Birdeye API key"
                      />
                    </div>
                    <button
                      onClick={handleAPIKeySave}
                      className="w-full mt-1 text-xs py-1.5 bg-blue-600 hover:bg-blue-700 rounded-md text-white"
                    >
                      Save API Keys
                    </button>
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