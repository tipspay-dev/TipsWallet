const state = {
  config: null,
  account: '',
  chainIdHex: '',
  activity: [],
  assets: [],
  provider: typeof window !== 'undefined' ? window.ethereum : null
};

const elements = {
  accountAddress: document.getElementById('account-address'),
  accountPill: document.getElementById('account-pill'),
  activityList: document.getElementById('activity-list'),
  addNetworkButton: document.getElementById('add-network-button'),
  amountInput: document.getElementById('amount-input'),
  assetSelect: document.getElementById('asset-select'),
  connectButton: document.getElementById('connect-button'),
  explorerUrl: document.getElementById('explorer-url'),
  memoInput: document.getElementById('memo-input'),
  modeSelect: document.getElementById('mode-select'),
  nameServiceAddress: document.getElementById('name-service-address'),
  nativeBalance: document.getElementById('native-balance'),
  nativeSymbol: document.getElementById('native-symbol'),
  networkPill: document.getElementById('network-pill'),
  priceOracleAddress: document.getElementById('price-oracle-address'),
  recipientInput: document.getElementById('recipient-input'),
  refreshButton: document.getElementById('refresh-button'),
  relayerUrl: document.getElementById('relayer-url'),
  resolutionPreview: document.getElementById('resolution-preview'),
  rpcUrl: document.getElementById('rpc-url'),
  stableBalance: document.getElementById('stable-balance'),
  stableSymbol: document.getElementById('stable-symbol'),
  stableTokenAddress: document.getElementById('stable-token-address'),
  transferForm: document.getElementById('transfer-form'),
  transferStatus: document.getElementById('transfer-status'),
  walletStatus: document.getElementById('wallet-status'),
  wrappedBalance: document.getElementById('wrapped-balance'),
  wrappedSymbol: document.getElementById('wrapped-symbol')
};

const ZERO_HEX = '0x0';
const BALANCE_OF_SELECTOR = '0x70a08231';
const TRANSFER_SELECTOR = '0xa9059cbb';

function setText(element, value) {
  element.textContent = value;
}

