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

// New: Get all carpool posts
const getAllCarpoolPosts = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT carpool_posts.*, users.email as userEmail
            FROM carpool_posts
            JOIN users ON carpool_posts.user_id = users.id
            ORDER BY carpool_posts.departure_date ASC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching carpool posts:', error);
        res.status(500).json({ error: 'Failed to fetch carpool posts' });
    }
};

module.exports = {
    createCarpoolPost,
    getAllCarpoolPosts
}; 