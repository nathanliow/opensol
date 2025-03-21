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

          If you are asked to perform an action that goes beyond the capabilities of the given nodes and functions, 
          return error as true otherwise false.


          An example of a function is below
          {
            "nodes": [
              {
                "id": "const-1742539084023",
                "type": "CONST",
                "position": {
                  "x": 236.97474443143057,
                  "y": 400.48892406634866
                },
                "data": {
                  "label": "CONST",
                  "selectedFunction": "",
                  "parameters": {},
                  "value": "HAUWqZTnQNhSqC3AG4GYtuoqTZMi3ywvgqWMyKC7pump"
                },
                "measured": {
                  "width": 227,
                  "height": 129
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
                  "width": 229,
                  "height": 96
                },
                "selected": false,
                "dragging": false
              },
              {
                "id": "print-1742539101850",
                "type": "PRINT",
                "position": {
                  "x": 954.9912185103105,
                  "y": 430.1854897593644
                },
                "data": {
                  "label": "PRINT",
                  "selectedFunction": "",
                  "parameters": {},
                  "template": "$output$"
                },
                "measured": {
                  "width": 232,
                  "height": 133
                },
                "selected": false,
                "dragging": false
              },
              {
                "id": "get-1742539131042",
                "type": "GET",
                "position": {
                  "x": 559.4537095481018,
                  "y": 430.02978688528066
                },
                "data": {
                  "label": "GET",
                  "selectedFunction": "getUserSolBalance",
                  "parameters": {
                    "network": "mainnet"
                  }
                },
                "measured": {
                  "width": 240,
                  "height": 129
                },
                "selected": false,
                "dragging": false
              },
              {
                "id": "helius-1742539536871",
                "type": "HELIUS",
                "position": {
                  "x": 557.6342744378624,
                  "y": 681.017676175493
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
                  "width": 316,
                  "height": 129
                },
                "selected": false,
                "dragging": false
              },
              {
                "id": "const-1742539543785",
                "type": "CONST",
                "position": {
                  "x": 264.64577170165865,
                  "y": 676.1989686955533
                },
                "data": {
                  "label": "CONST",
                  "selectedFunction": "",
                  "parameters": {},
                  "value": "HAUWqZTnQNhSqC3AG4GYtuoqTZMi3ywvgqWMyKC7pump"
                },
                "measured": {
                  "width": 227,
                  "height": 129
                },
                "selected": false,
                "dragging": false
              },
              {
                "id": "print-1742539553798",
                "type": "PRINT",
                "position": {
                  "x": 1007.2671181274745,
                  "y": 628.428666449504
                },
                "data": {
                  "label": "PRINT",
                  "selectedFunction": "",
                  "parameters": {},
                  "template": ""
                },
                "measured": {
                  "width": 232,
                  "height": 133
                },
                "selected": false,
                "dragging": false
              }
            ],
            "edges": [
              {
                "source": "function-1742539096506",
                "sourceHandle": "output",
                "target": "get-1742539131042",
                "targetHandle": "flow",
                "id": "xy-edge__function-1742539096506output-get-1742539131042flow"
              },
              {
                "source": "get-1742539131042",
                "sourceHandle": "bottom-source",
                "target": "helius-1742539536871",
                "targetHandle": "flow",
                "id": "xy-edge__get-1742539131042bottom-source-helius-1742539536871flow"
              },
              {
                "source": "const-1742539543785",
                "sourceHandle": "output",
                "target": "helius-1742539536871",
                "targetHandle": "param-assetId",
                "id": "xy-edge__const-1742539543785output-helius-1742539536871param-assetId"
              },
              {
                "source": "const-1742539084023",
                "sourceHandle": "output",
                "target": "get-1742539131042",
                "targetHandle": "param-address",
                "id": "xy-edge__const-1742539084023output-get-1742539131042param-address"
              },
              {
                "source": "helius-1742539536871",
                "sourceHandle": "output",
                "target": "print-1742539553798",
                "targetHandle": "flow",
                "id": "xy-edge__helius-1742539536871output-print-1742539553798flow"
              },
              {
                "source": "helius-1742539536871",
                "sourceHandle": "output",
                "target": "print-1742539553798",
                "targetHandle": "template",
                "id": "xy-edge__helius-1742539536871output-print-1742539553798template"
              },
              {
                "source": "get-1742539131042",
                "sourceHandle": "output",
                "target": "print-1742539101850",
                "targetHandle": "template",
                "id": "xy-edge__get-1742539131042output-print-1742539101850template"
              }
            ],
            "viewport": {
              "x": -88.08716153046566,
              "y": -239.50131790422324,
              "zoom": 0.8705505632961219
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
