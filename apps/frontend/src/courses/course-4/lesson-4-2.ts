import { Lesson } from "@/types/CourseTypes";
import { FlowEdge, FlowNode } from "../../../../backend/src/packages/compiler/src/types";

export const lesson_4_2: Lesson = {
  id: 'lesson-4-2',
  title: 'Fetching Token Data',
  description: '',
  steps: [
    {
      id: 'add-birdeye-node',
      title: 'Add a BIRDEYE node',
      description: 'Drag a BIRDEYE node onto the canvas and select "getPrice" from the function dropdown to query a token. This will use the [price API](https://docs.birdeye.so/reference/get-defi-price) and return the current price and liquidity for the token.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => {
        return nodes.some((n: FlowNode) => 
          n.type === 'BIRDEYE' && 
          n.data?.inputs?.function?.value === 'getPrice'
        );
      },
    },
    {
      id: 'add-const',
      title: 'Add a CONST node',
      description: 'Drag a CONST node onto the canvas and set its type to "string". Enter in a token address or use this: EwBUeMFm8Zcn79iJkDns3NdcL8t8B6Xikh9dKgZtpump',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) =>
        nodes.some(
          (n: FlowNode) =>
            n.type === 'CONST' && 
          n.data?.inputs?.dataType?.value === 'string' && 
          n.data?.inputs?.value?.value && 
          String(n.data.inputs.value.value).length > 0
        ),
    },
    {
      id: 'connect-const-to-birdeye',
      title: 'Connect CONST to BIRDEYE',
      description: 'Connect the output handle of the CONST node to the address input handle of the BIRDEYE node.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => {
        const constNode = nodes.find((n: FlowNode) => n.type === 'CONST');
        const birdeyeNode = nodes.find((n: FlowNode) => n.type === 'BIRDEYE');
        
        return !!(constNode && birdeyeNode && 
          edges?.some((e: FlowEdge) => e.source === constNode.id && e.target === birdeyeNode.id));
      },
    },
    {
      id: 'add-print-node',
      title: 'Add a PRINT node',
      description: 'Drag a PRINT node onto the canvas and type "$output$" into the template field.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => 
        nodes.some((n: FlowNode) => n.type === 'PRINT' && n.data?.inputs?.template?.value === '$output$'),
    },
    {
      id: 'connect-birdeye-to-print',
      title: 'Connect BIRDEYE to PRINT',
      description: 'Connect the output handle of the BIRDEYE node to the top handle of the PRINT node.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => {
        const birdeyeNode = nodes.find((n: FlowNode) => n.type === 'BIRDEYE');
        const printNode = nodes.find((n: FlowNode) => n.type === 'PRINT');

        return !!(birdeyeNode && printNode && 
          edges?.some((e: FlowEdge) => e.source === birdeyeNode.id && e.target === printNode.id));
      },
    },
    {
      id: 'run-flow',
      title: 'Run the flow',
      description: 'Click the Run button to execute the flow. You should see the token price data printed in the console.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => {
        return !!(output && output.length > 0);
      },
    },
    {
      id: 'birdeye-node-get-historical-price',
      title: 'Add a BIRDEYE node',
      description: 'Drag a BIRDEYE node onto the canvas and select "getHistoricalPrice" from the function dropdown to query a token. This will use the [historicalPrice API](https://docs.birdeye.so/reference/get-defi-history_price) and return the historical prices for the token between two unix timestamps. Fill out the timeFrom and timeTo fields with the start and end times of the historical price data you want to fetch. You can use timeFrom: 1748700279 and timeTo: 1748720279',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => {
        return nodes.some((n: FlowNode) => 
          n.type === 'BIRDEYE' && 
          n.data?.inputs?.function?.value === 'getHistoricalPrice' &&
          n.data?.inputs?.timeFrom?.value &&
          n.data?.inputs?.timeTo?.value &&
          String(n.data.inputs.timeFrom.value).length > 0 &&
          String(n.data.inputs.timeTo.value).length > 0
        );
      },
    },
    {
      id: 'run-flow',
      title: 'Run the flow',
      description: 'Click the Run button to execute the flow. You should an array of token price data printed in the console.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => {
        return !!(output && output.length > 0);
      },
    },
  ],
  startNodes: [
    {
      "id": "function-1748670572868",
      "type": "FUNCTION",
      "position": {
          "x": 395.4147249372667,
          "y": 338.10934551020216
      },
      "data": {
          "inputs": {
              "name": {
                  "handleId": "input-name",
                  "type": "string",
                  "value": "Fetch Token Data"
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
    }
  ],
};