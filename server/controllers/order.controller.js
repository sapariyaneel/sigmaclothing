const Order = require('../models/order.model');
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const Razorpay = require('razorpay');
const emailService = require('../services/email.service');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create payment
exports.createPayment = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount) {
            return res.status(400).json({
                success: false,
                message: 'Amount is required'
            });
        }

        // Create Razorpay order
        const razorpayOrder = await razorpay.orders.create({
            amount: amount * 100, // Convert to paise
            currency: 'INR',
            receipt: `order_${Date.now()}`
        });

        res.status(200).json({
            success: true,
            data: {
                id: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency
            }
        });
    } catch (error) {
        console.error('Create payment error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create payment'
        });
    }
};

// Create a new order
exports.createOrder = async (req, res) => {
    try {
        const orderData = {
            ...req.body,
            userId: req.user._id
        };

        console.log('Creating order with data:', {
            items: orderData.items,
            shippingAddress: orderData.shippingAddress,
            totalAmount: orderData.totalAmount
        });

        // Create order
        const order = await Order.create(orderData);
        
        // Populate necessary fields for email
        await order.populate([
            {
                path: 'items.productId',
                select: 'name images price'
            },
            {
                path: 'userId',
                select: 'email fullName'
            }
        ]);

        // Log populated order data
        console.log('Populated order data:', {
            orderNumber: order.orderNumber,
            items: order.items.length,
            shippingEmail: orderData.shippingAddress.email,
            shippingName: orderData.shippingAddress.fullName
        });

        // Create user object with shipping address details for email
        const userForEmail = {
            email: orderData.shippingAddress.email,
            fullName: orderData.shippingAddress.fullName
        };

        console.log('Attempting to send confirmation email to:', userForEmail);

        // Send confirmation email
        try {
            await emailService.sendOrderConfirmation(order);
            console.log('Order confirmation email sent successfully to:', order.email);
        } catch (emailError) {
            console.error('Error sending order confirmation email:', {
                error: emailError.message,
                stack: emailError.stack,
                emailConfig: {
                    service: process.env.EMAIL_SERVICE,
                    host: process.env.EMAIL_HOST,
                    port: process.env.EMAIL_PORT,
                    user: process.env.EMAIL_USER
                }
            });
        }

        // Clear cart after successful order
        await Cart.findOneAndUpdate(
            { userId: req.user._id },
            { $set: { items: [] } }
        );

        res.status(201).json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Verify payment and update order status
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        console.log('Verifying payment:', {
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id
        });

        // Find order
        const order = await Order.findOne({
            'paymentInfo.razorpayOrderId': razorpay_order_id
        });

        if (!order) {
            console.error('Order not found for payment verification:', razorpay_order_id);
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Verify signature
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const generatedSignature = hmac.digest('hex');

        if (generatedSignature !== razorpay_signature) {
            console.error('Payment signature verification failed');
            order.paymentInfo.status = 'failed';
            await order.save();

            return res.status(400).json({
                success: false,
                message: 'Payment verification failed'
            });
        }

        console.log('Payment signature verified successfully');

        // Update order
        order.paymentInfo.status = 'completed';
        order.paymentInfo.razorpayPaymentId = razorpay_payment_id;
        order.orderStatus = 'processing';
        await order.save();

        // Populate order for email
        await order.populate([
            {
                path: 'items.productId',
                select: 'name images price'
            },
            {
                path: 'userId',
                select: 'email fullName'
            }
        ]);

        // Create user object with shipping address details for email
        const userForEmail = {
            email: order.shippingAddress.email,
            fullName: order.shippingAddress.fullName
        };

        console.log('Attempting to send confirmation email after payment verification to:', userForEmail);

        // Send confirmation email
        try {
            await emailService.sendOrderConfirmation(order);
            console.log('Order confirmation email sent successfully after payment verification to:', order.email);
        } catch (emailError) {
            console.error('Error sending order confirmation email after payment verification:', {
                error: emailError.message,
                stack: emailError.stack,
                emailConfig: {
                    service: process.env.EMAIL_SERVICE,
                    host: process.env.EMAIL_HOST,
                    port: process.env.EMAIL_PORT,
                    user: process.env.EMAIL_USER
                }
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id })
            .populate('items.productId', 'name images')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get single order
exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.productId', 'name images');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if order belongs to user or user is admin
        if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this order'
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if order belongs to user
        if (order.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this order'
            });
        }

        // Check if order can be cancelled
        if (!order.canBeCancelled()) {
            return res.status(400).json({
                success: false,
                message: 'Order cannot be cancelled'
            });
        }

        // Update order status
        order.orderStatus = 'cancelled';
        
        // If payment was completed, mark for refund
        if (order.paymentInfo.status === 'completed') {
            order.paymentInfo.status = 'refunded';
        }

        await order.save();

        // Restore product stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: item.quantity }
            });
        }

        // Send cancellation email
        await emailService.sendOrderCancellation(order);

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all orders (admin only)
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('userId', 'fullName email')
            .populate('items.productId', 'name images')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Validate status transition
        const validTransitions = {
            pending: ['processing', 'cancelled'],
            processing: ['shipped', 'cancelled'],
            shipped: ['delivered', 'cancelled'],
            delivered: [],
            cancelled: []
        };

        if (!validTransitions[order.orderStatus].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status transition'
            });
        }

        order.orderStatus = status;
        await order.save();

        // Send status update email
        await emailService.sendOrderStatusUpdate(order);

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 