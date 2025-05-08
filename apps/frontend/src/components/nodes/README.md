# Node System Documentation

This document describes how to use the refactored node system to easily create and manage nodes in the application.

## Overview

The node system consists of several key components:

1. `TemplateNode`: A reusable component that renders a node with standardized styling, handles, and input elements
2. `NodeUtils`: Utility functions for working with nodes, handles, and connections
3. `useNodeData`: A hook for managing node data and connections
4. `InputDefinition`: A type system for defining node inputs with type-safety and helper functions
5. Supporting types and interfaces

## Creating a New Node

Here's how to create a new node using the refactored system:

### 1. Define Input/Output Schema

First, define the inputs and outputs for your node using the helper functions:

```tsx
import { createInputDefinition } from '../../../types/InputTypes';

// Define the node's inputs using helper functions for type safety
const inputs = [
  createInputDefinition.text({
    id: 'name',
    label: 'Name',
    defaultValue: '',
    placeholder: 'Enter a name'
  }),
  
  createInputDefinition.number({
    id: 'amount',
    label: 'Amount',
    defaultValue: 0,
    min: 0,
    max: 100,
    step: 0.1
  }),
  
  createInputDefinition.dropdown({
    id: 'category',
    label: 'Category',
    options: [
      { value: 'a', label: 'Category A' },
      { value: 'b', label: 'Category B' }
    ],
    searchable: true,
    clearable: true
  }),
  
  createInputDefinition.textarea({
    id: 'description',
    label: 'Description',
    rows: 4,
    maxLength: 500
  }),
  
  createInputDefinition.display({
    id: 'result',
    label: 'Result',
    format: (value) => `Result: ${value}`
  }),
  
  createInputDefinition.file({
    id: 'image',
    label: 'Image',
    accept: 'image/*',
    maxSize: 5 * 1024 * 1024, // 5MB
    onFileSelect: (file) => handleFileSelect(file),
    onFileRemove: () => handleFileRemove(),
    previewType: 'image',
    previewUrl: existingImageUrl
  })
];

// Define the output
const output = {
  type: 'string',
  description: 'Formatted result'
};
```

### 2. Create the Node Component

Create a component that uses the `TemplateNode` and `useNodeData` hook:

```tsx
function MyNewNode({ id, data }: { id: string; data: any }) {
  // Use the useNodeData hook to manage node data
  const {
    data: nodeData,
    updateInputValue,
    updateOutputValue,
    enhanceInputDefinitions
  } = useNodeData(id);

  // Enhance inputs with connection information
  const enhancedInputs = enhanceInputDefinitions(inputs);

  // Handle input changes
  const onInputChange = useCallback((inputId: string, value: any) => {
    updateInputValue(inputId, value);
  }, [updateInputValue]);

  // Process data and update output value
  useEffect(() => {
    // Process input values and compute output
    const result = processData(nodeData);
    
    // Update output value
    updateOutputValue(result);
  }, [nodeData, updateOutputValue]);

  return (
    <TemplateNode
      metadata={nodeTypesMetadata.MY_NODE_TYPE}
      inputs={enhancedInputs}
      output={output}
      data={nodeData}
      onInputChange={onInputChange}
    />
  );
}

export default memo(MyNewNode);
```

### 3. Register the Node Type

Add your node to the `NodeTypes.ts` file:

```tsx
// Import your node
import MyNewNode from "../components/nodes/path/to/MyNewNode";

// Add to NodeCategory if needed
export type NodeCategory = 'Code' | 'Database' | /* ... */ | 'MyCategory';

// Add to nodeTypesMetadata
export const nodeTypesMetadata: Record<string, NodeTypeMetadata> = {
  // ... existing code ...
  
  MY_NODE_TYPE: {
    id: 'MY_NODE_TYPE',
    label: 'My Node',
    category: 'MyCategory',
    backgroundColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    primaryColor: 'blue-100',
    secondaryColor: 'blue-300',
    textColor: 'text-blue-800'
  },
};

// Add to createNodeTypes
export const createNodeTypes = (setNodes: (updater: any) => void) => ({
  // ... existing code ...
  MY_NODE_TYPE: MyNewNode,
});
```

## Type-Safe Input Definitions

The new input system uses discriminated unions to provide type-specific properties and helper functions.

### Input Types

Each input type has its own interface with specific properties:

