// TipsChain Gasless Transaction Provider
// Supports multichain gasless transactions via tipspay.org/wallet

import { getNetworkByChainId } from "../core/networks";

// API endpoint uses path-based routing (NOT gasless.tipspay.org)
const GASLESS_API_URL = "https://tipspay.org/api/gasless";

export interface GaslessTransaction {
  chainId: number;
  to: string;
  data: string;
  value: string;
  socialName?: string;
}

export interface GaslessResult {
  txHash: string;
  chainId: number;
  status: "pending" | "confirmed" | "failed";
}

/**
 * Send a gasless transaction on any supported EVM chain
 * Gasless relay endpoint: tipspay.org/api/gasless (NOT gasless.tipspay.org)
 */
export const sendGaslessTransaction = async (
  tx: GaslessTransaction,
  socialName: string
): Promise<GaslessResult | null> => {
  const network = getNetworkByChainId(tx.chainId);
  if (!network) {
    console.error(`Unsupported chain ID: ${tx.chainId}`);
    return null;
  }

  console.log(
    `Sending gasless tx for ${socialName} on ${network.chainName} via ${GASLESS_API_URL}`
  );

  try {
    const response = await fetch(GASLESS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...tx,
        socialName,
        relayerNetwork: network.chainName,
      }),
    });

    if (!response.ok) {
      throw new Error(`Gasless relay failed: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      txHash: result.txHash,
      chainId: tx.chainId,
      status: "pending",
    };
  } catch (error) {
    console.error("Gasless transaction failed:", error);
    return null;
  }
};

/**
 * Check if gasless transactions are supported on a chain
 */
export const isGaslessSupported = (chainId: number): boolean => {
  // TipsChain always supports gasless
  if (chainId === 19251925) return true;

  // Other chains may have limited gasless support
  const network = getNetworkByChainId(chainId);
  return network !== undefined;
};
