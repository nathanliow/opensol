import {
  createDefaultRpcTransport,
  createSolanaRpcFromTransport,
  createSolanaRpcSubscriptions,
  sendAndConfirmTransactionFactory,
  KeyPairSigner,
  Address,
  TokenAmount,
} from "@solana/kit";
import { createRecentSignatureConfirmationPromiseFactory } from "@solana/transaction-confirmation";

import { checkIsValidURL, encodeURL } from "./url";
import { loadWalletFromEnvironment, loadWalletFromFile } from "./keypair";
import { KNOWN_CLUSTER_NAMES, CLUSTERS, KNOWN_CLUSTER_NAMES_STRING } from "./clusters";

import { sendTransactionFromInstructionsFactory } from "./transactions";
import { createWalletFactory, createWalletsFactory } from "./wallets";
import {
  getMintFactory,
  getTokenAccountAddress,
  createTokenMintFactory,
  mintTokensFactory,
  transferLamportsFactory,
  transferTokensFactory,
  getTokenAccountBalanceFactory,
  checkTokenAccountIsClosedFactory,
} from "./tokens";
import { getLogsFactory } from "./logs";
import { getExplorerLinkFactory } from "./explorer";
import { airdropIfRequiredFactory, getLamportBalanceFactory } from "./sol";
import { getPDAAndBump } from "./pdas";

/**
 * Creates a connection to a Solana cluster with all helper functions pre-configured.
 * @param {string} [clusterNameOrURL="localnet"] - Either a known cluster name or an HTTP URL
 *                 Known names: "mainnet-beta"/"mainnet", "testnet", "devnet", "localnet",
 *                 "helius-mainnet", "helius-testnet", "helius-devnet"
 * @param {string | null} [clusterWebSocketURL=null] - WebSocket URL for subscriptions. Required if using custom HTTP URL
 * @returns {Connection} Connection object with all helper functions configured
 * @throws {Error} If using Helius cluster without HELIUS_API_KEY environment variable set
 * @throws {Error} If using custom HTTP URL without WebSocket URL
 * @throws {Error} If cluster name is invalid
 */
