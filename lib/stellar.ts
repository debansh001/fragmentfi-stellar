import { 
  TransactionBuilder, 
  Networks, 
  rpc, 
  Contract, 
  nativeToScVal, 
  scValToNative,
  Address,
  Account,
  xdr as StellarXdr,
} from 'stellar-sdk';

const FRAG_CONTRACT_ID = process.env.NEXT_PUBLIC_FRAG_CONTRACT_ID || 'CDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
const TREASURY_CONTRACT_ID = process.env.NEXT_PUBLIC_TREASURY_CONTRACT_ID || 'CTREASURYXTESTXCONTRACTXIDXXXXXXXXXXXXXXXXXXXXXXXX';
const RPC_URL = 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = Networks.TESTNET;

// Lazy-init: avoid module-level crash if rpc is not ready at import time
let _server: InstanceType<typeof rpc.Server> | null = null;
function getServer() {
  if (!_server) _server = new rpc.Server(RPC_URL);
  return _server;
}

/**
 * Decodes a Soroban errorResultXdr into a human-readable string.
 */
function decodeErrorResult(errorResult: any): string {
  try {
    if (!errorResult) return 'Unknown contract error.';
    const raw = typeof errorResult === 'string' ? errorResult : JSON.stringify(errorResult);
    if (raw === '[object Object]' || raw === 'null') {
      return 'Contract invocation failed. This usually means: insufficient XLM balance, contract not initialized, or invalid parameters.';
    }
    // If it looks like base64, try to decode the XDR
    if (/^[A-Za-z0-9+/=]{20,}$/.test(raw)) {
      try {
        const parsed = StellarXdr.TransactionResult.fromXDR(raw, 'base64');
        const result = parsed.result();
        return `Contract rejected the transaction. Code: ${result.switch().name}`;
      } catch {
        // ignore parse errors, fall through
      }
    }
    return raw;
  } catch {
    return 'Contract invocation failed. Check your XLM balance and try again.';
  }
}

/**
 * Builds AND simulates a Soroban deposit transaction, attaching the required
 * ledger footprint and resource fees before Freighter signs it.
 * Without simulation, Soroban transactions always fail with an ERROR status.
 */
export async function buildDepositTransaction(
  sourceAddress: string,
  amountStr: string,
  assetCode: string
): Promise<string> {
  const account = await getServer().getAccount(sourceAddress);
  
  // Soroban takes i128 for amounts. 1 XLM = 10_000_000 stroops.
  const amountStroops = BigInt(Math.floor(parseFloat(amountStr) * 10_000_000));
  
  const contract = new Contract(TREASURY_CONTRACT_ID);
  
  const tx = new TransactionBuilder(account, {
    fee: '100000', // base fee; simulation will override with correct resource fee
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "deposit", 
        new Address(sourceAddress).toScVal(), 
        nativeToScVal(amountStroops, { type: 'i128' })
      )
    )
    .setTimeout(300)
    .build();

  // CRITICAL: simulate first to attach ledger footprint + soroban resource fees.
  // Without this the network will always reject the transaction.
  const simResult = await getServer().simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simResult)) {
    const msg = (simResult as rpc.Api.SimulateTransactionErrorResponse).error;
    if (msg.includes('not authorized') || msg.includes('require_auth')) {
      throw new Error('Transaction simulation failed: wallet authorization required. Please ensure Freighter is connected.');
    }
    if (msg.includes('balance') || msg.includes('insufficient')) {
      throw new Error('Transaction simulation failed: insufficient XLM balance to make this deposit.');
    }
    throw new Error(`Transaction simulation failed: ${msg}`);
  }

  const assembledTx = rpc.assembleTransaction(tx, simResult).build();
  return assembledTx.toXDR();
}

/**
 * Builds AND simulates a Soroban withdraw transaction.
 */
