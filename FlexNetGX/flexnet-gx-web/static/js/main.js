// File: main.js
// Description: Main application logic for the Project Management System
// Author: Steve Urkel
// Last Modified: [Current Date]

// Constants
const TEAMS_LIST = '#teams-list';
const WORKSPACES_LIST = '#workspaces-list';
const PERSONNEL_LIST = '#personnel-list';

$(function() {
  // Load welcome message
  $("#welcome-message").text(utils.loadFromStorage(CONSTANTS.WELCOME_MESSAGE_KEY, CONSTANTS.DEFAULT_WELCOME));

  $(function() {
    $("#tabs").tabs();

  // Load volunteer instructions
  $("#volunteer-instructions").html("<h3>Volunteer Instructions:</h3><p>" +
      utils.loadFromStorage(CONSTANTS.INSTRUCTIONS_KEY, CONSTANTS.DEFAULT_INSTRUCTIONS) + "</p>");

  // Button click handlers
  $("#surveys-available").click(surveyManager.loadAvailableSurveys);
  $("#surveys-completed").click(surveyManager.loadCompletedSurveys);
  $("#help-button").click(helpManager.toggleHelpForm);

  // Help form submission
  $("#help-request-form").submit(helpManager.submitHelpRequest);

  // Initialize submenu
  navigation.initSubmenu();
});

// Form submission handler
function handleFormSubmit(formId, tableId, rowTemplate) {
    $(`#${formId}`).on("submit", function(e) {
        e.preventDefault();
        try {
            const formData = $(this).serializeArray();
            const newRow = rowTemplate(formData);
            $(`#${tableId}`).append(newRow);
            updateDropdowns();
            this.reset();
        } catch (error) {
            console.error(`Error submitting form ${formId}:`, error);
            alert(`An error occurred while submitting the form. Please try again.`);
        }
    });
}

// Update all dropdowns
function updateDropdowns() {
    const teams = getListItems(TEAMS_LIST);
    const workspaces = getListItems(WORKSPACES_LIST);
    const personnel = getListItems(PERSONNEL_LIST);

    updateSelect(".team-select", teams);
    updateSelect(".workspace-select", workspaces);
    updateSelect(".person-select", personnel);

    updateAssignments();
}

// Get list items from a table
function getListItems(selector) {
    return $(selector + " tr").map(function() {
        return $(this).find("td:first").text();
    }).get();
}

// Update select options
function updateSelect(selector, options) {
    $(selector).each(function() {
        const currentValue = $(this).val();
        const optionsHtml = options.map(option => `<option value="${option}">${option}</option>`).join('');
        $(this).html(optionsHtml).val(currentValue);
    });
}

// Update assignments for teams and workspaces
function updateAssignments() {
    updateTeamAssignments();
    updateWorkspaceAssignments();
}

// Update team assignments
function updateTeamAssignments() {
    $(TEAMS_LIST + " tr").each(function() {
        const teamName = $(this).find("td:first").text();
        const assignedPersonnel = getAssignedItems(PERSONNEL_LIST, ".team-select", teamName);
        $(this).find(".assigned-personnel").text(assignedPersonnel);
    });
}

// Update workspace assignments
function updateWorkspaceAssignments() {
    $(WORKSPACES_LIST + " tr").each(function() {
        const workspaceName = $(this).find("td:first").text();
        const assignedTeams = getAssignedItems(TEAMS_LIST, ".workspace-select", workspaceName);
        $(this).find(".assigned-teams").text(assignedTeams);
    });
}

// Get assigned items
function getAssignedItems(listSelector, selectSelector, value) {
    return $(listSelector + " tr").filter(function() {
        return $(this).find(selectSelector).val() === value;
    }).map(function() {
        return $(this).find("td:first").text();
    }).get().join(", ");
}

// CSV to JSON conversion
function csvToJson(csv) {
    const lines = csv.split('\n');
    const result = [];
    const headers = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i]) continue;
        const obj = {};
        const currentline = lines[i].split(',');

        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j];
        }
        result.push(obj);
    }
    return JSON.stringify(result);
}

