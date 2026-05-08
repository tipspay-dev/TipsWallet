// Token Registry - Fetches token metadata and icons from blockchain RPC and token lists
// Supports multichain EVM token discovery

import { EVM_NETWORKS, NetworkConfig, getNetworkByChainId } from "./networks";

export interface TokenInfo {
  address: string;
  chainId: number;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  tags?: string[];
}

export interface TokenList {
  name: string;
  timestamp: string;
  tokens: TokenInfo[];
}

// Well-known token icon sources
const TOKEN_ICON_SOURCES = {
  trustwallet:
    "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/{chain}/assets/{address}/logo.png",
  coingecko: "https://tokens.coingecko.com/{platform}/all.json",
};

// Chain name mapping for TrustWallet Assets repo
const TRUSTWALLET_CHAIN_MAP: Record<number, string> = {
  1: "ethereum",
  56: "smartchain",
  137: "polygon",
  43114: "avalanchec",
  42161: "arbitrum",
  10: "optimism",
  8453: "base",
  250: "fantom",
  25: "cronos",
};

// Native token icons (for tokens that don't have contract addresses)
const NATIVE_TOKEN_ICONS: Record<number, string> = {
  19251925: "https://tipspay.org/assets/icons/tips-token.png",
  1: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  56: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
  137: "https://assets.coingecko.com/coins/images/4713/small/polygon.png",
  43114:
    "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png",
  42161:
    "https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg",
  10: "https://assets.coingecko.com/coins/images/25244/small/Optimism.png",
  8453: "https://assets.coingecko.com/coins/images/31164/small/base.png",
  250: "https://assets.coingecko.com/coins/images/4001/small/Fantom_round.png",
  25: "https://assets.coingecko.com/coins/images/7310/small/cro_token_logo.png",
};

// In-memory cache for token lists
const tokenListCache: Map<number, TokenInfo[]> = new Map();

/**
 * Fetch token list from network's token list URL
 */
export async function fetchTokenList(chainId: number): Promise<TokenInfo[]> {
  if (tokenListCache.has(chainId)) {
    return tokenListCache.get(chainId)!;
  }

  const network = getNetworkByChainId(chainId);
  if (!network || !network.tokenListUrl) {
    return [];
  }

  try {
    const response = await fetch(network.tokenListUrl);
    if (!response.ok) {
      console.warn(
        `Failed to fetch token list for chain ${chainId}: ${response.statusText}`
      );
      return [];
    }
    const data: TokenList = await response.json();
    const tokens = data.tokens.filter((t) => t.chainId === chainId);
    tokenListCache.set(chainId, tokens);
    return tokens;
  } catch (error) {
    console.warn(`Error fetching token list for chain ${chainId}:`, error);
    return [];
  }
}

/**
 * Get token icon URL from TrustWallet Assets repository
 */
export function getTrustWalletIconUrl(
  chainId: number,
  tokenAddress: string
): string | null {
  const chain = TRUSTWALLET_CHAIN_MAP[chainId];
  if (!chain) return null;

  const checksumAddress = tokenAddress; // Should be checksummed
  return TOKEN_ICON_SOURCES.trustwallet
    .replace("{chain}", chain)
    .replace("{address}", checksumAddress);
}

/**
 * Get native token icon for a given chain
 */
export function getNativeTokenIcon(chainId: number): string {
  return (
    NATIVE_TOKEN_ICONS[chainId] ||
    "https://tipspay.org/assets/icons/generic-token.png"
  );
}

/**
 * Resolve token icon from multiple sources with fallback
 * Priority: 1) Token list registry 2) TrustWallet assets 3) Native icon 4) Generic fallback
 */
