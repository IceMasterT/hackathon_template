// volunteerDashboard.js

document.addEventListener('DOMContentLoaded', function() {
  const contentArea = document.getElementById('content-area');
  const sidebarLinks = document.querySelectorAll('.sidebar-link');

  function navigateTo(url) {
    fetch(url)
      .then(response => response.text())
      .then(html => {
        contentArea.innerHTML = html;
      })
      .catch(error => {
        console.error('Error loading content:', error);
        contentArea.innerHTML = '<p>Error loading content. Please try again.</p>';
      });
  }

  function openNav() {
    document.getElementById("sidebar").style.width = "250px";
  }

  function closeNav() {
    document.getElementById("sidebar").style.width = "0";
  }

  function logout() {
    sessionStorage.clear();
    window.location.href = "index.html";
  }

  // Handle sidebar navigation
  sidebarLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const url = this.getAttribute('data-content');
      if (url) {
        navigateTo(url);
        closeNav();
      }
    });
  });

  // Handle survey completion
  document.addEventListener('surveyCompleted', function(event) {
    alert(`Survey ${event.detail.surveyId} completed!`);
    navigateTo('availableSurveys.html');
  });

  // Expose necessary functions to global scope
  window.openNav = openNav;
  window.closeNav = closeNav;
  window.logout = logout;

  // Load initial content (e.g., a welcome page or dashboard overview)
  navigateTo('welcome.html');
});
