function errorHandler(error, req, res, next) {
    // Jwt authintaction error
    if (error.name === 'UnauthorizedError') {
        return res.status(401).json({
            status: false,
            data: [],
            message: 'Unauthorized!'
        });
    // Validation error
    } else if (error.name === 'ValidationError') {
        return res.status(401).json({
            status: false,
            data: [],
            message: error.message
        });
    // Default to 500 server error
    } else {
        return res.status(500).json({
            status: false,
            data: [],
            message: error.message
        });
    }
}

module.exports = errorHandler;