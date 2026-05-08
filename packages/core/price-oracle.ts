// Price Oracle - Fetches token prices from blockchain oracles
// TPC/WTPC price from on-chain oracle, stablecoins pegged 1:1 to USD
// USDT = USCT = USDC = 1 USD (USDT is original Tether, pegged exactly to US Dollar)

import { getNetworkByChainId } from "./networks";

// TipsChain Oracle contract address for TPC/WTPC pricing
const TIPSCHAIN_PRICE_ORACLE_ADDRESS = "0x0000000000000000000000000000000000001926";

// TipsChain RPC
const TIPSCHAIN_RPC = "https://rpc.tipschain.org";

export interface TokenPrice {
  symbol: string;
  priceUSD: number;
  source: "oracle" | "pegged" | "dex" | "external";
  lastUpdated: number;
  chainId: number;
}

export interface OracleConfig {
  oracleAddress: string;
  rpcUrl: string;
  chainId: number;
}

// Stablecoin definitions - all pegged exactly 1:1 to USD
// USDT is original Tether USD, pegged to US Dollar: 1 USDT = 1 USD EXACT
const STABLECOIN_PEGS: Record<string, number> = {
  USDT: 1.0, // Original Tether USD - pegged 1:1 to US Dollar
  USCT: 1.0, // TipsChain USD Coin - pegged 1:1 to USD (same as USDT)
  USDC: 1.0, // USD Coin - pegged 1:1 to USD (same as USDT)
};

// In-memory price cache
const priceCache: Map<string, TokenPrice> = new Map();
const CACHE_TTL_MS = 30_000; // 30 seconds

/**
 * Get TPC/WTPC price from the on-chain oracle on TipsChain
 */
export async function getTpcPriceFromOracle(): Promise<number> {
  try {
    // getLatestPrice() function selector
    const GET_PRICE_SELECTOR = "0x8e15f473";

    const response = await fetch(TIPSCHAIN_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_call",
        params: [
          {
            to: TIPSCHAIN_PRICE_ORACLE_ADDRESS,
            data: GET_PRICE_SELECTOR,
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
      console.warn("Oracle returned empty price for TPC");
      return 0;
    }

    // Price is returned as uint256 with 8 decimals (like Chainlink)
    const rawPrice = BigInt(result.result);
    const price = Number(rawPrice) / 1e8;
    return price;
  } catch (error) {
    console.error("Failed to fetch TPC price from oracle:", error);
    return 0;
  }
}

/**
 * Get WTPC price - same as TPC since WTPC is wrapped TPC
 */
export async function getWtpcPrice(): Promise<number> {
  return getTpcPriceFromOracle();
}

/**
 * Get price for any TipsChain token
 * Stablecoins (USDT, USCT, USDC) are always pegged 1:1 to USD
 * TPC and WTPC prices come from the on-chain oracle
 */
export async function getTokenPrice(
  symbol: string,
  chainId: number = 19251925
): Promise<TokenPrice> {
  const cacheKey = `${symbol}_${chainId}`;
  const cached = priceCache.get(cacheKey);
  if (cached && Date.now() - cached.lastUpdated < CACHE_TTL_MS) {
    return cached;
  }

  let price: TokenPrice;
  const upperSymbol = symbol.toUpperCase();

  // Stablecoins - always exactly 1 USD
  if (upperSymbol in STABLECOIN_PEGS) {
    price = {
      symbol: upperSymbol,
      priceUSD: STABLECOIN_PEGS[upperSymbol],
      source: "pegged",
      lastUpdated: Date.now(),
      chainId,
    };
  }
  // TPC native token - price from oracle
  else if (upperSymbol === "TPC" || upperSymbol === "TIPS") {
    const oraclePrice = await getTpcPriceFromOracle();
    price = {
      symbol: upperSymbol,
      priceUSD: oraclePrice,
      source: "oracle",
      lastUpdated: Date.now(),
      chainId,
    };
  }
  // WTPC wrapped token - same price as TPC
  else if (upperSymbol === "WTPC") {
    const oraclePrice = await getWtpcPrice();
    price = {
      symbol: upperSymbol,
      priceUSD: oraclePrice,
      source: "oracle",
      lastUpdated: Date.now(),
      chainId,
    };
  }
  // Other tokens - try external price feeds
  else {
    const externalPrice = await fetchExternalPrice(symbol, chainId);
    price = {
      symbol: upperSymbol,
      priceUSD: externalPrice,
      source: "external",
      lastUpdated: Date.now(),
      chainId,
    };
  }

  priceCache.set(cacheKey, price);
  return price;
}

/**
 * Get prices for all TipsChain registered tokens
 */
export async function getAllTipsChainPrices(): Promise<TokenPrice[]> {
  const tokens = ["TIPS", "WTPC", "USDT", "USCT", "USDC"];
  const prices = await Promise.all(
    tokens.map((symbol) => getTokenPrice(symbol, 19251925))
  );
  return prices;
}

/**
 * Get the USD value of a token amount
 */
export async function getTokenValueUSD(
  symbol: string,
  amount: number,
  chainId: number = 19251925
): Promise<number> {
  const price = await getTokenPrice(symbol, chainId);
  return price.priceUSD * amount;
}

/**
 * Convert between two tokens using their USD prices
 * e.g. convert 100 TPC to USDT
 */
export async function convertTokenAmount(
  fromSymbol: string,
  toSymbol: string,
  amount: number,
  chainId: number = 19251925
): Promise<{ outputAmount: number; rate: number }> {
  const fromPrice = await getTokenPrice(fromSymbol, chainId);
  const toPrice = await getTokenPrice(toSymbol, chainId);

  if (toPrice.priceUSD === 0) {
    return { outputAmount: 0, rate: 0 };
  }

  const rate = fromPrice.priceUSD / toPrice.priceUSD;
  const outputAmount = amount * rate;

  return { outputAmount, rate };
}

/**
 * Fetch price from external sources for non-TipsChain tokens
 * Uses CoinGecko-compatible API
 */
async function fetchExternalPrice(
  symbol: string,
  chainId: number
): Promise<number> {
  try {
    const response = await fetch(
      `https://tipspay.org/api/prices/${symbol.toLowerCase()}?chainId=${chainId}`
    );

    if (!response.ok) {
      return 0;
    }

    const data = await response.json();
    return data.priceUSD || 0;
  } catch {
    return 0;
  }
}

/**
 * Check if a token is a stablecoin (pegged to USD)
 */
export function isStablecoin(symbol: string): boolean {
  return symbol.toUpperCase() in STABLECOIN_PEGS;
}

/**
 * Get stablecoin peg value (always 1.0 for USD-pegged stablecoins)
 */
export function getStablecoinPeg(symbol: string): number | null {
  const upper = symbol.toUpperCase();
  return STABLECOIN_PEGS[upper] ?? null;
}

/**
 * Clear the price cache
 */
export function clearPriceCache(): void {
  priceCache.clear();
}
