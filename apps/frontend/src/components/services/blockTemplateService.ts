import { getFlattenedTemplates } from '../../../../backend/src/block-functions';
import { NodeCategory } from '../../types/NodeTypes';
import { ApiKeyType } from '../../types/KeyTypes';

// Frontend block template format
export interface BlockTemplate {
  metadata: {
    name: string;
    description: string;
    blockType: string;
    blockCategory: NodeCategory;
    parameters: {
      name: string;
      type: 'string' | 'number' | 'boolean' | 'string[]' | 'number[]' | 'boolean[]';
      description: string;
    }[];
    requiredKeys: ApiKeyType[];
    output: {
      type: 'string' | 'number' | 'boolean' | 'object' | 'any' | 'string[]' | 'number[]' | 'boolean[]';
      description: string;
    };
  };
  execute: (params: any) => Promise<any>;
}

export class BlockTemplateService {
  private static instance: BlockTemplateService;
  private templates: Record<string, BlockTemplate>;

  private constructor() {
    // Load and transform backend templates
    const backendTemplates = getFlattenedTemplates();
    this.templates = Object.entries(backendTemplates).reduce((acc, [name, template]) => {
      acc[name] = this.transformTemplate(template);
      return acc;
    }, {} as Record<string, BlockTemplate>);
  }

  private transformTemplate(backendTemplate: BlockTemplate): BlockTemplate {
    // Transform backend template format to frontend format
    return {
      metadata: {
        name: backendTemplate.metadata.name,
        description: backendTemplate.metadata.description,
        blockType: backendTemplate.metadata.blockType,
        blockCategory: backendTemplate.metadata.blockCategory,
        parameters: backendTemplate.metadata.parameters || [], // Parameters are already in array format
        requiredKeys: backendTemplate.metadata.requiredKeys,
        output: {
          type: 'any', // We could add this to backend template if needed
          description: 'Function output'
        }
      },
      execute: backendTemplate.execute,
    };
  }

  static getInstance(): BlockTemplateService {
    if (!BlockTemplateService.instance) {
      BlockTemplateService.instance = new BlockTemplateService();
    }
    return BlockTemplateService.instance;
  }

  getTemplate(name: string): BlockTemplate | undefined {
    return this.templates[name];
  }

  getTemplates(): BlockTemplate[] {
    return Object.values(this.templates);
  }

  getTemplateNames(): string[] {
    return Object.keys(this.templates);
  }

  // Get templates for a specific block type
  getTemplatesByType(blockType: string): BlockTemplate[] {
    return Object.values(this.templates).filter(
      template => template.metadata.blockType === blockType
    );
  }

  // Get all available block types
  getBlockTypes(): string[] {
    return [...new Set(Object.values(this.templates).map(t => t.metadata.blockType))];
  }
}

export default BlockTemplateService.getInstance();