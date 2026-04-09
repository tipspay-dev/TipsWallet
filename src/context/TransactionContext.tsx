import React, { createContext, useContext, useState, useEffect } from 'react';

export type TransactionStatus = 'pending' | 'completed' | 'failed';
export type TransactionType = 'send' | 'receive' | 'swap';

export interface Transaction {
  id: string;
  type: TransactionType;
  token: string;
  amount: string;
  status: TransactionStatus;
  timestamp: number;
  hash?: string;
  to?: string;
  from?: string;
}

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('tipspay_transactions');
    if (saved) {
      try {
        setTransactions(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse transactions', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tipspay_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (tx: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTx: Transaction = {
      ...tx,
      id: Math.random().toString(36).substring(2, 15),
      timestamp: Date.now(),
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const clearHistory = () => {
    setTransactions([]);
  };

  return (
    <TransactionContext.Provider value={{ transactions, addTransaction, clearHistory }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};
