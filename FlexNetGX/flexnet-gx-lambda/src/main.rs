use lambda_runtime::{service_fn, LambdaEvent, Error};
use serde_json::{json, Value};
use aes_gcm::{Aes256Gcm, Nonce};
use aes_gcm::aead::{Aead, KeyInit};
use sha2::{Sha256, Digest};
use blake3;
use rusoto_core::Region;
use rusoto_kms::KmsClient;
use rusoto_kms::{Kms, DecryptRequest};
use hex;
use bytes::Bytes;

#[tokio::main]
async fn main() -> Result<(), Error> {
    lambda_runtime::run(service_fn(func)).await
}

async fn func(event: LambdaEvent<Value>) -> Result<Value, Error> {
    let (event, _context) = event.into_parts();
    let input_data = event["data"].as_str().unwrap_or("No data provided");

    // KMS decryption from encrypted input_data
    let decrypted_data = decrypt_with_kms(input_data.as_bytes().to_vec()).await?;
    let decrypted_str = String::from_utf8(decrypted_data)?;

    let encrypted_data = encrypt_data(&decrypted_str);
    let sha256_hash = simulate_blockchain_storage_sha256(&encrypted_data);
    let blake3_hash = simulate_blockchain_storage_blake3(&encrypted_data);

    Ok(json!({
        "message": "Data processed by FlexNet GX Lambda",
        "encrypted_data": encrypted_data,
        "SHA256_hash": sha256_hash,
        "BLAKE3_hash": blake3_hash
    }))
}

// for the KMS AWS Native FedRamp Stuff
async fn decrypt_with_kms(encrypted_data: Vec<u8>) -> Result<Vec<u8>, Box<dyn std::error::Error + Send + Sync>> {
    let client = KmsClient::new(Region::UsEast1);
    let decrypt_request = DecryptRequest {
        ciphertext_blob: Bytes::from(encrypted_data),
        ..Default::default()
    };
    let decrypt_response = client.decrypt(decrypt_request).await?;
    Ok(decrypt_response.plaintext.unwrap().to_vec())
}

fn encrypt_data(data: &str) -> String {
    let key = Aes256Gcm::generate_key(&mut rand::thread_rng());
    let cipher = Aes256Gcm::new(&key);
    let nonce = Nonce::from_slice(b"unique nonce"); // 12-bytes

    let encrypted = cipher.encrypt(nonce, data.as_bytes())
        .expect("encryption failure!");
    
    hex::encode(encrypted)
}

/*
* Dual Hashing: The function now computes both SHA256 and BLAKE3 hashes of the encrypted data. This might be beneficial if different parts of your system or different stakeholders require different hash standards.
* JSON Output: Adjusted to return both hash values in the response, making it flexible for clients needing either or both hash values for verification or other purposes.
*/

fn simulate_blockchain_storage_sha256(data: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(data);
    let result = hasher.finalize();
    hex::encode(result)
}

fn simulate_blockchain_storage_blake3(data: &str) -> String {
    let hash = blake3::hash(data.as_bytes());
    hex::encode(hash.as_bytes())
}

