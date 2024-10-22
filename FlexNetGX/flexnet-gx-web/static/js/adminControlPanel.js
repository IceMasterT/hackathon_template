$(function() {
  // Initialize tabs
  $("#tabs").tabs();

  // Initialize timeline
  let timeline;
  let items = new vis.DataSet([]);
  initTimeline();

  // Load all data
  loadPendingUsers();
  loadAssignedPersonnel();
  loadTeams();
  loadWorkspaces();
  loadTasks();
  loadSurveys();
  loadMessages();
  displayFeedback();

  // Set up event listeners for forms
  setupFormListeners();

  // Initialize dropdowns
  updateDropdowns();

  // Make tables sortable
  makeTablesSortable();

  // Refresh data periodically
  setInterval(refreshAllData, 60000); // Refresh every minute

  function initTimeline() {
      let container = document.getElementById('timeline');
      let options = {
          editable: true,
          onMove: function(item, callback) {
              updateTask(item.id, { dueDate: item.start });
              callback(item);
          }
      };
      timeline = new vis.Timeline(container, items, options);
  }

  function loadPendingUsers() {
      const pendingUsers = JSON.parse(localStorage.getItem('pendingUsers')) || [];
      let pendingUsersList = $('#pending-users-list');
      pendingUsersList.empty();

      pendingUsers.forEach(user => {
          pendingUsersList.append(`
              <tr>
                  <td>${user.firstName} ${user.lastName}</td>
                  <td>${user.email}</td>
                  <td>${user.username}</td>
                  <td>
                      <select class="role-select">
                          <option value="">Select Role</option>
                          <option value="Volunteer">Volunteer</option>
                          <option value="Research">Research</option>
                          <option value="Admin">Admin</option>
                      </select>
                  </td>
                  <td><button class="assign-role-btn" data-username="${user.username}">Assign Role</button></td>
              </tr>
          `);
      });

      $('.assign-role-btn').on('click', function() {
          let username = $(this).data('username');
          let role = $(this).closest('tr').find('.role-select').val();
          assignRole(username, role);
      });
  }

  function loadAssignedPersonnel() {
      const assignedPersonnel = JSON.parse(localStorage.getItem('users')) || [];
      let assignedPersonnelList = $('#assigned-personnel-list');
      assignedPersonnelList.empty();

      assignedPersonnel.forEach(user => {
          assignedPersonnelList.append(`
              <tr>
                  <td>${user.firstName} ${user.lastName}</td>
                  <td>${user.email}</td>
                  <td>${user.role}</td>
                  <td>${user.team || 'Unassigned'}</td>
                  <td>
                      <select class="team-select">
                          <option value="">Assign to Team</option>
                          ${getTeamOptions()}
                      </select>
                  </td>
              </tr>
          `);
      });

      $('.team-select').on('change', function() {
          let email = $(this).closest('tr').find('td:eq(1)').text();
          let team = $(this).val();
          assignPersonnelToTeam(email, team);
      });
  }

  function loadTeams() {
      const teams = JSON.parse(localStorage.getItem('teams')) || [];
      let teamsList = $('#teams-list');
      teamsList.empty();

      teams.forEach(team => {
          teamsList.append(`
              <tr>
                  <td>${team.name}</td>
                  <td>${team.members.join(', ')}</td>
                  <td>${team.workspace || 'Unassigned'}</td>
                  <td>
                      <select class="workspace-select">
                          <option value="">Assign to Workspace</option>
                          ${getWorkspaceOptions()}
                      </select>
                  </td>
              </tr>
          `);
      });

      $('.workspace-select').on('change', function() {
          let teamName = $(this).closest('tr').find('td:first').text();
          let workspace = $(this).val();
          assignTeamToWorkspace(teamName, workspace);
      });
  }

  function loadWorkspaces() {
      const workspaces = JSON.parse(localStorage.getItem('workspaces')) || [];
      let workspacesList = $('#workspaces-list');
      workspacesList.empty();

      workspaces.forEach(workspace => {
          workspacesList.append(`
              <tr>
                  <td>${workspace.name}</td>
                  <td>${workspace.teams.join(', ')}</td>
                  <td><button class="delete-workspace-btn" data-name="${workspace.name}">Delete</button></td>
              </tr>
          `);
      });

      $('.delete-workspace-btn').on('click', function() {
        let workspaceName = $(this).data('name');
        deleteWorkspace(workspaceName);
    });
}

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let taskList = $('#task-list');
    taskList.empty();
    items.clear();

    tasks.forEach(task => {
        taskList.append(`
            <tr>
                <td>${task.name}</td>
                <td>${task.priority}</td>
                <td>${task.assignedTo}</td>
                <td>${new Date(task.dueDate).toLocaleString()}</td>
                <td>${task.status}</td>
                <td>${task.team}</td>
                <td>${task.workspace}</td>
                <td>
                    <button class="edit-task-btn" data-id="${task.id}">Edit</button>
                    <button class="delete-task-btn" data-id="${task.id}">Delete</button>
                </td>
            </tr>
        `);

        items.add({
            id: task.id,
            content: task.name,
            start: task.dueDate
        });
    });

    $('.edit-task-btn').on('click', function() {
        let taskId = $(this).data('id');
        editTask(taskId);
    });

    $('.delete-task-btn').on('click', function() {
        let taskId = $(this).data('id');
        deleteTask(taskId);
    });

    timeline.setItems(items);
}

function loadSurveys() {
    const surveys = JSON.parse(localStorage.getItem('surveys')) || [];
    let surveysList = $('#surveys-list');
    surveysList.empty();

    surveys.forEach(survey => {
        surveysList.append(`
            <tr>
                <td>${survey.name}</td>
                <td>${survey.target}</td>
                <td>${new Date(survey.dueDate).toLocaleString()}</td>
                <td>
                    <button class="view-survey-btn" data-id="${survey.id}">View</button>
                    <button class="delete-survey-btn" data-id="${survey.id}">Delete</button>
                </td>
            </tr>
        `);
    });

    $('.view-survey-btn').on('click', function() {
        let surveyId = $(this).data('id');
        viewSurvey(surveyId);
    });

    $('.delete-survey-btn').on('click', function() {
        let surveyId = $(this).data('id');
        deleteSurvey(surveyId);
    });
}

function loadMessages() {
    $('#welcome-message').val(localStorage.getItem('welcomeMessage') || '');
    $('#volunteer-instructions').val(localStorage.getItem('volunteerInstructions') || '');
}

function setupFormListeners() {
    $('#add-person-form').on('submit', handlePersonnelSubmit);
    $('#add-team-form').on('submit', handleTeamSubmit);
    $('#add-workspace-form').on('submit', handleWorkspaceSubmit);
    $('#add-task-form').on('submit', handleTaskSubmit);
    $('#survey-form').on('submit', handleSurveySubmit);
    $('#welcome-message-form').on('submit', handleWelcomeMessageSubmit);
    $('#volunteer-instructions-form').on('submit', handleVolunteerInstructionsSubmit);
    $('#notificationForm').on('submit', handleNotificationSubmit);
    $('#feedbackForm').on('submit', handleFeedbackSubmit);
}

function handlePersonnelSubmit(e) {
    e.preventDefault();
    const newPerson = {
        firstName: $('#first-name').val(),
        lastName: $('#last-name').val(),
        email: $('#email').val(),
        phone: $('#phone').val(),
        role: $('#role').val(),
        team: null
    };

    let users = JSON.parse(localStorage.getItem('users')) || [];
    users.push(newPerson);
    localStorage.setItem('users', JSON.stringify(users));
    loadAssignedPersonnel();
    this.reset();
}

function handleTeamSubmit(e) {
    e.preventDefault();
    const newTeam = {
        name: $('#team-name').val(),
        members: [],
        workspace: null
    };

    let teams = JSON.parse(localStorage.getItem('teams')) || [];
    teams.push(newTeam);
    localStorage.setItem('teams', JSON.stringify(teams));
    loadTeams();
    this.reset();
}

function handleWorkspaceSubmit(e) {
    e.preventDefault();
    const newWorkspace = {
        name: $('#workspace-name').val(),
        teams: []
    };

    let workspaces = JSON.parse(localStorage.getItem('workspaces')) || [];
    workspaces.push(newWorkspace);
    localStorage.setItem('workspaces', JSON.stringify(workspaces));
    loadWorkspaces();
    this.reset();
}

function handleTaskSubmit(e) {
    e.preventDefault();
    const newTask = {
        id: Date.now(),
        name: $('#task-name').val(),
        dueDate: $('#task-due-date').val(),
        priority: $('#task-priority').val(),
        assignedTo: $('#task-assigned-to').val(),
        status: 'Not Started',
        team: $('#task-team').val(),
        workspace: $('#task-workspace').val()
    };

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push(newTask);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    loadTasks();
    this.reset();
}

function handleSurveySubmit(e) {
    e.preventDefault();
    const newSurvey = {
        id: Date.now(),
        name: $('#survey-name').val(),
        description: $('#survey-description').val(),
        target: $('#survey-target').val(),
        targetSpecific: $('#survey-target-specific').val(),
        dueDate: $('#survey-due-date').val(),
        questions: []
    };

    $('.survey-question').each(function() {
        newSurvey.questions.push({
            question: $(this).find('input').val(),
            type: $(this).find('select').val()
        });
    });

    let surveys = JSON.parse(localStorage.getItem('surveys')) || [];
    surveys.push(newSurvey);
    localStorage.setItem('surveys', JSON.stringify(surveys));
    loadSurveys();
    this.reset();
    $('#survey-questions').empty();
}

function handleWelcomeMessageSubmit(e) {
    e.preventDefault();
    localStorage.setItem('welcomeMessage', $('#welcome-message').val());
    alert('Welcome message updated successfully!');
}

function handleVolunteerInstructionsSubmit(e) {
    e.preventDefault();
    localStorage.setItem('volunteerInstructions', $('#volunteer-instructions').val());
    alert('Volunteer instructions updated successfully!');
}

function handleNotificationSubmit(e) {
    e.preventDefault();
    const notification = {
        message: $('#notificationMessage').val(),
        target: $('#notificationTarget').val(),
        targetSpecific: $('#notificationTargetSpecific').val()
    };
    sendNotification(notification);
    this.reset();
}

function handleFeedbackSubmit(e) {
    e.preventDefault();
    const feedback = {
        text: $('#feedbackText').val(),
        timestamp: new Date().toISOString()
    };
    let feedbackList = JSON.parse(localStorage.getItem('feedback')) || [];
    feedbackList.push(feedback);
    localStorage.setItem('feedback', JSON.stringify(feedbackList));
    displayFeedback();
    this.reset();
}

function updateDropdowns() {
    updatePersonnelDropdown();
    updateTeamDropdown();
    updateWorkspaceDropdown();
}

function updatePersonnelDropdown() {
    const personnel = JSON.parse(localStorage.getItem('users')) || [];
    let options = '<option value="">Select Person</option>';
    personnel.forEach(person => {
        options += `<option value="${person.email}">${person.firstName} ${person.lastName}</option>`;
    });
    $('#task-assigned-to').html(options);
}

function updateTeamDropdown() {
    const teams = JSON.parse(localStorage.getItem('teams')) || [];
    let options = '<option value="">Select Team</option>';
    teams.forEach(team => {
        options += `<option value="${team.name}">${team.name}</option>`;
    });
    $('#task-team').html(options);
}

function updateWorkspaceDropdown() {
    const workspaces = JSON.parse(localStorage.getItem('workspaces')) || [];
    let options = '<option value="">Select Workspace</option>';
    workspaces.forEach(workspace => {
        options += `<option value="${workspace.name}">${workspace.name}</option>`;
    });
    $('#task-workspace').html(options);
}

function makeTablesSortable() {
    $("#pending-users-table, #assigned-personnel-table, #teams-table, #workspaces-table, #task-table, #surveys-table").tablesorter();
}

function assignRole(username, role) {
    let pendingUsers = JSON.parse(localStorage.getItem('pendingUsers')) || [];
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = pendingUsers.findIndex(user => user.username === username);
    if (userIndex !== -1) {
        const user = pendingUsers[userIndex];
        user.role = role;
        users.push(user);
        pendingUsers.splice(userIndex, 1);
        localStorage.setItem('pendingUsers', JSON.stringify(pendingUsers));
        localStorage.setItem('users', JSON.stringify(users));
        loadPendingUsers();
        loadAssignedPersonnel();
    }
}

function assignPersonnelToTeam(email, team) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let teams = JSON.parse(localStorage.getItem('teams')) || [];
    const userIndex = users.findIndex(user => user.email === email);
    const teamIndex = teams.findIndex(t => t.name === team);
    if (userIndex !== -1 && teamIndex !== -1) {
        users[userIndex].team = team;
        teams[teamIndex].members.push(users[userIndex].firstName + ' ' + users[userIndex].lastName);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('teams', JSON.stringify(teams));
        loadAssignedPersonnel();
        loadTeams();
    }
}

