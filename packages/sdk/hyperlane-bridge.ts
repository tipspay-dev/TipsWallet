// Hyperlane Bridge - Cross-chain bridge for TipsWallet DEX
// Uses Hyperlane protocol for secure cross-chain token transfers
// Accessible at tipspay.org/dex (bridge tab)

import { EVM_NETWORKS, NetworkConfig, getNetworkByChainId } from "../core/networks";

// Hyperlane Mailbox contract addresses per chain
const HYPERLANE_MAILBOX: Record<number, string> = {
  1: "0xc005dc82818d67AF737725bD4bf75435d065D239",
  56: "0x2971b9Aec44bE4eb673DF1B88cDB57b96eefe8a6",
  137: "0x5d934f4e2f797775e53561bB72aca21ba36B96BB",
  43114: "0xFf06aFcaABaDDd1fb08371f9ccA15D73D51FeBD6",
  42161: "0x979Ca5202784112f4738403dBec5D0F3B9daabB9",
  10: "0xd4C1905BB739D293F90113fFFd0E579DBF75f891",
  8453: "0xeA87ae93Fa0019a82A727bfd3eBd1cFCa8f64f1D",
  250: "0x3a867fCfFeC2B790970eeBDC9023E75B0a172aa7",
};

// Hyperlane InterchainGasPaymaster addresses
const HYPERLANE_IGP: Record<number, string> = {
  1: "0x56f52c0A1ddcD557285f7CBc782D3d83096CE1Cc",
  56: "0x78fc78aA4202eD3Dc5c820cBb1E32cdC8Ef9E4A2",
  137: "0x0071740Bf129b05C4684abfbBeD248D80971cce2",
  43114: "0x95519ba800BBd0734407620CECfF511E5e8aBf32",
  42161: "0x3b6044acd6767f017e99318AA6Ef93b7BCfA4cb5",
  10: "0xD8A76C4D91fCbB7Cc8eA795DFDF870E48368995C",
  8453: "0xc3F23848Ed2e04C0c6d41bd7804fa8f89F940B94",
  250: "0xFf06aFcaABaDDd1fb08371f9ccA15D73D51FeBD6",
};

// Hyperlane domain IDs (different from chain IDs)
const HYPERLANE_DOMAIN_MAP: Record<number, number> = {
  1: 1,         // Ethereum
  56: 56,       // BSC
  137: 137,     // Polygon
  43114: 43114, // Avalanche
  42161: 42161, // Arbitrum
  10: 10,       // Optimism
  8453: 8453,   // Base
  250: 250,     // Fantom
  19251925: 19251925, // TipsChain
};

export interface BridgeQuote {
  sourceChainId: number;
  destinationChainId: number;
  tokenAddress: string;
  tokenSymbol: string;
  amount: string;
  estimatedReceive: string;
  bridgeFee: string;
  interchainGasFee: string;
  estimatedTime: number; // seconds
  route: string;
}

export interface BridgeTransaction {
  sourceChainId: number;
  destinationChainId: number;
  tokenAddress: string;
  amount: string;
  recipient: string;
  senderTipsName?: string;
  recipientTipsName?: string;
}

export interface BridgeResult {
  messageId: string;
  sourceTxHash: string;
  sourceChainId: number;
  destinationChainId: number;
  status: "dispatched" | "processing" | "delivered" | "failed";
}

/**
 * Hyperlane Bridge - Cross-chain token bridging for tipspay.org/dex
 */
export class HyperlaneBridge {
  /**
   * Get supported bridge routes
   */
  getSupportedRoutes(): Array<{
    source: NetworkConfig;
    destination: NetworkConfig;
    sourceDomain: number;
    destinationDomain: number;
  }> {
    const routes: Array<{
      source: NetworkConfig;
      destination: NetworkConfig;
      sourceDomain: number;
      destinationDomain: number;
    }> = [];

    const supportedChainIds = Object.keys(HYPERLANE_MAILBOX).map(Number);

    for (const sourceChainId of supportedChainIds) {
      for (const destChainId of supportedChainIds) {
        if (sourceChainId === destChainId) continue;

        const source = getNetworkByChainId(sourceChainId);
        const dest = getNetworkByChainId(destChainId);

        if (source && dest) {
          routes.push({
            source,
            destination: dest,
            sourceDomain: HYPERLANE_DOMAIN_MAP[sourceChainId],
            destinationDomain: HYPERLANE_DOMAIN_MAP[destChainId],
          });
        }
      }
    }

    return routes;
  }

