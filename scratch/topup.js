const { Keypair, TransactionBuilder, Networks, rpc, Contract, Address, nativeToScVal } = require('@stellar/stellar-sdk');

(async () => {
  try {
    const kp = Keypair.random();
    console.log('Funding new account: ' + kp.publicKey());
    await fetch('https://friendbot.stellar.org/?addr=' + kp.publicKey());
    
    const server = new rpc.Server('https://soroban-testnet.stellar.org');
    const account = await server.getAccount(kp.publicKey());
    
    const nativeContract = new Contract('CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC');
    
    // Transfer 9000 XLM (90000000000 stroops)
    const amountStroops = BigInt(9000 * 10000000);
    
    const tx = new TransactionBuilder(account, {
      fee: '100000',
      networkPassphrase: Networks.TESTNET,
    })
    .addOperation(
      nativeContract.call(
        'transfer',
        new Address(kp.publicKey()).toScVal(),
        new Address('CBT7IR4OYDQMAKZTJFJ3FA5JWSEBI5U7QXFM4TYCGDZ35SOOVKIZFPNS').toScVal(),
        nativeToScVal(amountStroops, { type: 'i128' })
      )
    )
    .setTimeout(300)
    .build();
    
    console.log('Simulating...');
    const sim = await server.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(sim)) {
      console.error(sim.error);
      return;
    }
    
    const assembledTx = rpc.assembleTransaction(tx, sim).build();
    assembledTx.sign(kp);
    
    console.log('Sending...');
    const result = await server.sendTransaction(assembledTx);
    console.log('Result:', result.status, result.hash);
  } catch(e) {
    console.error(e);
  }
})();
