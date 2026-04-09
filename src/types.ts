export interface Token {
  id: string;
  symbol: string;
  name: string;
  balance: number;
  price: number;
  change24h: number;
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'swap';
  token: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  timestamp: number;
  address?: string;
}

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  sparkline: number[];
}
