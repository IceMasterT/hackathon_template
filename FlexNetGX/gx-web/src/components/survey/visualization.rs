// FlexNetGX/gx-web/src/components/survey/visualization.rs
use yew::prelude::*;
use crate::components::gx-mobile::charts::{Chart, ChartData, Dataset};
use crate::types::{Survey, SurveyResponse, QuestionType};

#[derive(Properties, Clone, PartialEq)]
pub struct SurveyVisualizationProps {
    pub survey: Survey,
    pub responses: Vec<SurveyResponse>,
    #[prop_or_default]
    pub onquestionclick: Option<Callback<(usize, String)>>,
}

pub struct SurveyVisualization {
    props: SurveyVisualizationProps,
    link: ComponentLink<Self>,
}

impl Component for SurveyVisualization {
    type Message = (usize, String);
    type Properties = SurveyVisualizationProps;

    fn create(props: Self::Properties, link: ComponentLink<Self>) -> Self {
        Self { props, link }
    }

    fn view(&self) -> Html {
        html! {
            <div class="space-y-8">
                <h2 class="text-2xl font-bold">
                    { format!("Results: {}", self.props.survey.title) }
                </h2>
                <div class="grid grid-cols-2 gap-6">
                    { self.render_response_rate() }
                    { self.render_completion_time() }
                </div>
                <div class="space-y-6">
                    {
                        for self.props.survey.questions.iter().enumerate().map(|(i, q)| {
                            self.render_question_results(i, q)
                        })
                    }
                </div>
            </div>
        }
    }
}

impl SurveyVisualization {
    fn render_response_rate(&self) -> Html {
        let total_invites = self.props.survey.total_invites;
        let response_count = self.props.responses.len();
        let response_rate = (response_count as f64 / total_invites as f64) * 100.0;

        let data = ChartData {
            labels: vec!["Responded".to_string(), "No Response".to_string()],
            datasets: vec![Dataset {
                label: "Response Rate".to_string(),
                data: vec![response_rate, 100.0 - response_rate],
                background_color: Some(vec![
                    "rgba(75, 192, 192, 0.2)".to_string(),
                    "rgba(201, 203, 207, 0.2)".to_string(),
                ]),
                border_color: Some(vec![
                    "rgba(75, 192, 192, 1)".to_string(),
                    "rgba(201, 203, 207, 1)".to_string(),
                ]),
                fill: Some(true),
            }],
        };

        html! {
            <div class="bg-white rounded-lg shadow p-4">
                <h3 class="text-lg font-medium mb-4">{"Response Rate"}</h3>
                <Chart
                    data=data
                    height="200px"
                    options=chart_options()
                />
                <div class="mt-4 text-center">
                    <p class="text-sm text-gray-500">
                        { format!("{} out of {} responded", response_count, total_invites) }
                    </p>
                </div>
            </div>
        }
    }

    fn render_question_results(&self, index: usize, question: &Question) -> Html {
        match question.question_type {
            QuestionType::MultipleChoice => self.render_multiple_choice(index, question),
            QuestionType::Scale => self.render_scale(index, question),
            QuestionType::Text => self.render_text_responses(index, question),
            _ => html! {},
        }
    }

    // Implementation of specific rendering methods...
}