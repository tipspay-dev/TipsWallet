// Multichain EVM Network Configuration
// Supports TipsChain L1 + popular EVM-compatible networks

export interface NetworkConfig {
  chainId: number;
  chainName: string;
  shortName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
  iconUrl: string;
  isTestnet: boolean;
  tokenListUrl?: string;
}

export const EVM_NETWORKS: Record<string, NetworkConfig> = {
  tipschain: {
    chainId: 19251925,
    chainName: "TipsChain L1",
    shortName: "TIPS",
    nativeCurrency: {
      name: "TIPS",
      symbol: "TIPS",
      decimals: 18,
    },
    rpcUrls: ["https://rpc.tipschain.org"],
    blockExplorerUrls: ["https://tipschain.online"],
    iconUrl: "https://tipspay.org/assets/icons/tipschain.png",
    isTestnet: false,
    tokenListUrl: "https://rpc.tipschain.org/tokenlist.json",
  },
  ethereum: {
    chainId: 1,
    chainName: "Ethereum Mainnet",
    shortName: "ETH",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: [
      "https://eth.llamarpc.com",
      "https://rpc.ankr.com/eth",
      "https://ethereum.publicnode.com",
    ],
    blockExplorerUrls: ["https://etherscan.io"],
    iconUrl: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    isTestnet: false,
    tokenListUrl: "https://tokens.coingecko.com/ethereum/all.json",
  },
  bsc: {
    chainId: 56,
    chainName: "BNB Smart Chain",
    shortName: "BSC",
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18,
    },
    rpcUrls: [
      "https://bsc-dataseed.binance.org",
      "https://rpc.ankr.com/bsc",
      "https://bsc.publicnode.com",
    ],
    blockExplorerUrls: ["https://bscscan.com"],
    iconUrl: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
    isTestnet: false,
    tokenListUrl: "https://tokens.coingecko.com/binance-smart-chain/all.json",
  },
  polygon: {
    chainId: 137,
    chainName: "Polygon",
    shortName: "MATIC",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    rpcUrls: [
      "https://polygon-rpc.com",
      "https://rpc.ankr.com/polygon",
      "https://polygon-bor.publicnode.com",
    ],
    blockExplorerUrls: ["https://polygonscan.com"],
    iconUrl: "https://assets.coingecko.com/coins/images/4713/small/polygon.png",
    isTestnet: false,
    tokenListUrl: "https://tokens.coingecko.com/polygon-pos/all.json",
  },
  avalanche: {
    chainId: 43114,
    chainName: "Avalanche C-Chain",
    shortName: "AVAX",
    nativeCurrency: {
      name: "Avalanche",
      symbol: "AVAX",
      decimals: 18,
    },
    rpcUrls: [
      "https://api.avax.network/ext/bc/C/rpc",
      "https://rpc.ankr.com/avalanche",
      "https://avalanche-c-chain.publicnode.com",
    ],
    blockExplorerUrls: ["https://snowtrace.io"],
    iconUrl: "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png",
    isTestnet: false,
    tokenListUrl: "https://tokens.coingecko.com/avalanche/all.json",
  },
  arbitrum: {
    chainId: 42161,
    chainName: "Arbitrum One",
    shortName: "ARB",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: [
      "https://arb1.arbitrum.io/rpc",
      "https://rpc.ankr.com/arbitrum",
      "https://arbitrum-one.publicnode.com",
    ],
    blockExplorerUrls: ["https://arbiscan.io"],
    iconUrl: "https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg",
    isTestnet: false,
    tokenListUrl: "https://tokens.coingecko.com/arbitrum-one/all.json",
  },
  optimism: {
    chainId: 10,
    chainName: "Optimism",
    shortName: "OP",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: [
      "https://mainnet.optimism.io",
      "https://rpc.ankr.com/optimism",
      "https://optimism.publicnode.com",
    ],
    blockExplorerUrls: ["https://optimistic.etherscan.io"],
    iconUrl: "https://assets.coingecko.com/coins/images/25244/small/Optimism.png",
    isTestnet: false,
    tokenListUrl: "https://tokens.coingecko.com/optimistic-ethereum/all.json",
  },
  base: {
    chainId: 8453,
    chainName: "Base",
    shortName: "BASE",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: [
      "https://mainnet.base.org",
      "https://rpc.ankr.com/base",
      "https://base.publicnode.com",
    ],
    blockExplorerUrls: ["https://basescan.org"],
    iconUrl: "https://assets.coingecko.com/coins/images/31164/small/base.png",
    isTestnet: false,
    tokenListUrl: "https://tokens.coingecko.com/base/all.json",
  },
  fantom: {
    chainId: 250,
    chainName: "Fantom Opera",
    shortName: "FTM",
    nativeCurrency: {
      name: "Fantom",
      symbol: "FTM",
      decimals: 18,
    },
    rpcUrls: [
      "https://rpc.ftm.tools",
      "https://rpc.ankr.com/fantom",
      "https://fantom.publicnode.com",
    ],
    blockExplorerUrls: ["https://ftmscan.com"],
    iconUrl: "https://assets.coingecko.com/coins/images/4001/small/Fantom_round.png",
    isTestnet: false,
    tokenListUrl: "https://tokens.coingecko.com/fantom/all.json",
  },
  cronos: {
    chainId: 25,
    chainName: "Cronos Mainnet",
    shortName: "CRO",
    nativeCurrency: {
      name: "Cronos",
      symbol: "CRO",
      decimals: 18,
    },
    rpcUrls: [
      "https://evm.cronos.org",
      "https://cronos-evm.publicnode.com",
    ],
    blockExplorerUrls: ["https://cronoscan.com"],
    iconUrl: "https://assets.coingecko.com/coins/images/7310/small/cro_token_logo.png",
    isTestnet: false,
    tokenListUrl: "https://tokens.coingecko.com/cronos/all.json",
  },
};

export const DEFAULT_NETWORK = "tipschain";

export function getNetworkByChainId(chainId: number): NetworkConfig | undefined {
  return Object.values(EVM_NETWORKS).find((n) => n.chainId === chainId);
}

export function getSupportedChainIds(): number[] {
  return Object.values(EVM_NETWORKS).map((n) => n.chainId);
}

export function getNetworkKey(chainId: number): string | undefined {
  return Object.entries(EVM_NETWORKS).find(
    ([, config]) => config.chainId === chainId
  )?.[0];
}
