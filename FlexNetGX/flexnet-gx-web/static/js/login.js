// login.js

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const errorMessage = document.getElementById('errorMessage');

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const data = DataStore.getData();
    const user = data.users.find(u => u.username === username && u.password === password);

    if (user) {
      if (user.role) {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        redirectBasedOnRole(user.role);
      } else {
        errorMessage.textContent = 'Your account is pending approval. Please check back later.';
      }
    } else {
      errorMessage.textContent = 'Invalid username or password';
    }
  });
});

function redirectBasedOnRole(role) {
  switch (role) {
    case 'Volunteer':
      window.location.href = 'volunteerDashboard.html';
      break;
    case 'Research':
      window.location.href = 'researchDashboard.html';
      break;
    case 'Admin':
      window.location.href = 'adminDashboard.html';
      break;
    default:
      console.error('Invalid role');
      break;
  }
}
