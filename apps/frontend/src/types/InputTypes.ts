import { ReactNode } from "react";

/*
 * FRONTEND/BACKEND TYPES FOR INPUTS
 */

export type FrontendInputType = 'dropdown' | 'text' | 'number' | 'display' | 'textarea' | 'file';

// Value types that match input types
export type InputValueType = string | number | boolean | object | File | null;

export type InputValueTypeString = 'string' | 'number' | 'boolean' | 'object' | 'file' | 'null';

export type Inputs = {
  [name: string]: { // input name
    handleId?: string; // input handle id
    type?: InputValueTypeString; // input type
    value?: InputValueType | null; // input value
  }  
};

// Common properties for all input definitions
interface BaseInputDefinition {
  id: string;
  label: string;
  description?: string;
  defaultValue?: InputValueType;
  required?: boolean;
  disabled?: boolean;
  handleId?: string;
  getConnectedValue?: () => InputValueType | null;
  component?: ReactNode;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

// Type-specific input definitions
export interface TextInputDefinition extends BaseInputDefinition {
  type: 'text';
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
}

export interface NumberInputDefinition extends BaseInputDefinition {
  type: 'number';
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

export interface DropdownInputDefinition extends BaseInputDefinition {
  type: 'dropdown';
  options: { value: string; label: string }[];
  placeholder?: string;
  searchable?: boolean;
  clearable?: boolean;
}

export interface TextareaInputDefinition extends BaseInputDefinition {
  type: 'textarea';
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  autoResize?: boolean;
}

export interface DisplayInputDefinition extends BaseInputDefinition {
  type: 'display';
  format?: (value: InputValueType) => string;
}

export interface FileInputDefinition extends BaseInputDefinition {
  type: 'file';
  accept?: string; // File types to accept (e.g., 'image/*', '.pdf,.doc')
  multiple?: boolean; // Allow multiple file uploads
  maxSize?: number; // Maximum file size in bytes
  previewType?: 'image' | 'icon' | 'none'; // How to preview the file
  onFileSelect?: (file: File) => void; // Callback when a file is selected
  onFileRemove?: () => void; // Callback when a file is removed
  previewUrl?: string; // URL to display as preview (if already uploaded)
}

// Union type of all input definitions
export type InputDefinition = 
  | TextInputDefinition
  | NumberInputDefinition
  | DropdownInputDefinition
  | TextareaInputDefinition
  | DisplayInputDefinition
  | FileInputDefinition;

// Helper functions to create input definitions with proper types
export const createInputDefinition = {
  text: (props: Omit<TextInputDefinition, 'type'>): TextInputDefinition => ({
    type: 'text',
    ...props
  }),
  
  number: (props: Omit<NumberInputDefinition, 'type'>): NumberInputDefinition => ({
    type: 'number',
    ...props
  }),
  
  dropdown: (props: Omit<DropdownInputDefinition, 'type'>): DropdownInputDefinition => ({
    type: 'dropdown',
    ...props
  }),
  
  textarea: (props: Omit<TextareaInputDefinition, 'type'>): TextareaInputDefinition => ({
    type: 'textarea',
    rows: 3,
    ...props
  }),
  
  display: (props: Omit<DisplayInputDefinition, 'type'>): DisplayInputDefinition => ({
    type: 'display',
    ...props
  }),
  
  file: (props: Omit<FileInputDefinition, 'type'>): FileInputDefinition => ({
    type: 'file',
    accept: 'image/*',
    multiple: false,
    previewType: 'image',
    ...props
  })
};

// Helper function to enhance an input definition with a connection getter
export const withConnection = <T extends InputDefinition>(
  input: T, 
  getConnectedValue: () => InputValueType | null
): T => ({
  ...input,
  getConnectedValue
});

// Helper to create a set of inputs with consistent styling
export const createInputGroup = (
  inputs: InputDefinition[],
  defaults?: Partial<BaseInputDefinition>
): InputDefinition[] => {
  return inputs.map(input => ({
    ...defaults,
    ...input
  }));
};