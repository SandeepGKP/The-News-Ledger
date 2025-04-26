const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// CORS configuration - allow frontend to access backend
app.use(cors({
  origin: 'https://the-news-ledger-frontend.onrender.com', // Your frontend Render URL
  credentials: true, // Allow credentials like cookies
}));

app.use(express.json()); // To parse JSON body

// MongoDB connection string
const mongoURI = 'mongodb+srv://Sandeepnnishad638672:s20220020309@cluster0.rjm30.mongodb.net/newsAuth?retryWrites=true&w=majority&appName=Cluster0';

// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// JWT secret key
const JWT_SECRET = 'your_jwt_secret_key_here';

// User Schema for MongoDB
const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
});

const User = mongoose.model('User', UserSchema);

// User Registration Endpoint
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ username });
  if (userExists) return res.status(400).json({ message: 'User already exists' });

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword });

  // Save new user to the database
  await user.save();
  res.status(201).json({ message: 'User registered successfully' });
});

// User Login Endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  // Find user by username
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  // Compare passwords
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

  // Generate JWT token
  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });

  res.json({ token });
});

// News Endpoint (Fetching news from external API)
app.get('/api/news', async (req, res) => {
  const { category = 'general', country = 'in', lang = 'en', q = '', page = 1 } = req.query;

  // External API URL for news
  let url = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=${lang}&country=${country}&max=12&page=${page}&token=52dcbaeea5cf1eb3cabd04cf2d82441f`;

  // Append search query if provided
  if (q) {
    url += `&q=${encodeURIComponent(q)}`;
  }

  try {
    // Fetch news from external API
    const response = await axios.get(url);
    res.json(response.data); // Send back news data
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch news', details: error.response?.data || error.message });
  }
});

// Middleware to handle CORS errors for all other routes (generic handler for OPTIONS preflight)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://the-news-ledger-frontend.onrender.com'); // Frontend URL
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allowed methods
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allowed headers
  next();
});

// Start server on specified port (using 5000 or environment variable)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
