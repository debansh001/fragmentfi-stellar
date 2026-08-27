#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, symbol_short};
use soroban_sdk::token::Interface;

const INSTANCE_BUMP_AMOUNT: u32 = 518400; // ~30 days
const INSTANCE_LIFETIME_THRESHOLD: u32 = 172800; // ~10 days

const PERSISTENT_BUMP_AMOUNT: u32 = 518400; 
const PERSISTENT_LIFETIME_THRESHOLD: u32 = 172800;

#[contracttype]
pub enum DataKey {
    Admin,
    TotalSupply,
    Balance(Address),
    Allowance(AllowanceDataKey),
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AllowanceDataKey {
    pub from: Address,
    pub spender: Address,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AllowanceValue {
    pub amount: i128,
    pub expiration_ledger: u32,
}

fn extend_instance_ttl(env: &Env) {
    env.storage().instance().extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
}

fn extend_persistent_ttl(env: &Env, key: &DataKey) {
    env.storage().persistent().extend_ttl(key, PERSISTENT_LIFETIME_THRESHOLD, PERSISTENT_BUMP_AMOUNT);
}

fn extend_temporary_ttl(env: &Env, key: &DataKey) {
    env.storage().temporary().extend_ttl(key, PERSISTENT_LIFETIME_THRESHOLD, PERSISTENT_BUMP_AMOUNT);
}

#[contract]
pub struct FragToken;

// Admin functions (mint, init)
#[contractimpl]
impl FragToken {
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TotalSupply, &0i128);
        extend_instance_ttl(&env);
    }

    pub fn mint(env: Env, to: Address, amount: i128) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        if amount < 0 {
            panic!("amount must be non-negative");
        }
        extend_instance_ttl(&env);

        let mut supply: i128 = env.storage().instance().get(&DataKey::TotalSupply).unwrap_or(0);
        supply += amount;
        env.storage().instance().set(&DataKey::TotalSupply, &supply);

        let balance_key = DataKey::Balance(to.clone());
        let mut balance: i128 = env.storage().persistent().get(&balance_key).unwrap_or(0);
        balance += amount;
        env.storage().persistent().set(&balance_key, &balance);
        extend_persistent_ttl(&env, &balance_key);

        env.events().publish((symbol_short!("mint"), admin, to), amount);
    }

    pub fn total_supply(env: Env) -> i128 {
        extend_instance_ttl(&env);
        env.storage().instance().get(&DataKey::TotalSupply).unwrap_or(0)
    }
}

// SEP-41 Token Interface
#[contractimpl]
impl Interface for FragToken {
    fn allowance(env: Env, from: Address, spender: Address) -> i128 {
        extend_instance_ttl(&env);
        let key = DataKey::Allowance(AllowanceDataKey { from, spender });
        if let Some(allowance) = env.storage().temporary().get::<_, AllowanceValue>(&key) {
            if allowance.expiration_ledger > env.ledger().sequence() {
                extend_temporary_ttl(&env, &key);
                return allowance.amount;
            }
        }
        0
    }

    fn approve(env: Env, from: Address, spender: Address, amount: i128, expiration_ledger: u32) {
        from.require_auth();
        if amount < 0 {
            panic!("amount must be non-negative");
        }
        if expiration_ledger <= env.ledger().sequence() {
            panic!("expiration ledger must be in the future");
        }
        extend_instance_ttl(&env);

        let key = DataKey::Allowance(AllowanceDataKey { from: from.clone(), spender: spender.clone() });
        env.storage().temporary().set(&key, &AllowanceValue { amount, expiration_ledger });
        extend_temporary_ttl(&env, &key);

        env.events().publish((symbol_short!("approve"), from, spender), amount);
    }

    fn balance(env: Env, id: Address) -> i128 {
        extend_instance_ttl(&env);
        let key = DataKey::Balance(id);
        if env.storage().persistent().has(&key) {
            extend_persistent_ttl(&env, &key);
            env.storage().persistent().get(&key).unwrap()
        } else {
            0
        }
    }

    fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();
        if amount < 0 {
            panic!("amount must be non-negative");
        }
        extend_instance_ttl(&env);

        let from_key = DataKey::Balance(from.clone());
        let mut from_balance: i128 = env.storage().persistent().get(&from_key).unwrap_or(0);
        if from_balance < amount {
            panic!("insufficient balance");
        }
        from_balance -= amount;
        env.storage().persistent().set(&from_key, &from_balance);
        extend_persistent_ttl(&env, &from_key);

        let to_key = DataKey::Balance(to.clone());
        let mut to_balance: i128 = env.storage().persistent().get(&to_key).unwrap_or(0);
        to_balance += amount;
        env.storage().persistent().set(&to_key, &to_balance);
        extend_persistent_ttl(&env, &to_key);

