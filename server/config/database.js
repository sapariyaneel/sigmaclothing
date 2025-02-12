const mongoose = require('mongoose');

const connectDatabase = async () => {
    try {
        console.log('Connecting to MongoDB...');
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('MongoDB Connected:', conn.connection.host);
        
        // Test the connection by counting products
        const Product = require('../models/product.model');
        const productCount = await Product.countDocuments();
        console.log('Total products in database:', productCount);
        
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDatabase; 