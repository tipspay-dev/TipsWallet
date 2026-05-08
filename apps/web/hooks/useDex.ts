// DEX Hook - Manages DEX trading state for tipspay.org/dex
// Provides swap quotes, cross-chain routing, and liquidity info

import { DexAggregator, SwapQuote } from "../../../packages/sdk/dex-aggregator";
import { getNetworkByChainId, EVM_NETWORKS } from "../../../packages/core/networks";
import { resolveTokenIcon } from "../../../packages/core/token-registry";
import { APP_CONFIG } from "../config";

export interface DexHookState {
  selectedChainId: number;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  quote: SwapQuote | null;
  isLoading: boolean;
}

/**
 * useDex - Hook for DEX trading functionality at tipspay.org/dex
 * Supports multichain swaps across all EVM-compatible networks
 */
export const useDex = () => {
  const aggregator = new DexAggregator();

  /**
   * Get swap quote on a specific chain
   */
  const getQuote = async (
    chainId: number,
    tokenIn: string,
    tokenOut: string,
    amountIn: string
  ): Promise<SwapQuote | null> => {
    return aggregator.getSwapQuote(chainId, tokenIn, tokenOut, amountIn);
  };

  /**
   * Get best quotes across all chains
   */
  const getCrosschainQuotes = async (
    tokenIn: string,
    tokenOut: string,
    amountIn: string
  ): Promise<SwapQuote[]> => {
    return aggregator.getCrosschainQuotes(tokenIn, tokenOut, amountIn);
  };

  /**
   * Get available DEXes for a chain
   */
  const getAvailableDexes = (chainId: number) => {
    return aggregator.getDexRouters(chainId);
  };

  /**
   * Get all chains with DEX support
   */
  const getSupportedDexChains = () => {
    return aggregator.getSupportedDexChains();
  };

  /**
   * Get token icon for DEX UI
   */
  const getTokenIconForDex = async (
    chainId: number,
    tokenAddress?: string
  ): Promise<string> => {
    return resolveTokenIcon(chainId, tokenAddress);
  };

  /**
   * Get DEX page URL (path-based routing)
   */
  const getDexPageUrl = (): string => {
    return APP_CONFIG.urls.dex; // https://tipspay.org/dex
  };

  return {
    aggregator,
    getQuote,
    getCrosschainQuotes,
    getAvailableDexes,
    getSupportedDexChains,
    getTokenIconForDex,
    getDexPageUrl,
  };
};
