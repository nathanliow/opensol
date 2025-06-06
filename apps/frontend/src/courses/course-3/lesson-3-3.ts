import { Lesson } from "@/types/CourseTypes";
import { FlowEdge, FlowNode } from "../../../../backend/src/packages/compiler/src/types";

export const lesson_3_3: Lesson = {
  id: 'lesson-3-3',
  title: 'Fetching transaction data with Helius',
  description: '',
  xp: 100,
  steps: [
    {
      id: 'welcome',
      title: 'Fetching transactions',
      description: 'Helius can also easily fetch transactions for a given wallet or program address. Each transaction on Solana has a signature which can be used to search for a transaction. Signatures are simply strings of characters which are much smaller compared to full transaction objects, making then easier to fetch and index. We\'ll look at the HTTP getTransaction, Helius\' getTransaction and Helius\' getTransactionHistory functions.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
    {
      id: 'add-const-transaction',
      title: 'Add a CONST node',
      description: 'Drag a CONST node onto the canvas and set its type to "string". Enter in a signature or use this: arPN84dAHf6rzbpNb6ooVEAELaZJvbuwqnLUw7zuTzoAQjiquR1LwtMxzbYikeMtgHt8CYa5t2ubf2hZwhuUEhi',
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
      id: 'add-helius-node-gettransaction',
      title: 'Add a HELIUS node',
      description: 'Drag a HELIUS node onto the canvas and select "getTransaction" from the function dropdown to query a transaction. This will use the [HTTP getTransaction method](https://www.helius.dev/docs/api-reference/rpc/http/gettransaction) and return details about the transaction.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => {
        return nodes.some((n: FlowNode) => 
          n.type === 'HELIUS' && 
        n.data?.inputs?.function?.value === 'getTransaction');
      },
    },
    {
      id: 'connect-const-to-helius',
      title: 'Connect CONST to HELIUS',
      description: 'Connect the output handle of the CONST node to the signature input handle of the HELIUS node.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => {
        const constNode = nodes.find((n: FlowNode) => n.type === 'CONST');
        const heliusNode = nodes.find((n: FlowNode) => n.type === 'HELIUS');
        
        return !!(constNode && heliusNode && 
          edges?.some((e: FlowEdge) => e.source === constNode.id && e.target === heliusNode.id));
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
      id: 'connect-function-to-helius',
      title: 'Connect FUNCTION to HELIUS',
      description: 'Connect the bottom handle of the Function node to the top handle of the HELIUS node.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => {
        const functionNode = nodes.find((n: FlowNode) => n.type === 'FUNCTION');
        const heliusNode = nodes.find((n: FlowNode) => n.type === 'HELIUS');
        
        return !!(functionNode && heliusNode && 
          edges?.some((e: FlowEdge) => e.source === functionNode.id && e.target === heliusNode.id));
      },
    },
    {
      id: 'connect-helius-to-print',
      title: 'Connect HELIUS to PRINT',
      description: 'Connect the bottom handle of the HELIUS node to the top handle of the PRINT node.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => {
        const heliusNode = nodes.find((n: FlowNode) => n.type === 'HELIUS');
        const printNode = nodes.find((n: FlowNode) => n.type === 'PRINT');
        
        return !!(heliusNode && printNode && 
          edges?.some((e: FlowEdge) => e.source === heliusNode.id && e.target === printNode.id));
      },
    },
    {
      id: 'run-flow-gettransaction',
      title: 'Run the flow with getTransaction',
      description: 'Click the Run button to execute the flow. You should see the basic transaction data printed in the console using the HTTP getTransaction method.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => {
        return !!(output && output.length > 0);
      },
    },
    {
      id: 'change-to-enhanced-transaction',
      title: 'Change to getEnhancedTransaction',
      description: 'Change the HELIUS node function to "getEnhancedTransaction". This will use Helius\' own [getTransactions method](https://www.helius.dev/docs/api-reference/enhanced-transactions/gettransactions) and return enhanced, human-readable formats with decoded instruction data and contextual information about the transaction.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => {
        return nodes.some((n: FlowNode) => 
          n.type === 'HELIUS' && 
        n.data?.inputs?.function?.value === 'getEnhancedTransaction');
      },
    },
    {
      id: 'run-flow-enhanced',
      title: 'Run the flow with getEnhancedTransaction',
      description: 'Click the Run button again to execute the flow with the enhanced transaction method. Notice the difference in the output - it should be more detailed and human-readable.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => {
        return !!(output && output.length > 0);
      },
    },
    {
      id: 'add-address-const',
      title: 'Add another CONST node for address',
      description: 'Drag another CONST node onto the canvas and set its type to "string". Enter a wallet address or use this: 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => {
        const constNodes = nodes.filter((n: FlowNode) => n.type === 'CONST' && 
          n.data?.inputs?.dataType?.value === 'string' && 
          n.data?.inputs?.value?.value && 
          String(n.data.inputs.value.value).length > 0);
        return constNodes.length >= 2;
      },
    },
    {
      id: 'change-to-transaction-history',
      title: 'Change to getTransactionHistory',
      description: 'Change the HELIUS node function to "getTransactionHistory". This will use Helius\' own [getTransactionHistory method](https://www.helius.dev/docs/api-reference/enhanced-transactions/gettransactionsbyaddress) and return a list of enhanced transactions for a given address.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => {
        return nodes.some((n: FlowNode) => 
          n.type === 'HELIUS' && 
        n.data?.inputs?.function?.value === 'getTransactionHistory');
      },
    },
    {
      id: 'connect-address-to-helius',
      title: 'Connect address CONST to HELIUS',
      description: 'Connect the output handle of the address CONST node to the address input handle of the HELIUS node. You may need to disconnect the signature input first.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => {
        const constNodes = nodes.filter((n: FlowNode) => n.type === 'CONST');
        const heliusNode = nodes.find((n: FlowNode) => n.type === 'HELIUS' && n.data?.inputs?.function?.value === 'getTransactionHistory');
        
        return !!(constNodes.length >= 2 && heliusNode && 
          edges?.some((e: FlowEdge) => constNodes.some(c => c.id === e.source) && e.target === heliusNode.id));
      },
    },
    {
      id: 'run-flow-history',
      title: 'Run the flow with getTransactionHistory',
      description: 'Click the Run button to execute the flow with the transaction history method. This should return a list of transactions for the wallet address, which can be useful for getting a wallet\'s portfolio or PnL.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => {
        return !!(output && output.length > 0);
      },
    },
    {
      id: 'learn-pagination',
      title: 'Transaction Pagination',
      description: 'If a wallet has many transactions, use pagination to fetch all of their transactions. This is because getTransactionHistory has a max limit of 100 transactions. Check this [complete example](https://www.helius.dev/docs/enhanced-transactions#complete-pagination-example) by Helius.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
  ],
  startNodes: [
    {
      "id": "function-1748670572868",
      "type": "FUNCTION",
      "position": {
          "x": 0,
          "y": 0
      },
      "data": {
          "inputs": {
              "name": {
                  "handleId": "input-name",
                  "type": "string",
                  "value": "Fetch Transactions"
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