export async function resolveTokenIcon(
  chainId: number,
  tokenAddress?: string
): Promise<string> {
  // Native token (no contract address)
  if (!tokenAddress || tokenAddress === "0x0000000000000000000000000000000000000000") {
    return getNativeTokenIcon(chainId);
  }

  // Try token list registry first
  const tokens = await fetchTokenList(chainId);
  const tokenFromList = tokens.find(
    (t) => t.address.toLowerCase() === tokenAddress.toLowerCase()
  );
  if (tokenFromList?.logoURI) {
    return tokenFromList.logoURI;
  }

  // Fallback to TrustWallet assets
  const trustWalletUrl = getTrustWalletIconUrl(chainId, tokenAddress);
  if (trustWalletUrl) {
    return trustWalletUrl;
  }

  // Generic fallback
  return "https://tipspay.org/assets/icons/generic-token.png";
}

/**
 * Fetch token metadata from RPC using ERC-20 standard calls
 */
export async function fetchTokenMetadataFromRPC(
  chainId: number,
  tokenAddress: string
): Promise<Partial<TokenInfo> | null> {
  const network = getNetworkByChainId(chainId);
  if (!network) return null;

  const rpcUrl = network.rpcUrls[0];

  try {
    // ERC-20 function selectors
    const NAME_SELECTOR = "0x06fdde03";
    const SYMBOL_SELECTOR = "0x95d89b41";
    const DECIMALS_SELECTOR = "0x313ce567";

    const [nameResult, symbolResult, decimalsResult] = await Promise.all([
      callRPC(rpcUrl, tokenAddress, NAME_SELECTOR),
      callRPC(rpcUrl, tokenAddress, SYMBOL_SELECTOR),
      callRPC(rpcUrl, tokenAddress, DECIMALS_SELECTOR),
    ]);

    const name = decodeString(nameResult);
    const symbol = decodeString(symbolResult);
    const decimals = decodeUint(decimalsResult);

    const logoURI = await resolveTokenIcon(chainId, tokenAddress);

    return {
      address: tokenAddress,
      chainId,
      name: name || "Unknown Token",
      symbol: symbol || "???",
      decimals: decimals ?? 18,
      logoURI,
    };
  } catch (error) {
    console.warn(
      `Error fetching token metadata for ${tokenAddress} on chain ${chainId}:`,
      error
    );
    return null;
  }
}

/**
 * Make an eth_call to an RPC endpoint
 */
async function callRPC(
  rpcUrl: string,
  to: string,
  data: string
): Promise<string> {
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_call",
      params: [{ to, data }, "latest"],
      id: 1,
    }),
  });

  const result = await response.json();
  return result.result || "0x";
}

/**
 * Decode an ABI-encoded string from an RPC response
 */
function decodeString(hex: string): string {
  if (!hex || hex === "0x" || hex.length < 130) return "";
  try {
    const offset = parseInt(hex.slice(2, 66), 16) * 2;
    const length = parseInt(hex.slice(2 + offset, 2 + offset + 64), 16);
    const strHex = hex.slice(2 + offset + 64, 2 + offset + 64 + length * 2);
    return Buffer.from(strHex, "hex").toString("utf8");
  } catch {
    return "";
  }
}

/**
 * Decode an ABI-encoded uint256 from an RPC response
 */
function decodeUint(hex: string): number | null {
  if (!hex || hex === "0x") return null;
  try {
    return parseInt(hex, 16);
  } catch {
    return null;
  }
}

/**
 * Search tokens across all supported chains
 */
export async function searchTokens(
  query: string,
  chainIds?: number[]
): Promise<TokenInfo[]> {
  const chains = chainIds || Object.values(EVM_NETWORKS).map((n) => n.chainId);
  const results: TokenInfo[] = [];

  const searchPromises = chains.map(async (chainId) => {
    const tokens = await fetchTokenList(chainId);
    return tokens.filter(
      (t) =>
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.symbol.toLowerCase().includes(query.toLowerCase())
    );
  });

  const chainResults = await Promise.all(searchPromises);
  for (const tokens of chainResults) {
    results.push(...tokens);
  }

  return results;
}

/**
 * Clear the token list cache (useful for refreshing data)
 */
export function clearTokenCache(): void {
  tokenListCache.clear();
}
