const express = require('express');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middlewares/auth');
const BlackList = require('../models/blacklist');
const router = express.Router();

router.get(`/logout`, auth, async (req, res) => {
    try {
        const token = req.token;
        const user = req.user;

        const decoded = jwt.decode(token);
        if (!decoded || !decoded.exp) {
            return res.status(400).json({
                status: false,
                data: [],
                message: 'Invalid token!'
            });
        }

        const expiresAt = new Date(decoded.exp * 1000);

        await BlackList.create({
            token: token,
            userId: user.userId,
            expiresAt: expiresAt
        });

        res.status(200).json({
            status: true,
            data: [],
            message: 'Logged out successfully',
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            data: [],
            message: error.message
        });
    }
});

router.get(`/me`, auth, async (req, res) => {
    const user = await User.findById(req.user.userId).select('-passwordHash');

    if (!user) {
        return res.status(404).json({
            status: false,
            data: [],
            message: 'User not found!'
        });
    }

    return res.status(200).json({
        status: true,
        data: user,
        message: 'User retrieved successfully'
    });
});

router.put(`/update-profile`, auth, async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.user.userId,
        {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            street: req.body.street,
            apartment: req.body.apartment,
            city: req.body.city,
            zip: req.body.zip,
            country: req.body.country,
            isAdmin: req.body.isAdmin
        },
        { new: true }
    ).select('-passwordHash');

    if (!user) {
        return res.status(404).json({
            status: false,
            data: [],
            message: "User not found!"
        });
    }

    return res.status(200).json({
        status: true,
        data: user,
        message: "Profile updated successfully"
    })
});

router.get(`/admin`, async (req, res) => {
    const userList = await User.find().select('name email phone');

    if (!userList) {
        return res.status(500).json({
            status: false,
            data: [],
            message: 'Error!'
        });
    }

    return res.status(200).json({
        status: true,
        data: userList,
        message: 'Users retrieved successfully'
    });
});

router.get(`/:id`, async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash');

    if (!user) {
        return res.status(404).json({
            status: false,
            data: [],
            message: 'User not found!'
        });
    }

    return res.status(200).json({
        status: true,
        data: user,
        message: 'User retrieved successfully'
    });
});

router.post(`/register`, (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        street: req.body.street,
        apartment: req.body.apartment,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        isAdmin: req.body.isAdmin
    });

    user.save()
        .then(userCreated => {
            return res.status(201).json({
                status: true,
                data: userCreated,
                message: 'User created successfully'
            });
        }).catch(error => {
            return res.status(500).json({
                status: false,
                data: [],
                message: error.message
            });
        })
});

router.post(`/login`, async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return res.status(404).json({
            status: false,
            data: [],
            message: 'User not found!'
        });
    }

    const secret = process.env.secret;
    if (bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin
            },
            secret,
            {
                expiresIn: '1d'
            }
        );
        return res.status(200).json({
            status: true,
            data: {
                email: user.email,
                token: token
            },
            message: 'User login successfully'
        });
    } else {
        return res.status(400).json({
            status: false,
            data: [],
            message: 'User email & password does not match our records!'
        });
    }

});


router.get(`/admin/get/count`, async (req, res) => {
    const userCount = await User.countDocuments();

    if (!userCount) {
        return res.status(500).json({
            status: false,
            data: [],
            message: "Error!"
        });
    }

    return res.status(200).json({
        status: true,
        data: userCount,
        message: "Users count retrieved successfully"
    });
});

router.delete(`/`, auth, async (req, res) => {
    await User.findByIdAndDelete(req.user.userId)
        .then(user => {
            if (user) {
                return res.status(200).json({
                    status: true,
                    data: [],
                    message: 'User deleted successfully'
                });
            } else {
                return res.status(404).json({
                    status: false,
                    data: [],
                    message: "User not found!"
                });
            }
        }).catch(error => {
            return res.status(500).json({
                status: false,
                data: [],
                message: error.message
            });
        });
});

module.exports = router;