// Save as CSV
function saveAsCSV() {
    const tables = ['teams', 'workspaces', 'personnel'];
    let csvContent = '';

    tables.forEach(table => {
        csvContent += `${table.toUpperCase()}\n`;
        csvContent += Array.from($(`#${table}-list tr`)).map(row => 
            Array.from(row.cells).map(cell => cell.textContent).join(',')
        ).join('\n') + '\n\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "project_data.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Load CSV
function loadCSV(data) {
    const tables = ['teams', 'workspaces', 'personnel'];
    const sections = data.split('\n\n');

    sections.forEach((section, index) => {
        if (index >= tables.length) return;

        const rows = section.split('\n');
        const tableBody = $(`#${tables[index]}-list`);
        tableBody.empty();

        for (let i = 1; i < rows.length; i++) {
            if (!rows[i]) continue;
            const cells = rows[i].split(',');
            const rowHtml = `<tr>${cells.map(cell => `<td>${cell}</td>`).join('')}</tr>`;
            tableBody.append(rowHtml);
        }
    });

    updateDropdowns();
}

// Show database modal
function showDatabaseModal() {
    document.getElementById('databaseModal').style.display = 'block';
}

// Close database modal
function closeDatabaseModal() {
    document.getElementById('databaseModal').style.display = 'none';
}

// Connect to database
function connectToDatabase() {
    const dbDriver = document.getElementById('db-driver').value;
    const hostname = document.getElementById('hostname').value;
    const port = document.getElementById('port').value;
    const dbName = document.getElementById('db-name').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // This is a placeholder. In a real application, you'd send this data to your server.
    console.log(`Connecting to ${dbDriver} database ${dbName} on ${hostname}:${port} as ${username}`);
    alert('Database connection feature is not implemented in this demo.');

    closeDatabaseModal();
}

// Create team row
function createTeamRow(formData) {
    const name = formData.find(field => field.name === 'team-name').value;
    const workspace = formData.find(field => field.name === 'team-workspace').value;
    return `<tr>
        <td>${name}</td>
        <td>${workspace}</td>
        <td class="assigned-personnel"></td>
    </tr>`;
}

// Create workspace row
function createWorkspaceRow(formData) {
    const name = formData.find(field => field.name === 'workspace-name').value;
    return `<tr>
        <td>${name}</td>
        <td class="assigned-teams"></td>
    </tr>`;
}

// Create personnel row
function createPersonnelRow(formData) {
    const name = formData.find(field => field.name === 'person-name').value;
    const team = formData.find(field => field.name === 'person-team').value;
    return `<tr>
        <td>${name}</td>
        <td>${team}</td>
    </tr>`;
}

// Initialize the application
$(document).ready(function() {
    handleFormSubmit('team-form', 'teams-list', createTeamRow);
    handleFormSubmit('workspace-form', 'workspaces-list', createWorkspaceRow);
    handleFormSubmit('personnel-form', 'personnel-list', createPersonnelRow);
    updateDropdowns();

    // Event listeners for CSV and database operations
    $('#save-csv').on('click', saveAsCSV);
    $('#load-csv').on('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                loadCSV(e.target.result);
            };
            reader.readAsText(file);
        }
    });
    $('#show-db-modal').on('click', showDatabaseModal);
    $('#close-db-modal').on('click', closeDatabaseModal);
    $('#connect-db').on('click', connectToDatabase);
});

loadSurveys();

// Display surveys in the admin panel
function displaySurveys() {
    const surveyList = $("#survey-list");
    surveyList.empty();
    surveys.forEach(survey => {
        const listItem = $(`<li>${survey.name} - ${survey.target}</li>`);
        const sendButton = $(`<button>Send to Volunteer</button>`);
        sendButton.click(() => sendSurveyToVolunteer(survey.id));
        listItem.append(sendButton);
        surveyList.append(listItem);
    });
}

displaySurveys();
});
