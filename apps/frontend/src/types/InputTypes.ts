import { ReactNode } from "react";

export type InputType = 'dropdown' | 'text' | 'number' | 'display';

export interface InputDefinition {
  id: string;
  label: string;
  type: InputType;
  options?: { value: string; label: string }[]; // For dropdown
  defaultValue?: any;
  component?: ReactNode; // For custom input components
  description?: string; // For input placeholders
  getConnectedValue?: () => any | null; // Function to get connected value
  handleId?: string; // Custom handle ID
}