export const connect = (
  clusterNameOrURL: string = "localnet",
  clusterWebSocketURL: string | null = null,
): Connection => {
  let httpURL: string | null = null;
  let webSocketURL: string | null = null;
  let supportsGetPriorityFeeEstimate: boolean = false;
  let needsPriorityFees: boolean = false;
  let enableClientSideRetries: boolean = false;
  // Postel's law: be liberal in what you accept - so include 'mainnet' as well as 'mainnet-beta'
  if (clusterNameOrURL === "mainnet") {
    clusterNameOrURL = "mainnet-beta";
  }

  if (KNOWN_CLUSTER_NAMES.includes(clusterNameOrURL)) {
    const clusterDetails = CLUSTERS[clusterNameOrURL];

    if (clusterDetails.features.supportsGetPriorityFeeEstimate) {
      supportsGetPriorityFeeEstimate = true;
    }

    if (clusterDetails.features.needsPriorityFees) {
      needsPriorityFees = true;
    }

    enableClientSideRetries = clusterDetails.features.enableClientSideRetries;

    if (clusterDetails.requiredParamEnvironmentVariable) {
      const requiredParamEnvironmentVariable = process.env[clusterDetails.requiredParamEnvironmentVariable];
      if (!requiredParamEnvironmentVariable) {
        throw new Error(`Environment variable ${clusterDetails.requiredParamEnvironmentVariable} is not set.`);
      }
      // Add the URL param 'api-key' with the value of the environment variable
      // using a URLSearchParams object
      const queryParamsString = new URLSearchParams({
        "api-key": requiredParamEnvironmentVariable,
      });
      httpURL = `${clusterDetails.httpURL}?${queryParamsString}`;
      webSocketURL = `${clusterDetails.webSocketURL}?${queryParamsString}`;
    } else {
      httpURL = clusterDetails.httpURL;
      webSocketURL = clusterDetails.webSocketURL;
    }
  } else {
    if (!clusterWebSocketURL) {
      throw new Error(
        `Missing clusterWebSocketURL. Either provide a valid cluster name (${KNOWN_CLUSTER_NAMES_STRING}) or two valid URLs.`,
      );
    }
    if (checkIsValidURL(clusterNameOrURL) && checkIsValidURL(clusterWebSocketURL)) {
      httpURL = clusterNameOrURL;
      webSocketURL = clusterWebSocketURL;
    } else {
      throw new Error(
        `Unsupported cluster name (valid options are ${KNOWN_CLUSTER_NAMES_STRING}) or URL: ${clusterNameOrURL}. `,
      );
    }
  }

  const transport = createDefaultRpcTransport({
    url: httpURL,
  });

  // Create an RPC client using that transport.
  const rpc = createSolanaRpcFromTransport(transport);

  const rpcSubscriptions = createSolanaRpcSubscriptions(webSocketURL);
  const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({
    rpc,
    rpcSubscriptions,
  });

  // Let's avoid data types like 'Promise' into the function name
  // we're not using Hungarian notation, this isn't common TS behavior, and it's not necessary to do so
  const getRecentSignatureConfirmation = createRecentSignatureConfirmationPromiseFactory({
    rpc,
    rpcSubscriptions,
  });

  const airdropIfRequired = airdropIfRequiredFactory(rpc, rpcSubscriptions);

  const createWallet = createWalletFactory(airdropIfRequired);

  const createWallets = createWalletsFactory(createWallet);

  const getLogs = getLogsFactory(rpc);

  const sendTransactionFromInstructions = sendTransactionFromInstructionsFactory(
    rpc,
    needsPriorityFees,
    supportsGetPriorityFeeEstimate,
    enableClientSideRetries,
    sendAndConfirmTransaction,
  );

  const transferLamports = transferLamportsFactory(sendTransactionFromInstructions);

  const createTokenMint = createTokenMintFactory(rpc, sendTransactionFromInstructions);

  const getMint = getMintFactory(rpc);

  const transferTokens = transferTokensFactory(getMint, sendTransactionFromInstructions);

  const mintTokens = mintTokensFactory(sendTransactionFromInstructions);

  const getTokenAccountBalance = getTokenAccountBalanceFactory(rpc);

  const checkTokenAccountIsClosed = checkTokenAccountIsClosedFactory(getTokenAccountBalance);

  return {
    rpc,
    rpcSubscriptions,
    sendAndConfirmTransaction,
    sendTransactionFromInstructions,
    getLamportBalance: getLamportBalanceFactory(rpc),
    getExplorerLink: getExplorerLinkFactory(clusterNameOrURL),
    airdropIfRequired,
    createWallet,
    createWallets,
    getLogs,
    getRecentSignatureConfirmation,
    transferLamports,
    transferTokens,
    createTokenMint,
    mintTokens,
    getTokenAccountAddress,
    loadWalletFromFile,
    loadWalletFromEnvironment,
    getMint,
    getTokenAccountBalance,
    getPDAAndBump,
    checkTokenAccountIsClosed,
  };
};

export interface Connection {
  /**
   * The core RPC client for making direct Solana API calls. Use this when you need
   * access to raw Solana JSON RPC methods not covered by helper functions.
   */
  rpc: ReturnType<typeof createSolanaRpcFromTransport>;

  /**
   * The WebSocket client for real-time Solana event subscriptions like new blocks,
   * program logs, account changes etc.
   */
  rpcSubscriptions: ReturnType<typeof createSolanaRpcSubscriptions>;

