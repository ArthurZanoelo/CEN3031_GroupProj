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
      const { from, to, day, minSeats } = req.query;
  
      let extraWhere = '';
      const params = [userId];
  
      if (day) {
        extraWhere += ' AND DATE(cp.departure_date) = ?';
        params.push(day);
      } else {
        if (from) { extraWhere += ' AND cp.departure_date >= ?'; params.push(from); }
        if (to)   { extraWhere += ' AND cp.departure_date <= ?'; params.push(to);   }
      }
  
      if (minSeats) {
        extraWhere += ' AND (cp.seats_available - (   \
                          SELECT COUNT(*) FROM accepted_rides ar2 \
                          WHERE ar2.post_id = cp.id)) >= ?';
        params.push(parseInt(minSeats, 10));
      }
  
      const [rides] = await db.execute(
        `
        SELECT cp.*, u.email AS userEmail
        FROM   carpool_posts cp
        JOIN   accepted_rides ar ON cp.id = ar.post_id
        JOIN   users u ON cp.user_id = u.id
        WHERE  ar.user_id = ?
          ${extraWhere}
        ORDER BY cp.departure_date ASC
        `,
        params
      );
  
      res.json(rides);
    } catch (error) {
      console.error('Error fetching ride history:', error);
      res.status(500).json({ message: 'Server error fetching ride history' });
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