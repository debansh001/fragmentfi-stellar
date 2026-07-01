import { 
  TransactionBuilder, 
  Networks, 
  rpc, 
  Contract, 
  xdr, 
  nativeToScVal, 
  scValToNative,
  Address,
  Account
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
 * Builds a Soroban invoke transaction to deposit XLM into the Treasury Pool
 */
export async function buildDepositTransaction(
  sourceAddress: string,
  amountStr: string,
  assetCode: string
): Promise<string> {
  const account = await getServer().getAccount(sourceAddress);
  
  // amount is converted from string to a number, and we use stroops if needed.
  // Soroban takes i128 for amounts in our contract. Let's pass it as i128.
  const amountStroops = BigInt(Math.floor(parseFloat(amountStr) * 10000000));
  
  const contract = new Contract(TREASURY_CONTRACT_ID);
  
  const tx = new TransactionBuilder(account, {
    fee: '1000', // Basic fee, Soroban requires simulateTransaction for actual fee usually, but Freighter can handle it
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call("deposit", 
        new Address(sourceAddress).toScVal(), 
        nativeToScVal(amountStroops, { type: 'i128' })
      )
    )
    .setTimeout(300)
    .build();

  // Ideally we would run server.simulateTransaction(tx) to set the footers and fee,
  // but for the sake of frontend Freighter signing, Freighter will simulate and append footprint if needed.
  return tx.toXDR();
}

/**
 * Builds a Soroban invoke transaction to withdraw XLM from the Treasury Pool by burning FRAG
 */
export async function buildWithdrawTransaction(
  sourceAddress: string,
  amountFrag: string,
  targetAssetCode: string
): Promise<string> {
  const account = await getServer().getAccount(sourceAddress);
  
  const amountStroops = BigInt(Math.floor(parseFloat(amountFrag) * 10000000));
  
  const contract = new Contract(TREASURY_CONTRACT_ID);
  
  const tx = new TransactionBuilder(account, {
    fee: '1000',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call("withdraw", 
        new Address(sourceAddress).toScVal(), 
        nativeToScVal(amountStroops, { type: 'i128' })
      )
    )
    .setTimeout(300)
    .build();

  return tx.toXDR();
}

/**
 * Reads the FRAG token balance from the blockchain
 */
export async function getFragBalance(walletAddress: string): Promise<string> {
  try {
    const contract = new Contract(FRAG_CONTRACT_ID);
    
    // Create a simulation transaction just to read state
    const sourceAccount = new Account(walletAddress, "0"); // Sequence 0 is fine for read-only simulation
    
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
      console.error("Simulation error: ", simResponse.error);
      return "0";
    }

    if (rpc.Api.isSimulationSuccess(simResponse)) {
      if (simResponse.result && simResponse.result.retval) {
        // Parse returned i128
        const resultVal = scValToNative(simResponse.result.retval);
        
        // Convert from stroops to standard units
        if (typeof resultVal === 'bigint') {
          return (Number(resultVal) / 10000000).toString();
        }
        return (Number(resultVal) / 10000000).toString();
      }
    }
    
    return "0";
  } catch (err) {
    console.error("Failed to read balance from blockchain: ", err);
    return "0";
  }
}

export async function distributeYieldOnChain(totalYield: number): Promise<string> { 
  return 'MOCK_YIELD_TX_' + Date.now(); 
}
