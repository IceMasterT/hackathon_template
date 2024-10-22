const utils = {
  loadFromStorage: function(key, defaultValue) {
      return localStorage.getItem(key) || defaultValue;
  },
  saveToStorage: function(key, value) {
      localStorage.setItem(key, value);
  }
};

function handleFormSubmit(formId, tableId, rowTemplate) {
  $(`#${formId}`).on("submit", function(e) {
      e.preventDefault();
      try {
          let formData = $(this).serializeArray();
          let newRow = rowTemplate(formData);
          $(`#${tableId}`).append(newRow);
          updateDropdowns();
          this.reset();
      } catch (error) {
          console.error(`Error submitting form ${formId}:`, error);
          // Display error to user
      }
  });
}

function updateDropdowns() {
  let teams = $(TEAMS_LIST + " tr").map(function() {
      return $(this).find("td:first").text();
  }).get();

  let workspaces = $(WORKSPACES_LIST + " tr").map(function() {
      return $(this).find("td:first").text();
  }).get();

  let personnel = $(PERSONNEL_LIST + " tr").map(function() {
      return $(this).find("td:first").text();
  }).get();

  updateSelect(".team-select", teams);
  updateSelect(".workspace-select", workspaces);
  updateSelect(".person-select", personnel);

  updateAssignments();
}

function updateSelect(selector, options) {
  $(selector).each(function() {
      let currentValue = $(this).val();
      let optionsHtml = options.map(option => `<option value="${option}">${option}</option>`).join('');
      $(this).html(optionsHtml).val(currentValue);
  });
}

function updateAssignments() {
  // Update assigned personnel for each team
  $(TEAMS_LIST + " tr").each(function() {
      let teamName = $(this).find("td:first").text();
      let assignedPersonnel = $(PERSONNEL_LIST + " tr").filter(function() {
          return $(this).find(".team-select").val() === teamName;
      }).map(function() {
          return $(this).find("td:first").text();
      }).get().join(", ");
      $(this).find(".assigned-personnel").text(assignedPersonnel);
  });

  // Update assigned teams for each workspace
  $(WORKSPACES_LIST + " tr").each(function() {
      let workspaceName = $(this).find("td:first").text();
      let assignedTeams = $(TEAMS_LIST + " tr").filter(function() {
          return $(this).find(".workspace-select").val() === workspaceName;
      }).map(function() {
          return $(this).find("td:first").text();
      }).get().join(", ");
      $(this).find(".assigned-teams").text(assignedTeams);
  });
  

  function csvToJson(csv) {
    // Implementation for CSV to JSON conversion
}

function saveAsCSV() {
    // Implementation for saving as CSV
}

function loadCSV(data) {
    // Implementation for loading CSV
}

function showDatabaseModal() {
    document.getElementById('databaseModal').style.display = 'block';
}

function closeDatabaseModal() {
    document.getElementById('databaseModal').style.display = 'none';
}

function connectToDatabase() {
    // Implementation for database connection
}

// Add other utility functions here
}
