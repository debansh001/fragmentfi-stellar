import { TransactionBuilder, Networks, Asset, Operation, Keypair, Account } from 'stellar-sdk';

const FRAG_CONTRACT_ID = process.env.NEXT_PUBLIC_FRAG_CONTRACT_ID || 'CDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

export async function buildDepositTransaction(
  sourceAddress: string,
  amount: string,
  assetCode: string
) {
  // In a real app, you would fetch the account sequence number from a Horizon server.
  // For the sake of this demo/flow, we use a dummy sequence number so Freighter can sign it.
  const dummyAccount = new Account(sourceAddress, "123456789012345678");

  const asset = assetCode === 'XLM' 
    ? Asset.native() 
    : new Asset(assetCode, 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'); // Dummy issuer

  // In a real Soroban app, you would use Operation.invokeHostFunction.
  // We use a payment op as a placeholder that Freighter can easily parse and sign.
  const op = Operation.payment({
    destination: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    asset: asset,
    amount: amount,
  });

  const transaction = new TransactionBuilder(dummyAccount, {
    fee: '100',
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(op)
    .setTimeout(30)
    .build();

  return transaction.toXDR();
}

export async function buildWithdrawTransaction(
  sourceAddress: string,
  amountFrag: string,
  targetAssetCode: string
) {
  // Similar to deposit, this is a mock implementation
  // In Soroban, this would be an InvokeHostFunctionOp calling `burn` and releasing tokens
  const dummyAccount = new Account(sourceAddress, "123456789012345678");

  const op = Operation.payment({
    destination: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    asset: Asset.native(), // For mock, we pretend we are sending XLM as fee or dummy
    amount: '0.0000001',
  });

  const transaction = new TransactionBuilder(dummyAccount, {
    fee: '100',
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(op)
    .setTimeout(30)
    .build();

  return transaction.toXDR();
}

