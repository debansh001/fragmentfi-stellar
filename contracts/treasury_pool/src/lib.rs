#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env};

mod frag_token_contract {
    soroban_sdk::contractimport!(
        file = "../../target/wasm/frag_token/frag_token.wasm"
    );
}

use frag_token_contract::Client as FragTokenClient;

#[contracttype]
pub enum StorageKey {
    FragToken,
    XlmToken,
    Admin,
}

#[contract]
pub struct TreasuryPool;

#[contractimpl]
impl TreasuryPool {
    pub fn initialize(env: Env, admin: Address, frag_token: Address, xlm_token: Address) {
        if env.storage().instance().has(&StorageKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&StorageKey::Admin, &admin);
        env.storage().instance().set(&StorageKey::FragToken, &frag_token);
        env.storage().instance().set(&StorageKey::XlmToken, &xlm_token);
    }

    pub fn deposit(env: Env, user: Address, amount: i128) {
        user.require_auth();

        if amount <= 0 {
            panic!("amount must be positive");
        }

        let xlm_token: Address = env.storage().instance().get(&StorageKey::XlmToken).unwrap();
        let frag_token: Address = env.storage().instance().get(&StorageKey::FragToken).unwrap();

        // Transfer XLM from user to pool
        let xlm_client = token::Client::new(&env, &xlm_token);
        xlm_client.transfer(&user, &env.current_contract_address(), &amount);

        // Mint FRAG to user (TreasuryPool is the admin of FragToken)
        let frag_client = FragTokenClient::new(&env, &frag_token);
        frag_client.mint(&user, &amount);
    }

    pub fn withdraw(env: Env, user: Address, frag_amount: i128) {
        user.require_auth();

        if frag_amount <= 0 {
            panic!("amount must be positive");
        }

        let xlm_token: Address = env.storage().instance().get(&StorageKey::XlmToken).unwrap();
        let frag_token: Address = env.storage().instance().get(&StorageKey::FragToken).unwrap();

        // Burn FRAG from user
        let frag_client = FragTokenClient::new(&env, &frag_token);
        frag_client.burn(&user, &frag_amount);

        // Transfer XLM from pool to user
        let xlm_client = token::Client::new(&env, &xlm_token);
        xlm_client.transfer(&env.current_contract_address(), &user, &frag_amount);
    }

    pub fn get_pool_balance(env: Env) -> i128 {
        let xlm_token: Address = env.storage().instance().get(&StorageKey::XlmToken).unwrap();
        let xlm_client = token::Client::new(&env, &xlm_token);
        xlm_client.balance(&env.current_contract_address())
    }

    pub fn get_reserve_ratio(env: Env) -> i128 {
        let frag_token: Address = env.storage().instance().get(&StorageKey::FragToken).unwrap();
        let frag_client = FragTokenClient::new(&env, &frag_token);
        let supply = frag_client.total_supply();
        
        if supply == 0 {
            return 100;
        }

        let pool_balance = Self::get_pool_balance(env.clone());
        (pool_balance * 100) / supply
    }

    pub fn get_user_share(env: Env, user: Address) -> i128 {
        let frag_token: Address = env.storage().instance().get(&StorageKey::FragToken).unwrap();
        let frag_client = FragTokenClient::new(&env, &frag_token);
        frag_client.balance(&user)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env, Address};
    use frag_token::FragToken;
    use soroban_sdk::token::StellarAssetClient;

    #[test]
    fn test_deposit_withdraw() {
        let env = Env::default();
        env.mock_all_auths();

        // 1. Setup Admin and User
        let admin = Address::generate(&env);
        let user = Address::generate(&env);

        // 2. Setup Native XLM Token (using Stellar Asset Contract)
        let xlm_admin = Address::generate(&env);
        let xlm_contract = env.register_stellar_asset_contract_v2(xlm_admin.clone());
        let xlm_token_id = xlm_contract.address();
        let xlm_client = token::Client::new(&env, &xlm_token_id);
        let xlm_admin_client = StellarAssetClient::new(&env, &xlm_token_id);
        
        // Mint initial XLM to user
        xlm_admin_client.mint(&user, &1000);

        // 3. Setup FRAG Token
        let frag_token_id = env.register(FragToken, ());
        let frag_client = FragTokenClient::new(&env, &frag_token_id);

        // 4. Setup Treasury Pool
        let pool_id = env.register(TreasuryPool, ());
        let pool_client = TreasuryPoolClient::new(&env, &pool_id);

        // 5. Initialize contracts
        // Treasury Pool is the admin of the FRAG token
        frag_client.initialize(&pool_id);
        pool_client.initialize(&admin, &frag_token_id, &xlm_token_id);

        // 6. Test Deposit: deposit 100 XLM
        pool_client.deposit(&user, &100);

        // Check balances after deposit
        assert_eq!(xlm_client.balance(&user), 900);
        assert_eq!(xlm_client.balance(&pool_id), 100);
        assert_eq!(frag_client.balance(&user), 100);
        assert_eq!(pool_client.get_pool_balance(), 100);
        assert_eq!(pool_client.get_reserve_ratio(), 100);
        assert_eq!(pool_client.get_user_share(&user), 100);

        // 7. Test Withdraw: withdraw 50 FRAG
        pool_client.withdraw(&user, &50);

        // Check balances after withdraw
        assert_eq!(xlm_client.balance(&user), 950);
        assert_eq!(xlm_client.balance(&pool_id), 50);
        assert_eq!(frag_client.balance(&user), 50);
        assert_eq!(pool_client.get_pool_balance(), 50);
        assert_eq!(pool_client.get_reserve_ratio(), 100);
        assert_eq!(pool_client.get_user_share(&user), 50);
    }
}
