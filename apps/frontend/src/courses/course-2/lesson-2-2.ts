import { Lesson } from "@/types/CourseTypes";
import { FlowEdge, FlowNode } from "../../../../backend/src/packages/compiler/src/types";

export const lesson_2_2: Lesson = {
  id: 'lesson-2-2',
  title: 'Executing a Flow',
  description: '',
  startNodes: [
    {
      "id": "function-1748558297587",
      "type": "FUNCTION",
      "position": {
          "x": 17.31033337755335,
          "y": 1.5168258421026337
      },
      "data": {
          "inputs": {
              "name": {
                  "handleId": "input-name",
                  "type": "string",
                  "value": "Get Balance"
              }
          },
          "output": {
              "handleId": "output",
              "type": "string",
              "value": ""
          }
      },
      "measured": {
          "width": 243,
          "height": 81
      },
      "selected": false,
      "dragging": false
    },
    {
      "id": "const-1748558310524",
      "type": "CONST",
      "position": {
          "x": -312.5992305757297,
          "y": 179.9369495535477
      },
      "data": {
          "inputs": {
              "dataType": {
                  "handleId": "input-dataType",
                  "type": "string",
                  "value": "string"
              },
              "value": {
                  "handleId": "input-value",
                  "type": "string",
                  "value": "suqh5sHtr8HyJ7q8scBimULPkPpA557prMG47xCHQfK"
              }
          },
          "output": {
              "handleId": "output",
              "type": "string",
              "value": "suqh5sHtr8HyJ7q8scBimULPkPpA557prMG47xCHQfK"
          }
      },
      "measured": {
          "width": 243,
          "height": 115
      },
      "selected": false,
      "dragging": false
    },
    {
      "id": "get-1748558325738",
      "type": "GET",
      "position": {
          "x": 15.402363443135606,
          "y": 181.21630350189847
      },
      "data": {
          "inputs": {
              "function": {
                  "handleId": "input-function",
                  "type": "string",
                  "value": "getUserSolBalance"
              },
              "network": {
                  "handleId": "input-network",
                  "type": "string",
                  "value": "mainnet"
              },
              "address": {
                  "handleId": "input-address",
                  "type": "string",
                  "value": "suqh5sHtr8HyJ7q8scBimULPkPpA557prMG47xCHQfK"
              }
          },
          "output": {
              "handleId": "output",
              "type": "object",
              "value": {}
          }
      },
      "measured": {
          "width": 243,
          "height": 115
      },
      "selected": false,
      "dragging": false
    },
    {
      "id": "print-1748558349814",
      "type": "PRINT",
      "position": {
          "x": 8.887864038201883,
          "y": 384.7944099060773
      },
      "data": {
          "inputs": {
              "template": {
                  "handleId": "input-template",
                  "type": "string",
                  "value": "$output$"
              }
          },
          "output": {
              "handleId": "output",
              "type": "string",
              "value": "$output$"
          }
      },
      "measured": {
          "width": 254,
          "height": 117
      },
      "selected": false,
      "dragging": false
    }
  ],
  startEdges: [
    {
      "source": "function-1748558297587",
      "sourceHandle": "flow-bottom",
      "target": "get-1748558325738",
      "targetHandle": "flow-top",
      "type": "smoothstep",
      "animated": true,
      "style": {
        "strokeWidth": 2,
        "stroke": "white"
      },
      "id": "xy-edge__function-1748558297587flow-bottom-get-1748558325738flow-top"
    },
    {
      "source": "const-1748558310524",
      "sourceHandle": "output",
      "target": "get-1748558325738",
      "targetHandle": "input-address",
      "type": "smoothstep",
      "animated": true,
      "style": {
        "strokeWidth": 2,
        "stroke": "white"
      },
      "id": "xy-edge__const-1748558310524output-get-1748558325738input-address"
    },
    {
      "source": "get-1748558325738",
      "sourceHandle": "flow-bottom",
      "target": "print-1748558349814",
      "targetHandle": "flow-top",
      "type": "smoothstep",
      "animated": true,
      "style": {
        "strokeWidth": 2,
        "stroke": "white"
      },
      "id": "xy-edge__get-1748558325738flow-bottom-print-1748558349814flow-top"
    }
  ],
  steps: [
    {
      id: 'execute-flow',
      title: 'Execute your Flow',
      description: `During the last lesson, we created a flow that gets the balance of a wallet address. But now we need to execute it. Click on the console button at the bottom right of the canvas then click on the dropdown next to the green run button and select 'Get Balance'. Then click on the run button to execute the flow and generate code.`,
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => {
        return !!(output && output.trim().length > 0);
      },
    },
    {
      id: 'view-console-tabs',
      title: 'View Console Tabs',
      description: `Now you can see the output of the flow, the nodes and edges in their raw format, the code generated, and a prompt to build more with AI. The code can also be copied to your own repository if you want to expand on it.`,
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
  ],
};