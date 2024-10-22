// researchDashboard.js

document.addEventListener('DOMContentLoaded', function() {
  const ResearchDashboard = {
      contentArea: null,
      sidebarLinks: null,
      logoutLink: null,
      exitButton: null,
      currentUser: null,
      hamburger: null,
      closeSidebar: null,

      init: function() {
          this.contentArea = document.getElementById('content-area');
          this.sidebarLinks = document.querySelectorAll('.sidebar-link');
          this.logoutLink = document.getElementById('logout-link');
          this.exitButton = document.getElementById('exit-button');
          this.hamburger = document.getElementById('hamburger');
          this.closeSidebar = document.getElementById('close-sidebar');

          this.loadCurrentUser();
          this.setupEventListeners();
          this.loadInitialContent();
      },

      loadCurrentUser: function() {
          const userData = sessionStorage.getItem('currentUser');
          if (userData) {
              this.currentUser = JSON.parse(userData);
              if (this.currentUser.role !== 'Research') {
                  this.redirectToLogin();
              }
          } else {
              this.redirectToLogin();
          }
      },

      setupEventListeners: function() {
          this.sidebarLinks.forEach(link => {
              link.addEventListener('click', (e) => this.handleSidebarLinkClick(e));
          });

          if (this.logoutLink) {
              this.logoutLink.addEventListener('click', (e) => this.handleLogout(e));
          }

          if (this.exitButton) {
              this.exitButton.addEventListener('click', (e) => this.handleExit(e));
          }

          if (this.hamburger) {
              this.hamburger.addEventListener('click', () => this.toggleSidebar());
          }

          if (this.closeSidebar) {
              this.closeSidebar.addEventListener('click', () => this.closeSidebarMenu());
          }

          window.addEventListener('message', (event) => this.handleMessage(event));
      },

      loadInitialContent: function() {
          this.loadContent('welcome');
      },

      handleSidebarLinkClick: function(e) {
          e.preventDefault();
          const contentId = e.target.getAttribute('data-content');
          this.loadContent(contentId);

          // Close sidebar on mobile
          if (window.innerWidth <= 768) {
              this.closeSidebarMenu();
          }
      },

      handleLogout: function(e) {
          e.preventDefault();
          this.logout();
      },

      handleExit: function(e) {
          e.preventDefault();
          this.exitApplication();
      },

      handleMessage: function(event) {
          if (event.data.type === 'spreadsheetLoaded') {
              console.log('Spreadsheet loaded successfully');
              // Perform any necessary actions here
          }
      },

      loadContent: function(contentId) {
          this.hideAllContent();
          const selectedFrame = document.getElementById(`${contentId}-frame`);

          if (selectedFrame) {
              selectedFrame.style.display = 'block';
              this.initializeContentScripts(contentId);
          } else {
              console.error(`Frame not found for content: ${contentId}`);
          }
      },

      hideAllContent: function() {
          const frames = document.querySelectorAll('#content-area iframe');
          frames.forEach(frame => {
              frame.style.display = 'none';
          });
      },

      initializeContentScripts: function(contentId) {
          switch(contentId) {
              case 'welcome':
                  console.log('Welcome page loaded');
                  break;
              case 'dashboard':
                  console.log('Dashboard (spreadsheet) loaded');
                  if (typeof initializeSpreadsheet === 'function') initializeSpreadsheet();
                  break;
              case 'settings':
                  if (typeof initializeSettings === 'function') initializeSettings();
                  break;
              case 'profile':
                  if (typeof initializeProfile === 'function') initializeProfile();
                  break;
          }
      },

      toggleSidebar: function() {
          document.getElementById('sidebar').classList.toggle('active');
          document.body.classList.toggle('sidebar-open');
      },

      closeSidebarMenu: function() {
          document.getElementById('sidebar').classList.remove('active');
          document.body.classList.remove('sidebar-open');
      },

      logout: function() {
          sessionStorage.clear();
          this.redirectToLogin();
      },

      exitApplication: function() {
          if (confirm('Are you sure you want to exit? All unsaved changes will be lost.')) {
              sessionStorage.clear();
              if ('caches' in window) {
                  caches.keys().then(function(names) {
                      for (let name of names) caches.delete(name);
                  });
              }
              this.redirectToLogin();
              setTimeout(() => {
                  window.close();
              }, 1000);
          }
      },

      redirectToLogin: function() {
          window.location.href = "index.html";
      }
  };

  ResearchDashboard.init();
});

// Global function declarations
function initializeSettings() {
  console.log('Initializing settings');
  // Implementation for initializing settings
}

function initializeProfile() {
  console.log('Initializing profile');
  // Implementation for initializing profile
}

function initializeSpreadsheet() {
  console.log('Initializing spreadsheet');
  // Implementation for initializing spreadsheet
}
