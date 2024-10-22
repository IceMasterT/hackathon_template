function initializeTabManagement() {
  const sidebarLinks = document.querySelectorAll(".sidebar-link");
  const tabContents = document.querySelectorAll(".tab-content");

  // Handle sidebar links
  sidebarLinks.forEach(link => {
      link.addEventListener("click", function() {
          const targetId = link.id.split('-').pop();
          const targetUrl = link.getAttribute('data-url');
          if (targetUrl) {
              updateIframe(targetId, targetUrl);
              activateTab(targetId);
              closeNav();
          }
      });
  });

  // Handle submenu links
  document.querySelectorAll('.submenu-link').forEach(submenuLink => {
      submenuLink.addEventListener('click', function() {
          const targetUrl = submenuLink.getAttribute('data-url');
          updateIframe('dataengineering', targetUrl);
          activateTab('dataengineering');
      });
  });

  // Handle help submenu links
  document.querySelectorAll('#helpSubmenu li a').forEach(helpLink => {
      helpLink.addEventListener('click', function() {
          const targetId = helpLink.id.replace('Link', '');
          activateTab(targetId);
      });
  });
}

function updateIframe(tabId, url) {
  const iframe = document.getElementById(`${tabId}Iframe`);
  if (iframe) {
      iframe.src = url;
  }
}

function activateTab(targetId) {
  document.querySelectorAll('.tab-content').forEach(tab => {
      if (tab.id === targetId) {
          tab.classList.add('active');
      } else {
          tab.classList.remove('active');
      }
  });
}

// Make sure to call this function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeTabManagement);

// You might also want to export these functions if you're using modules
export { initializeTabManagement, updateIframe, activateTab };
