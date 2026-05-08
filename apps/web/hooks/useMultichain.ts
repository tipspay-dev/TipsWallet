// Multichain Hook - Manages network switching and multichain state in the UI
// Used across tipspay.org/wallet and tipspay.org/dex

import {
  EVM_NETWORKS,
  NetworkConfig,
  DEFAULT_NETWORK,
  getNetworkByChainId,
} from "../../../packages/core/networks";
import {
  MultichainProvider,
} from "../../../packages/core/multichain-provider";

export interface MultichainHookState {
  activeChainId: number;
  activeNetwork: NetworkConfig;
  supportedNetworks: NetworkConfig[];
  isConnected: boolean;
  provider: MultichainProvider;
}

/**
 * useMultichain - Hook for managing multichain state
 * Provides network switching, balance fetching, and connection management
 */
export const useMultichain = () => {
  const provider = new MultichainProvider();

  const switchNetwork = async (chainId: number): Promise<boolean> => {
    const success = await provider.switchNetwork(chainId);
    if (success) {
      console.log(
        `Network switched to ${provider.getActiveNetwork().chainName}`
      );
    }
    return success;
  };

  const getActiveNetwork = (): NetworkConfig => {
    return provider.getActiveNetwork();
  };

  const getSupportedNetworks = (): NetworkConfig[] => {
    return provider.getSupportedNetworks();
  };

  const getBalance = async (
    address: string,
    chainId?: number
  ): Promise<string> => {
    return provider.getBalance(address, chainId);
  };

  const getMultichainBalances = async (
    address: string
  ): Promise<Map<number, string>> => {
    return provider.getMultichainBalances(address);
  };

  const addCustomNetwork = (network: NetworkConfig): void => {
    provider.addCustomNetwork(network);
  };

  return {
    provider,
    switchNetwork,
    getActiveNetwork,
    getSupportedNetworks,
    getBalance,
    getMultichainBalances,
    addCustomNetwork,
  };
};
