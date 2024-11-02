// FlexNetGX/gx-web/src/components/dashboard/mod.rs
use yew::prelude::*;
use crate::types::{User, UserRole};
use crate::services::auth::AuthContext;

pub mod admin;
pub mod research;
pub mod volunteer;
pub mod common;

#[derive(Properties, Clone, PartialEq)]
pub struct DashboardProps {
    pub user: User,
}

pub enum Msg {
    Logout,
    ToggleSidebar,
    NavigateTo(Route),
    UpdateProfile,
    ShowNotification(String),
    Error(String),
}

pub struct Dashboard {
    props: DashboardProps,
    link: ComponentLink<Self>,
    sidebar_open: bool,
}

impl Component for Dashboard {
    type Message = Msg;
    type Properties = DashboardProps;

    fn create(props: Self::Properties, link: ComponentLink<Self>) -> Self {
        Self {
            props,
            link,
            sidebar_open: false,
        }
    }

    fn view(&self) -> Html {
        html! {
            <div class="flex h-screen bg-gray-100">
                { self.view_sidebar() }
                
                <div class="flex-1 flex flex-col overflow-hidden">
                    { self.view_header() }
                    
                    <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
                        { self.view_dashboard_content() }
                    </main>
                </div>
            </div>
        }
    }
}

impl Dashboard {
    fn view_dashboard_content(&self) -> Html {
        match self.props.user.role {
            UserRole::Admin => html! {
                <admin::AdminDashboard user=self.props.user.clone() />
            },
            UserRole::Research => html! {
                <research::ResearchDashboard user=self.props.user.clone() />
            },
            UserRole::Volunteer => html! {
                <volunteer::VolunteerDashboard user=self.props.user.clone() />
            },
        }
    }
}