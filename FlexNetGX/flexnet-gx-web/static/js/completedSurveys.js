// Function to load completed surveys
function loadCompletedSurveys() {
  const completedSurveyList = document.getElementById('completedSurveyList');
  // In a real application, you would fetch this data from a server or local storage
  const completedSurveys = [
      { id: 1, title: "Customer Satisfaction Survey", completedDate: "2023-05-15" },
      { id: 2, title: "Product Feedback Survey", completedDate: "2023-05-20" }
  ];

  completedSurveyList.innerHTML = '';
  completedSurveys.forEach(survey => {
      const li = document.createElement('li');
      li.className = 'survey-item';
      li.innerHTML = `
          <strong>${survey.title}</strong><br>
          Completed on: ${survey.completedDate}
      `;
      completedSurveyList.appendChild(li);
  });
}

// Load completed surveys when the page loads
window.addEventListener('load', loadCompletedSurveys);
