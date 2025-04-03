// Import templates
import { FlowTemplate } from '../types/FlowTemplateTypes';
import blankTemplate from './flow-templates-data/flow-blank.json';
import getSolBalanceTemplate from './flow-templates-data/flow-getSolBalance.json';
import getAssetHelius from './flow-templates-data/flow-getAsset-helius.json'

// Add metadata to templates
const flowTemplatesWithMetadata: FlowTemplate[] = [
  blankTemplate,
  getSolBalanceTemplate,
  getAssetHelius,
];

// Export all templates
export const flowTemplates = flowTemplatesWithMetadata;

// Get template by name
export const getTemplateByName = (name: string): FlowTemplate | undefined => {
  return flowTemplates.find((template) => template.name === name);
};

// Get templates by category
export const getTemplatesByCategory = (category: string): FlowTemplate[] => {
  return flowTemplates.filter((template) => template.category === category);
};

// Get all template categories
export const getTemplateCategories = (): string[] => {
  const categories = new Set(flowTemplates.map((template) => template.category || 'Uncategorized'));
  return Array.from(categories);
};
