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
          
          The nodes consist of GET, HELIUS, FUNCTION, PRINT, CONST, CONDITIONAL, MINT, TRANSFER
          GET: consists of functions retrieving and processing data from the blockchain
            - getUserSolBalance, parameters: address, apiKey, network
          HELIUS: consists of functions using the Helius API for Solana operations:
            - getAccountInfo: parameters: pubkey, apiKey, network
            - getAsset: parameters: assetId, apiKey, network
            - getAssetProof: parameters: assetId, apiKey, network
            - getAssetsByAuthority: parameters: authorityAddress, page, limit, apiKey, network
            - getAssetsByCreator: parameters: creatorAddress, page, limit, apiKey, network
            - getAssetsByGroup: parameters: groupKey, groupValue, page, limit, apiKey, network
            - getAssetsByOwner: parameters: ownerAddress, page, limit, apiKey, network
            - getBalance: parameters: address, apiKey, network
            - getBlockCommitment: parameters: blockNumber, apiKey, network
            - getBlockHeight: parameters: apiKey, network
            - getBlockProduction: parameters: apiKey, network
            - getBlocks: parameters: start, end, apiKey, network
            - getBlockTime: parameters: block, apiKey, network
            - getClusterNodes: parameters: apiKey, network
            - getEpochInfo: parameters: apiKey, network
            - getEpochSchedule: parameters: apiKey, network
            - getHealth: parameters: apiKey, network
            - getIdentity: parameters: apiKey, network
            - getNftEditions: parameters: mint, page, limit, apiKey, network
            - getProgramAccounts: parameters: programId, apiKey, network
            - getSignaturesForAddress: parameters: address, before, limit, apiKey, network
            - getSignaturesForAsset: parameters: assetId, page, limit, before, after, apiKey, network
            - getTokenAccountBalance: parameters: account, apiKey, network
            - getTokenAccounts: parameters: address, apiKey, network
            - getTokenLargestAccounts: parameters: mint, apiKey, network
            - getTokenSupply: parameters: mint, apiKey, network
            - getTransaction: parameters: signature, apiKey, network
            - getTransactionCount: parameters: apiKey, network
            - getTransactionHistory: parameters: address, before, until, source, type, limit, apiKey, network
            - getLatestBlockhash: parameters: apiKey, network
            - getVersion: parameters: apiKey, network
            - getVoteAccounts: parameters: apiKey, network
            - getSupply: parameters: apiKey, network
            - isBlockhashValid: parameters: blockhash, apiKey, network
          BIRDEYE: consists of functions using the BirdEye API for Solana operations:
            - getBaseQuoteOHLCV: parameters: baseAddress, quoteAddress, interval, timeFrom, timeTo, apiKey, network
            - getHistoricalPrice: parameters: address, interval, timeFrom, timeTo, apiKey, network
            - getNewTokens: parameters: timeTo, limit, apiKey, network
            - getPrice: parameters: address, apiKey, network
            - getPriceAtUnixTime: parameters: address, unixTimestamp, apiKey, network
            - getTokenHolders: parameters: address, apiKey, network
            - getTokenMetadata: parameters: address, apiKey, network
            - getTokenOHLCV: parameters: address, interval, timeFrom, timeTo, apiKey, network
            - getTokenTopTraders: parameters: address, limit, apiKey, network
            - getTokenTrades: parameters: address, sort_by, sort_type, txnType, source, limit, apiKey, network
            - getWalletPortfolio: parameters: address, apiKey, network
            - getWalletTokenBalance: parameters: address, token, apiKey, network
          FUNCTION: indicates a start of a logic, always the root of a logic
            - parameters: label
          PRINT: indicates a print statement
            - parameters: none
            - template
          CONST: indicates a constant either string, number or boolean
            - parameters: none
            - dataType
            - value
          CONDITIONAL: indicates a conditional statement that branches a flow of logic into two paths
          MINT: indicates a mint statement
            - parameters: none
            - name
            - symbol
            - description
            - supply
            - image
          TRANSFER: indicates a transfer statement
            - parameters: none
            - tokenAddress
            - amount
            - recipient
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
                "id": "const-1749621164430",
                "type": "CONST",
                "position": {
                    "x": 240.67626357122003,
                    "y": 295.0944802085949
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
                            "value": "9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump"
                        }
                    },
                    "output": {
                        "handleId": "output",
                        "type": "string",
                        "value": "9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump"
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
                "id": "function-1749621171174",
                "type": "FUNCTION",
                "position": {
                    "x": 546.5600338157957,
                    "y": 142.02858100234798
                },
                "data": {
                    "inputs": {
                        "name": {
                            "handleId": "input-name",
                            "type": "string",
                            "value": "Getting Asset"
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
                "id": "helius-1749621210483",
                "type": "HELIUS",
                "position": {
                    "x": 547.0014446711123,
                    "y": 294.4921809675752
                },
                "data": {
                    "inputs": {
                        "function": {
                            "handleId": "input-function",
                            "type": "string",
                            "value": "getAsset"
                        },
                        "network": {
                            "handleId": "input-network",
                            "type": "string",
                            "value": "devnet"
                        },
                        "assetId": {
                            "handleId": "input-assetId",
                            "type": "string",
                            "value": "9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump"
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
                "selected": true,
                "dragging": false
              },
              {
                "id": "print-1749621221672",
                "type": "PRINT",
                "position": {
                    "x": 540.6628061312763,
                    "y": 509.1003715305915
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
            "edges": [
              {
                "source": "const-1749621164430",
                "sourceHandle": "output",
                "target": "helius-1749621210483",
                "targetHandle": "input-assetId",
                "type": "smoothstep",
                "animated": true,
                "style": {
                    "strokeWidth": 2,
                    "stroke": "white"
                },
                "id": "xy-edge__const-1749621164430output-helius-1749621210483input-assetId"
              },
              {
                "source": "function-1749621171174",
                "sourceHandle": "flow-bottom",
                "target": "helius-1749621210483",
                "targetHandle": "flow-top",
                "type": "smoothstep",
                "animated": true,
                "style": {
                    "strokeWidth": 2,
                    "stroke": "white"
                },
                "id": "xy-edge__function-1749621171174flow-bottom-helius-1749621210483flow-top"
              },
              {
                "source": "helius-1749621210483",
                "sourceHandle": "flow-bottom",
                "target": "print-1749621221672",
                "targetHandle": "flow-top",
                "type": "smoothstep",
                "animated": true,
                "style": {
                    "strokeWidth": 2,
                    "stroke": "white"
                },
                "id": "xy-edge__helius-1749621210483flow-bottom-print-1749621221672flow-top"
              }
            ],
            "viewport": {
              "x": -282.67512911056133,
              "y": -140.44044993706058,
              "zoom": 1.1178056974905393
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
