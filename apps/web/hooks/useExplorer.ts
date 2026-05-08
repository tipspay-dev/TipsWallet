// Explorer Hook - Wires blockchain explorers into the wallet UI
// TipsChain explorer: https://tipschain.online
// Each EVM network has its own block explorer for transaction viewing

import {
  getTransactionUrl,
  getAddressUrl,
  getTokenUrl,
  getBlockUrl,
  getExplorerLinks,
  getTransactionWithExplorer,
  getRecentTransactions,
  getAllExplorerInfo,
  TransactionInfo,
} from "../../../packages/core/explorer";

/**
 * useExplorer - Hook for viewing transactions on blockchain explorers
 * Wires tipschain.online and other chain explorers into the wallet
 */
export const useExplorer = (chainId: number = 19251925) => {
  const openTransaction = (txHash: string): void => {
    const url = getTransactionUrl(chainId, txHash);
    if (url) window.open(url, "_blank");
  };

  const openAddress = (address: string): void => {
    const url = getAddressUrl(chainId, address);
    if (url) window.open(url, "_blank");
  };

  const openToken = (tokenAddress: string): void => {
    const url = getTokenUrl(chainId, tokenAddress);
    if (url) window.open(url, "_blank");
  };

  const openBlock = (blockNumber: number): void => {
    const url = getBlockUrl(chainId, blockNumber);
    if (url) window.open(url, "_blank");
  };

  const fetchTransaction = async (
    txHash: string
  ): Promise<TransactionInfo | null> => {
    return getTransactionWithExplorer(chainId, txHash);
  };

  const fetchRecentTransactions = async (
    address: string,
    blockCount: number = 100
  ): Promise<TransactionInfo[]> => {
    return getRecentTransactions(chainId, address, blockCount);
  };

  const getLinks = (params: {
    txHash?: string;
    address?: string;
    tokenAddress?: string;
    blockNumber?: number;
  }) => {
    return getExplorerLinks(chainId, params);
  };

  return {
    openTransaction,
    openAddress,
    openToken,
    openBlock,
    fetchTransaction,
    fetchRecentTransactions,
    getLinks,
    allExplorers: getAllExplorerInfo(),
  };
};