function assignTeamToWorkspace(teamName, workspace) {
    let teams = JSON.parse(localStorage.getItem('teams')) || [];
    let workspaces = JSON.parse(localStorage.getItem('workspaces')) || [];
    const teamIndex = teams.findIndex(t => t.name === teamName);
    const workspaceIndex = workspaces.findIndex(w => w.name === workspace);
    if (teamIndex !== -1 && workspaceIndex !== -1) {
        teams[teamIndex].workspace = workspace;
        workspaces[workspaceIndex].teams.push(teamName);
        localStorage.setItem('teams', JSON.stringify(teams));
        localStorage.setItem('workspaces', JSON.stringify(workspaces));
        loadTeams();
        loadWorkspaces();
    }
}

function deleteWorkspace(workspaceName) {
    if (confirm(`Are you sure you want to delete the workspace "${workspaceName}"?`)) {
        let workspaces = JSON.parse(localStorage.getItem('workspaces')) || [];
        let teams = JSON.parse(localStorage.getItem('teams')) || [];
        workspaces = workspaces.filter(w => w.name !== workspaceName);
        teams.forEach(team => {
            if (team.workspace === workspaceName) {
                team.workspace = null;
            }
        });
        localStorage.setItem('workspaces', JSON.stringify(workspaces));
        localStorage.setItem('teams', JSON.stringify(teams));
        loadWorkspaces();
        loadTeams();
    }
}

