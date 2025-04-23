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
      model: "gpt-4.5-preview",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that helps modify visual programming flows. The flow consists of nodes and edges. 
          Your task is to understand the user's request and return a modified version of the flow that implements their changes.
          You must preserve the structure and validity of the flow while making requested modifications.
          Return only valid JSON in the format: { "nodes": [...], "edges": [...] }
          
          The nodes consist of GET, HELIUS, FUNCTION, PRINT, CONST
          GET: consists of functions retrieving and processing data from the blockchain
            - getUserSolBalance, parameters: address, apiKey, network
          HELIUS: consists of functions using the Helius API for Solana operations, grouped by category:
            NFT and Asset Operations:
            - getAsset: parameters: assetId, apiKey, network
            - getAssetProof: parameters: assetId, apiKey, network
            - getAssetsByAuthority: parameters: authorityAddress, page, limit, apiKey, network
            - getAssetsByCreator: parameters: creatorAddress, page, limit, apiKey, network
            - getAssetsByGroup: parameters: groupKey, groupValue, page, limit, apiKey, network
            - getAssetsByOwner: parameters: ownerAddress, page, limit, apiKey, network
            - getNftEditions: parameters: mint, page, limit, apiKey, network
            - getSignaturesForAsset: parameters: assetId, before, until, limit, apiKey, network

            Account and Token Operations:
            - getAccountInfo: parameters: address, apiKey, network
            - getBalance: parameters: address, apiKey, network
            - getProgramAccounts: parameters: programId, apiKey, network
            - getTokenAccountBalance: parameters: account, apiKey, network
            - getTokenAccounts: parameters: address, apiKey, network
            - getTokenLargestAccounts: parameters: mint, apiKey, network
            - getTokenSupply: parameters: mint, apiKey, network

            Block and Transaction Operations:
            - getBlockHeight: parameters: apiKey, network
            - getBlockProduction: parameters: apiKey, network
            - getBlocks: parameters: start, end, apiKey, network
            - getBlockTime: parameters: block, apiKey, network
            - getTransaction: parameters: signature, apiKey, network
            - getTransactionCount: parameters: apiKey, network
            - getLatestBlockhash: parameters: apiKey, network
            - isBlockhashValid: parameters: blockhash, apiKey, network

            System Information:
            - getClusterNodes: parameters: apiKey, network
            - getEpochInfo: parameters: apiKey, network
            - getEpochSchedule: parameters: apiKey, network
            - getHealth: parameters: apiKey, network
            - getIdentity: parameters: apiKey, network
            - getVersion: parameters: apiKey, network
            - getVoteAccounts: parameters: apiKey, network
            - getSupply: parameters: apiKey, network

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
          - Output of a block only comes out from right side of the block and input only comes in from left side of the block
          - don't connect output of a block to a top of a block
          - everything must be connected with edges
          - if asked to perform an action, print the result using print node
          - use smooth step like the example
          - every node should be connected with edges

          If you are asked to perform an action that goes beyond the capabilities of the given nodes and functions, 
          return error as true otherwise false.


          An example of a function is below
          {
            "nodes": [
              {
                "id": "const-1742539084023",
                "type": "CONST",
                "position": {
                  "x": 129.09340366020075,
                  "y": 387.7135021329135
                },
                "data": {
                  "label": "CONST",
                  "selectedFunction": "",
                  "parameters": {},
                  "value": "HAUWqZTnQNhSqC3AG4GYtuoqTZMi3ywvgqWMyKC7pump"
                },
                "measured": {
                  "width": 258,
                  "height": 114
                },
                "selected": false,
                "dragging": false
              },
              {
                "id": "function-1742539096506",
                "type": "FUNCTION",
                "position": {
                  "x": 527.2645960571145,
                  "y": 196.57017101220296
                },
                "data": {
                  "name": "Untitled Function",
                  "label": "FUNCTION"
                },
                "measured": {
                  "width": 258,
                  "height": 80
                },
                "selected": false,
                "dragging": false
              },
              {
                "id": "print-1742539101850",
                "type": "PRINT",
                "position": {
                  "x": 1007.2758734415817,
                  "y": 325.85287730297756
                },
                "data": {
                  "label": "PRINT",
                  "selectedFunction": "",
                  "parameters": {},
                  "template": "$output"
                },
                "measured": {
                  "width": 254,
                  "height": 117
                },
                "selected": true,
                "dragging": false
              },
              {
                "id": "get-1742539131042",
                "type": "GET",
                "position": {
                  "x": 582.1655707630974,
                  "y": 439.9662261668413
                },
                "data": {
                  "label": "GET",
                  "selectedFunction": "getUserSolBalance",
                  "parameters": {
                    "network": "mainnet"
                  }
                },
                "measured": {
                  "width": 258,
                  "height": 114
                },
                "selected": false,
                "dragging": false
              },
              {
                "id": "helius-1742539536871",
                "type": "HELIUS",
                "position": {
                  "x": 503.69360405224734,
                  "y": 699.4710634126772
                },
                "data": {
                  "label": "HELIUS",
                  "selectedFunction": "getAsset",
                  "parameters": {
                    "network": "mainnet",
                    "apiKey": "59b22110-9b58-4580-9187-cf1cadeaa27d"
                  }
                },
                "measured": {
                  "width": 258,
                  "height": 114
                },
                "selected": false,
                "dragging": false
              },
              {
                "id": "const-1742539543785",
                "type": "CONST",
                "position": {
                  "x": 139.730535019182,
                  "y": 625.0972809618129
                },
                "data": {
                  "label": "CONST",
                  "selectedFunction": "",
                  "parameters": {},
                  "value": "HAUWqZTnQNhSqC3AG4GYtuoqTZMi3ywvgqWMyKC7pump"
                },
                "measured": {
                  "width": 258,
                  "height": 114
                },
                "selected": false,
                "dragging": false
              },
              {
                "id": "print-1742539553798",
                "type": "PRINT",
                "position": {
                  "x": 1000.1696614977884,
                  "y": 635.5261230791903
                },
                "data": {
                  "label": "PRINT",
                  "selectedFunction": "",
                  "parameters": {},
                  "template": "$output$"
                },
                "measured": {
                  "width": 254,
                  "height": 117
                },
                "selected": false,
                "dragging": false
              }
            ],
            "edges": [
              {
                "source": "helius-1742539536871",
                "sourceHandle": "output",
                "target": "print-1742539553798",
                "targetHandle": "flow-top",
                "id": "xy-edge__helius-1742539536871output-print-1742539553798flow"
              },
              {
                "source": "function-1742539096506",
                "sourceHandle": "output",
                "target": "get-1742539131042",
                "targetHandle": "flow-top",
                "type": "smoothstep",
                "animated": true,
                "style": {
                  "strokeWidth": 2,
                  "stroke": "white"
                },
                "id": "xy-edge__function-1742539096506output-get-1742539131042flow"
              },
              {
                "source": "const-1742539084023",
                "sourceHandle": "output",
                "target": "get-1742539131042",
                "targetHandle": "param-address",
                "type": "smoothstep",
                "animated": true,
                "style": {
                  "strokeWidth": 2,
                  "stroke": "white"
                },
                "id": "xy-edge__const-1742539084023output-get-1742539131042param-address"
              },
              {
                "source": "get-1742539131042",
                "sourceHandle": "output",
                "target": "print-1742539101850",
                "targetHandle": "template",
                "type": "smoothstep",
                "animated": true,
                "style": {
                  "strokeWidth": 2,
                  "stroke": "white"
                },
                "id": "xy-edge__get-1742539131042output-print-1742539101850template"
              },
              {
                "source": "helius-1742539536871",
                "sourceHandle": "output",
                "target": "print-1742539553798",
                "targetHandle": "template",
                "type": "smoothstep",
                "animated": true,
                "style": {
                  "strokeWidth": 2,
                  "stroke": "white"
                },
                "id": "xy-edge__helius-1742539536871output-print-1742539553798template"
              },
              {
                "source": "const-1742539543785",
                "sourceHandle": "output",
                "target": "helius-1742539536871",
                "targetHandle": "param-assetId",
                "type": "smoothstep",
                "animated": true,
                "style": {
                  "strokeWidth": 2,
                  "stroke": "white"
                },
                "id": "xy-edge__const-1742539543785output-helius-1742539536871param-assetId"
              },
              {
                "source": "get-1742539131042",
                "sourceHandle": "flow-bottom",
                "target": "helius-1742539536871",
                "targetHandle": "flow-top",
                "type": "smoothstep",
                "animated": true,
                "style": {
                  "strokeWidth": 2,
                  "stroke": "white"
                },
                "id": "xy-edge__get-1742539131042flow-bottom-helius-1742539536871flow"
              }
            ],
            "viewport": {
              "x": 93.66042235105147,
              "y": 2.0700435540771878,
              "zoom": 0.7044777109432065
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
    const result = JSON.parse(response.choices[0].message.content);

    if (result.error) {
      return {
        success: false,
        message: "Sorry! The flow asked is not supported by OpenSOL yet. But don't worry, you can file an issue on https://github.com/nathanliow/opensol or contribute your own template!"
      };
    }

    const nodesEqual = JSON.stringify(nodes.map(n => ({ ...n, position: undefined }))) === 
                      JSON.stringify(result.nodes?.map((n: any) => ({ ...n, position: undefined })));
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
