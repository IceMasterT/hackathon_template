$(function() {
  handleFormSubmit("add-team-form", "teams-list", function(formData) {
      let teamName = formData.find(f => f.name === "team-name").value;
      let workspace = formData.find(f => f.name === "team-workspace").value;

      return `
          <tr>
              <td>${teamName}</td>
              <td class="assigned-personnel"></td>
              <td><input type="checkbox"></td>
              <td><input type="datetime-local"></td>
              <td>
                  <select class="status-select">
                      ${STATUS_OPTIONS}
                  </select>
              </td>
              <td>
                  <select class="workspace-select">
                      <option value="${workspace}">${workspace}</option>
                  </select>
              </td>
          </tr>
      `;
  });

  loadTeams();
});

function loadTeams() {
  let teams = JSON.parse(localStorage.getItem('teams')) || [];
  let teamsList = $('#teams-list');
  teamsList.empty();

  teams.forEach(team => {
      teamsList.append(`
          <tr>
              <td>${team.name}</td>
              <td class="assigned-personnel">${team.personnel.join(', ')}</td>
              <td><input type="checkbox" ${team.assigned ? 'checked' : ''}></td>
              <td><input type="datetime-local" value="${team.dueDate || ''}"></td>
              <td>
                  <select class="status-select">
                      ${STATUS_OPTIONS}
                  </select>
              </td>
              <td>
                  <select class="workspace-select">
                      <option value="${team.workspace}">${team.workspace}</option>
                  </select>
              </td>
          </tr>
      `);
  });

  updateDropdowns();
}
