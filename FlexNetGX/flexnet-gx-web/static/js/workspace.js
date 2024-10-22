$(function() {
  handleFormSubmit("add-workspace-form", "workspaces-list", function(formData) {
      let workspaceNameField = formData.find(f => f.name === "workspace-name");
      let workspaceName = workspaceNameField ? workspaceNameField.value : "";

      return `
          <tr>
              <td>${workspaceName}</td>
              <td class="assigned-teams"></td>
              <td><input type="checkbox"></td>
              <td><input type="datetime-local"></td>
              <td>
                  <select class="status-select">
                      ${STATUS_OPTIONS}
                  </select>
              </td>
          </tr>
      `;
  });

  loadWorkspaces();
});

function loadWorkspaces() {
  let workspaces = JSON.parse(localStorage.getItem('workspaces')) || [];
  let workspacesList = $('#workspaces-list');
  workspacesList.empty();

  workspaces.forEach(workspace => {
      workspacesList.append(`
          <tr>
              <td>${workspace.name}</td>
              <td class="assigned-teams">${workspace.teams.join(', ')}</td>
              <td><input type="checkbox" ${workspace.assigned ? 'checked' : ''}></td>
              <td><input type="datetime-local" value="${workspace.dueDate || ''}"></td>
              <td>
                  <select class="status-select">
                      ${STATUS_OPTIONS}
                  </select>
              </td>
          </tr>
      `);
  });

  updateDropdowns();
}
