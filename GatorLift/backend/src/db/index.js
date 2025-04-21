const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test the connection when the server starts
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Database connected successfully');
        
        // Create users table if it doesn't exist
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Ensure the carpool_posts table exists with proper foreign key
        await connection.query(`
            CREATE TABLE IF NOT EXISTS carpool_posts (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                departure_location VARCHAR(255) NOT NULL,
                arrival_location VARCHAR(255) NOT NULL,
                departure_date DATETIME NOT NULL,
                seats_available INT NOT NULL,
                contact_info VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Ensure the profile_settings table exists with proper foreign key
        await connection.query(`
            CREATE TABLE IF NOT EXISTS profile_settings (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                first_name VARCHAR(255),
                last_name VARCHAR(255),
                contact_info VARCHAR(255),
                seats_available INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Ensure the ride_history table exists with proper foreign key
        await connection.query(`
            CREATE TABLE IF NOT EXISTS accepted_rides (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                post_id INT NOT NULL,
                accepted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (post_id) REFERENCES carpool_posts(id)
        )
        `);
        
        console.log('Database tables initialized successfully');
        connection.release();
    } catch (err) {
        console.error('Error connecting to database:', err);
    }
};

testConnection();

module.exports = pool; 