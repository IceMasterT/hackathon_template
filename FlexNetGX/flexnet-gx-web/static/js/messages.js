// Function to load messages
function loadMessages() {
  const messageList = document.getElementById('messageList');
  // In a real application, you would fetch this data from a server
  const messages = [
      { id: 1, content: "Welcome to the volunteer dashboard!", date: "2023-05-22" },
      { id: 2, content: "New survey available. Please check!", date: "2023-05-23" }
  ];

  messageList.innerHTML = '';
  messages.forEach(message => {
      const li = document.createElement('li');
      li.className = 'message-item';
      li.innerHTML = `
          <strong>${message.date}</strong><br>
          ${message.content}
      `;
      messageList.appendChild(li);
  });
}

// Event listener for message form
document.getElementById('messageForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const messageContent = document.getElementById('messageContent').value;
  alert(`Message sent: ${messageContent}`);
  // Here you would typically send this message to the server
  this.reset();
});

// Event listener for help form
document.getElementById('helpForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const helpTopic = document.getElementById('helpTopic').value;
  const helpContent = document.getElementById('helpContent').value;
  alert(`Help request sent. Topic: ${helpTopic}, Content: ${helpContent}`);
  // Here you would typically send this help request to the server
  this.reset();
});

// Load messages when the page loads
window.addEventListener('load', loadMessages);
