const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
require('dotenv').config();

let mongod;

// Connect to the in-memory database before running tests
beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
});

// Clear all test data after every test
afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany();
    }
});

// Disconnect and stop the in-memory server after all tests
afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod.stop();
});

// Global test setup
global.testSetup = {
    // Helper function to create a test user
    createTestUser: async (customData = {}) => {
        const User = require('../models/user.model');
        const defaultUser = {
            email: 'test@example.com',
            password: 'password123',
            fullName: 'Test User',
            phone: '1234567890',
            address: {
                street: 'Test Street',
                city: 'Test City',
                state: 'Test State',
                zipCode: '123456',
                country: 'Test Country'
            }
        };

        const userData = { ...defaultUser, ...customData };
        return await User.create(userData);
    },

    // Helper function to create a test product
    createTestProduct: async (customData = {}) => {
        const Product = require('../models/product.model');
        const defaultProduct = {
            name: 'Test Product',
            description: 'Test Description',
            price: 999,
            category: 'men',
            subCategory: 'shirts',
            sizes: ['M', 'L'],
            colors: ['Black', 'White'],
            images: ['test-image.jpg'],
            stock: 10
        };

        const productData = { ...defaultProduct, ...customData };
        return await Product.create(productData);
    },

    // Helper function to create a test order
    createTestOrder: async (userId, products, customData = {}) => {
        const Order = require('../models/order.model');
        const defaultOrder = {
            userId,
            items: products.map(product => ({
                productId: product._id,
                quantity: 1,
                size: product.sizes[0],
                color: product.colors[0],
                price: product.price,
                totalPrice: product.price
            })),
            totalAmount: products.reduce((total, product) => total + product.price, 0),
            shippingAddress: {
                street: 'Test Street',
                city: 'Test City',
                state: 'Test State',
                zipCode: '123456',
                country: 'Test Country'
            },
            paymentInfo: {
                razorpayOrderId: 'test_order_id',
                method: 'card',
                amountPaid: products.reduce((total, product) => total + product.price, 0)
            }
        };

        const orderData = { ...defaultOrder, ...customData };
        return await Order.create(orderData);
    },

    // Helper function to generate a valid JWT token
    generateToken: (userId, role = 'user') => {
        const jwt = require('jsonwebtoken');
        return jwt.sign(
            { id: userId, role },
            process.env.JWT_SECRET || 'test-secret',
            { expiresIn: '1h' }
        );
    }
}; 