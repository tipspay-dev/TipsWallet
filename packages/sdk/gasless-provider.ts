// TipsWallet Gasless Transaction Provider
// Gasless transfers are ONLY available for TipsWallet users
// Users must have a registered user.tips name for gasless transfers

import { getNetworkByChainId } from "../core/networks";

// API endpoint uses path-based routing (NOT gasless.tipspay.org)
const GASLESS_API_URL = "https://tipspay.org/api/gasless";

// TipsChain SocialNameServer contract address
const SOCIAL_NAME_SERVER_ADDRESS = "0x0000000000000000000000000000000000001925";

export interface GaslessTransaction {
  chainId: number;
  to: string;
  data: string;
  value: string;
}

export interface GaslessResult {
  txHash: string;
  chainId: number;
  status: "pending" | "confirmed" | "failed";
}

export interface TipsNameInfo {
  name: string; // e.g. "alice.tips"
  address: string;
  isRegistered: boolean;
}

/**
 * Resolve a user.tips name to an address via the SocialNameServer contract
 * e.g. "alice.tips" -> "0x1234..."
 */
export const resolveTipsName = async (
  tipsName: string
): Promise<string | null> => {
  if (!tipsName.endsWith(".tips")) {
    console.error("Invalid .tips name format. Must end with .tips");
    return null;
  }

  const rpcUrl = "https://rpc.tipschain.org";
  // registry(string) function selector
  const REGISTRY_SELECTOR = "0x5c383fae";

  try {
    const nameWithoutSuffix = tipsName.slice(0, -5);
    const encodedName = encodeStringParam(nameWithoutSuffix);

    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_call",
        params: [
          {
            to: SOCIAL_NAME_SERVER_ADDRESS,
            data: REGISTRY_SELECTOR + encodedName,
          },
          "latest",
        ],
        id: 1,
      }),
    });

    const result = await response.json();
    if (
      !result.result ||
      result.result === "0x" ||
      result.result === "0x0000000000000000000000000000000000000000000000000000000000000000"
    ) {
      return null;
    }

    // Decode address from result (last 20 bytes)
    const address = "0x" + result.result.slice(-40);
    return address;
  } catch (error) {
    console.error(`Failed to resolve .tips name ${tipsName}:`, error);
    return null;
  }
};

/**
 * Check if a user.tips name is registered
 */
export const isTipsNameRegistered = async (
  tipsName: string
): Promise<boolean> => {
  const address = await resolveTipsName(tipsName);
  return address !== null;
};

/**
 * Send a gasless transaction - ONLY for TipsWallet users with a .tips name
 * Gasless transfers require:
 * 1. User must be using TipsWallet (tipspay.org/wallet)
 * 2. User must have a registered user.tips name (e.g. alice.tips)
 * 3. Transaction is relayed through TipsWallet's gasless relay
 *
 * Gasless relay endpoint: tipspay.org/api/gasless (NOT gasless.tipspay.org)
 */
export const sendGaslessTransaction = async (
  tx: GaslessTransaction,
  senderTipsName: string,
  recipientTipsName?: string
): Promise<GaslessResult | null> => {
  // Validate sender has a .tips name
  if (!senderTipsName.endsWith(".tips")) {
    console.error("Gasless transfers require a registered .tips name");
    return null;
  }

  // Verify the sender's .tips name is registered
  const senderAddress = await resolveTipsName(senderTipsName);
  if (!senderAddress) {
    console.error(
      `Sender .tips name "${senderTipsName}" is not registered. Register at tipspay.org/wallet`
    );
    return null;
  }

  // If recipient is a .tips name, resolve it
  let resolvedTo = tx.to;
  if (recipientTipsName && recipientTipsName.endsWith(".tips")) {
    const recipientAddress = await resolveTipsName(recipientTipsName);
    if (!recipientAddress) {
      console.error(
        `Recipient .tips name "${recipientTipsName}" is not registered`
      );
      return null;
    }
    resolvedTo = recipientAddress;
  }

  const network = getNetworkByChainId(tx.chainId);
  if (!network) {
    console.error(`Unsupported chain ID: ${tx.chainId}`);
    return null;
  }

  console.log(
    `Sending gasless tx from ${senderTipsName} on ${network.chainName} via ${GASLESS_API_URL}`
  );

  try {
    const response = await fetch(GASLESS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...tx,
        to: resolvedTo,
        senderTipsName,
        recipientTipsName,
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
 * Check if gasless transactions are available
 * Gasless is ONLY for TipsWallet users with registered .tips names
 */
export const isGaslessSupported = (chainId: number): boolean => {
  // Gasless is only available on TipsChain for TipsWallet users
  return chainId === 19251925;
};

/**
 * Encode a string parameter for ABI call
 */
function encodeStringParam(str: string): string {
  const offset = "0000000000000000000000000000000000000000000000000000000000000020";
  const length = str.length.toString(16).padStart(64, "0");
  const hexStr = Buffer.from(str, "utf8").toString("hex").padEnd(64, "0");
  return offset + length + hexStr;
}
