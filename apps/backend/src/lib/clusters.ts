// Make an object with a map of solana cluster names to subobjects, with the subobjects containing the URL and websocket URL
export const CLUSTERS: Record<
  string,
  {
    httpURL: string;
    webSocketURL: string;

    // The URL param name required for this cluster (eg for API keys)
    requiredParam: string | null;
    // The environment variable name used for requiredParam above.
    requiredParamEnvironmentVariable: string | null;

    features: {
      // Whether this is the default cluster for the Solana Explorer
      isExplorerDefault: boolean;
      // Whether this cluster name is known to the Solana Explorer
      isNameKnownToSolanaExplorer: boolean;
      // Whether this cluster supports Helius priority fee estimate instruction
      // See https://docs.helius.dev/solana-apis/priority-fee-api
      supportsGetPriorityFeeEstimate: boolean;
      // Enable retries on the client side
      enableClientSideRetries: boolean;
      // Whether this cluster needs priority fees
      needsPriorityFees: boolean;
    };
  }
> = {
  // Solana Labs RPCs
  // Don't add a seperate entry for 'mainnet'. Instead, we'll correct the cluster name to 'mainnet-beta'
  // in the connect function, and avoid making a duplicate entry.
  "mainnet-beta": {
    httpURL: "https://api.mainnet-beta.solana.com",
    webSocketURL: "wss://api.mainnet-beta.solana.com",
    requiredParam: null,
    requiredParamEnvironmentVariable: null,
    features: {
      isExplorerDefault: true,
      isNameKnownToSolanaExplorer: true,
      supportsGetPriorityFeeEstimate: false,
      enableClientSideRetries: true,
      needsPriorityFees: true,
    },
  },
  testnet: {
    httpURL: "https://api.testnet.solana.com",
    webSocketURL: "wss://api.testnet.solana.com",
    requiredParam: null,
    requiredParamEnvironmentVariable: null,
    features: {
      isExplorerDefault: false,
      isNameKnownToSolanaExplorer: true,
      supportsGetPriorityFeeEstimate: false,
      enableClientSideRetries: true,
      needsPriorityFees: true,
    },
  },
  devnet: {
    httpURL: "https://api.devnet.solana.com",
    webSocketURL: "wss://api.devnet.solana.com",
    requiredParam: null,
    requiredParamEnvironmentVariable: null,
    features: {
      isExplorerDefault: false,
      isNameKnownToSolanaExplorer: true,
      supportsGetPriorityFeeEstimate: false,
      enableClientSideRetries: true,
      needsPriorityFees: true,
    },
  },
  // Helius RPCs
  "helius-mainnet": {
    httpURL: "https://mainnet.helius-rpc.com/",
    webSocketURL: "wss://mainnet.helius-rpc.com/",
    requiredParam: "api-key",
    requiredParamEnvironmentVariable: "HELIUS_API_KEY",
    features: {
      isExplorerDefault: false,
      isNameKnownToSolanaExplorer: false,
      supportsGetPriorityFeeEstimate: true,
      enableClientSideRetries: true,
      needsPriorityFees: true,
    },
  },
  "helius-devnet": {
    httpURL: "https://devnet.helius-rpc.com/",
    webSocketURL: "wss://devnet.helius-rpc.com/",
    requiredParam: "api-key",
    requiredParamEnvironmentVariable: "HELIUS_API_KEY",
    features: {
      isExplorerDefault: false,
      isNameKnownToSolanaExplorer: false,
      supportsGetPriorityFeeEstimate: false,
      enableClientSideRetries: true,
      needsPriorityFees: true,
    },
  },
  // Localnet
  localnet: {
    httpURL: "http://localhost:8899",
    webSocketURL: "ws://localhost:8900",
    requiredParam: null,
    requiredParamEnvironmentVariable: null,
    features: {
      isExplorerDefault: false,
      isNameKnownToSolanaExplorer: false,
      supportsGetPriorityFeeEstimate: false,
      enableClientSideRetries: false,
      needsPriorityFees: false,
    },
  },
};

export const KNOWN_CLUSTER_NAMES = Object.keys(CLUSTERS);

// For error messages
export const KNOWN_CLUSTER_NAMES_STRING = KNOWN_CLUSTER_NAMES.join(", ");