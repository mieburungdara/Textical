const prisma = require('../db');

// Simple admin authentication middleware
const adminAuth = (req, res, next) => {
    // For development purposes, we'll use a simple token-based authentication
    // In production, this should be replaced with a proper authentication system
    const authToken = req.headers['x-admin-token'];
    
    // Default admin token (can be overridden via environment variable)
    const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'textical-admin-2024';
    
    if (!authToken) {
        return res.status(401).json({ 
            success: false, 
            error: 'Authentication required' 
        });
    }
    
    if (authToken !== ADMIN_TOKEN) {
        return res.status(401).json({ 
            success: false, 
            error: 'Invalid authentication token' 
        });
    }
    
    next();
};

// Admin login endpoint handler
const adminLogin = async (req, res) => {
    const { username, password } = req.body;
    
    // For now, use hardcoded credentials (should be stored securely in production)
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Return token for future requests
        const token = process.env.ADMIN_TOKEN || 'textical-admin-2024';
        res.json({ 
            success: true, 
            message: 'Login successful',
            token: token,
            user: {
                username: ADMIN_USERNAME,
                role: 'admin'
            }
        });
    } else {
        res.status(401).json({ 
            success: false, 
            error: 'Invalid username or password' 
        });
    }
};

module.exports = { adminAuth, adminLogin };
