// js/survey.js
let currentSurveyId = null;

// Function to load survey questions
function loadSurvey(surveyId) {
    currentSurveyId = surveyId;
    // In a real application, you would fetch this data from a server based on the surveyId
    const surveyData = {
        1: {
            title: "Customer Satisfaction Survey",
            questions: [
                { id: 1, text: "How satisfied are you with our product?", type: "text" },
                { id: 2, text: "What features would you like to see improved?", type: "textarea" }
            ]
        },
        2: {
            title: "Product Feedback Survey",
            questions: [
                { id: 1, text: "Which product did you purchase?", type: "text" },
                { id: 2, text: "How would you rate the product quality?", type: "text" }
            ]
        },
        3: {
            title: "Website Usability Survey",
            questions: [
                { id: 1, text: "How easy was it to navigate our website?", type: "text" },
                { id: 2, text: "Did you encounter any issues while using our website?", type: "textarea" }
            ]
        }
    };

    const survey = surveyData[surveyId];
    document.getElementById('surveyTitle').textContent = survey.title;

    const form = document.getElementById('surveyForm');
    form.innerHTML = '';
    survey.questions.forEach(question => {
        const div = document.createElement('div');
        div.className = 'question';
        div.innerHTML = `
            <label for="q${question.id}">${question.text}</label>
            ${question.type === 'text'
                ? `<input type="text" id="q${question.id}" name="q${question.id}">`
                : `<textarea id="q${question.id}" name="q${question.id}" rows="4"></textarea>`}
        `;
        form.appendChild(div);
    });
}

// Event listener for form submission
document.getElementById('submitSurvey').addEventListener('click', function(e) {
    e.preventDefault();
    const form = document.getElementById('surveyForm');
    const formData = new FormData(form);
    const responses = {};
    for (let [key, value] of formData.entries()) {
        responses[key] = value;
    }
    // In a real application, you would send this data to a server
    console.log('Survey responses:', responses);
    alert('Survey submitted successfully!');
    // Notify the parent that the survey is completed
document.dispatchEvent(new CustomEvent('surveyCompleted', {
  detail: { surveyId: currentSurveyId }
}));

// Listen for messages from the parent window
window.addEventListener('message', function(event) {
    if (event.data.type === 'loadSurvey') {
        loadSurvey(event.data.surveyId);
    }
});
