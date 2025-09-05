const express = require('express');
const http = require('http'); // Import http module
const socketIo = require('socket.io'); // Import socket.io
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const server = http.createServer(app); // Create HTTP server
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins for now, refine later
    methods: ["GET", "POST"]
  }
});


// app.use(cors({ origin : 'https://the-news-ledger-frontend.onrender.com/'}));
// app.use(cors({ origin : 'http://localhost:3000'}));
app.use(cors());


app.use(express.json()); // for JSON body parsing

const URL= process.env.mongoURI ;

mongoose.connect(URL)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET;

// User Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
});
const User = mongoose.model('User', UserSchema);

// Registration endpoint
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  const userExists = await User.findOne({ username });
  if (userExists) return res.status(400).json({ message: 'User already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword });
  await user.save();
  res.status(201).json({ message: 'User registered successfully' });
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token });
});

// News endpoint (MODIFIED)
app.get('/api/news', async (req, res) => {
  const { category = 'general', country = 'in', lang = 'en', q = '', page = 1 } = req.query;

  let url = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=${lang}&country=${country}&max=12&page=${page}&token=52dcbaeea5cf1eb3cabd04cf2d82441f`;

  // Add q only if not empty
  if (q) {
    url += `&q=${encodeURIComponent(q)}`;
  }

  try {
    console.log('Fetching news from URL:', url); // Log the URL
    const response = await axios.get(url);
    console.log('API Response:', response.data); // Log the API response
    res.json(response.data);
  } catch (error) {
    console.error('API Error:', error.response ? error.response.data : error.message); // Log full error response
    res.status(500).json({ error: 'Failed to fetch news', details: error.response ? error.response.data : error.message });
  }
  
});

const users = {}; // Store active users: { socketId: username }

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // When a user logs in, associate their username with their socket ID
  socket.on('userLoggedIn', (username) => {
    users[socket.id] = username;
    console.log(`User ${username} connected with ID: ${socket.id}`);
    io.emit('updateUserList', Object.values(users)); // Notify all clients of updated user list
  });

  // Handle chat messages
  socket.on('sendMessage', (message) => {
    console.log('Message received:', message);
    io.emit('receiveMessage', message); // Broadcast message to all connected clients
  });

  // Handle video call invitations
  socket.on('callUser', ({ userToCall, roomName, signalData }) => {
    const callerId = socket.id;
    const callerUsername = users[callerId];
    // Find the socket ID of the user to call
    const calleeSocketId = Object.keys(users).find(key => users[key] === userToCall);

    if (calleeSocketId) {
      io.to(calleeSocketId).emit('hey', {
        signal: signalData,
        from: callerId,
        fromUsername: callerUsername,
        roomName: roomName,
      });
    } else {
      console.log(`User ${userToCall} not found or not online.`);
      // Optionally, emit an event back to the caller to inform them the user is offline
    }
  });

  socket.on('answerCall', (data) => {
    io.to(data.to).emit('callAccepted', data.signal);
  });

  // WebRTC Signaling
  socket.on('joinRoom', (roomName) => {
    socket.join(roomName);
    console.log(`${socket.id} joined room: ${roomName}`);
    socket.to(roomName).emit('userJoined', socket.id);
  });

  socket.on('offer', (offer, roomName) => {
    console.log('Offer received in room:', roomName);
    socket.to(roomName).emit('offer', offer, socket.id);
  });

  socket.on('answer', (answer, roomName) => {
    console.log('Answer received in room:', roomName);
    socket.to(roomName).emit('answer', answer, socket.id);
  });

  socket.on('ice-candidate', (candidate, roomName) => {
    console.log('ICE Candidate received in room:', roomName);
    socket.to(roomName).emit('ice-candidate', candidate, socket.id);
  });

  socket.on('leaveRoom', (roomName) => {
    socket.leave(roomName);
    console.log(`${socket.id} left room: ${roomName}`);
    socket.to(roomName).emit('userLeft', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    delete users[socket.id]; // Remove user from active users list
    io.emit('updateUserList', Object.values(users)); // Notify all clients of updated user list
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
