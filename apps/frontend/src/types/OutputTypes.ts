import { ReactNode } from "react";

// Basic output value types
export type OutputValueType = string | number | boolean | object | Array<any> | any | null;

export type OutputValueTypeString = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'any' | 'null';

export type Output = {
  handleId?: string; // output handle id
  type: OutputValueTypeString; // output type
  value: OutputValueType; // output value
};

// Common properties for all output definitions
interface BaseOutputDefinition {
  id: string;
  label: string;
  type: OutputValueType;
  description?: string;
  isConnected?: boolean;
  handleId?: string;
  getValue?: () => any;
  component?: ReactNode;
}

// Output definition type
export interface OutputDefinition extends BaseOutputDefinition {}

// Helper functions to create output definitions
export const createOutput = (props: OutputDefinition): OutputDefinition => ({
  ...props
});

// Output type descriptions
export const outputTypeDescriptions: Record<OutputValueTypeString, string> = {
  string: 'Text value',
  number: 'Numeric value',
  boolean: 'True/False value',
  object: 'Object containing properties',
  array: 'List of values',
  any: 'Any type of value',
  null: 'No value'
};

// Common output definitions
export const commonOutputs = {
  string: (id: string, label: string): OutputDefinition => createOutput({
    id,
    label,
    type: 'string',
    description: outputTypeDescriptions.string
  }),
  
  number: (id: string, label: string): OutputDefinition => createOutput({
    id,
    label,
    type: 'number',
    description: outputTypeDescriptions.number
  }),
  
  boolean: (id: string, label: string): OutputDefinition => createOutput({
    id,
    label,
    type: 'boolean',
    description: outputTypeDescriptions.boolean
  }),
  
  object: (id: string, label: string): OutputDefinition => createOutput({
    id,
    label,
    type: 'object',
    description: outputTypeDescriptions.object
  }),
  
  array: (id: string, label: string): OutputDefinition => createOutput({
    id,
    label,
    type: 'array',
    description: outputTypeDescriptions.array
  }),
  
  any: (id: string, label: string): OutputDefinition => createOutput({
    id,
    label,
    type: 'any',
    description: outputTypeDescriptions.any
  })
}; 