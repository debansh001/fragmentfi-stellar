#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String};

#[contracttype]
pub enum DataKey {
    Admin,
    TotalSupply,
    Balance(Address),
}

#[contract]
pub struct FragToken;

#[contractimpl]
impl FragToken {
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TotalSupply, &0i128);
    }

    pub fn mint(env: Env, to: Address, amount: i128) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        if amount <= 0 {
            panic!("amount must be positive");
        }

        let mut supply: i128 = env.storage().instance().get(&DataKey::TotalSupply).unwrap_or(0);
        supply += amount;
        env.storage().instance().set(&DataKey::TotalSupply, &supply);

        let mut balance: i128 = env.storage().persistent().get(&DataKey::Balance(to.clone())).unwrap_or(0);
        balance += amount;
        env.storage().persistent().set(&DataKey::Balance(to), &balance);
    }

    pub fn burn(env: Env, from: Address, amount: i128) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        if amount <= 0 {
            panic!("amount must be positive");
        }

        let mut balance: i128 = env.storage().persistent().get(&DataKey::Balance(from.clone())).unwrap_or(0);
        if balance < amount {
            panic!("insufficient balance");
        }
        balance -= amount;
        env.storage().persistent().set(&DataKey::Balance(from), &balance);

        let mut supply: i128 = env.storage().instance().get(&DataKey::TotalSupply).unwrap_or(0);
        supply -= amount;
        env.storage().instance().set(&DataKey::TotalSupply, &supply);
    }

    pub fn balance(env: Env, id: Address) -> i128 {
        env.storage().persistent().get(&DataKey::Balance(id)).unwrap_or(0)
    }

    pub fn total_supply(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::TotalSupply).unwrap_or(0)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{Env, Address};
    use soroban_sdk::testutils::Address as _;

    #[test]
    fn test_mint_burn() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(FragToken, ());
        let client = FragTokenClient::new(&env, &contract_id);
        
        let admin = Address::generate(&env);
        let user = Address::generate(&env);
        
        client.initialize(&admin);
        
        // Mint 100 FRAG
        client.mint(&user, &100);
        assert_eq!(client.balance(&user), 100);
        assert_eq!(client.total_supply(), 100);
        
        // Burn 50 FRAG
        client.burn(&user, &50);
        assert_eq!(client.balance(&user), 50);
        assert_eq!(client.total_supply(), 50);
    }
}
