const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // Check for token in cookies or Authorization header
    let token = req.cookies.token;
    
    // If not in cookies, check Authorization header
    const authHeader = req.header('Authorization');
    if (!token && authHeader) {
      token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
    }
    
    if (!token) {
      return res.status(401).json({ message: 'No auth token provided, please authenticate' });
    }

    try {
      console.log('Token to verify:', token);
      console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Secret exists' : 'Secret missing');
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded);
      
      // Ensure we have a user ID
      if (!decoded.id) {
        console.error('Token decoded but no id found in payload:', decoded);
        return res.status(401).json({ message: 'Invalid token format, please login again' });
      }
      
      req.user = decoded;
      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return res.status(401).json({ message: 'Invalid token, please authenticate again' });
    }
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ message: 'Please authenticate' });
  }
};

module.exports = auth; 