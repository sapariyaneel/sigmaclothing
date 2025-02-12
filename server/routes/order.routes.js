const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Protect all routes after this middleware
router.use(protect);

// User routes
router.post('/', orderController.createOrder);
router.post('/create-payment', orderController.createPayment);
router.post('/verify-payment', orderController.verifyPayment);
router.get('/my-orders', orderController.getUserOrders);
router.get('/:id', orderController.getOrder);
router.post('/:id/cancel', orderController.cancelOrder);

// Admin routes
router.use(authorize('admin'));
router.get('/', orderController.getAllOrders);
router.patch('/:id/status', orderController.updateOrderStatus);

module.exports = router; 