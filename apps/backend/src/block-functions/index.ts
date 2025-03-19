import { getUserSolBalance } from './default/get/getUserSolBalance';
import { usdToSol } from './misc/usdToSol';
import { solToUsd } from './misc/solToUsd';
import { BlockTemplate } from '../../../frontend/src/components/services/blockTemplateService';

// Group templates by their block type
export const templates: Record<string, Record<string, BlockTemplate>> = {
  GET: {
    getUserSolBalance
  },
  MISC: {
    solToUsd,
    usdToSol
  }
};

// Helper to get all templates flattened into a single record
export const getFlattenedTemplates = (): Record<string, BlockTemplate> => {
  const flattened: Record<string, BlockTemplate> = {};
  Object.entries(templates).forEach(([blockType, blockTemplates]) => {
    Object.entries(blockTemplates).forEach(([name, template]) => {
      flattened[name] = {
        ...template,
        metadata: {
          ...template.metadata,
          blockType
        }
      };
    });
  });
  
  return flattened;
};