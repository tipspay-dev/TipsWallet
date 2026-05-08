// Explorer Service - Wires blockchain explorers into the wallet for transaction viewing
// TipsChain explorer: https://tipschain.online
// Each EVM network has its own block explorer

import { EVM_NETWORKS, NetworkConfig, getNetworkByChainId } from "./networks";

export interface TransactionInfo {
  hash: string;
  chainId: number;
  from: string;
  to: string;
  value: string;
  status: "pending" | "confirmed" | "failed";
  blockNumber: number;
  timestamp: number;
  explorerUrl: string;
}

export interface ExplorerLinks {
  transaction: string;
  address: string;
  token: string;
  block: string;
}

/**
 * Get the block explorer base URL for a chain
 * TipsChain uses https://tipschain.online
 */
export function getExplorerBaseUrl(chainId: number): string | null {
  const network = getNetworkByChainId(chainId);
  if (!network || network.blockExplorerUrls.length === 0) return null;
  return network.blockExplorerUrls[0];
}

/**
 * Build explorer URL for a transaction hash
 */
export function getTransactionUrl(chainId: number, txHash: string): string | null {
  const baseUrl = getExplorerBaseUrl(chainId);
  if (!baseUrl) return null;
  return `${baseUrl}/tx/${txHash}`;
}

/**
 * Build explorer URL for an address
 */
export function getAddressUrl(chainId: number, address: string): string | null {
  const baseUrl = getExplorerBaseUrl(chainId);
  if (!baseUrl) return null;
  return `${baseUrl}/address/${address}`;
}

/**
 * Build explorer URL for a token contract
 */
export function getTokenUrl(chainId: number, tokenAddress: string): string | null {
  const baseUrl = getExplorerBaseUrl(chainId);
  if (!baseUrl) return null;
  return `${baseUrl}/token/${tokenAddress}`;
}

/**
 * Build explorer URL for a block
 */
export function getBlockUrl(chainId: number, blockNumber: number): string | null {
  const baseUrl = getExplorerBaseUrl(chainId);
  if (!baseUrl) return null;
  return `${baseUrl}/block/${blockNumber}`;
}

/**
 * Get all explorer links for a given chain
 */
export function getExplorerLinks(
  chainId: number,
  params: { txHash?: string; address?: string; tokenAddress?: string; blockNumber?: number }
): ExplorerLinks {
  const baseUrl = getExplorerBaseUrl(chainId) || "";
  return {
    transaction: params.txHash ? `${baseUrl}/tx/${params.txHash}` : "",
    address: params.address ? `${baseUrl}/address/${params.address}` : "",
    token: params.tokenAddress ? `${baseUrl}/token/${params.tokenAddress}` : "",
    block: params.blockNumber !== undefined ? `${baseUrl}/block/${params.blockNumber}` : "",
  };
}

/**
 * Fetch transaction details from RPC and build explorer-enriched info
 */
export async function getTransactionWithExplorer(
  chainId: number,
  txHash: string
): Promise<TransactionInfo | null> {
  const network = getNetworkByChainId(chainId);
  if (!network) return null;

  const rpcUrl = network.rpcUrls[0];
  const explorerUrl = getTransactionUrl(chainId, txHash) || "";

  try {
    // eth_getTransactionByHash
    const txResponse = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getTransactionByHash",
        params: [txHash],
        id: 1,
      }),
    });

    const txResult = await txResponse.json();
    const tx = txResult.result;

    if (!tx) return null;

    // eth_getTransactionReceipt for status
    const receiptResponse = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getTransactionReceipt",
        params: [txHash],
        id: 2,
      }),
    });

    const receiptResult = await receiptResponse.json();
    const receipt = receiptResult.result;

    let status: "pending" | "confirmed" | "failed" = "pending";
    if (receipt) {
      status = receipt.status === "0x1" ? "confirmed" : "failed";
    }

    // eth_getBlockByNumber for timestamp
    let timestamp = 0;
    if (tx.blockNumber) {
      const blockResponse = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_getBlockByNumber",
          params: [tx.blockNumber, false],
          id: 3,
        }),
      });

      const blockResult = await blockResponse.json();
      if (blockResult.result) {
        timestamp = parseInt(blockResult.result.timestamp, 16);
      }
    }

    return {
      hash: txHash,
      chainId,
      from: tx.from,
      to: tx.to || "",
      value: tx.value,
      status,
      blockNumber: tx.blockNumber ? parseInt(tx.blockNumber, 16) : 0,
      timestamp,
      explorerUrl,
    };
  } catch (error) {
    console.error(`Failed to fetch transaction ${txHash} on chain ${chainId}:`, error);
    return null;
  }
}

