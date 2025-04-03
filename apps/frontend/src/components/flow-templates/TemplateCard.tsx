import React from 'react';
import { Icons } from '../icons/icons';
import { FlowTemplate } from '../../types/FlowTemplateTypes';

interface FlowTemplateCardProps {
  template: FlowTemplate;
  selected: boolean;
  onClick: () => void;
}

const FlowTemplateCard: React.FC<FlowTemplateCardProps> = ({ template, selected, onClick }) => {
  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-lg border cursor-pointer transition-all duration-200 ${selected ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 bg-[#1E1E1E] hover:border-gray-500'}`}
      onClick={onClick}
    > 
      <div className="flex flex-col p-3">
        <h3 className="font-medium text-sm">{template.name}</h3>
        <p className="text-gray-400 text-xs mt-1 line-clamp-2">
          {template.description || 'No description'}
        </p>
        <div className="flex items-center mt-2 justify-between">
          <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded">
            {template.category || 'General'}
          </span>
          <div className="flex items-center space-x-2 px-1 text-xs text-gray-400">
            <span className="flex items-center">
              <Icons.FiBox size={10} className="mr-0.5" />
              {template.nodes?.length || 0}
            </span>
            <span className="flex items-center">
              <Icons.FiGitMerge size={10} className="mr-0.5" />
              {template.edges?.length || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowTemplateCard;