  /**
   * Submits a transaction and waits for it to be confirmed on the network.
   * @param {VersionedTransaction} transaction - The complete signed transaction to submit
   * @param {Object} [options] - Optional configuration
   * @param {Commitment} [options.commitment] - Confirmation level to wait for:
   *                                           'processed' = processed by current node,
   *                                           'confirmed' = confirmed by supermajority of the cluster,
   *                                           'finalized' = confirmed by supermajority and unlikely to revert
   * @param {boolean} [options.skipPreflight] - Skip pre-flight transaction checks to reduce latency
   * @returns {Promise<void>}
   */
  sendAndConfirmTransaction: ReturnType<typeof sendAndConfirmTransactionFactory>;

  /**
   * Builds, signs and sends a transaction containing multiple instructions.
   * @param {Object} params - Transaction parameters
   * @param {KeyPairSigner} params.feePayer - Account that will pay the transaction fees
   * @param {Array<IInstruction>} params.instructions - List of instructions to execute in sequence
   * @param {Commitment} [params.commitment="confirmed"] - Confirmation level to wait for:
   *                                                      'processed' = processed by current node,
   *                                                      'confirmed' = confirmed by supermajority of the cluster,
   *                                                      'finalized' = confirmed by supermajority and unlikely to revert
   * @param {boolean} [params.skipPreflight=true] - Skip pre-flight transaction checks to reduce latency
   * @param {number} [params.maximumClientSideRetries=0] - Number of times to retry if the transaction fails
   * @param {AbortSignal | null} [params.abortSignal=null] - Signal to cancel the transaction
   * @returns {Promise<string>} The transaction signature
   */
  sendTransactionFromInstructions: ReturnType<typeof sendTransactionFromInstructionsFactory>;

  /**
   * Gets an account's SOL balance in lamports (1 SOL = 1,000,000,000 lamports).
   * @param {string} address - The account address to check
   * @param {Commitment} commitment - Confirmation level of data:
   *                                 'processed' = maybe outdated but fast,
   *                                 'confirmed' = confirmed by supermajority,
   *                                 'finalized' = definitely permanent but slower
   * @returns {Promise<Lamports>} The balance in lamports
   */
  getLamportBalance: ReturnType<typeof getLamportBalanceFactory>;

  /**
   * Creates a URL to view any Solana entity on Solana Explorer.
   * Automatically configures the URL for the current network/cluster.
   * @param {("transaction" | "tx" | "address" | "block")} linkType - What type of entity to view
   * @param {string} id - Identifier (address, signature, or block number)
   * @returns {string} A properly configured Solana Explorer URL
   */
  getExplorerLink: ReturnType<typeof getExplorerLinkFactory>;

  /**
   * Checks if a transaction has been confirmed on the network.
   * Useful for verifying that time-sensitive transactions have succeeded.
   * @param {string} signature - The unique transaction signature to verify
   * @returns {Promise<boolean>} True if the transaction is confirmed
   */
  getRecentSignatureConfirmation: ReturnType<typeof createRecentSignatureConfirmationPromiseFactory>;

  /**
   * Checks if a token account is closed or doesn't exist.
   * A token account can be specified directly or derived from a wallet and mint address.
   * @param {Object} params - Parameters for checking token account
   * @param {Address} [params.tokenAccount] - Direct token account address to check
   * @param {Address} [params.wallet] - Wallet address (required if tokenAccount not provided)
   * @param {Address} [params.mint] - Token mint address (required if tokenAccount not provided)
   * @param {boolean} [params.useTokenExtensions=false] - Use Token-2022 program instead of Token program
   * @returns {Promise<boolean>} True if the token account is closed or doesn't exist, false if it exists and is open
   * @throws {Error} If neither tokenAccount nor both wallet and mint are provided
   * @throws {Error} If there's an error checking the account that isn't related to the account not existing
   */
  checkTokenAccountIsClosed: ReturnType<typeof checkTokenAccountIsClosedFactory>;

