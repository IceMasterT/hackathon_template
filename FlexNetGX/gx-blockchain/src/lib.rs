use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    msg,
};
use borsh::{BorshDeserialize, BorshSerialize};
use blake3;
use sha2::{Sha256, Digest};
use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce
};
use hex;

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct KeyData {
    pub owner: Pubkey,
    pub key: [u8; 32],
}

entrypoint!(process_instruction);

pub fn process_instruction(
    _program_id: &Pubkey,
    _accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    msg!("FlexNet GX Blockchain program entrypoint");
    
    // Example usage of data processing
    let example_data = "Hello, blockchain!";
    let (encrypted_data, blake3_hash, sha256_hash) = process_data_for_blockchain(example_data);

    // Logging to Solana's output
    msg!("Encrypted Data: {}", encrypted_data);
    msg!("BLAKE3 Hash: {}", blake3_hash);
    msg!("SHA256 Hash: {}", sha256_hash);
    
    Ok(())
}

// Process data function
pub fn process_data_for_blockchain(data: &str) -> (String, String, String) {
    let key = Aes256Gcm::generate_key(&mut rand::thread_rng());
    let cipher = Aes256Gcm::new(&key);
    let nonce = Nonce::from_slice(b"unique nonce"); // 12-bytes
    let encrypted = cipher.encrypt(nonce, data.as_bytes()).expect("encryption failure!");
    let encrypted_data = hex::encode(&encrypted);

    // Hash encrypted data
    let blake3_hash = blake3::hash(encrypted_data.as_bytes());
    let mut sha256_hasher = Sha256::new();
    sha256_hasher.update(&encrypted_data);
    let sha256_hash = sha256_hasher.finalize();

    (encrypted_data, hex::encode(blake3_hash.as_bytes()), hex::encode(sha256_hash))
}