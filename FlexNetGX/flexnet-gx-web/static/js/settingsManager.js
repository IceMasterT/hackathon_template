document.addEventListener('DOMContentLoaded', function() {
  loadSettings();
  setupEventListeners();
});

function loadSettings() {
  const settings = JSON.parse(localStorage.getItem('settings')) || {};

  document.getElementById('dateFormat').value = settings.dateFormat || 'mdy';
  document.getElementById('timeFormat').value = settings.timeFormat || '24h';
  document.getElementById('timeOverlayToggle').checked = settings.timeOverlay || false;
  document.getElementById('modeToggle').value = settings.mode || 'day';
  document.getElementById('fontChoice').value = settings.font || 'Arial';

  applySettings(settings);
}

function setupEventListeners() {
  document.getElementById('saveButton').addEventListener('click', saveSettings);
  document.getElementById('backButton').addEventListener('click', goBack);
  document.getElementById('cancelButton').addEventListener('click', cancel);
  document.getElementById('timeOverlayToggle').addEventListener('change', toggleTimeOverlay);
  document.getElementById('modeToggle').addEventListener('change', toggleMode);
  document.getElementById('fontChoice').addEventListener('change', changeFont);
  document.getElementById('timeFormat').addEventListener('change', changeTimeFormat);
}

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
  alert('Settings saved successfully!');
}

function applySettings(settings) {
  document.body.style.fontFamily = settings.font;
  document.body.classList.toggle('night-mode', settings.mode === 'night');
  updateTimeOverlay(settings.timeOverlay, settings.timeFormat);
}

let timeInterval;

function updateTimeOverlay(show, format) {
  const overlay = document.getElementById('timeOverlay');
  overlay.style.display = show ? 'block' : 'none';

  if (timeInterval) {
      clearInterval(timeInterval);
  }

  if (show) {
      updateTime();
      timeInterval = setInterval(updateTime, 1000);
  }

  function updateTime() {
      const now = new Date();
      const options = { 
          hour: 'numeric', 
          minute: 'numeric', 
          second: 'numeric',
          hour12: format === '12h'
      };
      overlay.textContent = now.toLocaleTimeString('en-US', options);
  }
}

function toggleTimeOverlay() {
  const isChecked = document.getElementById('timeOverlayToggle').checked;
  const timeFormat = document.getElementById('timeFormat').value;
  updateTimeOverlay(isChecked, timeFormat);
}

function changeTimeFormat() {
  const timeFormat = document.getElementById('timeFormat').value;
  const isOverlayVisible = document.getElementById('timeOverlayToggle').checked;
  if (isOverlayVisible) {
      updateTimeOverlay(true, timeFormat);
  }
}

function toggleMode() {
  const mode = document.getElementById('modeToggle').value;
  document.body.classList.toggle('night-mode', mode === 'night');
}

function changeFont() {
  const font = document.getElementById('fontChoice').value;
  document.body.style.fontFamily = font;
}

function goBack() {
  window.history.back();
}

function cancel() {
  loadSettings();
}

// Make the time overlay draggable
const overlay = document.getElementById('timeOverlay');
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

function dragEnd(e) {
  initialX = currentX;
  initialY = currentY;

  isDragging = false;
}

function setTranslate(xPos, yPos, el) {
  el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
}
