import OpenAI from "openai";
import { Responses } from "openai/resources.mjs";

export interface LLMResponse {
  success: boolean;
  message: string;
  nodes?: any[];
  edges?: any[];
}

export const callLLM = async (prompt: string, nodes: any[], edges: any[], apiKey: string): Promise<LLMResponse> => {
  try {
    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });

    const flowState = {
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type,
        data: node.data,
        position: node.position
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle
      }))
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that helps modify visual programming flows. The flow consists of nodes and edges. 
          Your task is to understand the user's request and return a modified version of the flow that implements their changes.
          You must preserve the structure and validity of the flow while making requested modifications.
          Return only valid JSON in the format: { "nodes": [...], "edges": [...] }
          
          The nodes concist of GET, FUNCTION, PRINT, CONST
          GET: consists of functions retrieving and processing data from the blockchain
            - getUserSolBalance, parameters: address, apiKey, network
          FUNCTION: indicates a start of a logic, always the root of a logic
            - parameters: label
          PRINT: indicates a print statement
            - parameters: none
            - template
          CONST: indicates a constant either string, number or boolean
            - parameters: none
            - dataType
            - value

          Make sure the nodes do not overlap.
          The positioning should approximately follow these rules:
          - FUNCTION is always placed above the blocks being connected.
          - Nodes like CONST will be placed upper left of the blocks being connected.
          - Sparse the nodes so that they don't overlap.

          If you are asked to perform an action that goes beyond the capabilities of the given nodes and functions, 
          return error as true otherwise false.


          An example of a function is below
          {
            "nodes": [
              {
                "id": "const-1742451986640",
                "type": "CONST",
                "position": {
                  "x": 363.4541156939158,
                  "y": 432.9031802333745
                },
                "data": {
                  "label": "CONST",
                  "selectedFunction": "",
                  "parameters": {},
                  "dataType": "string",
                  "value": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"
                },
                "measured": {
                  "width": 252,
                  "height": 124
                },
                "selected": false,
                "dragging": false
              },
              {
                "id": "get-1742452568579",
                "type": "GET",
                "position": {
                  "x": 773.82632947209,
                  "y": 465.28970192590305
                },
                "data": {
                  "label": "GET",
                  "selectedFunction": "getUserSolBalance",
                  "parameters": {
                    "network": "mainnet"
                  }
                },
                "measured": {
                  "width": 265,
                  "height": 152
                },
                "selected": false,
                "dragging": false
              },
              {
                "id": "function-1742452572163",
                "type": "FUNCTION",
                "position": {
                  "x": 785.9323049291177,
                  "y": 310.63609908585545
                },
                "data": {
                  "name": "Untitled Function",
                  "label": "FUNCTION"
                },
                "measured": {
                  "width": 255,
                  "height": 90
                },
                "selected": false,
                "dragging": false
              },
              {
                "id": "print-1742517462582",
                "type": "PRINT",
                "position": {
                  "x": 1084.4726093185518,
                  "y": 712.4915533128282
                },
                "data": {
                  "label": "PRINT",
                  "selectedFunction": "",
                  "parameters": {},
                  "template": "$output$"
                },
                "measured": {
                  "width": 259,
                  "height": 143
                },
                "selected": true,
                "dragging": false
              }
            ],
            "edges": [
              {
                "source": "function-1742452572163",
                "sourceHandle": "output",
                "target": "get-1742452568579",
                "targetHandle": "top-target",
                "id": "xy-edge__function-1742452572163output-get-1742452568579top-target"
              },
              {
                "source": "const-1742451986640",
                "sourceHandle": "value",
                "target": "get-1742452568579",
                "targetHandle": "param-address",
                "id": "xy-edge__const-1742451986640value-get-1742452568579param-address"
              },
              {
                "source": "get-1742452568579",
                "sourceHandle": "bottom-source",
                "target": "print-1742517462582",
                "targetHandle": "template",
                "id": "xy-edge__get-1742452568579bottom-source-print-1742517462582template"
              }
            ],
            "viewport": {
              "x": -675.8832077720012,
              "y": -473.8523662256637,
              "zoom": 1.1486983549970349
            }
          }
          `
        },
        {
          role: "user",
          content: `Current flow state:\n${JSON.stringify(flowState, null, 2)}\n\nUser request: ${prompt}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    if (!response.choices[0]?.message?.content) {
      throw new Error("No response from LLM");
    }
    console.log(response);
    const result = JSON.parse(response.choices[0].message.content);

    if (result.error) {
      return {
        success: false,
        message: "Sorry! The flow asked is not supported by OpenSOL yet. But don't worry, you can file an issue on https://github.com/nathanliow/opensol or contribute your own template!"
      };
    }

    const nodesEqual = JSON.stringify(nodes.map(n => ({ ...n, position: undefined }))) === 
                      JSON.stringify(result.nodes?.map(n => ({ ...n, position: undefined })));
    const edgesEqual = JSON.stringify(edges) === JSON.stringify(result.edges);

    if (nodesEqual && edgesEqual) {
      return {
        success: false,
        message: "No changes were made to the flow."
      };
    }

    return {
      success: true,
      message: "Flow updated successfully",
      nodes: result.nodes,
      edges: result.edges
    };

  } catch (error) {
    console.error("LLM call failed:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
};
