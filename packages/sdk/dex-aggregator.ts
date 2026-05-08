// DEX Aggregator - Multichain DEX support for tipspay.org/dex
// Aggregates liquidity across supported EVM chains

import { EVM_NETWORKS, NetworkConfig, getNetworkByChainId } from "../core/networks";

export interface DexPool {
  chainId: number;
  pairAddress: string;
  token0: {
    address: string;
    symbol: string;
    decimals: number;
    logoURI: string;
  };
  token1: {
    address: string;
    symbol: string;
    decimals: number;
    logoURI: string;
  };
  reserve0: string;
  reserve1: string;
  fee: number;
}

export interface SwapQuote {
  chainId: number;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  priceImpact: number;
  route: string[];
  estimatedGas: string;
}

export interface DexConfig {
  name: string;
  routerAddress: string;
  factoryAddress: string;
  chainId: number;
  fee: number;
}

// Known DEX routers per chain
const DEX_ROUTERS: Record<number, DexConfig[]> = {
  19251925: [
    {
      name: "TipsSwap",
      routerAddress: "0x0000000000000000000000000000000000000000",
      factoryAddress: "0x0000000000000000000000000000000000000000",
      chainId: 19251925,
      fee: 30, // 0.3%
    },
  ],
  1: [
    {
      name: "Uniswap V2",
      routerAddress: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
      factoryAddress: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
      chainId: 1,
      fee: 30,
    },
  ],
  56: [
    {
      name: "PancakeSwap",
      routerAddress: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
      factoryAddress: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73",
      chainId: 56,
      fee: 25,
    },
  ],
  137: [
    {
      name: "QuickSwap",
      routerAddress: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
      factoryAddress: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32",
      chainId: 137,
      fee: 30,
    },
  ],
  43114: [
    {
      name: "Trader Joe",
      routerAddress: "0x60aE616a2155Ee3d9A68541Ba4544862310933d4",
      factoryAddress: "0x9Ad6C38BE94206cA50bb0d90783181834C914dB",
      chainId: 43114,
      fee: 30,
    },
  ],
  42161: [
    {
      name: "SushiSwap",
      routerAddress: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
      factoryAddress: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
      chainId: 42161,
      fee: 30,
    },
  ],
  10: [
    {
      name: "Velodrome",
      routerAddress: "0xa062aE8A9c5e11aaA026fc2670B0D65cCc8B2858",
      factoryAddress: "0x25CbdDb98b35ab1FF77cfWc1c33A0b35b5e19E3E",
      chainId: 10,
      fee: 30,
    },
  ],
  8453: [
    {
      name: "Aerodrome",
      routerAddress: "0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43",
      factoryAddress: "0x420DD381b31aEf6683db6B902084cB0FFECe40Da",
      chainId: 8453,
      fee: 30,
    },
  ],
  250: [
    {
      name: "SpookySwap",
      routerAddress: "0xF491e7B69E4244ad4002BC14e878a34207E38c29",
      factoryAddress: "0x152eE697f2E276fA89E96742e9bB9aB1F2E61bE3",
      chainId: 250,
      fee: 30,
    },
  ],
  25: [
    {
      name: "VVS Finance",
      routerAddress: "0x145863Eb42Cf62847A6Ca784e6416C1682b1b2Ae",
      factoryAddress: "0x3B44B2a187a7b3824131F8db5a74194D0a42Fc15",
      chainId: 25,
      fee: 30,
    },
  ],
};

/**
 * DEX Aggregator - routes swaps across multiple chains and DEX protocols
 * Accessible at tipspay.org/dex
 */
export class DexAggregator {
  private supportedChains: number[];

  constructor(chainIds?: number[]) {
    this.supportedChains =
      chainIds || Object.values(EVM_NETWORKS).map((n) => n.chainId);
  }

  /**
   * Get available DEX routers for a chain
   */
  getDexRouters(chainId: number): DexConfig[] {
    return DEX_ROUTERS[chainId] || [];
  }

