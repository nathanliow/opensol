export interface SolanaOperationResult {
  success: boolean;
  data?: any;
  signature?: string;
  error?: string;
}

export interface SolanaOperationOptions {
  requiresSigning?: boolean;
  requiresMainnet?: boolean;
}
