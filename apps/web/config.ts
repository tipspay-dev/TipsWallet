// App Configuration - URLs, branding, and routing
// IMPORTANT: All routes use tipspay.org/wallet and tipspay.org/dex (NOT subdomains)

export const APP_CONFIG = {
  // Base URL - single domain, path-based routing
  baseUrl: "https://tipspay.org",

  // Application routes (path-based, NOT subdomain-based)
  routes: {
    wallet: "/wallet",
    dex: "/dex",
    explorer: "/explorer",
    staking: "/staking",
    bridge: "/bridge",
    settings: "/settings",
  },

  // Full URLs for reference
  urls: {
    wallet: "https://tipspay.org/wallet",
    dex: "https://tipspay.org/dex",
    explorer: "https://tipspay.org/explorer",
    staking: "https://tipspay.org/staking",
    bridge: "https://tipspay.org/bridge",
    settings: "https://tipspay.org/settings",
  },

  // Branding
  branding: {
    appName: "TipsWallet",
    companyName: "TIPSPAY",
    tagline: "Multichain EVM Wallet & DEX",
    logo: {
      light: "https://tipspay.org/assets/logo/tipspay-logo-light.svg",
      dark: "https://tipspay.org/assets/logo/tipspay-logo-dark.svg",
      icon: "https://tipspay.org/assets/logo/tipspay-icon.svg",
      favicon: "https://tipspay.org/assets/logo/favicon.ico",
    },
    socialLinks: {
      twitter: "https://twitter.com/tipspay",
      telegram: "https://t.me/tipspay",
      discord: "https://discord.gg/tipspay",
      github: "https://github.com/tipspay-dev",
    },
  },

  // API endpoints (path-based, NOT subdomain-based)
  api: {
    base: "https://tipspay.org/api",
    wallet: "https://tipspay.org/api/wallet",
    dex: "https://tipspay.org/api/dex",
    gasless: "https://tipspay.org/api/gasless",
    tokenList: "https://tipspay.org/api/tokens",
  },
};

/**
 * Build a full URL from a route path
 * Always uses tipspay.org base domain with path-based routing
 */
export function buildUrl(route: string): string {
  return `${APP_CONFIG.baseUrl}${route}`;
}

/**
 * Get the wallet URL
 * Returns: https://tipspay.org/wallet (NOT wallet.tipspay.org)
 */
export function getWalletUrl(): string {
  return APP_CONFIG.urls.wallet;
}

/**
 * Get the DEX URL
 * Returns: https://tipspay.org/dex (NOT dex.tipspay.org)
 */
export function getDexUrl(): string {
  return APP_CONFIG.urls.dex;
}

/**
 * Get logo URL based on theme
 */
export function getLogoUrl(theme: "light" | "dark" = "light"): string {
  return APP_CONFIG.branding.logo[theme];
}

/**
 * Get the favicon URL
 */
export function getFaviconUrl(): string {
  return APP_CONFIG.branding.logo.favicon;
}

/**
 * Get the icon-only logo URL
 */
export function getIconUrl(): string {
  return APP_CONFIG.branding.logo.icon;
}
