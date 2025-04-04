import React, { FC } from 'react';
import { Icons } from '@/components/icons/icons';
import { Project } from '@/types/ProjectTypes';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProject: Project;
  editedProjectName: string;
  setEditedProjectName: (name: string) => void;
  modalMode: 'edit' | 'delete';
  setModalMode: (mode: 'edit' | 'delete') => void;
  saveProjectName: () => void;
  confirmDeleteProject: () => void;
}

export const ProjectModal: FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  editingProject,
  editedProjectName,
  setEditedProjectName,
  modalMode,
  setModalMode,
  saveProjectName,
  confirmDeleteProject,
}) => {
  if (!isOpen || !editingProject) return null;
  
  const isEditMode = modalMode === 'edit';
  
  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[#1E1E1E] rounded-lg border border-[#333333] shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#333333] flex items-center justify-between">
          <h3 className="font-bold text-lg">
            {isEditMode ? 'Edit Project' : 'Delete Project'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <Icons.FiX size={20} />
          </button>
        </div>
        
        <div className="p-6">
          {isEditMode ? (
            <>
              <label htmlFor="editProjectName" className="block text-sm font-medium text-gray-300 mb-1">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="editProjectName"
                value={editedProjectName}
                onChange={(e) => setEditedProjectName(e.target.value)}
                className="w-full p-2.5 bg-[#252525] border border-[#333333] rounded-md focus:outline-none focus:border-blue-500 text-white mb-4"
                autoFocus
              />
            </>
          ) : (
            <div className="text-center py-2">
              <div className="mb-4 text-red-500">
                <Icons.FiAlertTriangle className="mx-auto" size={48} />
              </div>
              <p className="mb-2 text-lg">Are you sure you want to delete this project?</p>
              <p className="text-gray-400 mb-1">
                <strong>{editingProject.name}</strong>
              </p>
              <p className="text-gray-400 text-sm">This action cannot be undone.</p>
            </div>
          )}
        </div>
        
        <div className="px-6 py-4 border-t border-[#333333] flex items-center justify-between">
          <div>
            {isEditMode && (
              <button
                onClick={() => setModalMode('delete')}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white transition-colors"
              >
                Delete Project
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#252525] hover:bg-[#333333] rounded-md text-gray-300 transition-colors"
            >
              Cancel
            </button>
            {isEditMode ? (
              <button
                onClick={saveProjectName}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition-colors"
                disabled={!editedProjectName.trim()}
              >
                Save
              </button>
            ) : (
              <button
                onClick={confirmDeleteProject}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md font-medium transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};