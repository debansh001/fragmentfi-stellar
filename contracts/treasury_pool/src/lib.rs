#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env, symbol_short};

mod frag_token_contract {
    soroban_sdk::contractimport!(
        file = "../../target/wasm/frag_token/frag_token.wasm"
    );
}

use frag_token_contract::Client as FragTokenClient;

const INSTANCE_BUMP_AMOUNT: u32 = 518400; // ~30 days
const INSTANCE_LIFETIME_THRESHOLD: u32 = 172800; // ~10 days

#[contracttype]
pub enum StorageKey {
    FragToken,
    XlmToken,
    UsdcToken,
    Admin,
}

fn extend_instance_ttl(env: &Env) {
    env.storage().instance().extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
}

#[contract]
pub struct TreasuryPool;

#[contractimpl]
impl TreasuryPool {
    pub fn initialize(env: Env, admin: Address, frag_token: Address, xlm_token: Address, usdc_token: Address) {
        if env.storage().instance().has(&StorageKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&StorageKey::Admin, &admin);
        env.storage().instance().set(&StorageKey::FragToken, &frag_token);
        env.storage().instance().set(&StorageKey::XlmToken, &xlm_token);
        env.storage().instance().set(&StorageKey::UsdcToken, &usdc_token);
        extend_instance_ttl(&env);
    }

    pub fn deposit(env: Env, user: Address, amount: i128) {
        user.require_auth();
        if amount <= 0 { panic!("amount must be positive"); }
        extend_instance_ttl(&env);

        let xlm_token: Address = env.storage().instance().get(&StorageKey::XlmToken).unwrap();
        let frag_token: Address = env.storage().instance().get(&StorageKey::FragToken).unwrap();

        let xlm_client = token::Client::new(&env, &xlm_token);
        xlm_client.transfer(&user, &env.current_contract_address(), &amount);

        let frag_client = FragTokenClient::new(&env, &frag_token);
        frag_client.mint(&user, &amount);

        env.events().publish((symbol_short!("deposit"), user), amount);
    }

    pub fn deposit_usdc(env: Env, user: Address, amount: i128) {
        user.require_auth();
        if amount <= 0 { panic!("amount must be positive"); }
        extend_instance_ttl(&env);

        let usdc_token: Address = env.storage().instance().get(&StorageKey::UsdcToken).unwrap();
        let frag_token: Address = env.storage().instance().get(&StorageKey::FragToken).unwrap();

        let usdc_client = token::Client::new(&env, &usdc_token);
        usdc_client.transfer(&user, &env.current_contract_address(), &amount);

        let frag_client = FragTokenClient::new(&env, &frag_token);
        frag_client.mint(&user, &amount);

        env.events().publish((symbol_short!("dep_usdc"), user), amount);
    }

    pub fn withdraw(env: Env, user: Address, frag_amount: i128) {
        user.require_auth();
        if frag_amount <= 0 { panic!("amount must be positive"); }
        extend_instance_ttl(&env);

        let xlm_token: Address = env.storage().instance().get(&StorageKey::XlmToken).unwrap();
        let frag_token: Address = env.storage().instance().get(&StorageKey::FragToken).unwrap();

        let frag_client = FragTokenClient::new(&env, &frag_token);
        // Note: For SEP-41 standard, this uses burn from admin since Treasury is admin, 
        // but user auth is passed from the require_auth above to FragToken due to invocation auth.
        frag_client.burn(&user, &frag_amount);

        let xlm_client = token::Client::new(&env, &xlm_token);
        xlm_client.transfer(&env.current_contract_address(), &user, &frag_amount);

        env.events().publish((symbol_short!("withdraw"), user), frag_amount);
    }