function editTask(taskId) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        $('#task-name').val(task.name);
        $('#task-due-date').val(task.dueDate);
        $('#task-priority').val(task.priority);
        $('#task-assigned-to').val(task.assignedTo);
        $('#task-team').val(task.team);
        $('#task-workspace').val(task.workspace);
        $('#add-task-form').data('editing', taskId);
        $('#add-task-form button[type="submit"]').text('Update Task');
    }
}

function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks = tasks.filter(t => t.id !== taskId);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        loadTasks();
    }
}

function viewSurvey(surveyId) {
    let surveys = JSON.parse(localStorage.getItem('surveys')) || [];
    const survey = surveys.find(s => s.id === surveyId);
    if (survey) {
        let surveyHtml = `<h2>${survey.name}</h2>`;
        surveyHtml += `<p>${survey.description}</p>`;
        surveyHtml += `<p>Target: ${survey.target}</p>`;
        surveyHtml += `<p>Due Date: ${new Date(survey.dueDate).toLocaleString()}</p>`;
        surveyHtml += '<h3>Questions:</h3><ol>';
        survey.questions.forEach(q => {
            surveyHtml += `<li>${q.question} (${q.type})</li>`;
        });
        surveyHtml += '</ol>';
        $('#survey-view').html(surveyHtml).dialog({
            modal: true,
            width: 500,
            buttons: {
                Close: function() {
                    $(this).dialog('close');
                }
            }
        });
    }
}

