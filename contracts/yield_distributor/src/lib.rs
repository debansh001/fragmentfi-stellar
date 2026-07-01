#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env};
use frag_token::FragTokenClient;

#[contracttype]
pub enum DataKey {
    Admin,
    FragToken,
    XlmToken,
    AccruedYieldPerShare,      // scaled by 1e9
    UserYieldIndex(Address),   // tracks the last AccruedYieldPerShare for a user
    UserPendingYield(Address), // tracks pending yield ready to claim
}

const SCALE: i128 = 1_000_000_000; // 1e9

#[contract]
pub struct YieldDistributor;

#[contractimpl]
impl YieldDistributor {
    pub fn initialize(env: Env, admin: Address, frag_token: Address, xlm_token: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::FragToken, &frag_token);
        env.storage().instance().set(&DataKey::XlmToken, &xlm_token);
        env.storage().instance().set(&DataKey::AccruedYieldPerShare, &0i128);
    }

    /// Records the user's current pending yield based on their balance before any new distributions
    pub fn take_snapshot(env: Env, user: Address) {
        let frag_token: Address = env.storage().instance().get(&DataKey::FragToken).unwrap();
        let frag_client = FragTokenClient::new(&env, &frag_token);
        
        let user_balance = frag_client.balance(&user);
        let global_index: i128 = env.storage().instance().get(&DataKey::AccruedYieldPerShare).unwrap_or(0);
        let user_index: i128 = env.storage().persistent().get(&DataKey::UserYieldIndex(user.clone())).unwrap_or(0);
        
        if user_balance > 0 {
            let pending_delta = (user_balance * (global_index - user_index)) / SCALE;
            let mut current_pending: i128 = env.storage().persistent().get(&DataKey::UserPendingYield(user.clone())).unwrap_or(0);
            current_pending += pending_delta;
            env.storage().persistent().set(&DataKey::UserPendingYield(user.clone()), &current_pending);
        }
        
        env.storage().persistent().set(&DataKey::UserYieldIndex(user), &global_index);
    }

    /// Distributes a simulated 4.5% APY weekly yield based on the total pool balance
    pub fn distribute(env: Env, pool_balance: i128) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        // 4.5% APY = 0.045
        // Weekly = pool_balance * 45 / 1000 / 52
        let total_yield = (pool_balance * 45) / 52000;

        if total_yield == 0 {
            return;
        }

        let frag_token: Address = env.storage().instance().get(&DataKey::FragToken).unwrap();
        let frag_client = FragTokenClient::new(&env, &frag_token);
        let total_supply = frag_client.total_supply();

        if total_supply > 0 {
            let yield_per_share = (total_yield * SCALE) / total_supply;
            let mut global_index: i128 = env.storage().instance().get(&DataKey::AccruedYieldPerShare).unwrap_or(0);
            global_index += yield_per_share;
            env.storage().instance().set(&DataKey::AccruedYieldPerShare, &global_index);
        }
    }

    /// Claims the pending yield and transfers it to the user in XLM
    pub fn claim_yield(env: Env, user: Address) {
        user.require_auth();

        // Update user's pending yield to current block
        Self::take_snapshot(env.clone(), user.clone());

        let pending: i128 = env.storage().persistent().get(&DataKey::UserPendingYield(user.clone())).unwrap_or(0);
        if pending > 0 {
            // Reset pending yield
            env.storage().persistent().set(&DataKey::UserPendingYield(user.clone()), &0i128);

            // Transfer XLM yield
            let xlm_token: Address = env.storage().instance().get(&DataKey::XlmToken).unwrap();
            let xlm_client = token::Client::new(&env, &xlm_token);
            xlm_client.transfer(&env.current_contract_address(), &user, &pending);
        }
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env, Address};
    use frag_token::FragToken;
    use soroban_sdk::token::StellarAssetClient;

    #[test]
    fn test_yield_distribution() {
        let env = Env::default();
        env.mock_all_auths();

        let admin = Address::generate(&env);
        let user = Address::generate(&env);

        let xlm_admin = Address::generate(&env);
        let xlm_contract = env.register_stellar_asset_contract_v2(xlm_admin.clone());
        let xlm_token_id = xlm_contract.address();
        let xlm_client = token::Client::new(&env, &xlm_token_id);
        let xlm_admin_client = StellarAssetClient::new(&env, &xlm_token_id);

        let frag_token_id = env.register(FragToken, ());
        let frag_client = FragTokenClient::new(&env, &frag_token_id);
        frag_client.initialize(&admin);

        let dist_id = env.register(YieldDistributor, ());
        let dist_client = YieldDistributorClient::new(&env, &dist_id);
        dist_client.initialize(&admin, &frag_token_id, &xlm_token_id);

        // Fund Yield Distributor with 1000 XLM for paying out yields
        xlm_admin_client.mint(&dist_id, &1000);

        // User gets 1000 FRAG
        frag_client.mint(&user, &1000);

        // User interacts, updates snapshot (0 pending)
        dist_client.take_snapshot(&user);

        // Simulate 1 week distribution with a pool balance of 1,000,000
        // Yield = 1,000,000 * 45 / 52000 = 865
        dist_client.distribute(&1_000_000);

        // User claims yield
        dist_client.claim_yield(&user);

        // User holds 100% of supply, should receive the entire 865 XLM yield
        assert_eq!(xlm_client.balance(&user), 865);
    }
}
