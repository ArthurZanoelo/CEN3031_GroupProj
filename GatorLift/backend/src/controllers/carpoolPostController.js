const CarpoolPost = require('../models/CarpoolPost');
const db = require('../db');

const createCarpoolPost = async (req, res) => {
    try {
        console.log('Request user:', req.user);
        console.log('Request body:', req.body);
        
        if (!req.user || !req.user.id) {
            return res.status(401).json({ 
                error: 'User ID not found in token. Please login again.' 
            });
        }
        
        const postData = {
            userId: req.user.id,
            departureLocation: req.body.departureLocation,
            arrivalLocation: req.body.arrivalLocation,
            departureDate: req.body.departureDate,
            seatsAvailable: parseInt(req.body.seatsAvailable, 10),
            contactInfo: req.body.contactInfo || null
        };

        // Validate the post data
        const errors = CarpoolPost.validate(postData);
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        // Create the post
        const postId = await CarpoolPost.create(postData);
        
        res.status(201).json({
            message: 'Carpool post created successfully',
            postId
        });
    } catch (error) {
        console.error('Error creating carpool post:', error);
        res.status(500).json({
            error: 'Failed to create carpool post: ' + error.message
        });
    }
};

const getAllCarpoolPosts = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.user.id;
    let { from, to, day, minSeats } = req.query;

    // Sanitize and normalize
    const extraParams = [];
    let extraWhere = '';

    const parseDate = (dateStr) => {
      const d = new Date(dateStr);
      return isNaN(d) ? null : d.toISOString().slice(0, 19).replace('T', ' ');
    };

    if (day && day.trim() !== '') {
      const parsedDay = parseDate(day);
      if (parsedDay) {
        extraWhere += ' AND DATE(cp.departure_date) = DATE(?)';
        extraParams.push(parsedDay);
      }
    } else {
      if (from && from.trim() !== '') {
        const parsedFrom = parseDate(from);
        if (parsedFrom) {
          extraWhere += ' AND cp.departure_date >= ?';
          extraParams.push(parsedFrom);
        }
      }
      if (to && to.trim() !== '') {
        const parsedTo = parseDate(to);
        if (parsedTo) {
          extraWhere += ' AND cp.departure_date <= ?';
          extraParams.push(parsedTo);
        }
      }
    }

    if (minSeats && !isNaN(minSeats)) {
      extraWhere += ' AND (cp.seats_available - IFNULL(ac.acceptedCnt,0)) >= ?';
      extraParams.push(parseInt(minSeats, 10));
    }

    const query = `
      SELECT
        cp.*,
        u.email AS userEmail,
        IFNULL(ac.acceptedCnt, 0) AS acceptedCount,
        (cp.seats_available - IFNULL(ac.acceptedCnt, 0)) AS remainingSeats
      FROM carpool_posts cp
      JOIN users u ON cp.user_id = u.id
      LEFT JOIN (
        SELECT post_id, COUNT(*) AS acceptedCnt
        FROM accepted_rides
        GROUP BY post_id
      ) ac ON ac.post_id = cp.id
      WHERE cp.id NOT IN (
        SELECT post_id FROM accepted_rides WHERE user_id = ?
      )
        AND cp.user_id <> ?
        AND cp.departure_date >= NOW()
        AND (cp.seats_available - IFNULL(ac.acceptedCnt, 0)) > 0
        ${extraWhere}
      ORDER BY cp.departure_date ASC
    `;

    // Make sure parameters are in correct order
    const params = [userId, userId, ...extraParams];

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching carpool posts:', error);
    res.status(500).json({ error: 'Failed to fetch carpool posts' });
  }
};


const getMyCarpoolPosts = async (req, res) => {
  if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized' });
  const [rows] = await db.execute(
      `SELECT cp.*, IFNULL(ac.acceptedCnt,0) AS acceptedCount
       FROM   carpool_posts cp
       LEFT JOIN (
           SELECT post_id, COUNT(*) AS acceptedCnt
           FROM   accepted_rides
           GROUP  BY post_id
       ) ac ON ac.post_id = cp.id
       WHERE  cp.user_id = ?
       ORDER  BY cp.departure_date ASC`,
      [req.user.id]
  );
  res.json(rows);
};

const updateCarpoolPost = async (req, res) => {
  if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized' });
  const { id } = req.params;
  const { departureLocation, arrivalLocation, departureDate, seatsAvailable, contactInfo } = req.body;
  await db.execute(
      `UPDATE carpool_posts
         SET departure_location = ?, arrival_location = ?, departure_date = ?,
             seats_available    = ?, contact_info     = ?
       WHERE id = ? AND user_id = ?`,
      [departureLocation, arrivalLocation, departureDate,
       parseInt(seatsAvailable,10), contactInfo || null, id, req.user.id]
  );
  res.json({ message: 'Post updated' });
};

const deleteCarpoolPost = async (req, res) => {
  if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized' });
  const { id } = req.params;
  await db.execute('DELETE FROM accepted_rides WHERE post_id = ?', [id]);
  await db.execute('DELETE FROM carpool_posts WHERE id = ? AND user_id = ?', [id, req.user.id]);
  res.json({ message: 'Post deleted' });
};

module.exports = {
    createCarpoolPost,
    getAllCarpoolPosts,
    getMyCarpoolPosts,
    updateCarpoolPost,
    deleteCarpoolPost
}; 