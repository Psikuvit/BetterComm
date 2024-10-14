const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Use cors to allow cross-origin requests
app.use(cors());

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

// Start the server using Render's assigned port or default to 3000 for local dev
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
