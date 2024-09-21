(async () => {
  const myUser = await generateRandomUser();
  let activeUsers = [];
  let typingUsers = [];

  const socket = new WebSocket(generateBackendUrl());
  socket.addEventListener('open', () => {
    console.log('WebSocket connected!');
    socket.send(JSON.stringify({ type: 'newUser', user: myUser }));
  });
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    console.log('WebSocket message:', message);
    switch (message.type) {
      case 'message':
        const messageElement = generateMessage(message, myUser);
        document.getElementById('messages').appendChild(messageElement);
        setTimeout(() => {
          messageElement.classList.add('opacity-100');
        }, 100);
        break;
      case 'activeUsers':
        activeUsers = message.users;
        updateActiveUsersList(activeUsers);
        break;
      case 'typing':
        updateTypingIndicator(message.users, myUser);;
        break;
      default:
        break;
    }
  });
  socket.addEventListener('close', (event) => {
    console.log('WebSocket closed.');
  });
  socket.addEventListener('error', (event) => {
    console.error('WebSocket error:', event);
  });

  // Wait until the DOM is loaded before adding event listeners
  document.addEventListener('DOMContentLoaded', (event) => {
    // Send a message when the send button is clicked
    document.getElementById('sendButton').addEventListener('click', () => {
      const message = document.getElementById('messageInput').value;
      socket.send(JSON.stringify({ type: 'message', message, user: myUser }));
      document.getElementById('messageInput').value = '';
    });
  });

  document.addEventListener('keydown', (event) => {
    // Only send if the typed in key is not a modifier key
    if (event.key.length === 1) {
      socket.send(JSON.stringify({ type: 'typing', user: myUser }));
    }
    // Only send if the typed in key is the enter key
    if (event.key === 'Enter') {
      const message = document.getElementById('messageInput').value;
      socket.send(JSON.stringify({ type: 'message', message, user: myUser }));
      document.getElementById('messageInput').value = '';
    }
  });
})();


const updateActiveUsersList = (users) => {
  const userListElement = document.getElementById('activeUsersList');
  userListElement.innerHTML = '';
  users.forEach((user) => {
    const userElement = document.createElement('li');
    userElement.textContent = user.name;
    userListElement.appendChild(userElement);
  });
};


const updateTypingIndicator = (users, myUser) => { 
  const typingIndicator = document.getElementById('typingIndicator'); 
  if (!typingIndicator) {
    console.error('Element with id "typingIndicator" not found.');
    return;
  }

  const otherUsers = users.filter((user) => user.id !== myUser.id);

  if (otherUsers.length === 0) {
    typingIndicator.style.display = 'none'; 
  } else if (otherUsers.length === 1) {
    typingIndicator.style.display = 'block'; 
    typingIndicator.textContent = `${otherUsers[0].name} tippt...`;
  } else if (otherUsers.length === 2) {
    typingIndicator.style.display = 'block';
    typingIndicator.textContent = `${otherUsers[0].name} und ${otherUsers[1].name} tippen...`;
  } else {
    typingIndicator.style.display = 'block';
    typingIndicator.textContent = `${otherUsers[0].name}, ${otherUsers[1].name} und weitere tippen...`;
  }
};