  /**
   * Requests free test SOL from a faucet if an account's balance is too low.
   * Only works on test networks (devnet/testnet).
   * @param {Address} address - The account that needs SOL
   * @param {Lamports} airdropAmount - How much SOL to request (in lamports)
   * @param {Lamports} minimumBalance - Only request SOL if balance is below this amount
   * @param {Commitment} commitment - Confirmation level to wait for:
   *                                 'processed' = processed by current node,
   *                                 'confirmed' = confirmed by supermajority of the cluster,
   *                                 'finalized' = confirmed by supermajority and unlikely to revert
   * @returns {Promise<string | null>} Transaction signature if SOL was airdropped, null if no airdrop was needed
   */
  airdropIfRequired: ReturnType<typeof airdropIfRequiredFactory>;

  /**
   * Creates a new Solana wallet with optional vanity address and automatic funding.
   * @param {Object} [options={}] - Configuration options
   * @param {string | null} [options.prefix] - Generate address starting with these characters
   * @param {string | null} [options.suffix] - Generate address ending with these characters
   * @param {string | null} [options.envFileName] - Save private key to this .env file
   * @param {string} [options.envVariableName] - Environment variable name to store the key
   * @param {Lamports | null} [options.airdropAmount] - Amount of test SOL to request from faucet
   * @returns {Promise<KeyPairSigner>} The new wallet, ready to use
   */
  createWallet: ReturnType<typeof createWalletFactory>;

  /**
   * Creates multiple Solana wallets in parallel with identical configuration.
   * @param {number} amount - How many wallets to create
   * @param {Object} options - Same configuration options as createWallet
   * @returns {Promise<Array<KeyPairSigner>>} Array of new wallets
   */
  createWallets: ReturnType<typeof createWalletsFactory>;

  /**
   * Retrieves the program output messages from a transaction.
   * Useful for debugging failed transactions or understanding program behavior.
   * @param {string} signature - Transaction signature to analyze
   * @returns {Promise<readonly Array<string>>} Program log messages in order of execution
   */
  getLogs: ReturnType<typeof getLogsFactory>;

  /**
   * Transfers SOL from one account to another.
   * @param {Object} params - Transfer details
   * @param {KeyPairSigner} params.source - Account sending the SOL (must sign)
   * @param {Address} params.destination - Account receiving the SOL
   * @param {Lamports} params.amount - Amount of SOL to send (in lamports)
   * @param {boolean} [params.skipPreflight=true] - Skip pre-flight checks to reduce latency
   * @param {number} [params.maximumClientSideRetries=0] - Number of retry attempts if transfer fails
   * @param {AbortSignal | null} [params.abortSignal=null] - Signal to cancel the transfer
   * @returns {Promise<string>} Transaction signature
   */
  transferLamports: ReturnType<typeof transferLamportsFactory>;

  /**
   * Creates a new SPL token with metadata and minting controls.
   * @param {Object} params - Token configuration
   * @param {KeyPairSigner} params.mintAuthority - Account that will have permission to mint tokens
   * @param {number} params.decimals - Number of decimal places (e.g. 9 decimals means 1 token = 1,000,000,000 base units)
   * @param {string} params.name - Display name of the token
   * @param {string} params.symbol - Short ticker symbol (e.g. "USDC")
   * @param {string} params.uri - URL to token metadata (image, description etc.)
   * @param {Record<string, string> | Map<string, string>} [params.additionalMetadata={}] - Extra metadata key-value pairs
   * @returns {Promise<Address>} Address of the new token mint
   */
  createTokenMint: (params: {
    mintAuthority: KeyPairSigner;
    decimals: number;
    name: string;
    symbol: string;
    uri: string;
    additionalMetadata?: Record<string, string> | Map<string, string>;
  }) => Promise<Address>;

  /**
   * Creates new tokens from a token mint.
   * @param {Address} mintAddress - The token mint to create tokens from
   * @param {KeyPairSigner} mintAuthority - Account authorized to mint new tokens (must sign)
   * @param {bigint} amount - Number of base units to mint (adjusted for decimals)
   * @param {Address} destination - Account to receive the new tokens
   * @returns {Promise<string>} Transaction signature
   */
  mintTokens: (
    mintAddress: Address,
    mintAuthority: KeyPairSigner,
    amount: bigint,
    destination: Address,
  ) => Promise<string>;

