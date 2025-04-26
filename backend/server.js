const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const corsOptions = {
  origin: 'https://the-news-ledger-frontend.onrender.com',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

app.use(express.json()); // for JSON body parsing

const mongoURI = 'mongodb+srv://Sandeepnnishad638672:s20220020309@cluster0.rjm30.mongodb.net/newsAuth?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// JWT secret
const JWT_SECRET = 'your_jwt_secret_key_here';

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
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch news', details: error.response?.data || error.message });
  }
  
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
