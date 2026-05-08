// Token Registry Hook - Manages token icons and metadata in the wallet UI
// Fetches token info from RPC and on-chain token registries

import {
  TokenInfo,
  fetchTokenList,
  resolveTokenIcon,
  fetchTokenMetadataFromRPC,
  searchTokens,
  getNativeTokenIcon,
  clearTokenCache,
} from "../../../packages/core/token-registry";

export interface TokenRegistryHookState {
  tokens: TokenInfo[];
  isLoading: boolean;
  error: string | null;
}

/**
 * useTokenRegistry - Hook for fetching and managing token data with icons
 * Resolves token icons from multiple sources:
 * 1. On-chain token list registries
 * 2. TrustWallet assets repository
 * 3. CoinGecko token lists
 * 4. Fallback generic icon
 */
export const useTokenRegistry = () => {
  let cachedTokens: Map<string, TokenInfo[]> = new Map();

  /**
   * Load tokens for a specific chain
   */
  const loadTokensForChain = async (chainId: number): Promise<TokenInfo[]> => {
    const cacheKey = `chain_${chainId}`;
    if (cachedTokens.has(cacheKey)) {
      return cachedTokens.get(cacheKey)!;
    }

    try {
      const tokens = await fetchTokenList(chainId);
      cachedTokens.set(cacheKey, tokens);
      return tokens;
    } catch (error) {
      console.error(`Failed to load tokens for chain ${chainId}:`, error);
      return [];
    }
  };

  /**
   * Get token icon URL with fallback chain
   */
  const getTokenIcon = async (
    chainId: number,
    tokenAddress?: string
  ): Promise<string> => {
    return resolveTokenIcon(chainId, tokenAddress);
  };

  /**
   * Get native token icon for a chain
   */
  const getChainNativeIcon = (chainId: number): string => {
    return getNativeTokenIcon(chainId);
  };

  /**
   * Fetch complete token metadata from RPC
   */
  const getTokenMetadata = async (
    chainId: number,
    tokenAddress: string
  ): Promise<Partial<TokenInfo> | null> => {
    return fetchTokenMetadataFromRPC(chainId, tokenAddress);
  };

  /**
   * Search tokens across chains
   */
  const search = async (
    query: string,
    chainIds?: number[]
  ): Promise<TokenInfo[]> => {
    return searchTokens(query, chainIds);
  };

  /**
   * Refresh token cache
   */
  const refreshCache = (): void => {
    cachedTokens.clear();
    clearTokenCache();
  };

  return {
    loadTokensForChain,
    getTokenIcon,
    getChainNativeIcon,
    getTokenMetadata,
    search,
    refreshCache,
  };
};