/**
 * Fetch recent transactions for an address from RPC
 * Returns transactions enriched with explorer URLs
 */
export async function getRecentTransactions(
  chainId: number,
  address: string,
  blockCount: number = 100
): Promise<TransactionInfo[]> {
  const network = getNetworkByChainId(chainId);
  if (!network) return [];

  const rpcUrl = network.rpcUrls[0];

  try {
    // Get latest block number
    const blockNumResponse = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_blockNumber",
        params: [],
        id: 1,
      }),
    });

    const blockNumResult = await blockNumResponse.json();
    const latestBlock = parseInt(blockNumResult.result, 16);
    const fromBlock = Math.max(0, latestBlock - blockCount);

    // Get logs for the address (sent and received)
    const logsResponse = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getLogs",
        params: [
          {
            fromBlock: "0x" + fromBlock.toString(16),
            toBlock: "latest",
            topics: [
              "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef", // Transfer event
              null,
              "0x000000000000000000000000" + address.slice(2).toLowerCase(),
            ],
          },
        ],
        id: 2,
      }),
    });

    const logsResult = await logsResponse.json();
    const logs = logsResult.result || [];

    const transactions: TransactionInfo[] = [];
    const explorerBaseUrl = getExplorerBaseUrl(chainId);

    for (const log of logs.slice(-50)) {
      transactions.push({
        hash: log.transactionHash,
        chainId,
        from: "",
        to: address,
        value: "0x" + (log.data || "0").replace("0x", ""),
        status: "confirmed",
        blockNumber: parseInt(log.blockNumber, 16),
        timestamp: 0,
        explorerUrl: explorerBaseUrl ? `${explorerBaseUrl}/tx/${log.transactionHash}` : "",
      });
    }

    return transactions;
  } catch (error) {
    console.error(
      `Failed to fetch recent transactions for ${address} on chain ${chainId}:`,
      error
    );
    return [];
  }
}

/**
 * Get explorer info for all supported networks
 */
export function getAllExplorerInfo(): Array<{
  chainId: number;
  chainName: string;
  explorerUrl: string;
  explorerName: string;
}> {
  return Object.values(EVM_NETWORKS).map((network) => ({
    chainId: network.chainId,
    chainName: network.chainName,
    explorerUrl: network.blockExplorerUrls[0] || "",
    explorerName: getExplorerName(network),
  }));
}

/**
 * Get a human-readable name for the explorer
 */
function getExplorerName(network: NetworkConfig): string {
  const url = network.blockExplorerUrls[0] || "";
  if (url.includes("tipschain.online")) return "TipsChain Explorer";
  if (url.includes("etherscan")) return "Etherscan";
  if (url.includes("bscscan")) return "BscScan";
  if (url.includes("polygonscan")) return "PolygonScan";
  if (url.includes("snowtrace")) return "Snowtrace";
  if (url.includes("arbiscan")) return "Arbiscan";
  if (url.includes("optimistic")) return "Optimistic Etherscan";
  if (url.includes("basescan")) return "BaseScan";
  if (url.includes("ftmscan")) return "FTMScan";
  if (url.includes("cronoscan")) return "CronoScan";
  return "Explorer";
}
