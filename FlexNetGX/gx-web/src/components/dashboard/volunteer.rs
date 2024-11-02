// FlexNetGX/gx-web/src/components/dashboard/volunteer.rs
use yew::prelude::*;
use crate::components::gx-mobile::{Card, Tabs, Button, Modal};
use crate::components::survey::SurveyResponse;
use crate::services::volunteer::VolunteerService;
use crate::types::{Survey, VolunteerActivity, Badge, Task};

pub struct VolunteerDashboard {
    link: ComponentLink<Self>,
    service: VolunteerService,
    available_surveys: Vec<Survey>,
    completed_surveys: Vec<Survey>,
    current_activity: Option<VolunteerActivity>,
    earned_badges: Vec<Badge>,
    assigned_tasks: Vec<Task>,
    loading: bool,
    active_survey: Option<Survey>,
    show_survey_modal: bool,
    error: Option<String>,
}

pub enum Msg {
    FetchData,
    DataReceived {
        surveys: Vec<Survey>,
        completed: Vec<Survey>,
        badges: Vec<Badge>,
        tasks: Vec<Task>,
    },
    StartSurvey(Survey),
    SubmitSurvey(Survey, Vec<String>),
    CompleteTask(String),
    CloseModal,
    UpdateActivity(VolunteerActivity),
    Error(String),
}

impl Component for VolunteerDashboard {
    type Message = Msg;
    type Properties = ();

    fn create(_: Self::Properties, link: ComponentLink<Self>) -> Self {
        let mut dashboard = Self {
            link,
            service: VolunteerService::new(),
            available_surveys: vec![],
            completed_surveys: vec![],
            current_activity: None,
            earned_badges: vec![],
            assigned_tasks: vec![],
            loading: true,
            active_survey: None,
            show_survey_modal: false,
            error: None,
        };
        
        dashboard.link.send_message(Msg::FetchData);
        dashboard
    }

    fn update(&mut self, msg: Self::Message) -> ShouldRender {
        match msg {
            Msg::FetchData => {
                self.loading = true;
                let link = self.link.clone();
                wasm_bindgen_futures::spawn_local(async move {
                    match VolunteerService::fetch_volunteer_data().await {
                        Ok(data) => link.send_message(Msg::DataReceived {
                            surveys: data.available_surveys,
                            completed: data.completed_surveys,
                            badges: data.earned_badges,
                            tasks: data.assigned_tasks,
                        }),
                        Err(e) => link.send_message(Msg::Error(e.to_string())),
                    }
                });
                false
            }
            Msg::DataReceived { surveys, completed, badges, tasks } => {
                self.available_surveys = surveys;
                self.completed_surveys = completed;
                self.earned_badges = badges;
                self.assigned_tasks = tasks;
                self.loading = false;
                true
            }
            Msg::StartSurvey(survey) => {
                self.active_survey = Some(survey);
                self.show_survey_modal = true;
                true
            }
            Msg::SubmitSurvey(survey, responses) => {
                let link = self.link.clone();
                wasm_bindgen_futures::spawn_local(async move {
                    match VolunteerService::submit_survey_response(survey.id, responses).await {
                        Ok(_) => link.send_message(Msg::FetchData),
                        Err(e) => link.send_message(Msg::Error(e.to_string())),
                    }
                });
                self.show_survey_modal = false;
                true
            }
            // Handle other messages...
            _ => false
        }
    }

    fn view(&self) -> Html {
        html! {
            <div class="flex flex-col h-full bg-gray-100">
                { self.view_header() }
                <div class="flex-grow p-6">
                    <Tabs>
                        <div label="Dashboard">
                            { self.view_dashboard_content() }
                        </div>
                        <div label="Surveys">
                            { self.view_surveys() }
                        </div>
                        <div label="Tasks">
                            { self.view_tasks() }
                        </div>
                        <div label="Badges">
                            { self.view_badges() }
                        </div>
                    </Tabs>
                </div>
                { self.view_survey_modal() }
            </div>
        }
    }
}

impl VolunteerDashboard {
    fn view_header(&self) -> Html {
        html! {
            <header class="bg-white shadow-sm p-4">
                <div class="flex justify-between items-center">
                    <h1 class="text-2xl font-bold text-gray-800">
                        {"Volunteer Dashboard"}
                    </h1>
                    { self.view_activity_status() }
                </div>
            </header>
        }
    }

    fn view_dashboard_content(&self) -> Html {
        html! {
            <div class="grid grid-cols-12 gap-6">
                { self.view_stats_overview() }
                { self.view_recent_activity() }
                { self.view_upcoming_tasks() }
            </div>
        }
    }

    fn view_stats_overview(&self) -> Html {
        html! {
            <div class="col-span-12 grid grid-cols-4 gap-4">
                <Card>
                    <div class="p-4">
                        <h3 class="text-lg font-semibold text-gray-600">
                            {"Surveys Completed"}
                        </h3>
                        <p class="text-3xl font-bold">
                            { self.completed_surveys.len() }
                        </p>
                    </div>
                </Card>
                <Card>
                    <div class="p-4">
                        <h3 class="text-lg font-semibold text-gray-600">
                            {"Available Surveys"}
                        </h3>
                        <p class="text-3xl font-bold">
                            { self.available_surveys.len() }
                        </p>
                    </div>
                </Card>
                <Card>
                    <div class="p-4">
                        <h3 class="text-lg font-semibold text-gray-600">
                            {"Badges Earned"}
                        </h3>
                        <p class="text-3xl font-bold">
                            { self.earned_badges.len() }
                        </p>
                    </div>
                </Card>
                <Card>
                    <div class="p-4">
                        <h3 class="text-lg font-semibold text-gray-600">
                            {"Active Tasks"}
                        </h3>
                        <p class="text-3xl font-bold">
                            { self.assigned_tasks.len() }
                        </p>
                    </div>
                </Card>
            </div>
        }
    }

    fn view_survey_modal(&self) -> Html {
        if let Some(survey) = &self.active_survey {
            html! {
                <Modal
                    show=self.show_survey_modal
                    onclose=self.link.callback(|_| Msg::CloseModal)
                    title=survey.title.clone()
                >
                    <SurveyResponse
                        survey=survey.clone()
                        onsubmit=self.link.callback(move |responses| 
                            Msg::SubmitSurvey(survey.clone(), responses)
                        )
                    />
                </Modal>
            }
        } else {
            html! {}
        }
    }
}