const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('public'));

// File to store chat messages
const messagesFilePath = path.join(__dirname, 'messages.json');

// Load messages from the file at startup
let messages = [];
if (fs.existsSync(messagesFilePath)) {
    const rawData = fs.readFileSync(messagesFilePath);
    messages = JSON.parse(rawData);
} else {
    fs.writeFileSync(messagesFilePath, JSON.stringify(messages));
}

let clients = [];

// Function to broadcast user list
function broadcastUserList() {
    const userList = clients.map(client => client.userName).filter(Boolean);
    clients.forEach(client => {
        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({ type: 'users', users: userList }));
        }
    });
}

// Handle WebSocket connection
wss.on('connection', (ws) => {
    let userName = null;

    // Add client object with ws and userName
    const client = { ws, userName: null };
    clients.push(client);

    // Send chat history to the newly connected client
    ws.send(JSON.stringify({ type: 'history', messages }));

    // Handle incoming messages
    ws.on('message', (data) => {
        const message = JSON.parse(data);

        if (message.type === 'setName') {
            // Set the userName and broadcast the updated user list
            userName = message.name;
            client.userName = userName;
            broadcastUserList();
        } else if (message.type === 'message') {
            // Broadcast the message to all clients
            const chatMessage = { name: userName, text: message.text };
            messages.push(chatMessage);
            fs.writeFileSync(messagesFilePath, JSON.stringify(messages));

            clients.forEach(client => {
                if (client.ws.readyState === WebSocket.OPEN) {
                    client.ws.send(JSON.stringify({ type: 'message', message: chatMessage }));
                }
            });
        }
    });

    // Handle client disconnection
    ws.on('close', () => {
        clients = clients.filter(client => client.ws !== ws);
        broadcastUserList();  // Update the user list
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