        env.events().publish((symbol_short!("transfer"), from, to), amount);
    }

    fn transfer_from(env: Env, spender: Address, from: Address, to: Address, amount: i128) {
        spender.require_auth();
        if amount < 0 {
            panic!("amount must be non-negative");
        }
        extend_instance_ttl(&env);

        let key = DataKey::Allowance(AllowanceDataKey { from: from.clone(), spender: spender.clone() });
        if let Some(mut allowance) = env.storage().temporary().get::<_, AllowanceValue>(&key) {
            if allowance.expiration_ledger <= env.ledger().sequence() || allowance.amount < amount {
                panic!("insufficient allowance");
            }
            allowance.amount -= amount;
            env.storage().temporary().set(&key, &allowance);
            extend_temporary_ttl(&env, &key);
        } else {
            panic!("insufficient allowance");
        }

        let from_key = DataKey::Balance(from.clone());
        let mut from_balance: i128 = env.storage().persistent().get(&from_key).unwrap_or(0);
        if from_balance < amount {
            panic!("insufficient balance");
        }
        from_balance -= amount;
        env.storage().persistent().set(&from_key, &from_balance);
        extend_persistent_ttl(&env, &from_key);

        let to_key = DataKey::Balance(to.clone());
        let mut to_balance: i128 = env.storage().persistent().get(&to_key).unwrap_or(0);
        to_balance += amount;
        env.storage().persistent().set(&to_key, &to_balance);
        extend_persistent_ttl(&env, &to_key);

        env.events().publish((symbol_short!("transfer"), from, to), amount);
    }

    fn burn(env: Env, from: Address, amount: i128) {
        from.require_auth();
        if amount < 0 {
            panic!("amount must be non-negative");
        }
        extend_instance_ttl(&env);

        let balance_key = DataKey::Balance(from.clone());
        let mut balance: i128 = env.storage().persistent().get(&balance_key).unwrap_or(0);
        if balance < amount {
            panic!("insufficient balance");
        }
        balance -= amount;
        env.storage().persistent().set(&balance_key, &balance);
        extend_persistent_ttl(&env, &balance_key);

        let mut supply: i128 = env.storage().instance().get(&DataKey::TotalSupply).unwrap_or(0);
        supply -= amount;
        env.storage().instance().set(&DataKey::TotalSupply, &supply);

        env.events().publish((symbol_short!("burn"), from), amount);
    }

    fn burn_from(env: Env, spender: Address, from: Address, amount: i128) {
        spender.require_auth();
        if amount < 0 {
            panic!("amount must be non-negative");
        }
        extend_instance_ttl(&env);

        let key = DataKey::Allowance(AllowanceDataKey { from: from.clone(), spender: spender.clone() });
        if let Some(mut allowance) = env.storage().temporary().get::<_, AllowanceValue>(&key) {
            if allowance.expiration_ledger <= env.ledger().sequence() || allowance.amount < amount {
                panic!("insufficient allowance");
            }
            allowance.amount -= amount;
            env.storage().temporary().set(&key, &allowance);
            extend_temporary_ttl(&env, &key);
        } else {
            panic!("insufficient allowance");
        }

        let balance_key = DataKey::Balance(from.clone());
        let mut balance: i128 = env.storage().persistent().get(&balance_key).unwrap_or(0);
        if balance < amount {
            panic!("insufficient balance");
        }
        balance -= amount;
        env.storage().persistent().set(&balance_key, &balance);
        extend_persistent_ttl(&env, &balance_key);

        let mut supply: i128 = env.storage().instance().get(&DataKey::TotalSupply).unwrap_or(0);
        supply -= amount;
        env.storage().instance().set(&DataKey::TotalSupply, &supply);

        env.events().publish((symbol_short!("burn"), from), amount);
    }

    fn decimals(_env: Env) -> u32 {
        7
    }

    fn name(env: Env) -> String {
        String::from_str(&env, "FragmentFi")
    }

    fn symbol(env: Env) -> String {
        String::from_str(&env, "FRAG")
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{Env, Address};
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::token::Client as TokenClient;

    #[test]
    fn test_mint_burn() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(FragToken, ());
        
        let client = FragTokenClient::new(&env, &contract_id);
        let token_client = TokenClient::new(&env, &contract_id);
        
        let admin = Address::generate(&env);
        let user = Address::generate(&env);
        
        client.initialize(&admin);
        
        // Mint 100 FRAG
        client.mint(&user, &100);
        assert_eq!(token_client.balance(&user), 100);
        assert_eq!(client.total_supply(), 100);
        
        // Burn 50 FRAG
        token_client.burn(&user, &50);
        assert_eq!(token_client.balance(&user), 50);
        assert_eq!(client.total_supply(), 50);
    }
}

// Trigger CI
