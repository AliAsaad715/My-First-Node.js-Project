const express = require('express');
const router = express.Router();
const Category = require('../models/category');

router.get(`/`, async (req, res) => {
    const categoryList = await Category.find();

    if (!categoryList) {
        return res.status(500).json({
            status: false,
            data: [],
            message: "Error!"
        });
    }

    return res.status(200).json({
        status: true,
        data: categoryList,
        message: "Categories retrived successfully"
    });

});

router.get(`/admin/:id`, async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        return res.status(404).json({
            status: false,
            data: [],
            message: "Category not found!"
        });
    }

    return res.status(200).json({
        status: true,
        data: category,
        message: "Categories retrived successfully"
    });

});

router.post(`/admin`, (req, res) => {
    const category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    });

    category.save()
        .then(createdCategory => {
            return res.status(201).json({
                status: true,
                data: createdCategory,
                message: "Category created successfully"
            });
        }).catch(error => {
            return res.status(500).json({
                status: false,
                data: {},
                message: error.message
            });
        });
});

router.put(`/admin/:id`, async (req, res) => {
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color,
        },
        { new: true }
    );

    if (!category) {
        return res.status(404).json({
            status: false,
            data: [],
            message: "Category not found!"
        });
    }

    return res.status(200).json({
        status: true,
        data: category,
        message: "Category updated successfully"
    });

});

router.delete(`/admin/:id`, (req, res) => {
    Category.findByIdAndDelete(req.params.id)
        .then(category => {
            if (category) {
                return res.status(200).json({
                    status: true,
                    data: [],
                    message: "Category deleted successfully"
                });
            } else {
                return res.status(404).json({
                    status: false,
                    data: [],
                    message: "Category not found!"
                });
            }
        }).catch(error => {
            return res.status(400).json({
                status: false,
                data: [],
                message: error.message
            });
        });
});

module.exports = router;