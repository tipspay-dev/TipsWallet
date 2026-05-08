# TipsWallet & TIPSPAY - Multichain EVM Wallet & DEX

TipsChain L1 (Chain ID: 19251925) ve diğer EVM uyumlu ağlar için non-custodial cüzdan ve DEX platformu.

## URL Yapısı

> **Önemli:** Subdomain kullanılmaz. Tüm erişim path-based routing ile yapılır.

| Uygulama | URL |
|----------|-----|
| Wallet | [tipspay.org/wallet](https://tipspay.org/wallet) |
| DEX | [tipspay.org/dex](https://tipspay.org/dex) |
| Explorer | [tipspay.org/explorer](https://tipspay.org/explorer) |
| API | [tipspay.org/api](https://tipspay.org/api) |

## Desteklenen Ağlar (Multichain EVM)

| Ağ | Chain ID | Native Token |
|----|----------|-------------|
| TipsChain L1 | 19251925 | TIPS |
| Ethereum | 1 | ETH |
| BNB Smart Chain | 56 | BNB |
| Polygon | 137 | MATIC |
| Avalanche C-Chain | 43114 | AVAX |
| Arbitrum One | 42161 | ETH |
| Optimism | 10 | ETH |
| Base | 8453 | ETH |
| Fantom Opera | 250 | FTM |
| Cronos | 25 | CRO |

## Kurulum

1. Terminali açın.
2. `git clone https://github.com/tipspay-dev/TipsWallet.git`
3. `cd TipsWallet`
4. `npm install` ile bağımlılıkları yükleyin.

## Proje Yapısı

```
TipsWallet/
├── apps/
│   └── web/
│       ├── config.ts              # URL ve branding ayarları
│       └── hooks/
│           ├── useMultichain.ts    # Multichain ağ yönetimi
│           ├── useTokenRegistry.ts # Token ikonları ve metadata
│           ├── useDex.ts           # DEX swap işlemleri
│           └── useSocialRecovery.ts # Cloud backup
├── packages/
│   ├── core/
│   │   ├── networks.ts            # EVM ağ konfigürasyonları
│   │   ├── token-registry.ts      # Token ikon ve metadata servisi
│   │   ├── multichain-provider.ts # Multichain RPC bağlantı yöneticisi
│   │   ├── wallet-manager.ts      # Non-custodial cüzdan yönetimi
│   │   └── index.ts               # Core paket export
│   └── sdk/
│       ├── gasless-provider.ts    # Gasless transaction + user.tips isim çözümleme
│       ├── dex-aggregator.ts      # Multichain DEX aggregator
│       ├── hyperlane-bridge.ts    # Hyperlane cross-chain bridge
│       └── index.ts               # SDK paket export
└── contracts/
    └── SocialNameServer.sol       # Sosyal isim sunucusu
```

## Özellikler

- **Multichain EVM Desteği**: 10+ EVM uyumlu ağ desteği (Ethereum, BSC, Polygon, Avalanche, Arbitrum, Optimism, Base, Fantom, Cronos, TipsChain)
- **Token İkon Çözümleme**: RPC token registry, TrustWallet Assets ve CoinGecko üzerinden otomatik ikon yükleme
- **DEX Aggregator**: Her ağdaki en iyi DEX'ler üzerinden swap kotasyonu (Uniswap, PancakeSwap, QuickSwap, vb.)
- **Non-Custodial Mimari**: BIP-39 mnemonic ve AES-256 şifreleme
- **Cloud Backup**: Google Drive, Dropbox ile yedekleme
- **Gasless Transaction**: Sadece TipsWallet kullanıcıları için gasless transfer (user.tips isim sistemi ile)
- **user.tips İsim Sistemi**: SocialNameServer üzerinden isim kaydı (örn: alice.tips -> 0x1234...)
- **Hyperlane Bridge**: Cross-chain token köprüleme (tipspay.org/dex bridge sekmesi)
- **Cross-Chain Swap Karşılaştırma**: Tüm ağlarda en iyi fiyat bulma

## TipsChain Kayıtlı Tokenlar

| Token | Sembol | Açıklama |
|-------|--------|----------|
| USD Coin TipsChain | USCT | TipsChain stablecoin |
| Tether USD | USDT | Stablecoin |
| Wrapped TIPS Coin | WTPC | Wrapped native token |
| USD Coin | USDC | Stablecoin |

## Gasless Transfer & user.tips İsim Sistemi

Gasless transferler **sadece TipsWallet kullanıcıları** için geçerlidir:
1. Kullanıcı tipspay.org/wallet üzerinden bir user.tips ismi kaydeder (örn: `alice.tips`)
2. Kayıtlı isim ile gasless transfer yapabilir
3. Alıcı da user.tips ismi ile belirtilebilir (örn: `bob.tips`)

## Hyperlane Bridge

Cross-chain token köprüleme Hyperlane protokolü ile yapılır:
- tipspay.org/dex adresindeki bridge sekmesinden erişilebilir
- Ethereum, BSC, Polygon, Avalanche, Arbitrum, Optimism, Base, Fantom arası köprü

## Token İkonları

Token ikonları aşağıdaki kaynaklardan sırasıyla çözümlenir:
1. **On-chain Token List Registry** - Ağın kendi token listesi
2. **TrustWallet Assets** - GitHub üzerindeki TrustWallet asset deposu
3. **CoinGecko Token Lists** - CoinGecko API token listeleri
4. **Fallback** - Generic token ikonu
