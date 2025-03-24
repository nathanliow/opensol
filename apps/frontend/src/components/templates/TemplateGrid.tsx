import React, { useState } from 'react';
import { FlowTemplate, getTemplateCategories } from '@/templates';
import TemplateCard from './TemplateCard';
import { Icons } from '../icons/icons';

interface TemplateGridProps {
  templates: FlowTemplate[];
  selectedTemplate: FlowTemplate | null;
  onSelectTemplate: (template: FlowTemplate) => void;
}

const TemplateGrid: React.FC<TemplateGridProps> = ({
  templates,
  selectedTemplate,
  onSelectTemplate,
}) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const categories = getTemplateCategories();

  // Filter templates by category if one is selected
  const filteredTemplates = activeCategory
    ? templates.filter((template) => template.category === activeCategory)
    : templates;

  return (
    <div className="flex flex-col space-y-4">
      {/* Category tabs */}
      <div className="flex items-center space-x-2 pb-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700">
        <button
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${!activeCategory ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
          onClick={() => setActiveCategory(null)}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${activeCategory === category ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Templates grid */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.name}
              template={template}
              selected={selectedTemplate?.name === template.name}
              onClick={() => onSelectTemplate(template)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
          <Icons.FiSearch size={48} className="mb-4" />
          <p>No templates found in this category</p>
        </div>
      )}
    </div>
  );
};

export default TemplateGrid;
