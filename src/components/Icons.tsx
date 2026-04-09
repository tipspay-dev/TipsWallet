import React from 'react';

export const TipsChainLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 10C14.4772 10 10 14.4772 10 20C10 25.5228 14.4772 30 20 30H30C35.5228 30 40 25.5228 40 20C40 14.4772 35.5228 10 30 10H20Z" stroke="#3b82f6" strokeWidth="4"/>
    <path d="M35 10C29.4772 10 25 14.4772 25 20C25 25.5228 29.4772 30 35 30H45C50.5228 30 55 25.5228 55 20C55 14.4772 50.5228 10 45 10H35Z" stroke="#60a5fa" strokeWidth="4"/>
    <text x="60" y="28" fill="currentColor" fontSize="18" fontWeight="bold" fontFamily="sans-serif">Tipschain</text>
  </svg>
);

export const TipsPayDEXLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 120 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="10" width="30" height="20" rx="4" fill="#3b82f6" transform="skewX(-10)"/>
    <rect x="25" y="15" width="30" height="20" rx="4" fill="#a855f7" transform="skewX(-10)"/>
    <path d="M15 20L25 20M50 20L40 20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <text x="60" y="28" fill="currentColor" fontSize="14" fontWeight="bold" fontFamily="sans-serif">TipspayDEX</text>
  </svg>
);

export const TipsPayWalletLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 120 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="5" width="40" height="30" rx="6" fill="#f59e0b"/>
    <path d="M30 15C30 12.2386 32.2386 10 35 10H45V30H35C32.2386 30 30 27.7614 30 25V15Z" fill="#d97706"/>
    <circle cx="37" cy="20" r="3" fill="white"/>
    <text x="55" y="28" fill="currentColor" fontSize="14" fontWeight="bold" fontFamily="sans-serif">Tipspay</text>
  </svg>
);

export const TPCCoin = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="45" fill="#fbbf24" stroke="#d97706" strokeWidth="4"/>
    <text x="50" y="65" fill="#92400e" fontSize="30" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">TPC</text>
  </svg>
);

export const USDCCoin = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="45" fill="#2563eb" stroke="#1d4ed8" strokeWidth="4"/>
    <text x="50" y="65" fill="white" fontSize="40" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">$</text>
  </svg>
);

export const WTPCCoin = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="45" fill="#7c3aed" stroke="#6d28d9" strokeWidth="4"/>
    <text x="50" y="55" fill="white" fontSize="20" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">W</text>
    <text x="50" y="75" fill="white" fontSize="20" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">TPC</text>
  </svg>
);

export const TetherCoin = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="45" fill="#22c55e" stroke="#16a34a" strokeWidth="4"/>
    <path d="M30 35H70M50 35V75M35 75H65" stroke="white" strokeWidth="8" strokeLinecap="round"/>
  </svg>
);
