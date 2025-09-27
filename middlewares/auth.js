// middleware/auth.js
const jwt = require('jsonwebtoken');
const BlackList = require('../models/blacklist');
require('dotenv/config');

const authMiddleware = async (req, res, next) => {
    if (req.url === '' || req.url === '/' || req.url === '/api/v1/users/login'
        || req.url === '/api/v1/users/register'
        || req.url.startsWith('/public/uploads') ||
        (req.url.startsWith('/api/v1/products') && req.method === 'GET')
        || (req.url === '/api/v1/categories' && req.method === 'GET')) {
        return next();
    } else {
        try {
            const authHeader = req.headers.authorization;
            const token = authHeader.split(' ')[1];

            const blacklistedToken = await BlackList.findOne({ token });
            if (blacklistedToken) {
                return res.status(401).json({
                    status: false,
                    data: [],
                    message: 'Unauthorized!'
                });
            }

            const decoded = jwt.verify(token, process.env.secret);
            req.user = decoded;
            req.token = token;
            if (req.path.includes('admin') && !req.user.isAdmin) {
                return res.status(403).json({
                    status: false,
                    data: [],
                    message: 'Access denied. Admins only.'
                });
            }
            else {
                next();
            }

        } catch (error) {
            return res.status(401).json({
                status: false,
                data: [],
                message: 'Unauthorized!'
            });
        }
    }
};

module.exports = authMiddleware;