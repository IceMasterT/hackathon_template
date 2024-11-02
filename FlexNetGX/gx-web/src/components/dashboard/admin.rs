// FlexNetGX/gx-web/src/services/admin.rs
use wasm_bindgen::JsValue;
use wasm_bindgen_futures::JsFuture;
use web_sys::{Request, RequestInit, RequestMode, Response};
use crate::types::{User, UserStats, Task, Team, Workspace};
use crate::config::API_BASE_URL;

pub struct AdminService {
    base_url: String,
}

impl AdminService {
    pub fn new() -> Self {
        Self {
            base_url: API_BASE_URL.to_string(),
        }
    }

    pub async fn fetch_stats(&self) -> Result<UserStats, String> {
        let mut opts = RequestInit::new();
        opts.method("GET");
        opts.mode(RequestMode::Cors);

        let url = format!("{}/admin/stats", self.base_url);
        let request = Request::new_with_str_and_init(&url, &opts)
            .map_err(|err| err.as_string().unwrap_or_else(|| "Failed to create request".to_string()))?;

        request.headers().set("Authorization", &self.get_auth_header()?)?;

        let window = web_sys::window().unwrap();
        let resp_value = JsFuture::from(window.fetch_with_request(&request))
            .await
            .map_err(|err| err.as_string().unwrap_or_else(|| "Failed to fetch".to_string()))?;

        let resp: Response = resp_value.dyn_into().unwrap();

        let json = JsFuture::from(resp.json()?)
            .await
            .map_err(|err| err.as_string().unwrap_or_else(|| "Failed to parse response".to_string()))?;

        let stats: UserStats = serde_wasm_bindgen::from_value(json)?;
        Ok(stats)
    }

    pub async fn approve_user(&self, user_id: &str) -> Result<(), String> {
        let mut opts = RequestInit::new();
        opts.method("POST");
        opts.mode(RequestMode::Cors);

        let url = format!("{}/admin/users/{}/approve", self.base_url, user_id);
        let request = Request::new_with_str_and_init(&url, &opts)?;
        
        request.headers().set("Authorization", &self.get_auth_header()?)?;
        request.headers().set("Content-Type", "application/json")?;

        let window = web_sys::window().unwrap();
        let resp_value = JsFuture::from(window.fetch_with_request(&request))
            .await?;

        let resp: Response = resp_value.dyn_into().unwrap();

        if resp.ok() {
            Ok(())
        } else {