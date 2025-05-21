import { getFlattenedTemplates } from '../../../../backend/src/block-functions';
import { NodeCategory } from '../../types/NodeTypes';
import { ApiKeyType, HeliusApiKeyTiers, BirdeyeApiKeyTiers } from '../../types/KeyTypes';
import { OutputValueType } from '../../types/OutputTypes';

// Frontend block template format
export interface BlockFunctionTemplateMetadata {
  name: string;
  description: string;
  blockType: string;
  blockCategory?: NodeCategory;
  parameters: BlockFunctionTemplateParameters[];
  requiredKeys?: ApiKeyType[];
  requiredKeyTiers?: {
    [key in ApiKeyType]?: HeliusApiKeyTiers | BirdeyeApiKeyTiers | Array<HeliusApiKeyTiers | BirdeyeApiKeyTiers>;
  };
  output?: {
    type: OutputValueType;
    description: string;
  };
}

export interface BlockFunctionTemplateParameters {
  name: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'string[]' | 'number[]' | 'boolean[]' | 'dropdown';
  defaultValue?: any;
  options?: string[]; // Available options when type is 'dropdown'
}

export interface BlockFunctionTemplate {
  metadata: BlockFunctionTemplateMetadata;
  execute: (params: Record<string, any>) => Promise<any>;
}

export class BlockFunctionTemplateService {
  private static instance: BlockFunctionTemplateService;
  private templates: Record<string, BlockFunctionTemplate>;

  private constructor() {
    // Load and transform backend templates
    const backendTemplates = getFlattenedTemplates();
    this.templates = Object.entries(backendTemplates).reduce((acc, [name, template]) => {
      acc[name] = transformTemplate(template);
      return acc;
    }, {} as Record<string, BlockFunctionTemplate>);
  }

  static getInstance(): BlockFunctionTemplateService {
    if (!BlockFunctionTemplateService.instance) {
      BlockFunctionTemplateService.instance = new BlockFunctionTemplateService();
    }
    return BlockFunctionTemplateService.instance;
  }

  getTemplate(name: string): BlockFunctionTemplate | undefined {
    return this.templates[name];
  }

  getTemplates(): BlockFunctionTemplate[] {
    return Object.values(this.templates);
  }

  getTemplateNames(): string[] {
    return Object.keys(this.templates);
  }

  // Get templates for a specific block type
  getTemplatesByType(blockType: string): BlockFunctionTemplate[] {
    return Object.values(this.templates).filter(
      template => template.metadata.blockType === blockType
    );
  }

  // Get all available block types
  getBlockTypes(): string[] {
    return [...new Set(Object.values(this.templates).map(t => t.metadata.blockType))];
  }
}

export function transformTemplate(backendTemplate: BlockFunctionTemplate): BlockFunctionTemplate {
  return {
    metadata: {
      name: backendTemplate.metadata.name,
      description: backendTemplate.metadata.description,
      blockType: backendTemplate.metadata.blockType,
      blockCategory: backendTemplate.metadata.blockCategory,
      parameters: backendTemplate.metadata.parameters || [],
      requiredKeys: backendTemplate.metadata.requiredKeys,
      requiredKeyTiers: backendTemplate.metadata.requiredKeyTiers,
      output: backendTemplate.metadata.output || undefined
    },
    execute: backendTemplate.execute
  };
}

export default BlockFunctionTemplateService.getInstance();