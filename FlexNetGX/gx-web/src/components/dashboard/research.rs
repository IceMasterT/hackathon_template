// FlexNetGX/gx-web/src/components/dashboard/research.rs
use yew::prelude::*;
use crate::components::gx-mobile::{Card, DataGrid, Chart, Tabs, Button};
use crate::components::research::{SurveyManager, DataVisualization, TeamCollaboration};
use crate::services::research::ResearchService;
use crate::types::{ResearchData, Survey, Analysis, TeamMember};

pub struct ResearchDashboard {
    link: ComponentLink<Self>,
    research_service: ResearchService,
    current_data: Option<ResearchData>,
    active_surveys: Vec<Survey>,
    team_members: Vec<TeamMember>,
    analyses: Vec<Analysis>,
    loading: bool,
    error: Option<String>,
}

pub enum Msg {
    FetchData,
    DataReceived(ResearchData),
    CreateSurvey(Survey),
    UpdateAnalysis(Analysis),
    ExportData(String),
    ShareAnalysis(Analysis, Vec<String>),
    Error(String),
    ClearError,
}

impl Component for ResearchDashboard {
    type Message = Msg;
    type Properties = ();

    fn create(_: Self::Properties, link: ComponentLink<Self>) -> Self {
        let mut dashboard = Self {
            link,
            research_service: ResearchService::new(),
            current_data: None,
            active_surveys: vec![],
            team_members: vec![],
            analyses: vec![],
            loading: true,
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
                    match ResearchService::fetch_research_data().await {
                        Ok(data) => link.send_message(Msg::DataReceived(data)),
                        Err(e) => link.send_message(Msg::Error(e.to_string())),
                    }
                });
                false
            }
            Msg::DataReceived(data) => {
                self.current_data = Some(data);
                self.loading = false;
                true
            }
            Msg::CreateSurvey(survey) => {
                let link = self.link.clone();
                wasm_bindgen_futures::spawn_local(async move {
                    match ResearchService::create_survey(survey).await {
                        Ok(_) => link.send_message(Msg::FetchData),
                        Err(e) => link.send_message(Msg::Error(e.to_string())),
                    }
                });
                false
            }
            // Other message handlers...
            _ => false
        }
    }

    fn view(&self) -> Html {
        html! {
            <div class="flex flex-col h-full">
                { self.view_header() }
                <div class="flex-grow p-6">
                    <Tabs>
                        <div label="Dashboard">
                            { self.view_dashboard_content() }
                        </div>
                        <div label="Surveys">
                            { self.view_surveys() }
                        </div>
                        <div label="Analysis">
                            { self.view_analysis() }
                        </div>
                        <div label="Team">
                            { self.view_team() }
                        </div>
                    </Tabs>
                </div>
            </div>
        }
    }
}

impl ResearchDashboard {
    fn view_header(&self) -> Html {
        html! {
            <header class="bg-white shadow-md p-4">
                <div class="flex justify-between items-center">
                    <h1 class="text-2xl font-bold text-gray-800">{"Research Dashboard"}</h1>
                    <div class="flex space-x-4">
                        <Button
                            variant="primary"
                            onclick=self.link.callback(|_| Msg::CreateSurvey(Survey::default()))
                        >
                            {"New Survey"}
                        </Button>
                        <Button
                            variant="secondary"
                            onclick=self.link.callback(|_| Msg::ExportData("csv".to_string()))
                        >
                            {"Export Data"}
                        </Button>
                    </div>
                </div>
            </header>
        }
    }

    fn view_dashboard_content(&self) -> Html {
        html! {
            <div class="grid grid-cols-12 gap-6">
                { self.view_stats_cards() }
                { self.view_recent_activity() }
                { self.view_data_visualization() }
            </div>
        }
    }

    fn view_stats_cards(&self) -> Html {
        if let Some(data) = &self.current_data {
            html! {
                <div class="col-span-12 grid grid-cols-4 gap-4">
                    <Card>
                        <div class="p-4">
                            <h3 class="text-lg font-semibold text-gray-600">{"Active Surveys"}</h3>
                            <p class="text-3xl font-bold">{ data.active_surveys_count }</p>
                        </div>
                    </Card>
                    <Card>
                        <div class="p-4">
                            <h3 class="text-lg font-semibold text-gray-600">{"Total Responses"}</h3>
                            <p class="text-3xl font-bold">{ data.total_responses }</p>
                        </div>
                    </Card>
                    <Card>
                        <div class="p-4">
                            <h3 class="text-lg font-semibold text-gray-600">{"Team Members"}</h3>
                            <p class="text-3xl font-bold">{ data.team_member_count }</p>
                        </div>
                    </Card>
                    <Card>
                        <div class="p-4">
                            <h3 class="text-lg font-semibold text-gray-600">{"Analysis Reports"}</h3>
                            <p class="text-3xl font-bold">{ data.analysis_count }</p>
                        </div>
                    </Card>
                </div>
            }
        } else {
            html! {
                <div class="col-span-12">
                    <div class="animate-pulse flex space-x-4">
                        // Loading placeholders...
                    </div>
                </div>
            }
        }
    }

    fn view_data_visualization(&self) -> Html {
        html! {
            <div class="col-span-8">
                <Card>
                    <div class="p-4">
                        <h2 class="text-xl font-bold mb-4">{"Data Visualization"}</h2>
                        <DataVisualization
                            data=self.current_data.clone()
                            onupdate=self.link.callback(Msg::UpdateAnalysis)
                        />
                    </div>
                </Card>
            </div>
        }
    }

    fn view_surveys(&self) -> Html {
        html! {
            <div class="space-y-6">
                <div class="flex justify-between items-center">
                    <h2 class="text-xl font-bold">{"Active Surveys"}</h2>
                    <Button
                        variant="primary"
                        onclick=self.link.callback(|_| Msg::CreateSurvey(Survey::default()))
                    >
                        {"Create New Survey"}
                    </Button>
                </div>
                <SurveyManager
                    surveys=self.active_surveys.clone()
                    onupdate=self.link.callback(|_| Msg::FetchData)
                />
            </div>
        }
    }
}