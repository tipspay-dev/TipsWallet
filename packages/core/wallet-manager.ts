// Non-custodial Wallet Management Logic
// Supports multichain EVM wallet operations

import { EVM_NETWORKS, NetworkConfig, getNetworkByChainId } from "./networks";
import { resolveTokenIcon, fetchTokenList, TokenInfo } from "./token-registry";
import { MultichainProvider } from "./multichain-provider";
import { getExplorerBaseUrl, getTransactionUrl, getAddressUrl } from "./explorer";

export interface WalletAccount {
  address: string;
  name: string;
  activeChainId: number;
}

export interface WalletTokenBalance {
  token: TokenInfo;
  balance: string;
  chainId: number;
  iconUrl: string;
  explorerUrl: string;
}

export const generateMnemonic = (): string => {
  // BIP-39 mnemonic generation placeholder
  return "";
};

export const encryptWallet = (mnemonic: string, pin: string): string => {
  // AES-256 encryption placeholder
  return "";
};

/**
 * Get all token balances for an address on a specific chain
 * Fetches token icons from the on-chain token registry
 */
export const getWalletTokens = async (
  address: string,
  chainId: number
): Promise<WalletTokenBalance[]> => {
  const tokens = await fetchTokenList(chainId);
  const network = getNetworkByChainId(chainId);
  if (!network) return [];

  // Add native token as first entry
  const nativeIcon = await resolveTokenIcon(chainId);
  const explorerBase = getExplorerBaseUrl(chainId) || "";
  const balances: WalletTokenBalance[] = [
    {
      token: {
        address: "0x0000000000000000000000000000000000000000",
        chainId,
        name: network.nativeCurrency.name,
        symbol: network.nativeCurrency.symbol,
        decimals: network.nativeCurrency.decimals,
        logoURI: nativeIcon,
      },
      balance: "0",
      chainId,
      iconUrl: nativeIcon,
      explorerUrl: explorerBase ? `${explorerBase}/address/${address}` : "",
    },
  ];

  // Add ERC-20 tokens with their icons
  for (const token of tokens.slice(0, 100)) {
    const iconUrl = token.logoURI || (await resolveTokenIcon(chainId, token.address));
    balances.push({
      token: { ...token, logoURI: iconUrl },
      balance: "0",
      chainId,
      iconUrl,
      explorerUrl: explorerBase ? `${explorerBase}/token/${token.address}` : "",
    });
  }

  return balances;
};

/**
 * Get multichain portfolio - balances across all supported EVM networks
 * Each token includes its resolved icon from the registry
 */
export const getMultichainPortfolio = async (
  address: string
): Promise<Map<number, WalletTokenBalance[]>> => {
  const portfolio = new Map<number, WalletTokenBalance[]>();

  const promises = Object.values(EVM_NETWORKS).map(async (network) => {
    try {
      const tokens = await getWalletTokens(address, network.chainId);
      portfolio.set(network.chainId, tokens);
    } catch (error) {
      console.warn(
        `Failed to fetch tokens for ${network.chainName}:`,
        error
      );
      portfolio.set(network.chainId, []);
    }
  });

  await Promise.all(promises);
  return portfolio;
};
