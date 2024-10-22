// navigation.js
const navigation = {
  openNav: function() {
      document.getElementById("sidebar").classList.add("open");
      document.body.classList.add("sidebar-open");
  },

  closeNav: function() {
      document.getElementById("sidebar").classList.remove("open");
      document.body.classList.remove("sidebar-open");
  },

  exitApplication: function() {
      this.logoutUser();
      this.clearSessionCache();
      window.close();
      setTimeout(function() {
          window.location.href = 'about:blank';
      }, 100);
  },

  logoutUser: function() {
      console.log("User logged out");
      // Add your logout logic here
  },

  clearSessionCache: function() {
      sessionStorage.clear();
      localStorage.clear();
      document.cookie.split(";").forEach(function(c) {
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      if ('caches' in window) {
          caches.keys().then(function(cacheNames) {
              return Promise.all(
                  cacheNames.map(function(cacheName) {
                      return caches.delete(cacheName);
                  })
              );
          });
      }
  },

  initSubmenu: function() {
      document.querySelectorAll('.menu-link').forEach(menuLink => {
          menuLink.addEventListener('mouseenter', function() {
              const submenu = this.nextElementSibling;
              if (submenu && submenu.classList.contains('submenu')) {
                  submenu.style.display = 'block';
              }
          });
          menuLink.addEventListener('mouseleave', function() {
              const submenu = this.nextElementSibling;
              if (submenu && submenu.classList.contains('submenu')) {
                  submenu.style.display = 'none';
              }
          });
      });

      document.querySelectorAll('.submenu').forEach(submenu => {
          submenu.addEventListener('mouseenter', function() {
              this.style.display = 'block';
          });
          submenu.addEventListener('mouseleave', function() {
              this.style.display = 'none';
          });
      });
  },

  init: function() {
      this.initSubmenu();
      const hamburger = document.getElementById('hamburger');
      if (hamburger) {
          hamburger.addEventListener('click', () => this.openNav());
      }
      const closeSidebar = document.getElementById('close-sidebar');
      if (closeSidebar) {
          closeSidebar.addEventListener('click', () => this.closeNav());
      }
      const exitButton = document.getElementById('exit-button');
      if (exitButton) {
          exitButton.addEventListener('click', () => this.exitApplication());
      }
  }
};

// Initialize the navigation when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  navigation.init();
});
