const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authController = require('./controllers/authController');
const carpoolPostController = require('./controllers/carpoolPostController');
const auth = require('./middleware/auth');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173', // Vite's default port
  credentials: true
}));

// Routes
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.post('/api/auth/logout', auth, authController.logout);
app.get('/api/auth/verify', auth, authController.verifyToken);

// Carpool post routes
app.post('/api/carpool-posts', auth, carpoolPostController.createCarpoolPost);

// Protected route example
app.get('/api/user/profile', auth, (req, res) => {
  res.json({ message: 'Protected route accessed successfully' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 