# TipsWallet Wallet-Only App

This folder is a standalone wallet frontend prepared for Spaceship deployment.

## Why this folder exists

The root repository currently exposes an Express service and a DEX surface. This folder isolates a wallet-only app so you can deploy it independently to `wallet.tipspay.org` without shipping the rest of the service.

## Use This As The Repo Root

For Spaceship Hyperlift, the cleanest path is to publish the contents of this folder as the root of a separate repository.

Recommended repository name:

- `tipswallet`

Recommended root contents:

- `Dockerfile`
- `package.json`
- `server.js`
- `.env.example`
- `public/`

## Included files

- `server.js`: zero-dependency runtime server with `/health` and `/api/config`
- `public/index.html`: wallet dashboard shell
- `public/app.js`: browser wallet integration, balances, transfer flow, gasless-ready relay hook
- `public/styles.css`: premium wallet UI styling
- `Dockerfile`: Spaceship Hyperlift-ready image
- `.env.example`: runtime configuration for chain, contracts, relay, and explorer

## Local run

```powershell
Set-Location -LiteralPath 'E:\tipschain-ecosystem\wallet-only'
Copy-Item .env.example .env
node .\server.js
```

Open [http://localhost:8080](http://localhost:8080).

## Spaceship Hyperlift

1. Create a new GitHub repository for the wallet-only app.
2. Copy the contents of this folder into that repository root.
3. Push the repository to GitHub.
4. In Spaceship Starlight Hyperlift, create a new app from that GitHub repository.
5. Use the included `Dockerfile` at the repository root.
6. Add environment variables from `.env.example`.
7. Deploy the app and wait for the first successful build.
8. Open the app in Spaceship and attach `wallet.tipspay.org` in Connections.
9. Apply the TXT and A/CNAME records shown by Spaceship, or switch the domain to Spaceship nameservers if you want Spaceship-managed DNS.
10. After DNS propagates, verify `/health` and the homepage over HTTPS.

## Spaceship Web Hosting

1. Create a Node.js app in cPanel.
2. Upload this folder as the application root.
3. Set the startup file to `server.js`.
4. Add environment variables from `.env.example`.
5. Restart the application after configuration changes.

## Runtime integrations

- `.tip` resolution is enabled when `PUBLIC_NAME_RESOLVER_URL` is set.
- Gasless transfer submission is enabled when `PUBLIC_RELAYER_URL` is set.
- Activity feed is enabled when `PUBLIC_ACTIVITY_API_URL` is set.

The wallet can still connect, display balances, switch networks, and send direct native/ERC-20 transfers without those optional endpoints.

## Production Defaults Included

This folder already includes the confirmed public TipsPay defaults we have been using:

- `chainId=19251925`
- `rpc=https://rpc.tipspay.org`
- `explorer=https://scan.tipspay.org`
- `stableToken=0x960541Ba5d3D1da6A6224918082B1b0c2AA50234`
- `wrappedNative=0x18b9cA5bA2277484CD59Ac75DB235b6c67e65504`
- `priceOracle=0xB23ea545dB34a0596b29C93E818503fc5e6cB8D4`
- `tipsNameService=0xAAD1b0D0261c0E12Eb1327578C4a3dCdA3aF6d72`
- `trustedForwarder=0xaD69fb5FB37E310a17025e097D9A2a3F9fC7eC8F`
- `gaslessReserve=0x640Dd349333dC4F36E28843C27e23412537F7A7C`

Optional off-chain endpoints are intentionally left blank until the production relayer, resolver, and activity APIs are finalized.
