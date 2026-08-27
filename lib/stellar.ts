import { 
  TransactionBuilder, 
  Networks, 
  rpc, 
  Contract, 
  nativeToScVal, 
  scValToNative,
  Address,
  Account,
  Keypair,
  xdr as StellarXdr,
  Operation,
  Asset,
  Horizon
} from '@stellar/stellar-sdk';

const FRAG_CONTRACT_ID = process.env.NEXT_PUBLIC_FRAG_CONTRACT_ID || 'CDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
const TREASURY_CONTRACT_ID = process.env.NEXT_PUBLIC_TREASURY_CONTRACT_ID || 'CTREASURYXTESTXCONTRACTXIDXXXXXXXXXXXXXXXXXXXXXXXX';
const YIELD_CONTRACT_ID = process.env.NEXT_PUBLIC_YIELD_CONTRACT_ID || 'CYIELDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

// USDC TESTNET Mock Issuer
const USDC_ISSUER = 'GAPZKDPK4H237SGRTPS65MS3B6ZHIPP5Q2EHVX6RPQBR5CZOS7KCS35U';
const USDC_ASSET = new Asset('USDC', USDC_ISSUER);

const RPC_URL = 'https://soroban-testnet.stellar.org';
const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const NETWORK_PASSPHRASE = Networks.TESTNET;

let _server: InstanceType<typeof rpc.Server> | null = null;
function getServer() {
  if (!_server) _server = new rpc.Server(RPC_URL);
  return _server;
}

let _horizon: InstanceType<typeof Horizon.Server> | null = null;
function getHorizon() {
  if (!_horizon) _horizon = new Horizon.Server(HORIZON_URL);
  return _horizon;
}

function decodeErrorResult(errorResult: any): string {
  try {
    if (!errorResult) return 'Unknown contract error.';
    const raw = typeof errorResult === 'string' ? errorResult : JSON.stringify(errorResult);
    if (raw === '[object Object]' || raw === 'null') {
      return 'Contract invocation failed. This usually means: insufficient XLM balance, contract not initialized, or invalid parameters.';
    }
    if (/^[A-Za-z0-9+/=]{20,}$/.test(raw)) {
      try {
        const parsed = StellarXdr.TransactionResult.fromXDR(raw, 'base64');
        const result = parsed.result();
        return `Contract rejected the transaction. Code: ${result.switch().name}`;
      } catch {}
    }
    if (raw.includes('txBadAuth')) return 'Transaction authentication failed.';
    if (raw.includes('txBadSeq')) return 'Transaction sequence number mismatch.';
    if (raw.includes('txInsufficientBalance')) return 'Insufficient XLM balance.';
    return raw;
  } catch {
    return 'Contract invocation failed. Check your XLM balance and try again.';
  }
}

export async function buildDepositTransaction(
  sourceAddress: string,
  amountStr: string,
  assetCode: string
): Promise<string> {
  const account = await getServer().getAccount(sourceAddress);
  const amountStroops = BigInt(Math.floor(parseFloat(amountStr) * 10_000_000));
  const contract = new Contract(TREASURY_CONTRACT_ID);
  
  const methodName = assetCode === 'USDC' ? "deposit_usdc" : "deposit";

  const tx = new TransactionBuilder(account, { fee: '100000', networkPassphrase: NETWORK_PASSPHRASE })
    .addOperation(
      contract.call(methodName, new Address(sourceAddress).toScVal(), nativeToScVal(amountStroops, { type: 'i128' }))
    )
    .setTimeout(300)
    .build();

  const simResult = await getServer().simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simResult)) {
    throw new Error(`Transaction simulation failed: ${simResult.error}`);
  }
  return rpc.assembleTransaction(tx, simResult).build().toXDR();
}

/**
 * PHASE 3: Path Payment strict receive + Soroban Contract call.
 * This does a multi-hop atomic swap from XLM to USDC via Stellar DEX, 
 * then deposits the resulting USDC into the Treasury Pool.
 */
