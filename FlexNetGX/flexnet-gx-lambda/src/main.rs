use lambda_runtime::{service_fn, LambdaEvent, Error};
use serde_json::{json, Value};
use aes_gcm::{Aes256Gcm, Key, Nonce};
use aes_gcm::aead::{Aead, NewAead};
use sha2::{Sha256, Digest};
use blake3; // "blockchain_hash": blockchain_hash

#[tokio::main]
async fn main() -> Result<(), Error> {
    lambda_runtime::run(service_fn(func)).await?;
    Ok(())
}

async fn func(event: LambdaEvent<Value>) -> Result<Value, Error> {
    let (event, _context) = event.into_parts();
    let input_data = event["data"].as_str().unwrap_or("No data provided");

    let encrypted_data = encrypt_data(input_data);
    let sha256_hash = simulate_blockchain_storage_sha256(&encrypted_data);
    let blake3_hash = simulate_blockchain_storage_blake3(&encrypted_data); // "blockchain_hash": blockchain_hash

    Ok(json!({
        "message": "Data processed by FlexNet GX Lambda",
        "encrypted_data": encrypted_data,
        "SHA256_hash": sha256_hash,
        "BLAKE3_hash": blake3_hash // "blockchain_hash": blockchain_hash
    }))
}

fn encrypt_data(data: &str) -> String {
    let key = Key::from_slice(b"an example very very secret key.");
    let cipher = Aes256Gcm::new(key);
    let nonce = Nonce::from_slice(b"unique nonce");

    let encrypted = cipher.encrypt(nonce, data.as_bytes())
        .expect("encryption failure!");
    
    hex::encode(encrypted)
}

fn simulate_blockchain_storage_sha256(data: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(data);
    let result = hasher.finalize();
    hex::encode(result)
}

// Replace of "blockchain_hash": blockchain_hash
fn simulate_blockchain_storage_blake3(data: &str) -> String {
    let hash = blake3::hash(data.as_bytes());
    hex::encode(hash.as_bytes())
}

/** 
* Dual Hashing: The function now computes both SHA256 and BLAKE3 hashes of the encrypted data. This might be beneficial if different parts of your system or different stakeholders require different hash standards.
* JSON Output: Adjusted to return both hash values in the response, making it flexible for clients needing either or both hash values for verification or other purposes.
**/