  /**
   * Transfers SPL tokens between accounts.
   * @param {Object} params - Transfer details
   * @param {KeyPairSigner} params.sender - Account sending the tokens (must sign)
   * @param {Address} params.destination - Account receiving the tokens
   * @param {Address} params.mintAddress - The type of token to transfer
   * @param {bigint} params.amount - Number of base units to transfer (adjusted for decimals)
   * @param {number} [params.maximumClientSideRetries=0] - Number of retry attempts if transfer fails
   * @param {AbortSignal | null} [params.abortSignal=null] - Signal to cancel the transfer
   * @returns {Promise<string>} Transaction signature
   */
  transferTokens: ReturnType<typeof transferTokensFactory>;

  /**
   * Retrieves information about a token mint including supply and decimals.
   * @param {Address} mintAddress - Address of the token mint to query
   * @param {Commitment} [commitment="confirmed"] - Confirmation level of data:
   *                                               'processed' = maybe outdated but fast,
   *                                               'confirmed' = confirmed by supermajority,
   *                                               'finalized' = definitely permanent but slower
   * @returns {Promise<Mint | null>} Token information if found, null if not
   */
  getMint: ReturnType<typeof getMintFactory>;

  /**
   * Gets the token balance for a specific account.
   * @param {Object} params - Parameters for getting token balance
   * @param {Address} [params.tokenAccount] - Direct token account address to check balance for
   * @param {Address} [params.wallet] - Wallet address (required if tokenAccount not provided)
   * @param {Address} [params.mint] - Token mint address (required if tokenAccount not provided)
   * @param {boolean} [params.useTokenExtensions=false] - Use Token-2022 program instead of Token program
   * @returns {Promise<TokenAmount>} Balance information including amount and decimals
   * @throws {Error} If neither tokenAccount nor both wallet and mint are provided
   */
  getTokenAccountBalance: (params: {
    tokenAccount?: Address;
    wallet?: Address;
    mint?: Address;
    useTokenExtensions?: boolean;
  }) => Promise<TokenAmount>;

  /**
   * Gets the address where a wallet's tokens are stored.
   * Each wallet has a unique storage address for each type of token.
   * @param {Address} wallet - The wallet that owns the tokens
   * @param {Address} mint - The type of token
   * @param {boolean} [useTokenExtensions=false] - Use Token-2022 program instead of Token program
   * @returns {Promise<Address>} The token account address
   */
  getTokenAccountAddress: typeof getTokenAccountAddress;

  /**
   * Loads a wallet from a file containing a keypair.
   * Compatible with keypair files generated by 'solana-keygen'.
   * @param {string} [filepath] - Location of the keypair file (defaults to ~/.config/solana/id.json)
   * @returns {Promise<KeyPairSigner>} The loaded wallet
   */
  loadWalletFromFile: typeof loadWalletFromFile;

  /**
   * Loads a wallet from an environment variable containing a keypair.
   * The keypair must be in the same format as 'solana-keygen' (array of numbers).
   * @param {string} variableName - Name of environment variable storing the keypair
   * @returns {KeyPairSigner} The loaded wallet
   */
  loadWalletFromEnvironment: typeof loadWalletFromEnvironment;

  /**
   * Derives a Program Derived Address (PDA) and its bump seed.
   * PDAs are deterministic addresses that programs can sign for.
   * @param {Address} programAddress - The program that will control this PDA
   * @param {Array<String | Address | BigInt>} seeds - Values used to derive the PDA
   * @returns {Promise<{pda: Address, bump: number}>} The derived address and bump seed
   */
  getPDAAndBump: typeof getPDAAndBump;
}