const db = require('../db');

class ProfileOptions {
  static async updateProfile(profileData) {
    const { userId, firstName, lastName, contactInfo, seatsAvailable } = profileData;

    console.log('Updating profile with data:', {
      userId, firstName, lastName, contactInfo, seatsAvailable
    });

    try {
      const [rows] = await db.execute(
        'SELECT user_id FROM profile_settings WHERE user_id = ?',
        [userId]
      );

      if (rows.length === 0) {
        const insertQuery = `
          INSERT INTO profile_settings 
          (user_id, first_name, last_name, contact_info, seats_available) 
          VALUES (?, ?, ?, ?, ?)
        `;

        await db.execute(insertQuery, [
          userId,
          firstName,
          lastName,
          contactInfo || null,
          parseInt(seatsAvailable, 10)
        ]);

        console.log('Inserted new profile for user ID:', userId);
      } else {
        const updateQuery = `
          UPDATE profile_settings 
          SET first_name = ?, last_name = ?, contact_info = ?, seats_available = ?
          WHERE user_id = ?
        `;

        await db.execute(updateQuery, [
          firstName,
          lastName,
          contactInfo || null,
          parseInt(seatsAvailable, 10),
          userId
        ]);

        console.log('Updated profile for user ID:', userId);
      }

      return true;
    } catch (error) {
      console.error('Database error updating profile:', error);
      throw new Error('Failed to update profile: ' + error.message);
    }
  }
}

module.exports = ProfileOptions;