export async function buildPathPaymentTransaction(
  sourceAddress: string,
  amountUSDCStr: string,
  maxXLMStr: string
): Promise<string> {
  const account = await getServer().getAccount(sourceAddress);
  const amountUSDCStroops = BigInt(Math.floor(parseFloat(amountUSDCStr) * 10_000_000));
  const contract = new Contract(TREASURY_CONTRACT_ID);

  const tx = new TransactionBuilder(account, { fee: '100000', networkPassphrase: NETWORK_PASSPHRASE })
    .addOperation(
      Operation.pathPaymentStrictReceive({
        sendAsset: Asset.native(),
        sendMax: maxXLMStr,
        destination: sourceAddress,
        destAsset: USDC_ASSET,
        destAmount: amountUSDCStr,
        path: [] // SDEX routing
      })
    )
    .addOperation(
      contract.call("deposit_usdc", new Address(sourceAddress).toScVal(), nativeToScVal(amountUSDCStroops, { type: 'i128' }))
    )
    .setTimeout(300)
    .build();

  const simResult = await getServer().simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simResult)) {
    // If it fails on testnet, likely no liquidity on SDEX for the exact pair
    throw new Error(`Path payment simulation failed. Note: Testnet may lack SDEX liquidity. (${simResult.error})`);
  }
  return rpc.assembleTransaction(tx, simResult).build().toXDR();
}

export async function buildWithdrawTransaction(
  sourceAddress: string,
  amountFrag: string,
  targetAssetCode: string
): Promise<string> {
  const account = await getServer().getAccount(sourceAddress);
  const amountStroops = BigInt(Math.floor(parseFloat(amountFrag) * 10_000_000));
  const contract = new Contract(TREASURY_CONTRACT_ID);
  
  const methodName = targetAssetCode === 'USDC' ? "withdraw_usdc" : "withdraw";

  const tx = new TransactionBuilder(account, { fee: '100000', networkPassphrase: NETWORK_PASSPHRASE })
    .addOperation(
      contract.call(methodName, new Address(sourceAddress).toScVal(), nativeToScVal(amountStroops, { type: 'i128' }))
    )
    .setTimeout(300)
    .build();

  const simResult = await getServer().simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simResult)) {
    throw new Error(`Transaction simulation failed: ${simResult.error}`);
  }
  return rpc.assembleTransaction(tx, simResult).build().toXDR();
}

export async function getFragBalance(walletAddress: string): Promise<string> {
  try {
    const contract = new Contract(FRAG_CONTRACT_ID);
    const sourceAccount = new Account(walletAddress, "0");
    const tx = new TransactionBuilder(sourceAccount, { fee: '100', networkPassphrase: NETWORK_PASSPHRASE })
      .addOperation(contract.call("balance", new Address(walletAddress).toScVal()))
      .setTimeout(30).build();

    const simResponse = await getServer().simulateTransaction(tx);
    if (rpc.Api.isSimulationSuccess(simResponse) && simResponse.result?.retval) {
      const resultVal = scValToNative(simResponse.result.retval);
      return (Number(resultVal) / 10_000_000).toString();
    }
    return "0";
  } catch { return "0"; }
}

export async function getFragTotalSupply(): Promise<number> {
  try {
    const contract = new Contract(FRAG_CONTRACT_ID);
    const sourceAccount = new Account("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF", "0");
    const tx = new TransactionBuilder(sourceAccount, { fee: '100', networkPassphrase: NETWORK_PASSPHRASE })
      .addOperation(contract.call("total_supply")).setTimeout(30).build();

    const simResponse = await getServer().simulateTransaction(tx);
    if (rpc.Api.isSimulationSuccess(simResponse) && simResponse.result?.retval) {
      return Number(scValToNative(simResponse.result.retval)) / 10_000_000;
    }
    return 0;
  } catch { return 0; }
}

export async function getTreasuryPoolBalance(): Promise<number> {
  try {
    const contract = new Contract(TREASURY_CONTRACT_ID);
    const sourceAccount = new Account("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF", "0");
    const tx1 = new TransactionBuilder(sourceAccount, { fee: '100', networkPassphrase: NETWORK_PASSPHRASE })
      .addOperation(contract.call("get_pool_balance")).setTimeout(30).build();
    const tx2 = new TransactionBuilder(sourceAccount, { fee: '100', networkPassphrase: NETWORK_PASSPHRASE })
      .addOperation(contract.call("get_usdc_balance")).setTimeout(30).build();

    const [sim1, sim2] = await Promise.all([
      getServer().simulateTransaction(tx1),
      getServer().simulateTransaction(tx2)
    ]);

    let total = 0;
    if (rpc.Api.isSimulationSuccess(sim1) && sim1.result?.retval) {
      total += Number(scValToNative(sim1.result.retval)) / 10_000_000;
    }
    if (rpc.Api.isSimulationSuccess(sim2) && sim2.result?.retval) {
      total += Number(scValToNative(sim2.result.retval)) / 10_000_000;
    }
    return total;
  } catch { return 0; }
}

