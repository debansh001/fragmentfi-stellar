#![no_std]
use soroban_sdk::{contract, contractimpl, Env, Symbol, String};

#[contract]
pub struct FragmentFiContract;

#[contractimpl]
impl FragmentFiContract {
    pub fn mint(env: Env, to: String, amount: u64) -> u64 {
        // Dummy mint logic
        amount
    }

    pub fn burn(env: Env, from: String, amount: u64) -> u64 {
        // Dummy burn logic
        amount
    }

    pub fn get_reserves(env: Env) -> u64 {
        // Dummy reserves
        1500000
    }
}
