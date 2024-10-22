// index.js

document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  const loginForm = document.getElementById('loginForm');
  const errorMessage = document.getElementById('errorMessage');
  const registerBtn = document.getElementById('registerBtn');
  const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsPopup = document.getElementById('settingsPopup');
  const saveSettingsBtn = document.getElementById('saveButton');
  const backSettingsBtn = document.getElementById('backButton');
  const cancelSettingsBtn = document.getElementById('cancelButton');

  // Load settings from localStorage
  loadSettings();

  // Event listeners
  loginForm.addEventListener('submit', handleLogin);
  registerBtn.addEventListener('click', handleRegister);
  forgotPasswordBtn.addEventListener('click', handleForgotPassword);
  settingsBtn.addEventListener('click', openSettingsPopup);
  saveSettingsBtn.addEventListener('click', saveSettings);
  backSettingsBtn.addEventListener('click', closeSettingsPopup);
  cancelSettingsBtn.addEventListener('click', cancelSettings);

  /**
   * Handle login form submission
   * @param {Event} e - The submit event
   */
  function handleLogin(e) {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      // Check user data
      const userData = JSON.parse(localStorage.getItem('userData')) || [];
      const user = userData.find(u => u.email === email && u.password === password);

      if (user) {
          if (user.role) {
              // User has a role assigned, allow login
              sessionStorage.setItem('currentUser', JSON.stringify(user));
              redirectBasedOnRole(user.role);
          } else {
              errorMessage.textContent = 'Your account is pending approval. Please check back later.';
          }
      } else {
          errorMessage.textContent = 'Invalid email or password';
      }
  }

  /**
   * Redirect user based on their role
   * @param {string} role - The user's role
   */
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

  /**
   * Handle register button click
   */
  function handleRegister() {
      window.location.href = 'register.html';
  }

  /**
   * Handle forgot password button click
   */
  function handleForgotPassword() {
      window.location.href = 'forgotPassword.html';
  }

  /**
   * Open settings popup
   */
  function openSettingsPopup() {
      settingsPopup.style.display = 'block';
  }

  /**
   * Close settings popup
   */
  function closeSettingsPopup() {
      settingsPopup.style.display = 'none';
  }

  /**
   * Load settings from localStorage
   */
  function loadSettings() {
      const settings = JSON.parse(localStorage.getItem('settings')) || {};
      document.getElementById('dateFormat').value = settings.dateFormat || 'mdy';
      document.getElementById('timeFormat').value = settings.timeFormat || '24h';
      document.getElementById('timeOverlayToggle').checked = settings.timeOverlay || false;
      document.getElementById('modeToggle').value = settings.mode || 'day';
      document.getElementById('fontChoice').value = settings.font || 'Arial';

      applySettings(settings);
  }

  /**
   * Save settings to localStorage
   */
  function saveSettings() {
      const settings = {
          dateFormat: document.getElementById('dateFormat').value,
          timeFormat: document.getElementById('timeFormat').value,
          timeOverlay: document.getElementById('timeOverlayToggle').checked,
          mode: document.getElementById('modeToggle').value,
          font: document.getElementById('fontChoice').value
      };

      localStorage.setItem('settings', JSON.stringify(settings));
      applySettings(settings);
      closeSettingsPopup();
      alert('Settings saved successfully!');
  }

  /**
   * Cancel settings changes
   */
  function cancelSettings() {
      loadSettings();
      closeSettingsPopup();
  }

  /**
   * Apply settings to the page
   * @param {Object} settings - The settings object
   */
  function applySettings(settings) {
      document.body.style.fontFamily = settings.font;
      document.body.classList.toggle('night-mode', settings.mode === 'night');
      updateTimeOverlay(settings.timeOverlay, settings.timeFormat);
  }

  /**
   * Update the time overlay based on settings
   * @param {boolean} show - Whether to show or hide the overlay
   * @param {string} format - The time format to use (12h or 24h)
   */
  function updateTimeOverlay(show, format) {
      let overlay = document.getElementById('timeOverlay');
      if (!overlay) {
          overlay = document.createElement('div');
          overlay.id = 'timeOverlay';
          document.body.appendChild(overlay);
          makeOverlayDraggable(overlay);
      }

      if (show) {
          overlay.style.display = 'block';
          updateTime();
          setInterval(updateTime, 1000);
      } else {
          overlay.style.display = 'none';
      }

      function updateTime() {
          const now = new Date();
          let timeString;
          if (format === '24h') {
              timeString = now.toLocaleTimeString('en-US', { hour12: false });
          } else {
              timeString = now.toLocaleTimeString('en-US', { hour12: true });
          }
          overlay.textContent = timeString;
      }
  }

  /**
   * Make the time overlay draggable
   * @param {HTMLElement} overlay - The overlay element
   */
  function makeOverlayDraggable(overlay) {
      let isDragging = false;
      let currentX;
      let currentY;
      let initialX;
      let initialY;
      let xOffset = 0;
      let yOffset = 0;

      overlay.addEventListener('mousedown', dragStart);
      document.addEventListener('mousemove', drag);
      document.addEventListener('mouseup', dragEnd);

      function dragStart(e) {
          initialX = e.clientX - xOffset;
          initialY = e.clientY - yOffset;

          if (e.target === overlay) {
              isDragging = true;
          }
      }

      function drag(e) {
          if (isDragging) {
              e.preventDefault();
              currentX = e.clientX - initialX;
              currentY = e.clientY - initialY;

              xOffset = currentX;
              yOffset = currentY;

              setTranslate(currentX, currentY, overlay);
          }
      }

      function dragEnd() {
          initialX = currentX;
          initialY = currentY;

          isDragging = false;
      }

      function setTranslate(xPos, yPos, el) {
          el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
      }
  }
});
