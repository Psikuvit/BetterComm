// server.js
const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve the HTML, CSS, and JS files
app.use(express.static('public'));

let clients = [];

// Handle WebSocket connection
wss.on('connection', (ws) => {
    clients.push(ws);

    ws.on('message', (data) => {
        const message = JSON.parse(data);

        // Broadcast message to all clients
        clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    });

    // Remove disconnected clients
    ws.on('close', () => {
        clients = clients.filter((client) => client !== ws);
    });
});

// Start the server
server.listen(3000, () => {
    console.log('Server is listening on http://localhost:3000');
});
