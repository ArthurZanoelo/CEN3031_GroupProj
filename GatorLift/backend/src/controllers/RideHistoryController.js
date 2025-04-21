const RideHistory = require('../models/CarpoolPost');
const db = require('../db');
const express = require('express');
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());


const acceptRide = async (req, res) => {
    const userId = req.user.id;
    const postId = Number(req.params.postId);
    if (isNaN(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }
  
    const conn = await db.getConnection();
    try {
    await conn.beginTransaction();

    // lock row
    const [[post]] = await conn.execute(
        'SELECT seats_available FROM carpool_posts WHERE id = ? FOR UPDATE',
        [postId]
    );

    if (!post) throw new Error('Ride not found');

    const [[{ count }]] = await conn.execute(
        'SELECT COUNT(*) AS count FROM accepted_rides WHERE post_id = ? FOR UPDATE',
        [postId]
    );

    if (count >= post.seats_available) {
        await conn.rollback();
        return res.status(409).json({ message: 'Ride is full' });
    }

    // UNIQUE index prevents duplicates automatically
    await conn.execute(
        'INSERT INTO accepted_rides (user_id, post_id) VALUES (?, ?)',
        [userId, postId]
    );

    await conn.commit();
    res.json({ message: 'Ride accepted', acceptedCount: count + 1 });
    } catch (e) {
    await conn.rollback();
    console.error(e);
    res.status(500).json({ message: 'Server error' });
    } finally {
    conn.release();
    }

  };
  


  // GET /api/accepted-counts
    const getAcceptedCounts = async (req, res) => {
    try {
      const [counts] = await db.execute(`
        SELECT post_id, COUNT(*) as count
        FROM accepted_rides
        GROUP BY post_id
      `);
  
      const result = {};
      counts.forEach(row => {
        result[row.post_id] = row.count;
      });
  
      res.json(result);
    } catch (err) {
      console.error('Error fetching accepted counts:', err);
      res.status(500).json({ message: 'Failed to get accepted counts' });
    }
  };
  

  const getRideHistory = async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
  
      const userId = req.user.id;
  
      const [rides] = await db.execute(`
        SELECT cp.*, ar.accepted_at, u.email AS userEmail
        FROM carpool_posts cp
        JOIN accepted_rides ar ON cp.id = ar.post_id
        JOIN users u ON cp.user_id = u.id
        WHERE ar.user_id = ?
        ORDER BY cp.departure_date ASC
      `, [userId]); 
      
      res.json(rides);
    } catch (error) {
      console.error('Error fetching carpool posts:', error);
      res.status(500).json({ message: 'Server error fetching carpool posts' });
    }
  };


  const cancelRide = async (req, res) => {
    const userId = req.user.id;
    const postId = Number(req.params.postId);
    if (isNaN(postId)) return res.status(400).json({ message: 'Invalid post ID' });
  
    try {
      const [result] = await db.execute(
        'DELETE FROM accepted_rides WHERE user_id = ? AND post_id = ?',
        [userId, postId]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Ride not found in your history' });
      }
  
      const [[{ count: acceptedCount }]] = await db.execute(
        'SELECT COUNT(*) AS count FROM accepted_rides WHERE post_id = ?',
        [postId]
      );
  
      res.json({ message: 'Ride removed from history', acceptedCount });
    } catch (err) {
      console.error('Error cancelling ride:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };
  

module.exports = {
    acceptRide,
    getRideHistory,
    getAcceptedCounts,
    cancelRide
}; 