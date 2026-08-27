#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env, symbol_short, Symbol, vec};

mod frag_token_contract {
    soroban_sdk::contractimport!(
        file = "../../target/wasm/frag_token/frag_token.wasm"
    );
}

use frag_token_contract::Client as FragTokenClient;

const INSTANCE_BUMP_AMOUNT: u32 = 518400; 
const INSTANCE_LIFETIME_THRESHOLD: u32 = 172800; 

const PERSISTENT_BUMP_AMOUNT: u32 = 518400; 
const PERSISTENT_LIFETIME_THRESHOLD: u32 = 172800;

#[contracttype]
pub enum StorageKey {
    Admin,
    FragToken,
    XlmToken,
    TreasuryPool,
    AccruedYieldPerShare,      // scaled by 1e9
    UserYieldIndex(Address),   
    UserPendingYield(Address), 
}

const SCALE: i128 = 1_000_000_000; // 1e9

fn extend_instance_ttl(env: &Env) {
    env.storage().instance().extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
}

fn extend_persistent_ttl(env: &Env, key: &StorageKey) {
    env.storage().persistent().extend_ttl(key, PERSISTENT_LIFETIME_THRESHOLD, PERSISTENT_BUMP_AMOUNT);
}

#[contract]
pub struct YieldDistributor;

#[contractimpl]
impl YieldDistributor {
    pub fn initialize(env: Env, admin: Address, frag_token: Address, xlm_token: Address, treasury_pool: Address) {
        if env.storage().instance().has(&StorageKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&StorageKey::Admin, &admin);
        env.storage().instance().set(&StorageKey::FragToken, &frag_token);
        env.storage().instance().set(&StorageKey::XlmToken, &xlm_token);
        env.storage().instance().set(&StorageKey::TreasuryPool, &treasury_pool);
        env.storage().instance().set(&StorageKey::AccruedYieldPerShare, &0i128);
        extend_instance_ttl(&env);
    }

    pub fn take_snapshot(env: Env, user: Address) {
        extend_instance_ttl(&env);
        let frag_token: Address = env.storage().instance().get(&StorageKey::FragToken).unwrap();
        let frag_client = FragTokenClient::new(&env, &frag_token);
        
        let user_balance = frag_client.balance(&user);
        let global_index: i128 = env.storage().instance().get(&StorageKey::AccruedYieldPerShare).unwrap_or(0);
        
        let idx_key = StorageKey::UserYieldIndex(user.clone());
        let user_index: i128 = env.storage().persistent().get(&idx_key).unwrap_or(0);
        
        if user_balance > 0 {
            let pending_delta = (user_balance * (global_index - user_index)) / SCALE;
            let pending_key = StorageKey::UserPendingYield(user.clone());
            let mut current_pending: i128 = env.storage().persistent().get(&pending_key).unwrap_or(0);
            current_pending += pending_delta;
            env.storage().persistent().set(&pending_key, &current_pending);
            extend_persistent_ttl(&env, &pending_key);
        }
        
        env.storage().persistent().set(&idx_key, &global_index);
        extend_persistent_ttl(&env, &idx_key);

        env.events().publish((symbol_short!("snapshot"), user.clone()), user_balance);
    }

    pub fn distribute(env: Env) {
        let admin: Address = env.storage().instance().get(&StorageKey::Admin).unwrap();
        admin.require_auth();
        extend_instance_ttl(&env);

        let treasury_pool: Address = env.storage().instance().get(&StorageKey::TreasuryPool).unwrap();
        
        let pool_balance: i128 = env.invoke_contract(
            &treasury_pool,
            &Symbol::new(&env, "get_pool_balance"),
            vec![&env]
        );

        let usdc_balance: i128 = env.invoke_contract(
            &treasury_pool,
            &Symbol::new(&env, "get_usdc_balance"),
            vec![&env]
        );

        let total_collateral = pool_balance + usdc_balance;
        let total_yield = (total_collateral * 45) / 52000;

        if total_yield == 0 {
            return;
        }

        let frag_token: Address = env.storage().instance().get(&StorageKey::FragToken).unwrap();
        let frag_client = FragTokenClient::new(&env, &frag_token);
        let total_supply = frag_client.total_supply();

        if total_supply > 0 {
            let yield_per_share = (total_yield * SCALE) / total_supply;
            let mut global_index: i128 = env.storage().instance().get(&StorageKey::AccruedYieldPerShare).unwrap_or(0);
            global_index += yield_per_share;
            env.storage().instance().set(&StorageKey::AccruedYieldPerShare, &global_index);
            
            env.events().publish((symbol_short!("yield_dst"), total_collateral), yield_per_share);
        }
    }

    pub fn claim_yield(env: Env, user: Address) {
        user.require_auth();
        extend_instance_ttl(&env);

        Self::take_snapshot(env.clone(), user.clone());

        let pending_key = StorageKey::UserPendingYield(user.clone());
        let pending: i128 = env.storage().persistent().get(&pending_key).unwrap_or(0);
        
        if pending > 0 {
            env.storage().persistent().set(&pending_key, &0i128);
            extend_persistent_ttl(&env, &pending_key);

            let xlm_token: Address = env.storage().instance().get(&StorageKey::XlmToken).unwrap();
            let xlm_client = token::Client::new(&env, &xlm_token);
            xlm_client.transfer(&env.current_contract_address(), &user, &pending);

            env.events().publish((symbol_short!("yield_clm"), user.clone()), pending);
        }
    }
}
