const bcrypt = require('bcrypt');
const db = require('../db');

class User {
  static async create(email, password) {
    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insert the user
      const [result] = await db.execute(
        'INSERT INTO users (email, password) VALUES (?, ?)',
        [email, hashedPassword]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user: ' + error.message);
    }
  }

  static async findByEmail(email) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      
      return rows[0] || null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw new Error('Failed to find user: ' + error.message);
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      
      return rows[0] || null;
    } catch (error) {
      console.error('Error finding user by id:', error);
      throw new Error('Failed to find user: ' + error.message);
    }
  }

  static async verifyPassword(password, hashedPassword) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      console.error('Error verifying password:', error);
      throw new Error('Failed to verify password: ' + error.message);
    }
  }
}

module.exports = User; 