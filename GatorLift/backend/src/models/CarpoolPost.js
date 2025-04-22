const db = require('../db');

class CarpoolPost {
    static async create(postData) {
        const { userId, departureLocation, arrivalLocation, departureDate, seatsAvailable, contactInfo } = postData;
        
        console.log('Creating carpool post with data:', {
            userId, departureLocation, arrivalLocation, 
            departureDate, seatsAvailable, contactInfo
        });
        
        const query = `
            INSERT INTO carpool_posts 
            (user_id, departure_location, arrival_location, departure_date, seats_available, contact_info)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        try {
            const [result] = await db.execute(query, [
                userId, 
                departureLocation,
                arrivalLocation,
                departureDate,
                seatsAvailable,
                contactInfo || null // Handle empty contact info
            ]);
            
            console.log('Post created successfully with ID:', result.insertId);
            return result.insertId;
        } catch (error) {
            console.error('Database error creating carpool post:', error);
            throw new Error('Error creating carpool post: ' + error.message);
        }
    }

    static validate(postData) {
        console.log('Validating carpool post data:', postData);
        
        const errors = [];
        
        if (!postData.userId) {
            errors.push('User ID is required');
        }
        
        if (!postData.departureLocation) {
            errors.push('Departure location is required');
        }
        if (!postData.arrivalLocation) {
            errors.push('Arrival location is required');
        }
        if (!postData.departureDate) {
            errors.push('Departure date is required');
        } else {
            const departureDate = new Date(postData.departureDate);
            if (departureDate <= new Date()) {
                errors.push('Departure date must be in the future');
            }
        }
        if (!postData.seatsAvailable || postData.seatsAvailable < 1) {
            errors.push('Number of seats available must be at least 1');
        }
        
        console.log('Validation errors:', errors);
        return errors;
    }
}

module.exports = CarpoolPost; 