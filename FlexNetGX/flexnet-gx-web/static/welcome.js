$(document).ready(function() {
  // Initialize tabs
  $("#tabs").tabs();

  // Set user name
  const userName = "John Doe"; // Replace with actual user name from your system
  $("#user-name").text(userName);

  // Function to create a new message
  function createMessage(title, content) {
      return `
          <div class="message">
              <h3>${title}</h3>
              <p>${content}</p>
          </div>
      `;
  }

  // Function to create a new feedback item
  function createFeedbackItem(title, content) {
      return `
          <div class="feedback-item">
              <h3>${title}</h3>
              <p>${content}</p>
          </div>
      `;
  }

  // Function to create a new survey item
  function createSurveyItem(title, content) {
      return `
          <div class="survey-item">
              <h3>${title}</h3>
              <p>${content}</p>
          </div>
      `;
  }

  // Function to create a new approval item
  function createApprovalItem(title, content) {
      return `
          <div class="approval-item">
              <h3>${title}</h3>
              <p>${content}</p>
          </div>
      `;
  }

  // Add sample data (replace with actual data from your system)
  $("#messages .message-list").append(
      createMessage("Welcome Message", "Welcome to your dashboard. Here you'll find all important updates.")
  );

  $("#feedback .feedback-list").append(
      createFeedbackItem("Recent Feedback", "Your latest project received positive feedback from the client.")
  );

  $("#surveys .survey-list").append(
      createSurveyItem("Customer Satisfaction Survey", "New results available. Overall satisfaction increased by 5%.")
  );

  $("#approval .approval-list").append(
      createApprovalItem("Budget Proposal", "The Q3 budget proposal is ready for your review and approval.")
  );

  // Help button click event
  $(".help-button").click(function() {
      alert("Connecting to support... Please wait.");
      // Implement actual support chat functionality here
  });

  // Make dashboard items draggable
  $(".dashboard-item").draggable({
      containment: "parent",
      cursor: "move",
      stop: function(event, ui) {
          // Save the new position to user preferences (implement this functionality)
          console.log("New position:", ui.position);
      }
  });

  // Periodically check for updates (every 5 minutes)
  setInterval(function() {
      // Implement API call to check for new messages, feedback, surveys, and approvals
      console.log("Checking for updates...");
  }, 300000);
});
