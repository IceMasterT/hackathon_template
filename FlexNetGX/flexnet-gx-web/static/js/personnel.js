$(function() {
  // Load pending users
  loadPendingUsers();

  // Handle adding new person
  handleFormSubmit("add-person-form", "personnel-list", function(formData) {
      let firstName = formData.find(f => f.name === "first-name").value;
      let lastName = formData.find(f => f.name === "last-name").value;
      let email = formData.find(f => f.name === "email").value;
      let phone = formData.find(f => f.name === "phone").value;
      let role = formData.find(f => f.name === "role").value;
      let team = formData.find(f => f.name === "person-team").value;

      return `
          <tr>
              <td>${firstName} ${lastName}</td>
              <td>${role}</td>
              <td><input type="checkbox"></td>
              <td><input type="datetime-local"></td>
              <td>
                  <select class="status-select">
                      ${STATUS_OPTIONS}
                  </select>
              </td>
              <td>
                  <select class="team-select">
                      <option value="${team}">${team}</option>
                  </select>
              </td>
              <td>
                  <select class="workspace-select"></select>
              </td>
          </tr>
      `;
  });

  // Handle assigning roles to pending users
  $(document).on('click', '.assign-role-btn', function() {
      let row = $(this).closest('tr');
      let username = row.find('td:eq(2)').text();
      let role = row.find('.role-select').val();

      if (role) {
          assignRole(username, role);
          row.remove();
          loadPersonnelList();
      } else {
          alert('Please select a role before assigning.');
      }
  });
});

function loadPendingUsers() {
  let pendingUsers = JSON.parse(localStorage.getItem('pendingUsers')) || [];
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
                      <option value="Data Scientist">Data Scientist</option>
                      <option value="Researcher">Researcher</option>
                  </select>
              </td>
              <td><button class="assign-role-btn">Assign Role</button></td>
          </tr>
      `);
  });
}

function assignRole(username, role) {
  let pendingUsers = JSON.parse(localStorage.getItem('pendingUsers')) || [];
  let personnelList = JSON.parse(localStorage.getItem('personnelList')) || [];

  let userIndex = pendingUsers.findIndex(user => user.username === username);
  if (userIndex !== -1) {
      let user = pendingUsers[userIndex];
      user.role = role;
      personnelList.push(user);
      pendingUsers.splice(userIndex, 1);

      localStorage.setItem('pendingUsers', JSON.stringify(pendingUsers));
      localStorage.setItem('personnelList', JSON.stringify(personnelList));
  }
}

function loadPersonnelList() {
  let personnelList = JSON.parse(localStorage.getItem('personnelList')) || [];
  let personnelListElement = $('#personnel-list');
  personnelListElement.empty();

  personnelList.forEach(person => {
      personnelListElement.append(`
          <tr>
              <td>${person.firstName} ${person.lastName}</td>
              <td>${person.role}</td>
              <td><input type="checkbox"></td>
              <td><input type="datetime-local"></td>
              <td>
                  <select class="status-select">
                      ${STATUS_OPTIONS}
                  </select>
              </td>
              <td>
                  <select class="team-select"></select>
              </td>
              <td>
                  <select class="workspace-select"></select>
              </td>
          </tr>
      `);
  });

  updateDropdowns();
}
