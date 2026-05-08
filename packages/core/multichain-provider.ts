// Multichain Provider - Manages connections to multiple EVM networks simultaneously
// Enables wallet and DEX to operate across all supported chains

import {
  EVM_NETWORKS,
  NetworkConfig,
  DEFAULT_NETWORK,
  getNetworkByChainId,
  getNetworkKey,
} from "./networks";

export interface ChainConnection {
  chainId: number;
  network: NetworkConfig;
  isConnected: boolean;
  currentRpcIndex: number;
}

export interface MultichainState {
  activeChainId: number;
  connections: Map<number, ChainConnection>;
}

/**
 * Multichain Provider - handles RPC connections across all supported EVM networks
 */
export class MultichainProvider {
  private state: MultichainState;

  constructor(initialChainId?: number) {
    this.state = {
      activeChainId: initialChainId || EVM_NETWORKS[DEFAULT_NETWORK].chainId,
      connections: new Map(),
    };
    this.initializeConnections();
  }

  private initializeConnections(): void {
    for (const [key, network] of Object.entries(EVM_NETWORKS)) {
      this.state.connections.set(network.chainId, {
        chainId: network.chainId,
        network,
        isConnected: false,
        currentRpcIndex: 0,
      });
    }
  }

  /**
   * Switch active network
   */
  async switchNetwork(chainId: number): Promise<boolean> {
    const connection = this.state.connections.get(chainId);
    if (!connection) {
      console.error(`Network with chainId ${chainId} is not supported`);
      return false;
    }

    this.state.activeChainId = chainId;
    console.log(`Switched to ${connection.network.chainName} (${chainId})`);
    return true;
  }

  /**
   * Get current active network
   */
  getActiveNetwork(): NetworkConfig {
    const connection = this.state.connections.get(this.state.activeChainId);
    return connection!.network;
  }

  /**
   * Get active chain ID
   */
  getActiveChainId(): number {
    return this.state.activeChainId;
  }

  /**
   * Get current RPC URL for a chain (with automatic failover)
   */
  getRpcUrl(chainId?: number): string {
    const id = chainId || this.state.activeChainId;
    const connection = this.state.connections.get(id);
    if (!connection) {
      throw new Error(`Network with chainId ${id} is not supported`);
    }
    return connection.network.rpcUrls[connection.currentRpcIndex];
  }

  /**
   * Rotate to next RPC URL on failure
   */
  rotateRpc(chainId?: number): string {
    const id = chainId || this.state.activeChainId;
    const connection = this.state.connections.get(id);
    if (!connection) {
      throw new Error(`Network with chainId ${id} is not supported`);
    }

    connection.currentRpcIndex =
      (connection.currentRpcIndex + 1) % connection.network.rpcUrls.length;
    return connection.network.rpcUrls[connection.currentRpcIndex];
  }

  /**
   * Make an RPC call with automatic retry and failover
   */
  async rpcCall(
    method: string,
    params: unknown[],
    chainId?: number
  ): Promise<unknown> {
    const id = chainId || this.state.activeChainId;
    const connection = this.state.connections.get(id);
    if (!connection) {
      throw new Error(`Network with chainId ${id} is not supported`);
    }

    const maxRetries = connection.network.rpcUrls.length;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const rpcUrl = this.getRpcUrl(id);
      try {
        const response = await fetch(rpcUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method,
            params,
            id: Date.now(),
          }),
        });

        const result = await response.json();
        if (result.error) {
          throw new Error(result.error.message);
        }

        connection.isConnected = true;
        return result.result;
      } catch (error) {
        console.warn(
          `RPC call failed on ${rpcUrl}, rotating to next endpoint...`
        );
        this.rotateRpc(id);
      }
    }

    connection.isConnected = false;
    throw new Error(
      `All RPC endpoints failed for ${connection.network.chainName}`
    );
  }

  /**
   * Get balance for an address on a specific chain
   */
  async getBalance(address: string, chainId?: number): Promise<string> {
    const result = await this.rpcCall(
      "eth_getBalance",
      [address, "latest"],
      chainId
    );
    return result as string;
  }

  /**
   * Get balances across all supported chains
   */
  async getMultichainBalances(
    address: string
  ): Promise<Map<number, string>> {
    const balances = new Map<number, string>();

    const promises = Array.from(this.state.connections.keys()).map(
      async (chainId) => {
        try {
          const balance = await this.getBalance(address, chainId);
          balances.set(chainId, balance);
        } catch {
          balances.set(chainId, "0x0");
        }
      }
    );

    await Promise.all(promises);
    return balances;
  }

  /**
   * Get all supported networks
   */
  getSupportedNetworks(): NetworkConfig[] {
    return Array.from(this.state.connections.values()).map((c) => c.network);
  }

  /**
   * Check if a chain is supported
   */
  isChainSupported(chainId: number): boolean {
    return this.state.connections.has(chainId);
  }

  /**
   * Get connection status for all chains
   */
  getConnectionStatus(): Map<number, boolean> {
    const status = new Map<number, boolean>();
    for (const [chainId, conn] of this.state.connections) {
      status.set(chainId, conn.isConnected);
    }
    return status;
  }

  /**
   * Add a custom EVM network
   */
  addCustomNetwork(network: NetworkConfig): void {
    if (this.state.connections.has(network.chainId)) {
      console.warn(
        `Network with chainId ${network.chainId} already exists, updating...`
      );
    }

    this.state.connections.set(network.chainId, {
      chainId: network.chainId,
      network,
      isConnected: false,
      currentRpcIndex: 0,
    });
  }

  /**
   * Remove a custom network (cannot remove built-in networks)
   */
  removeCustomNetwork(chainId: number): boolean {
    const key = getNetworkKey(chainId);
    if (key && key in EVM_NETWORKS) {
      console.warn(`Cannot remove built-in network: ${key}`);
      return false;
    }
    return this.state.connections.delete(chainId);
  }
}
