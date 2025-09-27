const express = require('express');
const Order = require('../models/order');
const OrderItem = require('../models/orderItem');
const auth = require('../middlewares/auth');
const router = express.Router();

router.get(`/admin`, async (req, res) => {
    const orderList = await Order.find().populate('user', 'name').sort({ 'dateOrdered': -1 });

    if (!orderList) {
        return res.status(500).json({
            status: false,
            data: [],
            message: 'Error!'
        });
    }

    return res.status(200).json({
        status: true,
        data: orderList,
        message: 'Orders retrieved successfully'
    });
});

router.get(`/admin/get/total-sales`, async (req, res) => {
    const totalSales = await Order.aggregate([
        { $group: { _id: null, totalSales: { $sum: '$totalPrice' } } }
    ]);

    if (!totalSales) {
        return res.status(500).json({
            status: false,
            data: [],
            message: 'Error!'
        });
    }

    return res.status(200).json({
        status: true,
        data: totalSales.pop().totalSales,
        message: 'Total Sales retrieved successfully'
    });
});

router.get(`/admin/get/count`, async (req, res) => {
    const orderCount = await Order.countDocuments();

    if (!orderCount) {
        return res.status(500).json({
            status: false,
            data: [],
            message: "Error!"
        });
    }

    return res.status(200).json({
        status: true,
        data: orderCount,
        message: "Orders count retrieved successfully"
    });
});

router.get(`/get/my-orders`, auth, async (req, res) => {
    const userOrderList = await Order.find({ user: req.user.userId }).
        populate({
            path: 'orderItems',
            populate: { path: 'product', populate: 'category' }
        }).sort({ 'dateOrdered': -1 });

    return res.status(200).json({
        status: true,
        data: userOrderList,
        message: 'Orders retrieved successfully'
    });
});

router.get(`/admin/get/user-orders/:user_id`, async (req, res) => {
    const userOrderList = await Order.find({ user: req.params.user_id }).
        populate({
            path: 'orderItems',
            populate: { path: 'product', populate: 'category' }
        }).sort({ 'dateOrdered': -1 });

    if (!userOrderList) {
        return res.status(500).json({
            status: false,
            data: [],
            message: 'Error!'
        });
    }

    return res.status(200).json({
        status: true,
        data: userOrderList,
        message: 'Orders retrieved successfully'
    });
});

router.get(`/oi`, async (req, res) => {
    const orderList = await OrderItem.find();

    if (!orderList) {
        return res.status(500).json({
            status: false,
            data: [],
            message: 'Error!'
        });
    }

    return res.status(200).json({
        status: true,
        data: orderList,
        message: 'Orders retrieved successfully'
    });
});

router.get(`/:id`, async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name')
        .populate({ path: 'orderItems', populate: { path: 'product', populate: 'category' } });

    if (!order) {
        return res.status(404).json({
            status: false,
            data: [],
            message: 'Order not found!'
        });
    }

    return res.status(200).json({
        status: true,
        data: order,
        message: 'Order retrieved successfully'
    });
});

router.post(`/`, auth, async (req, res) => {
    const orderItemsIds = Promise.all(req.body.orderItems.map(async (orderItem) => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        });

        newOrderItem = await newOrderItem.save();

        return newOrderItem.id;
    }));

    const orderItemsIdsResolved = await orderItemsIds;

    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async orderItemId => {
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice;
    }));

    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

    let order = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        totalPrice: totalPrice,
        user: req.user.userId
    });

    order = await order.save();

    return res.status(200).json({
        status: true,
        data: order,
        message: 'Orders retrieved successfully'
    });
});


router.patch(`/admin/:id`, async (req, res) => {
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status
        },
        { new: true }
    );

    if (!order) {
        return res.status(404).json({
            status: false,
            data: [],
            message: 'Order not found!'
        });
    }

    return res.status(200).json({
        status: true,
        data: order,
        message: 'Order updated successfully'
    });
});

router.delete(`/:id`, auth, async (req, res) => {
    const user = req.user;
    let order = await Order.findById(req.params.id);

    if(!order) {
        return res.status(404).json({
            status: false,
            data: [],
            message: "Order not found!"
        });
    }

    if (!user.isAdmin && order.user.toString() !== user.userId) {
        return res.status(403).json({
            status: false,
            data: [],
            message: "Access denied!"
        });
    }

    order = await Order.findByIdAndDelete(req.params.id)
        .then(async order => {
            if (order) {
                await order.orderItems.map(async (orderItem) => {
                    await OrderItem.findByIdAndDelete(orderItem._id);
                });
                return res.status(200).json({
                    status: true,
                    data: [],
                    message: "Order deleted successfully"
                });
            } else {
                return res.status(404).json({
                    status: false,
                    data: [],
                    message: "Order not found!"
                });
            }
        })
        .catch(error => {
            return res.status(500).json({
                status: false,
                data: [],
                message: error.message
            })
        })
});

module.exports = router;