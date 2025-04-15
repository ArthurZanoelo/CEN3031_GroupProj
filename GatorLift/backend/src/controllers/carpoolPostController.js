const CarpoolPost = require('../models/CarpoolPost');

const createCarpoolPost = async (req, res) => {
    try {
        const postData = {
            userId: req.user.id, // Assuming user is authenticated and req.user contains user info
            departureLocation: req.body.departureLocation,
            arrivalLocation: req.body.arrivalLocation,
            departureDate: req.body.departureDate,
            seatsAvailable: req.body.seatsAvailable,
            contactInfo: req.body.contactInfo
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
            error: 'Failed to create carpool post'
        });
    }
};

module.exports = {
    createCarpoolPost
}; 