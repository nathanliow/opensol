import React, { FC } from 'react';
import { Icons } from '@/components/icons/icons';
import TemplateGrid from '@/components/flow-templates/TemplateGrid';
import { FlowTemplate } from '@/types/FlowTemplateTypes';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  newProjectName: string;
  setNewProjectName: (name: string) => void;
  newProjectDescription: string;
  setNewProjectDescription: (description: string) => void;
  selectedTemplate: FlowTemplate | null;
  setSelectedTemplate: (template: FlowTemplate | null) => void;
  createStep: number;
  goToNextStep: () => void;
  goToPrevStep: () => void;
  createNewProject: () => void;
  templates: FlowTemplate[];
}

export const NewProjectModal: FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  newProjectName,
  setNewProjectName,
  newProjectDescription,
  setNewProjectDescription,
  selectedTemplate,
  setSelectedTemplate,
  createStep,
  goToNextStep,
  goToPrevStep,
  createNewProject,
  templates,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[#1E1E1E] rounded-lg border border-[#333333] shadow-xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#333333] flex items-center justify-between">
          <h3 className="font-bold text-lg">{createStep === 1 ? 'Create New Project' : 'Choose a Template'}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <Icons.FiX size={20} />
          </button>
        </div>
        
        {/* Modal Content */}
        <div className="overflow-auto p-6 flex-grow">
          {createStep === 1 ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="projectName" className="block text-sm font-medium text-gray-300 mb-1">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="projectName"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="My Awesome Project"
                  className="w-full p-2.5 bg-[#252525] border border-[#333333] rounded-md focus:outline-none focus:border-blue-500 text-white"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-300 mb-1">
                  Description <span className="text-gray-500">(optional)</span>
                </label>
                <textarea
                  id="projectDescription"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="What's this project about?"
                  rows={4}
                  className="w-full p-2.5 bg-[#252525] border border-[#333333] rounded-md focus:outline-none focus:border-blue-500 text-white resize-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-400 text-sm mb-4">
                Choose a template to start with, or select "Blank Project" to start from scratch.
              </p>
              
              <TemplateGrid
                templates={templates}
                selectedTemplate={selectedTemplate}
                onSelectTemplate={setSelectedTemplate}
              />
            </div>
          )}
        </div>
        
        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#333333] flex items-center justify-end gap-2">
          {createStep === 1 ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-[#252525] hover:bg-[#333333] rounded-md text-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={goToNextStep}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition-colors"
              >
                Next
              </button>
            </>
          ) : (
            <>
              <button
                onClick={goToPrevStep}
                className="px-4 py-2 bg-[#252525] hover:bg-[#333333] rounded-md text-gray-300 transition-colors"
              >
                Back
              </button>
              <button
                onClick={createNewProject}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition-colors"
                disabled={!selectedTemplate}
              >
                Create Project
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};