// Import templates
import blankTemplate from '../../templates/flow-blank.json';
import getSolBalanceTemplate from '../../templates/flow-getSolBalance.json';

// Template interface
export interface FlowTemplate {
  nodes: any[];
  edges: any[];
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  name: string;
  description?: string; // Optional description for the template
  category?: string; // Optional category for grouping templates
}

// Add metadata to templates
const templatesWithMetadata: FlowTemplate[] = [
  {
    ...blankTemplate,
    description: 'Start with a clean canvas',
    category: 'Basic',
  },
  {
    ...getSolBalanceTemplate,
    description: 'Get SOL balance for a wallet address',
    category: 'Solana',
  },
];

// Export all templates
export const templates = templatesWithMetadata;

// Get template by name
export const getTemplateByName = (name: string): FlowTemplate | undefined => {
  return templates.find((template) => template.name === name);
};

// Get templates by category
export const getTemplatesByCategory = (category: string): FlowTemplate[] => {
  return templates.filter((template) => template.category === category);
};

// Get all template categories
export const getTemplateCategories = (): string[] => {
  const categories = new Set(templates.map((template) => template.category || 'Uncategorized'));
  return Array.from(categories);
};
