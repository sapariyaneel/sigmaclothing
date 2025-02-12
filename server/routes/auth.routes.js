const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { check } = require('express-validator');
const {
    register,
    login,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    getMe
} = require('../controllers/auth.controller');
const emailService = require('../services/email.service');
const transporter = require('../services/email.service');
const User = require('../models/user.model');
const nodemailer = require('nodemailer');

// Validation middleware
const registerValidation = [
    check('email')
        .isEmail()
        .withMessage('Please enter a valid email address'),
    check('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    check('fullName')
        .notEmpty()
        .withMessage('Full name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Full name must be between 2 and 50 characters'),
    check('phone')
        .optional()
        .matches(/^[0-9]{10}$/)
        .withMessage('Please enter a valid 10-digit phone number')
];

const loginValidation = [
    check('email')
        .isEmail()
        .withMessage('Please enter a valid email address'),
    check('password')
        .notEmpty()
        .withMessage('Password is required')
];

const forgotPasswordValidation = [
    check('email')
        .isEmail()
        .withMessage('Please enter a valid email address')
];

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', logout);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Protected routes
router.use(protect);
router.get('/me', getMe);

// Add this route for direct email testing
router.post('/test-email', async (req, res) => {
    try {
        const mailOptions = {
            from: `"Sigma Clothing" <${process.env.EMAIL_USER}>`,
            to: req.body.email || process.env.EMAIL_USER, // Send to the provided email or fallback to sender
            subject: "Test Email from Sigma Clothing",
            html: `
                <h1>Test Email</h1>
                <p>This is a test email from Sigma Clothing.</p>
                <p>If you're receiving this, the email configuration is working correctly!</p>
                <p>Time sent: ${new Date().toLocaleString()}</p>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        
        res.json({
            success: true,
            messageId: info.messageId,
            response: info.response,
            preview: nodemailer.getTestMessageUrl(info)
        });
    } catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            code: error.code,
            command: error.command,
            response: error.response
        });
    }
});

router.post('/test-login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');
        
        console.log('Test login:', {
            userFound: !!user,
            hasPassword: !!user?.password,
            passwordLength: password?.length,
            userPasswordLength: user?.password?.length
        });
        
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }
        
        const isMatch = await user.comparePassword(password);
        
        res.json({
            success: true,
            passwordMatch: isMatch
        });
    } catch (error) {
        console.error('Test login error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router; 