```typescript
// Text input
createInputDefinition.text({
  id: 'myText',
  label: 'Text Input',
  defaultValue: 'Default',
  placeholder: 'Enter text',
  maxLength: 100,
  multiline: false
});

// Number input
createInputDefinition.number({
  id: 'myNumber',
  label: 'Number Input',
  defaultValue: 0,
  min: 0,
  max: 100,
  step: 0.1
});

// Dropdown input
createInputDefinition.dropdown({
  id: 'myDropdown',
  label: 'Dropdown',
  options: [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' }
  ],
  searchable: true,
  clearable: true
});

// Textarea input
createInputDefinition.textarea({
  id: 'myTextarea',
  label: 'Textarea',
  rows: 4,
  maxLength: 1000,
  autoResize: true
});

// Display input
createInputDefinition.display({
  id: 'myDisplay',
  label: 'Display',
  format: (value) => `Formatted: ${value}`
});

// File input
createInputDefinition.file({
  id: 'myFile',
  label: 'Upload File',
  accept: 'image/*', // Accept only image files
  multiple: false,   // Only allow single file upload
  maxSize: 5 * 1024 * 1024, // Max 5MB
  previewType: 'image', // Show image preview
  onFileSelect: (file) => handleFileSelected(file),
  onFileRemove: () => handleFileRemoved()
});
```

### Helper Functions

The input system provides helper functions for working with inputs:

```typescript
import { createInputDefinition, withConnection, createInputGroup } from '../types/InputTypes';

// Create an input with a connection
const connectedInput = withConnection(
  createInputDefinition.text({ id: 'myText', label: 'Text' }),
  () => getConnectedValue('myText')
);

// Create a group of inputs with shared properties
const inputGroup = createInputGroup(
  [
    createInputDefinition.text({ id: 'field1', label: 'Field 1' }),
    createInputDefinition.text({ id: 'field2', label: 'Field 2' })
  ],
  { required: true }
);
```

## Utility Functions

### nodeUtils

The `nodeUtils` utility (imported from `'../../utils/nodeUtils'`) provides various helper functions for working with nodes:

```tsx
import { nodeUtils } from '../../utils/nodeUtils';

// Find a node by ID
const node = nodeUtils.findNodeById(nodes, 'node-123');

// Check if an input is connected
const isConnected = nodeUtils.isInputConnected(input);

// Get the connected value for an input
const connectedValue = nodeUtils.getConnectedValue(input);

// Get handle style for a position
const style = nodeUtils.getHandleStyle('left');

// Create inputs from a schema
const inputs = nodeUtils.createInputsFromSchema(schema);

// Flow-wide node operations
const connectedNodes = nodeUtils.findNodesConnectedToOutput(nodes, edges, sourceNodeId);
const executionPath = nodeUtils.getExecutionPath(nodes, edges, startNodeId);
```

### useNodeData Hook

The `useNodeData` hook provides methods for working with node data and connections:

```tsx
const {
  // Node data and output
  node,                    // The current node
  data,                    // The node's data
  outputValue,             // The node's output value
  
  // Update methods
  updateInputValue,        // Update a single input value
  updateInputValues,       // Update multiple input values
  updateOutputValue,       // Update the output value
  
  // Connection helpers
  isInputConnected,        // Check if an input is connected
  getConnectedValue,       // Get a connected input's value
  enhanceInputDefinitions, // Add connection info to input definitions
  
  // Navigation
  getOutputConnectedNodes, // Get nodes connected to output
  getNextNode,             // Get next node in execution path
  getPreviousNode,         // Get previous node in execution path
} = useNodeData(nodeId);
```

## Handle Types

Nodes can have these handle types:

- Flow handles: `flow-top` and `flow-bottom` for execution flow
- Input handles: One handle per input on the left side
- Output handle: A single output handle on the right side
- Custom handles: Additional handles with custom positions and logic

## Best Practices

1. Use the type-safe input definition helpers for better IDE support and error checking
2. Group related inputs using `createInputGroup` for consistent styling
3. Use `memo` to optimize rendering
4. Use `useCallback` for event handlers
5. Use `useEffect` to compute output values when inputs change
6. Keep node logic modular and focused on a single responsibility
7. Add validation to inputs where appropriate
8. Use semantic naming for inputs and outputs
9. For file inputs, always provide proper validation and handling callbacks
10. Implement preview capabilities for better UX when using file inputs 