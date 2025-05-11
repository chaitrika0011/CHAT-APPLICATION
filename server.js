const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');
const Message = require('./models/Message');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/chatapp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.use(express.static(__dirname));

// Add route to get chat history
app.get('/messages', async (req, res) => {
    try {
        const messages = await Message.find().sort({ timestamp: -1 }).limit(50);
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching messages' });
    }
});

const users = new Map();

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('user join', (username) => {
        users.set(socket.id, username);
        io.emit('user joined', { username, users: Array.from(users.values()) });
    });

    socket.on('chat message', async (msg) => {
        const username = users.get(socket.id);
        const messageData = {
            text: msg,
            userId: socket.id,
            username: username,
            timestamp: new Date()
        };

        // Save message to database
        try {
            const message = new Message({
                username: username,
                text: msg,
                timestamp: messageData.timestamp
            });
            await message.save();
        } catch (error) {
            console.error('Error saving message:', error);
        }

        io.emit('chat message', messageData);
    });

    socket.on('disconnect', () => {
        const username = users.get(socket.id);
        users.delete(socket.id);
        io.emit('user left', { username, users: Array.from(users.values()) });
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});