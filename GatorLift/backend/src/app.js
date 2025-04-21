const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authController = require('./controllers/authController');
const carpoolPostController = require('./controllers/carpoolPostController');
const ProfileController = require('./controllers/ProfileController');
const RideHistoryController = require('./controllers/RideHistoryController');
const auth = require('./middleware/auth');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173', // Vite's default port
  credentials: true
}));

// Debug middleware for authentication
app.use((req, res, next) => {
  console.log('Request cookies:', req.cookies);
  console.log('Authorization header:', req.headers.authorization);
  next();
});

// Routes
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.post('/api/auth/logout', auth, authController.logout);
app.get('/api/auth/verify', auth, authController.verifyToken);

app.get('/api/profile', auth, ProfileController.getProfile);
app.put('/api/profile', auth, ProfileController.updateProfile);

// Carpool post routes
app.post('/api/carpool-posts', auth, (req, res, next) => {
  console.log('User from auth middleware:', req.user);
  console.log('Request body:', req.body);
  next();
}, carpoolPostController.createCarpoolPost);
app.get('/api/carpool-posts', auth, carpoolPostController.getAllCarpoolPosts);

app.post('/api/carpool-posts/:postId/accept', auth, RideHistoryController.acceptRide);
app.delete('/api/ride-history/:postId', auth, RideHistoryController.cancelRide);

app.get('/api/accepted-counts', auth, RideHistoryController.getAcceptedCounts);
app.get('/api/ride-history', auth, RideHistoryController.getRideHistory);




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 