function shortValue(value) {
  if (!value) {
    return 'Not connected';
  }

  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function safeLower(value) {
  return String(value || '').trim().toLowerCase();
}

function isAddress(value) {
  return /^0x[a-fA-F0-9]{40}$/.test(String(value || '').trim());
}

function hexToBigInt(hexValue) {
  return BigInt(String(hexValue || ZERO_HEX));
}

function decimalToBigInt(amountText, decimals) {
  const value = String(amountText || '').trim();

  if (!/^\d+(?:\.\d+)?$/.test(value)) {
    throw new Error('Amount must be a positive number.');
  }

  const [wholePart, fractionPart = ''] = value.split('.');
  const normalizedFraction = `${fractionPart}${'0'.repeat(decimals)}`.slice(0, decimals);
  return BigInt(wholePart) * 10n ** BigInt(decimals) + BigInt(normalizedFraction || '0');
}

function formatUnits(rawUnits, decimals, precision = 4) {
  const units = typeof rawUnits === 'bigint' ? rawUnits : BigInt(rawUnits || 0);
  const scale = 10n ** BigInt(decimals);
  const whole = units / scale;
  const fraction = (units % scale).toString().padStart(decimals, '0').slice(0, precision).replace(/0+$/, '');
  return fraction ? `${whole.toString()}.${fraction}` : whole.toString();
}

function toHex(value) {
  return `0x${value.toString(16)}`;
}

function padAddress(address) {
  return safeLower(address).replace(/^0x/, '').padStart(64, '0');
}

function padUint(value) {
  return value.toString(16).padStart(64, '0');
}

function buildTransferData(address, amountUnits) {
  return `${TRANSFER_SELECTOR}${padAddress(address)}${padUint(amountUnits)}`;
}

function buildBalanceOfData(address) {
  return `${BALANCE_OF_SELECTOR}${padAddress(address)}`;
}

function explorerTxUrl(hash) {
  const explorerUrl = state.config?.network?.explorerUrl || '';
  return explorerUrl && hash ? `${explorerUrl.replace(/\/$/, '')}/tx/${hash}` : '';
}

function pushActivity(entry) {
  state.activity = [entry, ...state.activity].slice(0, 10);
  renderActivity();
}

function renderActivity() {
  if (!state.activity.length) {
    elements.activityList.innerHTML = '<li class="empty-state">No recent activity yet.</li>';
    return;
  }

  elements.activityList.innerHTML = state.activity
    .map((entry) => {
      const cssClass =
        entry.status === 'success'
          ? 'activity-state activity-state-ok'
          : entry.status === 'error'
            ? 'activity-state activity-state-error'
            : 'activity-state';

      const link = entry.txUrl
        ? `<a class="mono" href="${entry.txUrl}" target="_blank" rel="noreferrer">Open in explorer</a>`
        : '';

      return `
        <li>
          <div class="activity-title">
            <strong>${entry.title}</strong>
            <span class="${cssClass}">${entry.statusLabel}</span>
          </div>
          <p class="activity-meta">${entry.meta}</p>
          ${link}
        </li>
      `;
    })
    .join('');
}

function setWalletStatus(message) {
  setText(elements.walletStatus, message);
}

function setTransferStatus(message, status = 'idle') {
  elements.transferStatus.textContent = message;
  elements.transferStatus.style.color =
    status === 'error' ? 'var(--danger)' : status === 'success' ? 'var(--ok)' : 'var(--muted)';
}

function getAssetByKey(key) {
  return state.assets.find((asset) => asset.key === key);
}

function buildAssets(config) {
  const nativeAsset = {
    key: 'native',
    symbol: config.network.currency.symbol,
    decimals: config.network.currency.decimals,
    kind: 'native',
    address: ''
  };

  return [nativeAsset, ...(config.tokens || []).map((token) => ({ ...token, kind: 'erc20' }))];
}

function populateAssetSelect() {
  elements.assetSelect.innerHTML = state.assets
    .map((asset) => `<option value="${asset.key}">${asset.symbol}</option>`)
    .join('');

  const stableAsset = state.assets.find((asset) => asset.key === 'stable');
  if (stableAsset) {
    elements.assetSelect.value = stableAsset.key;
  }
}

function renderConfig() {
  const config = state.config;

  setText(elements.nativeSymbol, config.network.currency.symbol);
  setText(elements.networkPill, `${config.network.chainName} (${config.network.chainId})`);
  setText(elements.rpcUrl, config.network.rpcUrl || 'Not configured');
  setText(elements.explorerUrl, config.network.explorerUrl || 'Not configured');
  setText(elements.relayerUrl, config.integrations.relayerUrl || 'Not configured');
  setText(elements.nameServiceAddress, config.contracts.nameService || 'Not configured');
  setText(elements.stableTokenAddress, config.contracts.stableToken || 'Not configured');
  setText(elements.priceOracleAddress, config.contracts.priceOracle || 'Not configured');

  const stableAsset = state.assets.find((asset) => asset.key === 'stable');
  const wrappedAsset = state.assets.find((asset) => asset.key === 'wrapped');

  setText(elements.stableSymbol, stableAsset ? stableAsset.symbol : 'Stable');
  setText(elements.wrappedSymbol, wrappedAsset ? wrappedAsset.symbol : 'Wrapped');

  populateAssetSelect();
}

async function readConfig() {
  const response = await fetch('/api/config', { cache: 'no-store' });

  if (!response.ok) {
    throw new Error('Unable to load runtime configuration.');
  }

  state.config = await response.json();
  state.assets = buildAssets(state.config);
  renderConfig();
}

async function request(method, params = []) {
  if (!state.provider) {
    throw new Error('No injected wallet provider found. Install MetaMask or a compatible wallet.');
  }

  return state.provider.request({ method, params });
}

async function connectWallet() {
  const accounts = await request('eth_requestAccounts');

  if (!Array.isArray(accounts) || !accounts[0]) {
    throw new Error('Wallet returned no accounts.');
  }

  state.account = accounts[0];
  state.chainIdHex = await request('eth_chainId');
  setText(elements.accountAddress, state.account);
  setText(elements.accountPill, shortValue(state.account));

  if (safeLower(state.chainIdHex) !== safeLower(state.config.network.chainIdHex)) {
    setWalletStatus(`Connected on ${state.chainIdHex}. Switch to ${state.config.network.chainName}.`);
  } else {
    setWalletStatus(`Connected to ${state.config.network.chainName}.`);
  }

  await refreshBalances();
  await loadRemoteActivity();
}

async function addOrSwitchNetwork() {
  const config = state.config.network;

  try {
    await request('wallet_switchEthereumChain', [{ chainId: config.chainIdHex }]);
  } catch (error) {
    if (error && error.code !== 4902) {
      throw error;
    }

    await request('wallet_addEthereumChain', [
      {
        chainId: config.chainIdHex,
        chainName: config.chainName,
        nativeCurrency: {
          name: config.currency.symbol,
          symbol: config.currency.symbol,
          decimals: config.currency.decimals
        },
        rpcUrls: [config.rpcUrl],
        blockExplorerUrls: config.explorerUrl ? [config.explorerUrl] : []
      }
    ]);
  }

  state.chainIdHex = config.chainIdHex;
  setWalletStatus(`Wallet aligned to ${config.chainName}.`);
}

async function refreshBalances() {
  if (!state.account) {
    setText(elements.nativeBalance, '-');
    setText(elements.stableBalance, '-');
    setText(elements.wrappedBalance, '-');
    return;
  }

  const nativeHex = await request('eth_getBalance', [state.account, 'latest']);
  const nativeValue = formatUnits(hexToBigInt(nativeHex), state.config.network.currency.decimals);
  setText(elements.nativeBalance, nativeValue);

  for (const asset of state.assets.filter((item) => item.kind === 'erc20')) {
    const callResult = await request('eth_call', [{ to: asset.address, data: buildBalanceOfData(state.account) }, 'latest']);
    const formatted = formatUnits(hexToBigInt(callResult), asset.decimals);

    if (asset.key === 'stable') {
      setText(elements.stableBalance, formatted);
    }

    if (asset.key === 'wrapped') {
      setText(elements.wrappedBalance, formatted);
    }
  }
}

async function resolveRecipient(rawRecipient) {
  const recipient = String(rawRecipient || '').trim();

  if (!recipient) {
    throw new Error('Recipient is required.');
  }

  if (isAddress(recipient)) {
    setText(elements.resolutionPreview, `Direct address: ${recipient}`);
    return { address: recipient, label: recipient };
  }

  if (!recipient.endsWith('.tip')) {
    throw new Error('Recipient must be a 0x address or a .tip name.');
  }

  if (!state.config.integrations.nameResolverUrl) {
    throw new Error('Name resolver URL is not configured yet.');
  }

  const resolverUrl = new URL(state.config.integrations.nameResolverUrl);
  resolverUrl.searchParams.set('name', recipient);

  const response = await fetch(resolverUrl.toString(), { headers: { accept: 'application/json' } });

  if (!response.ok) {
    throw new Error('Unable to resolve .tip name.');
  }

  const payload = await response.json();
  const resolvedAddress = payload.address || payload.resolvedAddress || payload.data?.address;

  if (!isAddress(resolvedAddress)) {
    throw new Error('Resolver response did not include a valid address.');
  }

  setText(elements.resolutionPreview, `${recipient} -> ${resolvedAddress}`);
  return { address: resolvedAddress, label: recipient };
}

async function sendDirectTransfer(asset, recipientAddress, amountText) {
  const amountUnits = decimalToBigInt(amountText, asset.decimals);

  if (asset.kind === 'native') {
    return request('eth_sendTransaction', [
      {
        from: state.account,
        to: recipientAddress,
        value: toHex(amountUnits)
      }
    ]);
  }

  return request('eth_sendTransaction', [
    {
      from: state.account,
      to: asset.address,
      data: buildTransferData(recipientAddress, amountUnits)
    }
  ]);
}

async function submitGaslessTransfer(asset, recipientAddress, amountText, memo, recipientLabel) {
  if (!state.config.integrations.relayerUrl) {
    throw new Error('Relayer URL is not configured yet.');
  }

  const response = await fetch(state.config.integrations.relayerUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json'
    },
    body: JSON.stringify({
      mode: 'gasless',
      senderAddress: state.account,
      recipientAddress,
      recipientLabel,
      asset: {
        key: asset.key,
        symbol: asset.symbol,
        address: asset.address,
        decimals: asset.decimals
      },
      amount: amountText,
      memo,
      chainId: state.config.network.chainId
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || 'Gasless relay request failed.');
  }

  const payload = await response.json();
  return payload.txHash || payload.hash || payload.requestId || 'relay-submitted';
}

async function loadRemoteActivity() {
  if (!state.account || !state.config.integrations.activityApiUrl) {
    renderActivity();
    return;
  }

  try {
    const url = new URL(state.config.integrations.activityApiUrl);
    url.searchParams.set('address', state.account);
    url.searchParams.set('limit', '10');

    const response = await fetch(url.toString(), { headers: { accept: 'application/json' } });

    if (!response.ok) {
      return;
    }

    const payload = await response.json();
    const entries = Array.isArray(payload.items) ? payload.items : Array.isArray(payload.activity) ? payload.activity : [];

    if (!entries.length) {
      return;
    }

    state.activity = entries.slice(0, 10).map((entry) => ({
      title: entry.title || entry.type || 'Remote activity',
      status: entry.status || 'pending',
      statusLabel: entry.statusLabel || entry.status || 'remote',
      meta: entry.meta || entry.description || shortValue(entry.hash || entry.txHash || ''),
      txUrl: entry.txHash ? explorerTxUrl(entry.txHash) : ''
    }));
    renderActivity();
  } catch (error) {
    console.warn(error);
  }
}

async function handleTransfer(event) {
  event.preventDefault();

  try {
    if (!state.account) {
      throw new Error('Connect your wallet first.');
    }

    if (safeLower(state.chainIdHex) !== safeLower(state.config.network.chainIdHex)) {
      throw new Error(`Switch to ${state.config.network.chainName} before sending.`);
    }

    const recipient = await resolveRecipient(elements.recipientInput.value);
    const asset = getAssetByKey(elements.assetSelect.value);
    const mode = elements.modeSelect.value;
    const amount = elements.amountInput.value;
    const memo = elements.memoInput.value.trim();

    if (!asset) {
      throw new Error('Select an asset first.');
    }

    setTransferStatus(`Submitting ${mode} transfer...`);

    if (mode === 'gasless') {
      await submitGaslessTransfer(asset, recipient.address, amount, memo, recipient.label);
      setTransferStatus('Gasless transfer request accepted.', 'success');
      pushActivity({
        title: `${asset.symbol} gasless transfer`,
        status: 'success',
        statusLabel: 'relay queued',
        meta: `${amount} to ${recipient.label}`
      });
    } else {
      const transactionReference = await sendDirectTransfer(asset, recipient.address, amount);
      const txUrl = explorerTxUrl(transactionReference);

      setTransferStatus(`Transaction sent: ${transactionReference}`, 'success');
      pushActivity({
        title: `${asset.symbol} direct transfer`,
        status: 'success',
        statusLabel: 'submitted',
        meta: `${amount} to ${recipient.label}`,
        txUrl
      });
    }

    elements.transferForm.reset();
    setText(elements.resolutionPreview, 'Recipient not resolved yet.');
    await refreshBalances();
    await loadRemoteActivity();
  } catch (error) {
    setTransferStatus(error.message || 'Transfer failed.', 'error');
    pushActivity({
      title: 'Transfer failed',
      status: 'error',
      statusLabel: 'error',
      meta: error.message || 'Unknown error'
    });
  }
}

function bindProviderEvents() {
  if (!state.provider || typeof state.provider.on !== 'function') {
    return;
  }

  state.provider.on('accountsChanged', async (accounts) => {
    state.account = accounts && accounts[0] ? accounts[0] : '';
    setText(elements.accountAddress, state.account || 'Not connected');
    setText(elements.accountPill, state.account ? shortValue(state.account) : 'No wallet');

    if (state.account) {
      await refreshBalances();
      await loadRemoteActivity();
    } else {
      setWalletStatus('Wallet disconnected.');
      renderActivity();
    }
  });

  state.provider.on('chainChanged', async (chainIdHex) => {
    state.chainIdHex = chainIdHex;

    if (safeLower(chainIdHex) === safeLower(state.config.network.chainIdHex)) {
      setWalletStatus(`Connected to ${state.config.network.chainName}.`);
      await refreshBalances();
    } else {
      setWalletStatus(`Connected chain changed to ${chainIdHex}. Switch back to ${state.config.network.chainName}.`);
    }
  });
}

async function bootstrap() {
  try {
    await readConfig();
    bindProviderEvents();
    renderActivity();
    setTransferStatus('Gasless mode activates when a relay URL is configured.');

    if (!state.provider) {
      setWalletStatus('No browser wallet detected. Install MetaMask to connect.');
    }
  } catch (error) {
    console.error(error);
    setWalletStatus('Unable to initialize wallet UI.');
    setTransferStatus(error.message || 'Runtime bootstrap failed.', 'error');
  }
}

elements.connectButton.addEventListener('click', async () => {
  try {
    await connectWallet();
  } catch (error) {
    setWalletStatus(error.message || 'Wallet connection failed.');
  }
});

elements.addNetworkButton.addEventListener('click', async () => {
  try {
    await addOrSwitchNetwork();
  } catch (error) {
    setWalletStatus(error.message || 'Unable to add network.');
  }
});

elements.refreshButton.addEventListener('click', async () => {
  try {
    await refreshBalances();
    await loadRemoteActivity();
    setWalletStatus('Wallet data refreshed.');
  } catch (error) {
    setWalletStatus(error.message || 'Refresh failed.');
  }
});

elements.transferForm.addEventListener('submit', handleTransfer);

elements.recipientInput.addEventListener('blur', async () => {
  if (!elements.recipientInput.value.trim()) {
    setText(elements.resolutionPreview, 'Recipient not resolved yet.');
    return;
  }

  try {
    await resolveRecipient(elements.recipientInput.value);
  } catch (error) {
    setText(elements.resolutionPreview, error.message || 'Recipient could not be resolved.');
  }
});

bootstrap();