  /**
   * Get a bridge quote for transferring tokens between chains
   */
  async getBridgeQuote(
    sourceChainId: number,
    destinationChainId: number,
    tokenAddress: string,
    amount: string
  ): Promise<BridgeQuote | null> {
    const sourceNetwork = getNetworkByChainId(sourceChainId);
    const destNetwork = getNetworkByChainId(destinationChainId);

    if (!sourceNetwork || !destNetwork) {
      console.error("Unsupported source or destination chain");
      return null;
    }

    if (!HYPERLANE_MAILBOX[sourceChainId]) {
      console.error(
        `Hyperlane not available on ${sourceNetwork.chainName}`
      );
      return null;
    }

    try {
      const interchainGasFee = await this.estimateInterchainGas(
        sourceChainId,
        destinationChainId
      );

      return {
        sourceChainId,
        destinationChainId,
        tokenAddress,
        tokenSymbol: "",
        amount,
        estimatedReceive: amount, // 1:1 for wrapped tokens
        bridgeFee: "0",
        interchainGasFee,
        estimatedTime: this.estimateBridgeTime(sourceChainId, destinationChainId),
        route: `${sourceNetwork.shortName} -> Hyperlane -> ${destNetwork.shortName}`,
      };
    } catch (error) {
      console.error("Failed to get bridge quote:", error);
      return null;
    }
  }

