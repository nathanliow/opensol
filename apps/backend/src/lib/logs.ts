import { createSolanaRpcFromTransport } from "@solana/kit";

export const getLogsFactory = (rpc: ReturnType<typeof createSolanaRpcFromTransport>) => {
  /**
   * Retrieves logs for a transaction.
   * @param {string} signature - Transaction signature to get logs for
   * @returns {Promise<readonly Array<string>>} Array of log messages from the transaction
   */
  const getLogs = async (signature: string): Promise<readonly Array<string>[]> => {
    const transaction = await rpc
      .getTransaction(signature, {
        commitment: "confirmed",
      })
      .send();

    if (!transaction?.meta) {
      throw new Error(`Transaction not found: ${signature}`);
    }

    return transaction.meta.logMessages ?? [];
  };
  return getLogs;
};