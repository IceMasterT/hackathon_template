// register.js

document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const errorMessage = document.getElementById('errorMessage');
  const backBtn = document.getElementById('backBtn');

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const username = document.getElementById('username').value;
    const cellPhone = document.getElementById('cellPhone').value;

    if (password !== confirmPassword) {
      errorMessage.textContent = 'Passwords do not match';
      return;
    }

    try {
      const newUser = {
        email,
        password,
        firstName,
        lastName,
        username,
        cellPhone,
        registrationDate: new Date().toISOString(),
        role: 'Admin' // Set the role to Admin by default
      };

      const isGenesisAdmin = saveUserData(newUser);

      if (isGenesisAdmin) {
        alert('Welcome! You are now registered as the Genesis Admin.');
        window.location.href = 'adminDashboard.html';
      } else {
        alert('Registration successful! You are now an admin.');
        window.location.href = 'adminDashboard.html';
      }
    } catch (error) {
      errorMessage.textContent = error.message;
    }
  });

  backBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
  });
});

function saveUserData(userData) {
  const data = DataStore.getData();
  let isGenesisAdmin = false;

  if (data.users.length === 0) {
    isGenesisAdmin = true;
  }

  DataStore.addUser(userData);

  return isGenesisAdmin;
}
