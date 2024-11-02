// FlexNetGX/gx-web/src/components/auth/login.rs
use yew::prelude::*;
use wasm_bindgen::JsCast;
use web_sys::HtmlInputElement;
use crate::services::auth::AuthService;
use crate::types::{LoginCredentials, AuthError};

pub enum Msg {
    SetEmail(String),
    SetPassword(String),
    Submit,
    AuthSuccess,
    AuthError(AuthError),
}

pub struct Login {
    email: String,
    password: String,
    error: Option<String>,
    auth_service: AuthService,
    link: ComponentLink<Self>,
}

impl Component for Login {
    type Message = Msg;
    type Properties = ();

    fn create(_: Self::Properties, link: ComponentLink<Self>) -> Self {
        Self {
            email: String::new(),
            password: String::new(),
            error: None,
            auth_service: AuthService::new(),
            link,
        }
    }

    fn update(&mut self, msg: Self::Message) -> ShouldRender {
        match msg {
            Msg::SetEmail(email) => {
                self.email = email;
                true
            }
            Msg::SetPassword(password) => {
                self.password = password;
                true
            }
            Msg::Submit => {
                let credentials = LoginCredentials {
                    email: self.email.clone(),
                    password: self.password.clone(),
                };
                
                self.auth_service.login(credentials);
                true
            }
            Msg::AuthSuccess => {
                // Handle successful authentication
                true
            }
            Msg::AuthError(error) => {
                self.error = Some(error.to_string());
                true
            }
        }
    }

    fn view(&self) -> Html {
        html! {
            <div class="login-container">
                <h2>{"Login"}</h2>
                
                { self.view_error() }
                
                <form onsubmit=self.link.callback(|e: FocusEvent| {
                    e.prevent_default();
                    Msg::Submit
                })>
                    <div class="form-group">
                        <label for="email">{"Email:"}</label>
                        <input 
                            type="email"
                            id="email"
                            value=self.email.clone()
                            oninput=self.link.callback(|e: InputEvent| {
                                let input: HtmlInputElement = e.target_unchecked_into();
                                Msg::SetEmail(input.value())
                            })
                        />
                    </div>

                    <div class="form-group">
                        <label for="password">{"Password:"}</label>
                        <input 
                            type="password"
                            id="password"
                            value=self.password.clone()
                            oninput=self.link.callback(|e: InputEvent| {
                                let input: HtmlInputElement = e.target_unchecked_into();
                                Msg::SetPassword(input.value())
                            })
                        />
                    </div>

                    <button type="submit">{"Login"}</button>

                    <div class="additional-options">
                        <button onclick=self.link.callback(|_| Msg::Register)>
                            {"Register"}
                        </button>
                        <button onclick=self.link.callback(|_| Msg::ForgotPassword)>
                            {"Forgot Password"}
                        </button>
                    </div>
                </form>
            </div>
        }
    }
}

impl Login {
    fn view_error(&self) -> Html {
        if let Some(error) = &self.error {
            html! {
                <div class="error-message">
                    { error }
                </div>
            }
        } else {
            html! {}
        }
    }
}