const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');
const Product = require('../models/product.model');
const Featured = require('../models/featured.model');
const {
    getDashboardStats,
    getSalesReport,
    getInventoryReport,
    getUserAnalytics,
    getAllProducts,
    updateProduct,
    deleteProduct
} = require('../controllers/admin.controller');

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

// Dashboard and analytics routes
router.get('/dashboard', getDashboardStats);
router.get('/sales-report', getSalesReport);
router.get('/inventory-report', getInventoryReport);
router.get('/user-analytics', getUserAnalytics);

// Product management routes
router.post('/products', upload.array('images', 6), async (req, res) => {
    try {
        const productData = {
            ...req.body,
            images: req.files.map(file => file.path)
        };
        
        // Convert string arrays back to arrays if they're strings
        if (typeof productData.sizes === 'string') {
            productData.sizes = JSON.parse(productData.sizes);
        }
        if (typeof productData.tags === 'string') {
            productData.tags = JSON.parse(productData.tags);
        }

        // Convert numeric strings to numbers
        if (productData.price) productData.price = Number(productData.price);
        if (productData.discountPrice) productData.discountPrice = Number(productData.discountPrice);
        if (productData.stock) productData.stock = Number(productData.stock);

        console.log('Creating product with data:', productData);

        const product = await Product.create(productData);
        
        console.log('Product created successfully:', product);
        
        res.status(201).json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating product'
        });
    }
});

router.get('/products', getAllProducts);

router.put('/products/:id', upload.array('images', 6), async (req, res) => {
    try {
        const productId = req.params.id;
        const updateData = { ...req.body };

        // Parse arrays that were stringified
        if (typeof updateData.sizes === 'string') {
            updateData.sizes = JSON.parse(updateData.sizes);
        }
        if (typeof updateData.tags === 'string') {
            updateData.tags = JSON.parse(updateData.tags);
        }

        // Handle existing images
        if (updateData.existingImages) {
            updateData.images = JSON.parse(updateData.existingImages);
            delete updateData.existingImages;
        }

        // Add new uploaded images to existing images
        if (req.files && req.files.length > 0) {
            const newImageUrls = req.files.map(file => file.path);
            updateData.images = [...(updateData.images || []), ...newImageUrls];
        }

        // Convert numeric strings to numbers
        if (updateData.price) updateData.price = Number(updateData.price);
        if (updateData.discountPrice) updateData.discountPrice = Number(updateData.discountPrice);
        if (updateData.stock) updateData.stock = Number(updateData.stock);

        // Remove unwanted fields
        delete updateData.newImages;

        const product = await Product.findByIdAndUpdate(
            productId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error updating product'
        });
    }
});

router.delete('/products/:id', deleteProduct);

// Featured Products Management Routes
router.get('/featured', async (req, res) => {
    try {
        // First, ensure we have a featured document for each category
        const categories = ['men', 'women', 'accessories'];
        for (const category of categories) {
            const existing = await Featured.findOne({ category });
            if (!existing) {
                await Featured.create({ 
                    category,
                    products: []
                });
            }
        }

        const featured = await Featured.find()
            .populate({
                path: 'products',
                select: 'name description images price discountPrice stock category subCategory sizes _id',
                model: 'Product'
            });

        console.log('Featured products:', featured); // Debug log

        res.status(200).json({
            success: true,
            data: featured
        });
    } catch (error) {
        console.error('Error fetching featured products:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching featured products'
        });
    }
});

router.put('/featured/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const { productIds } = req.body;

        console.log(`Updating featured products for category ${category}:`, productIds);

        // Validate category
        if (!['men', 'women', 'accessories'].includes(category)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category'
            });
        }

        // Validate products exist
        if (!Array.isArray(productIds)) {
            return res.status(400).json({
                success: false,
                message: 'productIds must be an array'
            });
        }

        const products = await Product.find({ _id: { $in: productIds } });
        if (products.length !== productIds.length) {
            return res.status(400).json({
                success: false,
                message: 'One or more products not found'
            });
        }

        // Find and update featured document
        const featured = await Featured.findOneAndUpdate(
            { category },
            { 
                $set: { 
                    products: productIds,
                    lastUpdated: Date.now()
                }
            },
            { 
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        // Populate and return
        await featured.populate({
            path: 'products',
            select: 'name description images price discountPrice stock category subCategory sizes _id'
        });

        console.log('Updated featured products:', featured);

        res.status(200).json({
            success: true,
            data: featured
        });
    } catch (error) {
        console.error('Error updating featured products:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error updating featured products'
        });
    }
});

module.exports = router; 