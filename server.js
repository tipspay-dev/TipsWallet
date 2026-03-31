const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');

const publicDir = path.join(__dirname, 'public');
const indexPath = path.join(publicDir, 'index.html');
const envPath = path.join(__dirname, '.env');

function loadEnvFile() {
  if (!fs.existsSync(envPath)) {
    return;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');

  for (const rawLine of envContent.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function parseInteger(rawValue, fallback) {
  const value = Number.parseInt(String(rawValue ?? fallback), 10);
  return Number.isInteger(value) ? value : fallback;
}

function normalizeEnv(value) {
  return String(value || '').trim();
}

loadEnvFile();

function buildRuntimeConfig() {
  const chainId = parseInteger(process.env.PUBLIC_CHAIN_ID, 19251925);
  const currencyDecimals = parseInteger(process.env.PUBLIC_CURRENCY_DECIMALS, 18);
  const stableTokenDecimals = parseInteger(process.env.PUBLIC_STABLE_TOKEN_DECIMALS, 6);
  const wrappedNativeDecimals = parseInteger(process.env.PUBLIC_WRAPPED_NATIVE_DECIMALS, 18);
  const stableTokenAddress =
    normalizeEnv(process.env.PUBLIC_STABLE_TOKEN_ADDRESS) || '0x960541Ba5d3D1da6A6224918082B1b0c2AA50234';
  const wrappedNativeAddress =
    normalizeEnv(process.env.PUBLIC_WRAPPED_NATIVE_ADDRESS) || '0x18b9cA5bA2277484CD59Ac75DB235b6c67e65504';
  const priceOracleAddress =
    normalizeEnv(process.env.PUBLIC_PRICE_ORACLE_ADDRESS) || '0xB23ea545dB34a0596b29C93E818503fc5e6cB8D4';
  const nameServiceAddress =
    normalizeEnv(process.env.PUBLIC_NAME_SERVICE_ADDRESS) || '0xAAD1b0D0261c0E12Eb1327578C4a3dCdA3aF6d72';
  const trustedForwarderAddress =
    normalizeEnv(process.env.PUBLIC_FORWARDER_ADDRESS) || '0xaD69fb5FB37E310a17025e097D9A2a3F9fC7eC8F';
  const gaslessReserveAddress =
    normalizeEnv(process.env.PUBLIC_GASLESS_RESERVE_ADDRESS) || '0x640Dd349333dC4F36E28843C27e23412537F7A7C';

  return {
    appName: normalizeEnv(process.env.PUBLIC_APP_NAME) || 'TipsWallet',
    siteUrl: normalizeEnv(process.env.PUBLIC_SITE_URL) || 'https://wallet.tipspay.org',
    network: {
      chainId,
      chainIdHex: `0x${chainId.toString(16)}`,
      chainName: normalizeEnv(process.env.PUBLIC_CHAIN_NAME) || 'TipsPay',
      currency: {
        symbol: normalizeEnv(process.env.PUBLIC_CURRENCY_SYMBOL) || 'TPC',
        decimals: currencyDecimals
      },
      rpcUrl: normalizeEnv(process.env.PUBLIC_RPC_URL) || 'https://rpc.tipspay.org',
      explorerUrl: normalizeEnv(process.env.PUBLIC_EXPLORER_URL) || 'https://scan.tipspay.org'
    },
    tokens: [
      {
        key: 'stable',
        address: stableTokenAddress,
        symbol: normalizeEnv(process.env.PUBLIC_STABLE_TOKEN_SYMBOL) || 'USDT',
        decimals: stableTokenDecimals
      },
      {
        key: 'wrapped',
        address: wrappedNativeAddress,
        symbol: normalizeEnv(process.env.PUBLIC_WRAPPED_NATIVE_SYMBOL) || 'WTPC',
        decimals: wrappedNativeDecimals
      }
    ].filter((token) => token.address),
    contracts: {
      stableToken: stableTokenAddress,
      wrappedNative: wrappedNativeAddress,
      priceOracle: priceOracleAddress,
      nameService: nameServiceAddress,
      trustedForwarder: trustedForwarderAddress,
      gaslessReserve: gaslessReserveAddress
    },
    integrations: {
      relayerUrl: normalizeEnv(process.env.PUBLIC_RELAYER_URL),
      nameResolverUrl: normalizeEnv(process.env.PUBLIC_NAME_RESOLVER_URL),
      activityApiUrl: normalizeEnv(process.env.PUBLIC_ACTIVITY_API_URL)
    }
  };
}

const runtimeConfig = buildRuntimeConfig();
const port = parseInteger(process.env.PORT, 8080);

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'cache-control': 'no-store',
    'content-type': 'application/json; charset=utf-8'
  });
  response.end(JSON.stringify(payload, null, 2));
}

function sendFile(response, filePath) {
  if (!fs.existsSync(filePath)) {
    sendJson(response, 404, { error: 'Not Found' });
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = contentTypes[ext] || 'application/octet-stream';
  const fileBuffer = fs.readFileSync(filePath);

  response.writeHead(200, {
    'cache-control': ext === '.html' ? 'no-store' : 'public, max-age=300',
    'content-type': contentType
  });
  response.end(fileBuffer);
}

function serveStaticAsset(pathname, response) {
  const normalizedPath = pathname === '/' ? '/index.html' : pathname;
  const safePath = path.normalize(normalizedPath).replace(/^(\.\.[\\/])+/, '');
  const filePath = path.join(publicDir, safePath);

  if (!filePath.startsWith(publicDir)) {
    sendJson(response, 403, { error: 'Forbidden' });
    return;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    sendFile(response, filePath);
    return;
  }

  sendFile(response, indexPath);
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);

  if (request.method !== 'GET') {
    sendJson(response, 405, { error: 'Method Not Allowed' });
    return;
  }

  if (url.pathname === '/health') {
    sendJson(response, 200, {
      status: 'healthy',
      app: runtimeConfig.appName,
      port,
      timestamp: new Date().toISOString()
    });
    return;
  }

  if (url.pathname === '/api/config') {
    sendJson(response, 200, runtimeConfig);
    return;
  }

  serveStaticAsset(url.pathname, response);
});

server.listen(port, () => {
  console.log(
    JSON.stringify({
      event: 'wallet.server.started',
      app: runtimeConfig.appName,
      port,
      siteUrl: runtimeConfig.siteUrl
    })
  );
});
