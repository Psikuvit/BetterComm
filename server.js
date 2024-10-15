let ws;
let userName = '';

// DOM Elements
const loginContainer = document.getElementById('login');
const chatContainer = document.getElementById('chatContainer');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendMessageButton = document.getElementById('sendMessage');
const nameInput = document.getElementById('nameInput');
const startChatButton = document.getElementById('startChat');
const userListDiv = document.getElementById('userList');

// Handle login
startChatButton.addEventListener('click', () => {
    userName = nameInput.value.trim();
    
    if (userName) {
        loginContainer.classList.add('hidden');
        chatContainer.classList.remove('hidden');
        initializeWebSocket();
    }
});

// Initialize WebSocket connection
function initializeWebSocket() {
    ws = new WebSocket('wss://bettercomm.onrender.com');
    
    ws.onopen = () => {
        console.log('Connected to the server');
        // Send the user's name to the server
        ws.send(JSON.stringify({ type: 'setName', name: userName }));
    };
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'history') {
            // Display all previous messages
            data.messages.forEach((message) => {
                displayMessage(message.name, message.text);
            });
        } else if (data.type === 'message') {
            // Display a new message
            displayMessage(data.message.name, data.message.text);
        } else if (data.type === 'users') {
            // Update the user list
            updateUserList(data.users);
        }
    };
    
    ws.onclose = () => {
        console.log('Disconnected from the server');
    };
    
    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
}

// Send message function
function sendMessage() {
    const messageText = messageInput.value.trim();
    
    if (messageText) {
        const message = {
            type: 'message',
            text: messageText
        };
        ws.send(JSON.stringify(message));
        displayMessage('You', messageText);
        messageInput.value = ''; // Clear the input field
    }
}

// Handle "Send" button click
sendMessageButton.addEventListener('click', () => {
    sendMessage();
});

// Handle "Enter" key press in the message input
messageInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();  // Prevent the default behavior
        sendMessage();
    }
});

// Display message in chat
function displayMessage(name, text) {
    const messageDiv = document.createElement('div');
    messageDiv.innerHTML = `<strong>${name}:</strong> ${text}`;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Auto-scroll to the latest message
}

// Update user list in sidebar
function updateUserList(users) {
    userListDiv.innerHTML = ''; // Clear the existing list
    users.forEach((user) => {
        const userDiv = document.createElement('div');
        userDiv.textContent = user;
        userListDiv.appendChild(userDiv);
    });
}
