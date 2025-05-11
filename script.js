// Add this at the beginning of your script.js
async function loadMessageHistory() {
  try {
      const response = await fetch('/messages');
      const messages = await response.json();
      
      messages.reverse().forEach(msg => {
          const item = document.createElement('li');
          item.className = 'message received';
          item.innerHTML = `
              <div class="username">${msg.username}</div>
              <div class="text">${msg.text}</div>
              <div class="timestamp">${new Date(msg.timestamp).toLocaleTimeString()}</div>
          `;
          messages.appendChild(item);
      });
      
      messages.scrollTop = messages.scrollHeight;
  } catch (error) {
      console.error('Error loading message history:', error);
  }
}

// Call this function after connecting to socket
loadMessageHistory();