export async function buildWithdrawTransaction(
  sourceAddress: string,
  amountFrag: string,
  targetAssetCode: string
): Promise<string> {
  const account = await getServer().getAccount(sourceAddress);
  
  const amountStroops = BigInt(Math.floor(parseFloat(amountFrag) * 10_000_000));
  
  const contract = new Contract(TREASURY_CONTRACT_ID);
  
  const tx = new TransactionBuilder(account, {
    fee: '100000',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "withdraw", 
        new Address(sourceAddress).toScVal(), 
        nativeToScVal(amountStroops, { type: 'i128' })
      )
    )
    .setTimeout(300)
    .build();

  // CRITICAL: simulate first to attach ledger footprint + soroban resource fees.
  const simResult = await getServer().simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simResult)) {
    const msg = (simResult as rpc.Api.SimulateTransactionErrorResponse).error;
    if (msg.includes('balance') || msg.includes('insufficient')) {
      throw new Error('Transaction simulation failed: insufficient FRAG balance to withdraw.');
    }
    throw new Error(`Transaction simulation failed: ${msg}`);
  }

  const assembledTx = rpc.assembleTransaction(tx, simResult).build();
  return assembledTx.toXDR();
}

/**
 * Reads the FRAG token balance from the blockchain via simulation
 */
export async function getFragBalance(walletAddress: string): Promise<string> {
  try {
    const contract = new Contract(FRAG_CONTRACT_ID);
    
    // Sequence 0 is fine for read-only simulation
    const sourceAccount = new Account(walletAddress, "0");
    
    const tx = new TransactionBuilder(sourceAccount, {
      fee: '100',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call("balance", new Address(walletAddress).toScVal())
      )
      .setTimeout(30)
      .build();

    const simResponse = await getServer().simulateTransaction(tx);
    
    if (rpc.Api.isSimulationError(simResponse)) {
      console.error("Simulation error reading balance: ", simResponse.error);
      return "0";
    }

    if (rpc.Api.isSimulationSuccess(simResponse)) {
      if (simResponse.result && simResponse.result.retval) {
        const resultVal = scValToNative(simResponse.result.retval);
        if (typeof resultVal === 'bigint') {
          return (Number(resultVal) / 10_000_000).toString();
        }
        return (Number(resultVal) / 10_000_000).toString();
      }
    }
    
    return "0";
  } catch (err) {
    console.error("Failed to read balance from blockchain: ", err);
    return "0";
  }
}

/**
 * Reads the total FRAG token supply from the blockchain
 */
export async function getFragTotalSupply(): Promise<number> {
  try {
    const contract = new Contract(FRAG_CONTRACT_ID);
    const sourceAccount = new Account("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF", "0");
    const tx = new TransactionBuilder(sourceAccount, {
      fee: '100',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call("total_supply"))
      .setTimeout(30)
      .build();

    const simResponse = await getServer().simulateTransaction(tx);
    if (rpc.Api.isSimulationSuccess(simResponse) && simResponse.result && simResponse.result.retval) {
      const resultVal = scValToNative(simResponse.result.retval);
      if (typeof resultVal === 'bigint' || typeof resultVal === 'number') {
        return Number(resultVal) / 10_000_000;
      }
    }
    return 0;
  } catch (err) {
    console.error("Failed to read total supply from blockchain: ", err);
    return 0;
  }
}

/**
 * Reads the Treasury Pool XLM balance from the blockchain
 */
export async function getTreasuryPoolBalance(): Promise<number> {
  try {
    const contract = new Contract(TREASURY_CONTRACT_ID);
    const sourceAccount = new Account("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF", "0");
    const tx = new TransactionBuilder(sourceAccount, {
      fee: '100',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call("get_pool_balance"))
      .setTimeout(30)
      .build();

    const simResponse = await getServer().simulateTransaction(tx);
    if (rpc.Api.isSimulationSuccess(simResponse) && simResponse.result && simResponse.result.retval) {
      const resultVal = scValToNative(simResponse.result.retval);
      if (typeof resultVal === 'bigint' || typeof resultVal === 'number') {
        return Number(resultVal) / 10_000_000;
      }
    }
    return 0;
  } catch (err) {
    console.error("Failed to read pool balance from blockchain: ", err);
    return 0;
  }
}

export async function distributeYieldOnChain(totalYield: number): Promise<string> { 
  return 'MOCK_YIELD_TX_' + Date.now(); 
}

/**
 * Submits an already-signed XDR transaction to the Stellar network.
 * Throws a user-readable error if the ledger rejects it.
 */
export async function submitSignedTransaction(signedXdr: string): Promise<string> {
  const tx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
  const response = await getServer().sendTransaction(tx as any);
  if (response.status === "ERROR") {
    const humanError = decodeErrorResult(
      (response as any).errorResultXdr ?? (response as any).errorResult
    );
    console.error("Tx failed on ledger:", response);
    throw new Error(humanError);
  }
  return response.hash;
}