  /**
   * Get a swap quote for a token pair on a specific chain
   */
  async getSwapQuote(
    chainId: number,
    tokenIn: string,
    tokenOut: string,
    amountIn: string
  ): Promise<SwapQuote | null> {
    const routers = this.getDexRouters(chainId);
    if (routers.length === 0) {
      console.warn(`No DEX routers available for chain ${chainId}`);
      return null;
    }

    const network = getNetworkByChainId(chainId);
    if (!network) return null;

    // Get best quote across all available routers on this chain
    let bestQuote: SwapQuote | null = null;

    for (const router of routers) {
      try {
        const quote = await this.queryRouter(
          network,
          router,
          tokenIn,
          tokenOut,
          amountIn
        );
        if (
          quote &&
          (!bestQuote ||
            BigInt(quote.amountOut) > BigInt(bestQuote.amountOut))
        ) {
          bestQuote = quote;
        }
      } catch (error) {
        console.warn(
          `Failed to get quote from ${router.name} on chain ${chainId}:`,
          error
        );
      }
    }

    return bestQuote;
  }

  /**
   * Get quotes across all supported chains (cross-chain quote comparison)
   */
  async getCrosschainQuotes(
    tokenSymbol: string,
    tokenOutSymbol: string,
    amountIn: string
  ): Promise<SwapQuote[]> {
    const quotes: SwapQuote[] = [];

    const quotePromises = this.supportedChains.map(async (chainId) => {
      try {
        const quote = await this.getSwapQuote(
          chainId,
          tokenSymbol,
          tokenOutSymbol,
          amountIn
        );
        if (quote) quotes.push(quote);
      } catch {
        // Skip chains that fail
      }
    });

    await Promise.all(quotePromises);
    return quotes.sort(
      (a, b) => Number(BigInt(b.amountOut) - BigInt(a.amountOut))
    );
  }

  /**
   * Query a specific DEX router for a swap quote
   */
  private async queryRouter(
    network: NetworkConfig,
    router: DexConfig,
    tokenIn: string,
    tokenOut: string,
    amountIn: string
  ): Promise<SwapQuote | null> {
    const rpcUrl = network.rpcUrls[0];

    // getAmountsOut function selector: 0xd06ca61f
    const AMOUNTS_OUT_SELECTOR = "0xd06ca61f";

    try {
      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_call",
          params: [
            {
              to: router.routerAddress,
              data: encodeGetAmountsOut(amountIn, [tokenIn, tokenOut]),
            },
            "latest",
          ],
          id: 1,
        }),
      });

      const result = await response.json();
      if (result.error || !result.result || result.result === "0x") {
        return null;
      }

      const amountOut = decodeAmountsOut(result.result);

      return {
        chainId: network.chainId,
        tokenIn,
        tokenOut,
        amountIn,
        amountOut,
        priceImpact: 0,
        route: [tokenIn, tokenOut],
        estimatedGas: "200000",
      };
    } catch {
      return null;
    }
  }

  /**
   * Get all supported chains with DEX availability
   */
  getSupportedDexChains(): Array<{
    chainId: number;
    chainName: string;
    dexCount: number;
    dexNames: string[];
  }> {
    return this.supportedChains
      .filter((chainId) => DEX_ROUTERS[chainId]?.length > 0)
      .map((chainId) => {
        const network = getNetworkByChainId(chainId)!;
        const routers = DEX_ROUTERS[chainId];
        return {
          chainId,
          chainName: network.chainName,
          dexCount: routers.length,
          dexNames: routers.map((r) => r.name),
        };
      });
  }
}

/**
 * Encode getAmountsOut call data
 */
function encodeGetAmountsOut(amountIn: string, path: string[]): string {
  const selector = "0xd06ca61f";
  const amount = BigInt(amountIn).toString(16).padStart(64, "0");
  const offset = "0000000000000000000000000000000000000000000000000000000000000040";
  const pathLength = path.length.toString(16).padStart(64, "0");
  const pathEncoded = path
    .map((addr) => addr.slice(2).padStart(64, "0"))
    .join("");

  return selector + amount + offset + pathLength + pathEncoded;
}

/**
 * Decode getAmountsOut response
 */
function decodeAmountsOut(hex: string): string {
  if (!hex || hex === "0x") return "0";
  try {
    // The last 32 bytes contain the output amount
    const lastWord = hex.slice(-64);
    return BigInt("0x" + lastWord).toString();
  } catch {
    return "0";
  }
}
