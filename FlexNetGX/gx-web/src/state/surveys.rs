// FlexNetGX/gx-web/src/state/surveys.rs
use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};
use std::collections::HashMap;

#[derive(Serialize, Deserialize, Clone, Debug, Default)]
pub struct SurveyState {
    pub items: Vec<Survey>,
    pub responses: HashMap<String, Vec<SurveyResponse>>,
    pub active_survey_id: Option<String>,
    pub filters: SurveyFilters,
    pub statistics: SurveyStatistics,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct SurveyFilters {
    pub status: Option<SurveyStatus>,
    pub date_range: Option<(DateTime<Utc>, DateTime<Utc>)>,
    pub tag: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct SurveyStatistics {
    pub total_responses: usize,
    pub average_completion_time: f64,
    pub response_rate: f64,
    pub completion_rate: f64,
}

pub enum SurveyAction {
    SetFilter(SurveyFilters),
    UpdateStatistics(SurveyStatistics),
    SetActiveSurvey(Option<String>),
    AddResponse(String, SurveyResponse),
    ClearResponses(String),
}

impl SurveyState {
    pub fn apply_action(&mut self, action: SurveyAction) {
        match action {
            SurveyAction::SetFilter(filters) => {
                self.filters = filters;
            }
            SurveyAction::UpdateStatistics(stats) => {
                self.statistics = stats;
            }
            SurveyAction::SetActiveSurvey(id) => {
                self.active_survey_id = id;
            }
            SurveyAction::AddResponse(survey_id, response) => {
                self.responses
                    .entry(survey_id)
                    .or_insert_with(Vec::new)
                    .push(response);
                self.update_statistics();
            }
            SurveyAction::ClearResponses(survey_id) => {
                self.responses.remove(&survey_id);
                self.update_statistics();
            }
        }
    }

    fn update_statistics(&mut self) {
        let total_responses: usize = self.responses.values().map(|r| r.len()).sum();
        let total_surveys = self.items.len();
        
        self.statistics = SurveyStatistics {
            total_responses,
            average_completion_time: self.calculate_average_completion_time(),
            response_rate: self.calculate_response_rate(),
            completion_rate: self.calculate_completion_rate(),
        };
    }

    // Helper methods for statistics calculations...
}