export async function buildTakeSnapshotTransaction(userAddress: string): Promise<string> {
  const account = await getServer().getAccount(userAddress);
  const contract = new Contract(YIELD_CONTRACT_ID);
  const tx = new TransactionBuilder(account, { fee: '100000', networkPassphrase: NETWORK_PASSPHRASE })
    .addOperation(contract.call("take_snapshot", new Address(userAddress).toScVal()))
    .setTimeout(300).build();

  const simResult = await getServer().simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simResult)) throw new Error(simResult.error);
  return rpc.assembleTransaction(tx, simResult).build().toXDR();
}

export async function buildClaimYieldTransaction(userAddress: string): Promise<string> {
  const account = await getServer().getAccount(userAddress);
  const contract = new Contract(YIELD_CONTRACT_ID);
  const tx = new TransactionBuilder(account, { fee: '100000', networkPassphrase: NETWORK_PASSPHRASE })
    .addOperation(contract.call("claim_yield", new Address(userAddress).toScVal()))
    .setTimeout(300).build();

  const simResult = await getServer().simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simResult)) throw new Error(simResult.error);
  return rpc.assembleTransaction(tx, simResult).build().toXDR();
}

export async function executeDistributeCron(adminSecret: string): Promise<string> {
  const keypair = Keypair.fromSecret(adminSecret);
  const account = await getServer().getAccount(keypair.publicKey());
  const contract = new Contract(YIELD_CONTRACT_ID);
  
  const tx = new TransactionBuilder(account, { fee: '100000', networkPassphrase: NETWORK_PASSPHRASE })
    .addOperation(contract.call("distribute"))
    .setTimeout(300).build();

  const simResult = await getServer().simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simResult)) throw new Error(simResult.error);
  
  const assembledTx = rpc.assembleTransaction(tx, simResult).build();
  assembledTx.sign(keypair); 
  
  const response = await getServer().sendTransaction(assembledTx as any);
  if (response.status === "ERROR") throw new Error("Cron distribution network error");
  return pollTransactionStatus(response.hash);
}

export async function submitSignedTransaction(signedXdr: string): Promise<string> {
  const tx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
  const response = await getServer().sendTransaction(tx as any);
  if (response.status === "ERROR") {
    const err = decodeErrorResult((response as any).errorResultXdr ?? (response as any).errorResult);
    throw new Error(err);
  }
  return pollTransactionStatus(response.hash);
}

/**
 * PHASE 4: Transaction polling
 * Polling loops to wait for ledger confirmation.
 */
export async function pollTransactionStatus(hash: string): Promise<string> {
  let retries = 0;
  while (retries < 15) {
    const txStatus = await getServer().getTransaction(hash);
    if (txStatus.status === 'SUCCESS') return hash;
    if (txStatus.status === 'FAILED') {
      const err = decodeErrorResult(txStatus.resultXdr);
      throw new Error(`Transaction failed on ledger: ${err}`);
    }
    await new Promise(r => setTimeout(r, 1500));
    retries++;
  }
  throw new Error("Transaction timeout waiting for ledger confirmation.");
}

/**
 * Live XLM price from SDEX
 */
export async function getLiveXlmPrice(): Promise<number> {
  try {
    const response = await fetch(`${HORIZON_URL}/order_book?selling_asset_type=native&buying_asset_code=USDC&buying_asset_issuer=${USDC_ISSUER}`);
    if (response.ok) {
      const data = await response.json();
      if (data.bids && data.bids.length > 0) {
        return parseFloat(data.bids[0].price);
      }
    }
    return 0.15; // Fallback mock price
  } catch {
    return 0.15;
  }
}
