const express = require('express');
const Product = require('../models/product');
const Category = require('../models/category');
const mongoose = require('mongoose');
const multer = require('multer');
const router = express.Router();

const FILE_TYPE_MAP = {
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/jpeg': 'jpeg'
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = null;

        if (!isValid) {
            uploadError = new Error('invalid image type');
        }

        cb(uploadError, 'public/uploads');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extention = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extention}`);
    }
});

const uploadOptions = multer({ storage: storage });

router.get(`/`, async (req, res) => {
    let filter = {};
    if (req.query.categories) {
        filter = { category: req.query.categories.split(',') };
    }
    console.log(filter);
    const productList = await Product.find(filter).select('name image');// .select('name image -_id');

    if (!productList) {
        return res.status(500).json({
            status: false,
            data: [],
            message: "Error!"
        })
    }

    return res.status(200).json({
        status: true,
        data: productList,
        message: "Products retrived successfully"
    });
});

router.get(`/:id`, async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category');

    if (!product) {
        return res.status(404).json({
            status: false,
            data: [],
            message: "Product not found!"
        })
    }

    return res.status(200).json({
        status: true,
        data: product,
        message: "Product retrieved successfully"
    });
});

router.post(`/admin`, uploadOptions.single('image'), async (req, res) => {
    const category = await Category.findById(req.body.category);

    if (!category) {
        return res.status(400).json({
            status: false,
            data: [],
            message: "Invalid category!"
        });
    }

    const file = req.file;
    if (!file) {
        return res.status(400).json({
            status: false,
            data: [],
            message: 'No image in the request!'
        });
    }

    const fileName = file.filename;
    const basePath = `https://my-first-node-js-project-nkfr.onrender.com/public/uploads/`;

    const product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,
        images: req.body.images,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    });

    product.save()
        .then(createdProduct => {
            return res.status(201).json({
                status: true,
                data: createdProduct,
                message: "Product created successfully"
            });
        })
        .catch(error => {
            return res.status(500).json({
                status: false,
                data: [],
                message: error.message
            });
        });
});

router.put(`/admin/:id`, async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
            status: false,
            data: [],
            message: "Invalid Product Id!"
        });
    }

    const category = await Category.findById(req.body.category);

    if (!category) {
        return res.status(400).json({
            status: false,
            data: [],
            message: "Invalid category!"
        });
    }

    const product = await Product.findByIdAndUpdate(req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            images: req.body.images,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
        },
        { new: true }
    );

    if (!product) {
        return res.status(404).json({
            status: false,
            data: [],
            message: "Product not found!"
        });
    }

    return res.status(200).json({
        status: true,
        data: product,
        message: "Product updated successfully"
    });
});

router.delete(`/admin/:id`, async (req, res) => {
    await Product.findByIdAndDelete(req.params.id)
        .then(product => {
            if (product) {
                return res.status(200).json({
                    status: true,
                    data: [],
                    message: "Product deleted successfully"
                });
            } else {
                return res.status(404).json({
                    status: false,
                    data: [],
                    message: "Product not found!"
                });
            }
        })
        .catch(error => {
            return res.status(500).json({
                status: false,
                data: [],
                message: error.message
            });
        })
});

router.get(`/admin/get/count`, async (req, res) => {
    const productCount = await Product.countDocuments();

    if (!productCount) {
        return res.status(500).json({
            status: false,
            data: [],
            message: "Error!"
        });
    }

    return res.status(200).json({
        status: true,
        data: productCount,
        message: "Products count retrieved successfully"
    });
});

router.get(`/get/featured/:count`, async (req, res) => {
    const count = req.params.count ? req.params.count : 0;
    const products = await Product.find({ isFeatured: true }).limit(+count);

    if (!products) {
        return res.status(500).json({
            status: false,
            data: [],
            message: "Error!"
        });
    }

    return res.status(200).json({
        status: true,
        data: products,
        message: "Featured products retrieved successfully"
    })
});

router.patch(`/admin/gallery-images/:id`, uploadOptions.array('images', 10), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
            status: false,
            data: [],
            message: "Invalid Product Id!"
        });
    }

    const files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    if (files) {
        files.map(file => {
            imagesPaths.push(`${basePath}${file.filename}`);
        });
    }
    const product = await Product.findByIdAndUpdate(
        req.params.id,
        { images: imagesPaths },
        { new: true }
    );

    if (!product) {
        return res.status(404).json({
            status: false,
            data: [],
            message: "Product not found!"
        });
    }
    return res.status(200).json({
        status: true,
        data: product,
        message: "Product updated successfully"
    });
});
module.exports = router;