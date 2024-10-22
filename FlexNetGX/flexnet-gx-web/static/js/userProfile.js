$(document).ready(function() {
  // Function to fetch user data from server or local storage
  function fetchUserData() {
      // This is a placeholder. In a real application, you would fetch data from a server.
      return {
          firstName: "John",
          lastName: "Doe",
          username: "johndoe",
          email: "john.doe@example.com",
          cellPhone: "123-456-7890",
          role: "user"
      };
  }

  // Function to populate form fields with user data
  function populateForm(userData) {
      $('#firstName').val(userData.firstName);
      $('#lastName').val(userData.lastName);
      $('#username').val(userData.username);
      $('#email').val(userData.email);
      $('#cellPhone').val(userData.cellPhone);
      $('#role').val(userData.role);
  }

  // Fetch and populate user data
  const userData = fetchUserData();
  populateForm(userData);

  // Handle profile picture upload
  $('#upload').on('change', function(event) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = function(e) {
          $('#profileImg').attr('src', e.target.result);
      }

      reader.readAsDataURL(file);
  });

  // Handle edit button click
  $('#editBtn').on('click', function() {
      $('.profile-details input, .profile-details select').prop('readonly', false).prop('disabled', false);
      $('#editBtn').hide();
      $('#saveBtn').show();
  });

  // Handle save button click
  $('#saveBtn').on('click', function() {
      // Here you would typically send the updated data to a server
      // For this example, we'll just disable the inputs again
      $('.profile-details input, .profile-details select').prop('readonly', true).prop('disabled', true);
      $('#saveBtn').hide();
      $('#editBtn').show();
      alert('Profile updated successfully!');
  });

  // Handle logout button click
  $('#logoutBtn').on('click', function() {
      // Here you would typically send a request to the server to invalidate the session
      alert('Logged out of all devices');
      // Redirect to login page
      // window.location.href = 'login.html';
  });

  // Handle delete account button click
  $('#deleteBtn').on('click', function() {
      if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
          // Here you would typically send a request to the server to delete the account
          alert('Account deleted successfully');
          // Redirect to homepage or login page
          // window.location.href = 'index.html';
      }
  });

  // Handle back button click
  $('#backBtn').on('click', function() {
      // Redirect to the previous page or a specific page
      window.history.back();
  });
});
