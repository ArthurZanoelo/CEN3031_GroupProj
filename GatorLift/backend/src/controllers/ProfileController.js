const Profile = require('../models/ProfileOptions');
const db = require('../db');
const express = require('express');
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

const getProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const [rows] = await db.execute(
      `SELECT 
        first_name AS firstName, 
        last_name AS lastName, 
        contact_info AS contactInfo, 
        seats_available AS seatsAvailable 
      FROM profile_settings 
      WHERE user_id = ?`,
      [req.user.id]
    );

    if (rows.length === 0) {
      console.log('No profile found for user ID:', req.user.id);
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {

    const { firstName, lastName, contactInfo, seatsAvailable } = req.body;

    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    await Profile.updateProfile({
      userId: req.user.id,
      firstName,
      lastName,
      contactInfo,
      seatsAvailable
    });

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = {
  getProfile,
  updateProfile
}; 