function deleteSurvey(surveyId) {
    if (confirm('Are you sure you want to delete this survey?')) {
        let surveys = JSON.parse(localStorage.getItem('surveys')) || [];
        surveys = surveys.filter(s => s.id !== surveyId);
        localStorage.setItem('surveys', JSON.stringify(surveys));
        loadSurveys();
    }
}

function sendNotification(notification) {
    // In a real application, this would send the notification to the specified targets
    console.log('Sending notification:', notification);
    alert('Notification sent successfully!');
}

function displayFeedback() {
    const feedback = JSON.parse(localStorage.getItem('feedback')) || [];
    let feedbackHtml = '<ul>';
    feedback.forEach(f => {
        feedbackHtml += `<li>${f.text} (${new Date(f.timestamp).toLocaleString()})</li>`;
    });
    feedbackHtml += '</ul>';
    $('#feedbackDisplay').html(feedbackHtml);
}

function refreshAllData() {
    loadPendingUsers();
    loadAssignedPersonnel();
    loadTeams();
    loadWorkspaces();
    loadTasks();
    loadSurveys();
    loadMessages();
    displayFeedback();
    updateDropdowns();
}

    // Report generation functions
    $('#generatePersonnelReport').on('click', generatePersonnelReport);
    $('#generateTeamsReport').on('click', generateTeamsReport);
    $('#generateWorkspacesReport').on('click', generateWorkspacesReport);
    $('#generateTasksReport').on('click', generateTasksReport);

    function generatePersonnelReport() {
        const personnel = JSON.parse(localStorage.getItem('users')) || [];
        let reportContent = 'Name,Email,Role,Team\n';
        personnel.forEach(person => {
            reportContent += `${person.firstName} ${person.lastName},${person.email},${person.role},${person.team || 'Unassigned'}\n`;
        });
        downloadReport('personnel_report.csv', reportContent);
    }

    function generateTeamsReport() {
        const teams = JSON.parse(localStorage.getItem('teams')) || [];
        let reportContent = 'Team Name,Members,Workspace\n';
        teams.forEach(team => {
            reportContent += `${team.name},${team.members.join('; ')},${team.workspace || 'Unassigned'}\n`;
        });
        downloadReport('teams_report.csv', reportContent);
    }

    function generateWorkspacesReport() {
        const workspaces = JSON.parse(localStorage.getItem('workspaces')) || [];
        let reportContent = 'Workspace Name,Teams\n';
        workspaces.forEach(workspace => {
            reportContent += `${workspace.name},${workspace.teams.join('; ')}\n`;
        });
        downloadReport('workspaces_report.csv', reportContent);
    }

    function generateTasksReport() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        let reportContent = 'Task Name,Priority,Assigned To,Due Date,Status,Team,Workspace\n';
        tasks.forEach(task => {
            reportContent += `${task.name},${task.priority},${task.assignedTo},${task.dueDate},${task.status},${task.team},${task.workspace}\n`;
        });
        downloadReport('tasks_report.csv', reportContent);
    }

    function downloadReport(filename, content) {
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(content));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    // Helper functions
    function getTeamOptions() {
        const teams = JSON.parse(localStorage.getItem('teams')) || [];
        return teams.map(team => `<option value="${team.name}">${team.name}</option>`).join('');
    }

    function getWorkspaceOptions() {
        const workspaces = JSON.parse(localStorage.getItem('workspaces')) || [];
        return workspaces.map(workspace => `<option value="${workspace.name}">${workspace.name}</option>`).join('');
    }

    // Initialize the page
    refreshAllData();

    // Add question button functionality
    $('#add-question').on('click', function() {
        const questionNum = $('.survey-question').length + 1;
        const questionHtml = `
            <div class="survey-question">
                <input type="text" placeholder="Question ${questionNum}" required>
                <select required>
                    <option value="text">Text</option>
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="rating">Rating</option>
                </select>
                <button type="button" class="remove-question">Remove</button>
            </div>
        `;
        $('#survey-questions').append(questionHtml);
    });

    // Remove question button functionality
    $(document).on('click', '.remove-question', function() {
        $(this).closest('.survey-question').remove();
    });

    // Survey target change functionality
    $('#survey-target').on('change', function() {
        const target = $(this).val();
        const $targetSpecific = $('#survey-target-specific');
        $targetSpecific.empty().hide();

        if (target === 'workspace') {
            const workspaces = JSON.parse(localStorage.getItem('workspaces')) || [];
            workspaces.forEach(workspace => {
                $targetSpecific.append(`<option value="${workspace.name}">${workspace.name}</option>`);
            });
            $targetSpecific.show();
        } else if (target === 'team') {
            const teams = JSON.parse(localStorage.getItem('teams')) || [];
            teams.forEach(team => {
                $targetSpecific.append(`<option value="${team.name}">${team.name}</option>`);
            });
            $targetSpecific.show();
        } else if (target === 'individual') {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            users.forEach(user => {
                $targetSpecific.append(`<option value="${user.email}">${user.firstName} ${user.lastName}</option>`);
            });
            $targetSpecific.show();
        }
    });

    // Notification target change functionality
    $('#notificationTarget').on('change', function() {
        const target = $(this).val();
        const $targetSpecific = $('#notificationTargetSpecific');
        $targetSpecific.empty().hide();

        if (target === 'workspace') {
            const workspaces = JSON.parse(localStorage.getItem('workspaces')) || [];
            workspaces.forEach(workspace => {
                $targetSpecific.append(`<option value="${workspace.name}">${workspace.name}</option>`);
            });
            $targetSpecific.show();
        } else if (target === 'team') {
            const teams = JSON.parse(localStorage.getItem('teams')) || [];
            teams.forEach(team => {
                $targetSpecific.append(`<option value="${team.name}">${team.name}</option>`);
            });
            $targetSpecific.show();
        } else if (target === 'individual') {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            users.forEach(user => {
                $targetSpecific.append(`<option value="${user.email}">${user.firstName} ${user.lastName}</option>`);
            });
            $targetSpecific.show();
        }
    });

    // Function to update a task
    function updateTask(taskId, updates) {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
            localStorage.setItem('tasks', JSON.stringify(tasks));
            loadTasks();
        }
    }

    // Refresh pending users button functionality
    $('#refresh-pending-users').on('click', function() {
        // In a real application, this would fetch new pending users from a server
        // For this example, we'll just reload the existing pending users
        loadPendingUsers();
    });
});