    pub fn withdraw_usdc(env: Env, user: Address, frag_amount: i128) {
        user.require_auth();
        if frag_amount <= 0 { panic!("amount must be positive"); }
        extend_instance_ttl(&env);

        let usdc_token: Address = env.storage().instance().get(&StorageKey::UsdcToken).unwrap();
        let frag_token: Address = env.storage().instance().get(&StorageKey::FragToken).unwrap();

        let frag_client = FragTokenClient::new(&env, &frag_token);
        frag_client.burn(&user, &frag_amount);

        let usdc_client = token::Client::new(&env, &usdc_token);
        usdc_client.transfer(&env.current_contract_address(), &user, &frag_amount);

        env.events().publish((symbol_short!("wd_usdc"), user), frag_amount);
    }

    pub fn get_pool_balance(env: Env) -> i128 {
        extend_instance_ttl(&env);
        let xlm_token: Address = env.storage().instance().get(&StorageKey::XlmToken).unwrap();
        let xlm_client = token::Client::new(&env, &xlm_token);
        xlm_client.balance(&env.current_contract_address())
    }

    pub fn get_usdc_balance(env: Env) -> i128 {
        extend_instance_ttl(&env);
        let usdc_token: Address = env.storage().instance().get(&StorageKey::UsdcToken).unwrap();
        let usdc_client = token::Client::new(&env, &usdc_token);
        usdc_client.balance(&env.current_contract_address())
    }

    pub fn get_reserve_ratio(env: Env) -> i128 {
        extend_instance_ttl(&env);
        let frag_token: Address = env.storage().instance().get(&StorageKey::FragToken).unwrap();
        let frag_client = FragTokenClient::new(&env, &frag_token);
        let supply = frag_client.total_supply();
        
        if supply == 0 {
            return 100;
        }

        // Just an aggregate proxy calculation.
        let pool_balance = Self::get_pool_balance(env.clone());
        let usdc_balance = Self::get_usdc_balance(env.clone());
        let total_collateral = pool_balance + usdc_balance;
        (total_collateral * 100) / supply
    }

    pub fn get_user_share(env: Env, user: Address) -> i128 {
        extend_instance_ttl(&env);
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

        let admin = Address::generate(&env);
        let user = Address::generate(&env);

        let xlm_admin = Address::generate(&env);
        let xlm_contract = env.register_stellar_asset_contract_v2(xlm_admin.clone());
        let xlm_token_id = xlm_contract.address();
        let xlm_client = token::Client::new(&env, &xlm_token_id);
        let xlm_admin_client = StellarAssetClient::new(&env, &xlm_token_id);
        xlm_admin_client.mint(&user, &1000);

        let usdc_admin = Address::generate(&env);
        let usdc_contract = env.register_stellar_asset_contract_v2(usdc_admin.clone());
        let usdc_token_id = usdc_contract.address();
        let usdc_client = token::Client::new(&env, &usdc_token_id);
        let usdc_admin_client = StellarAssetClient::new(&env, &usdc_token_id);
        usdc_admin_client.mint(&user, &1000);

        let frag_token_id = env.register(FragToken, ());
        let frag_client = FragTokenClient::new(&env, &frag_token_id);

        let pool_id = env.register(TreasuryPool, ());
        let pool_client = TreasuryPoolClient::new(&env, &pool_id);

        frag_client.initialize(&pool_id);
        pool_client.initialize(&admin, &frag_token_id, &xlm_token_id, &usdc_token_id);

        pool_client.deposit(&user, &100);
        assert_eq!(xlm_client.balance(&user), 900);
        assert_eq!(xlm_client.balance(&pool_id), 100);
        assert_eq!(frag_client.balance(&user), 100);

        pool_client.deposit_usdc(&user, &200);
        assert_eq!(usdc_client.balance(&user), 800);
        assert_eq!(usdc_client.balance(&pool_id), 200);
        assert_eq!(frag_client.balance(&user), 300);

        pool_client.withdraw(&user, &50);
        assert_eq!(xlm_client.balance(&user), 950);
        assert_eq!(xlm_client.balance(&pool_id), 50);
        assert_eq!(frag_client.balance(&user), 250);

        pool_client.withdraw_usdc(&user, &200);
        assert_eq!(usdc_client.balance(&user), 1000);
        assert_eq!(usdc_client.balance(&pool_id), 0);
        assert_eq!(frag_client.balance(&user), 50);
    }
}
