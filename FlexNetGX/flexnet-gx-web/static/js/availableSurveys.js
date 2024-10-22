// availableSurveys.js

// Function to load available surveys
function loadAvailableSurveys() {
  const surveyList = document.getElementById('surveyList');
  // In a real application, you would fetch this data from a server
  const availableSurveys = [
      { id: 1, title: "Customer Satisfaction Survey" },
      { id: 2, title: "Product Feedback Survey" },
      { id: 3, title: "Website Usability Survey" }
  ];

  surveyList.innerHTML = '';
  availableSurveys.forEach(survey => {
      const li = document.createElement('li');
      li.className = 'survey-item';
      li.innerHTML = `
          ${survey.title}
          <button class="take-survey-btn" data-id="${survey.id}">Take Survey</button>
      `;
      surveyList.appendChild(li);
  });

  // Add event listeners to buttons
  document.querySelectorAll('.take-survey-btn').forEach(btn => {
      btn.addEventListener('click', function() {
          const surveyId = this.getAttribute('data-id');
          // Send a message to the parent window to load the survey
          window.parent.postMessage({type: 'loadSurvey', surveyId: surveyId}, '*');
      });
  });
}

// Load surveys when the page loads
window.addEventListener('load', loadAvailableSurveys);
