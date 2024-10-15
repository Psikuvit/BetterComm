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
    // Replace with your actual Render app URL
    ws = new WebSocket('wss://bettercomm.onrender.com');
    
    ws.onopen = () => {
        console.log('Connected to the server');
    };
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        // Handle chat history or new message
        if (data.type === 'history') {
            // Display all previous messages
            data.messages.forEach((message) => {
                displayMessage(message.name, message.text);
            });
        } else if (data.type === 'message') {
            // Display a new message
            displayMessage(data.message.name, data.message.text);
        }
    };
    
    ws.onclose = () => {
        console.log('Disconnected from the server');
    };
    
    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
}

// Send message
sendMessageButton.addEventListener('click', () => {
    const messageText = messageInput.value.trim();
    
    if (messageText) {
        const message = {
            name: userName,
            text: messageText
        };
        ws.send(JSON.stringify(message));
        displayMessage('You', messageText);
        messageInput.value = '';
    }
});

messageInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();  // Prevent the default behavior of form submission or new line creation
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
