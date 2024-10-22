// forgotPassword.js

document.addEventListener('DOMContentLoaded', () => {
  const forgotPasswordForm = document.getElementById('forgotPasswordForm');
  const messageElement = document.getElementById('message');
  const backToLoginBtn = document.getElementById('backToLoginBtn');

  forgotPasswordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;

      // In a real application, you would send a request to your server to handle the password reset
      // For this example, we'll just show a message
      messageElement.textContent = `Password reset link sent to ${email}. Please check your email.`;
      forgotPasswordForm.reset();
  });

  backToLoginBtn.addEventListener('click', () => {
      window.location.href = 'index.html';
  });
});
