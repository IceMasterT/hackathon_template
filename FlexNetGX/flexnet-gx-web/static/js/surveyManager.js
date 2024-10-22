let surveyData = [];

$(function() {
    $('#add-question').click(addQuestion);
    $('#survey-form').submit(submitSurvey);
    $('#survey-target').change(updateTargetSpecific);
});

function addQuestion() {
    let questionCount = $('.question').length + 1;
    $('#survey-questions').append(`
        <div class="question">
            <input type="text" placeholder="Question ${questionCount}" required>
            <select class="question-type">
                <option value="text">Text</option>
                <option value="multiple">Multiple Choice</option>
                <option value="true-false">True/False</option>
            </select>
            <div class="question-options" style="display: none;">
                <input type="text" placeholder="Option 1" class="option-input">
                <input type="text" placeholder="Option 2" class="option-input">
                <button type="button" class="add-option">Add Option</button>
            </div>
        </div>
    `);
}

function submitSurvey(e) {
    e.preventDefault();
    let survey = {
        name: $('#survey-name').val(),
        description: $('#survey-description').val(),
        target: $('#survey-target').val(),
        targetSpecific: $('#survey-target-specific').val(),
        dueDate: $('#survey-due-date').val(),
        questions: []
    };

    $('.question').each(function() {
        let question = {
            text: $(this).find('input:first').val(),
            type: $(this).find('.question-type').val(),
            options: []
        };

        if (question.type === 'multiple' || question.type === 'true-false') {
            $(this).find('.option-input').each(function() {
                question.options.push($(this).val());
            });
        }

        survey.questions.push(question);
    });

    surveyData.push(survey);
    localStorage.setItem('surveyData', JSON.stringify(surveyData));
    console.log("Survey created:", survey);

    this.reset();
    $('#survey-questions').empty();
}

function updateTargetSpecific() {
    let target = $('#survey-target').val();
    let specificSelect = $('#survey-target-specific');
    specificSelect.empty();

    if (target !== 'all') {
        specificSelect.show();
        let options = [];
        switch(target) {
            case 'workspace':
                options = JSON.parse(localStorage.getItem('workspaces')) || [];
                break;
            case 'team':
                options = JSON.parse(localStorage.getItem('teams')) || [];
                break;
            case 'individual':
                options = JSON.parse(localStorage.getItem('personnelList')) || [];
                break;
        }
        options.forEach(option => {
            specificSelect.append(`<option value="${option.name}">${option.name}</option>`);
        });
    } else {
        specificSelect.hide();
    }
}

function getSurveyData() {
    return JSON.parse(localStorage.getItem('surveyData')) || [];
}

window.getSurveyData = getSurveyData;
