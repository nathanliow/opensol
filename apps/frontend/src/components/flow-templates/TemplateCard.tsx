import React from 'react';
import { Icons } from '../icons/icons';
import { FlowTemplate } from '../../types/FlowTemplateTypes';

// Colors for template shapes
const FLOW_TEMPLATE_SHAPE_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-red-500',
];

// Shapes for templates
const FLOW_TEMPLATE_SHAPE_TYPES = ['circle', 'square', 'triangle', 'diamond', 'hexagon'];

// Generate a pseudo-random shape based on the template name
const getTemplateShape = (name: string) => {
  // Simple hash function to generate a consistent number from a string
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Use the hash to select shape and color
  const colorIndex = hash % FLOW_TEMPLATE_SHAPE_COLORS.length;
  const shapeIndex = hash % FLOW_TEMPLATE_SHAPE_TYPES.length;
  
  return {
    color: FLOW_TEMPLATE_SHAPE_COLORS[colorIndex],
    shape: FLOW_TEMPLATE_SHAPE_TYPES[shapeIndex]
  };
};

interface FlowTemplateCardProps {
  template: FlowTemplate;
  selected: boolean;
  onClick: () => void;
}

const FlowTemplateCard: React.FC<FlowTemplateCardProps> = ({ template, selected, onClick }) => {
  const { color, shape } = getTemplateShape(template.name);
  
  // Render the appropriate shape component
  const renderShape = () => {
    // Centers the shape in its container
    const shapeContainer = 'flex items-center justify-center w-full h-full';
    
    switch(shape) {
      case 'circle':
        return (
          <div className={shapeContainer}>
            <div className={`${color} rounded-full w-24 h-24 flex items-center justify-center`}>
              {template.category && (
                <span className="text-white font-bold text-xl">{template.category.charAt(0)}</span>
              )}
            </div>
          </div>
        );
      case 'square':
        return (
          <div className={shapeContainer}>
            <div className={`${color} w-24 h-24 flex items-center justify-center`}>
              {template.category && (
                <span className="text-white font-bold text-xl">{template.category.charAt(0)}</span>
              )}
            </div>
          </div>
        );
      case 'triangle':
        return (
          <div className={shapeContainer}>
            <div className="relative w-0 h-0" style={{ 
              borderLeft: '40px solid transparent', 
              borderRight: '40px solid transparent', 
              borderBottom: `80px solid ${color.includes('blue') ? '#3B82F6' : 
                          color.includes('green') ? '#10B981' : 
                          color.includes('purple') ? '#8B5CF6' : 
                          color.includes('orange') ? '#F97316' : 
                          color.includes('pink') ? '#EC4899' : 
                          color.includes('teal') ? '#14B8A6' : 
                          color.includes('indigo') ? '#6366F1' : 
                          color.includes('red') ? '#EF4444' : '#3B82F6'}` 
            }}>
              <span className="absolute text-white font-bold text-xl" style={{ top: '30px', left: '-7px' }}>
                {template.category?.charAt(0) || ''}
              </span>
            </div>
          </div>
        );
      case 'diamond':
        return (
          <div className={shapeContainer}>
            <div className={`${color} w-24 h-24 transform rotate-45 flex items-center justify-center`}>
              <span className="transform -rotate-45 text-white font-bold text-xl">
                {template.category?.charAt(0) || ''}
              </span>
            </div>
          </div>
        );
      case 'hexagon':
        return (
          <div className={shapeContainer}>
            <div className="relative">
              <svg width="80" height="80" viewBox="0 0 80 80">
                <polygon 
                  points="20,0 60,0 80,40 60,80 20,80 0,40" 
                  fill={color.includes('blue') ? '#3B82F6' : 
                        color.includes('green') ? '#10B981' : 
                        color.includes('purple') ? '#8B5CF6' : 
                        color.includes('orange') ? '#F97316' : 
                        color.includes('pink') ? '#EC4899' : 
                        color.includes('teal') ? '#14B8A6' : 
                        color.includes('indigo') ? '#6366F1' : 
                        color.includes('red') ? '#EF4444' : '#3B82F6'}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl">
                {template.category?.charAt(0) || ''}
              </span>
            </div>
          </div>
        );
      default:
        return (
          <div className={shapeContainer}>
            <Icons.FiLayout size={48} className="text-gray-400" />
          </div>
        );
    }
  };

  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-lg border cursor-pointer transition-all duration-200 ${selected ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 bg-[#1E1E1E] hover:border-gray-500'}`}
      onClick={onClick}
    >
      <div className="relative flex h-32 items-center justify-center bg-[#121212] p-2">
        {renderShape()}
        
        {/* Selection badge */}
        {selected && (
          <div className="absolute top-2 right-2 h-6 w-6 flex items-center justify-center rounded-full bg-blue-500">
            <Icons.FiCheck size={16} className="text-white" />
          </div>
        )}
      </div>
      
      <div className="flex flex-col p-3">
        <h3 className="font-medium text-sm">{template.name}</h3>
        <p className="text-gray-400 text-xs mt-1 line-clamp-2">
          {template.description || 'No description'}
        </p>
        <div className="flex items-center mt-2">
          <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded">
            {template.category || 'General'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FlowTemplateCard;