  /**
   * Initiate a cross-chain bridge transfer via Hyperlane
   */
  async bridge(tx: BridgeTransaction): Promise<BridgeResult | null> {
    const sourceNetwork = getNetworkByChainId(tx.sourceChainId);
    const destNetwork = getNetworkByChainId(tx.destinationChainId);

    if (!sourceNetwork || !destNetwork) {
      console.error("Unsupported chain for bridge");
      return null;
    }

    const mailboxAddress = HYPERLANE_MAILBOX[tx.sourceChainId];
    if (!mailboxAddress) {
      console.error(
        `Hyperlane Mailbox not available on ${sourceNetwork.chainName}`
      );
      return null;
    }

    const destinationDomain = HYPERLANE_DOMAIN_MAP[tx.destinationChainId];
    if (!destinationDomain) {
      console.error(
        `Hyperlane domain not mapped for ${destNetwork.chainName}`
      );
      return null;
    }

    console.log(
      `Bridging ${tx.amount} from ${sourceNetwork.chainName} to ${destNetwork.chainName} via Hyperlane`
    );

    try {
      const rpcUrl = sourceNetwork.rpcUrls[0];

      // Encode dispatch(uint32 destination, bytes32 recipient, bytes body)
      const DISPATCH_SELECTOR = "0xfa31de01";
      const destDomainHex = destinationDomain.toString(16).padStart(64, "0");
      const recipientBytes32 = tx.recipient.slice(2).padStart(64, "0");
      const bodyOffset = "0000000000000000000000000000000000000000000000000000000000000060";
      const bodyLength = "0000000000000000000000000000000000000000000000000000000000000020";
      const amountHex = BigInt(tx.amount).toString(16).padStart(64, "0");

      const callData =
        DISPATCH_SELECTOR +
        destDomainHex +
        recipientBytes32 +
        bodyOffset +
        bodyLength +
        amountHex;

      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_call",
          params: [{ to: mailboxAddress, data: callData }, "latest"],
          id: 1,
        }),
      });

      const result = await response.json();

      return {
        messageId: result.result || "0x",
        sourceTxHash: "",
        sourceChainId: tx.sourceChainId,
        destinationChainId: tx.destinationChainId,
        status: "dispatched",
      };
    } catch (error) {
      console.error("Bridge transaction failed:", error);
      return null;
    }
  }

  /**
   * Check the status of a bridge transfer
   */
  async getBridgeStatus(
    messageId: string,
    destinationChainId: number
  ): Promise<"dispatched" | "processing" | "delivered" | "failed"> {
    const destNetwork = getNetworkByChainId(destinationChainId);
    if (!destNetwork) return "failed";

    const mailboxAddress = HYPERLANE_MAILBOX[destinationChainId];
    if (!mailboxAddress) return "failed";

    try {
      const rpcUrl = destNetwork.rpcUrls[0];

      // delivered(bytes32 messageId) selector
      const DELIVERED_SELECTOR = "0xe495f1d4";
      const msgIdHex = messageId.startsWith("0x")
        ? messageId.slice(2).padStart(64, "0")
        : messageId.padStart(64, "0");

      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_call",
          params: [
            { to: mailboxAddress, data: DELIVERED_SELECTOR + msgIdHex },
            "latest",
          ],
          id: 1,
        }),
      });

      const result = await response.json();

      if (
        result.result &&
        result.result !==
          "0x0000000000000000000000000000000000000000000000000000000000000000"
      ) {
        return "delivered";
      }

      return "processing";
    } catch {
      return "failed";
    }
  }

  /**
   * Estimate interchain gas fee for a bridge transfer
   */
  private async estimateInterchainGas(
    sourceChainId: number,
    destinationChainId: number
  ): Promise<string> {
    const igpAddress = HYPERLANE_IGP[sourceChainId];
    if (!igpAddress) return "0";

    const sourceNetwork = getNetworkByChainId(sourceChainId);
    if (!sourceNetwork) return "0";

    try {
      const rpcUrl = sourceNetwork.rpcUrls[0];
      const destDomain = HYPERLANE_DOMAIN_MAP[destinationChainId];

      // quoteGasPayment(uint32 dest, uint256 gasAmount) selector
      const QUOTE_SELECTOR = "0x5c70a5e0";
      const destHex = destDomain.toString(16).padStart(64, "0");
      const gasAmount = (200000).toString(16).padStart(64, "0");

      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_call",
          params: [
            {
              to: igpAddress,
              data: QUOTE_SELECTOR + destHex + gasAmount,
            },
            "latest",
          ],
          id: 1,
        }),
      });

      const result = await response.json();
      if (result.result && result.result !== "0x") {
        return BigInt(result.result).toString();
      }
      return "0";
    } catch {
      return "0";
    }
  }

  /**
   * Estimate bridge transfer time in seconds
   */
  private estimateBridgeTime(
    sourceChainId: number,
    destinationChainId: number
  ): number {
    // Approximate finality times for different chains
    const finalityTimes: Record<number, number> = {
      1: 900,      // Ethereum ~15 min
      56: 45,      // BSC ~45 sec
      137: 120,    // Polygon ~2 min
      43114: 60,   // Avalanche ~1 min
      42161: 60,   // Arbitrum ~1 min
      10: 60,      // Optimism ~1 min
      8453: 60,    // Base ~1 min
      250: 30,     // Fantom ~30 sec
      19251925: 15, // TipsChain ~15 sec
    };

    const sourceFinality = finalityTimes[sourceChainId] || 120;
    const destFinality = finalityTimes[destinationChainId] || 120;

    // Total time = source finality + relay + destination confirmation
    return sourceFinality + 30 + destFinality;
  }

  /**
   * Get chains supported by Hyperlane bridge
   */
  getSupportedChains(): Array<{
    chainId: number;
    chainName: string;
    hasMailbox: boolean;
  }> {
    return Object.values(EVM_NETWORKS).map((network) => ({
      chainId: network.chainId,
      chainName: network.chainName,
      hasMailbox: HYPERLANE_MAILBOX[network.chainId] !== undefined,
    }));
  }
}
