const nodemailer = require('nodemailer');

// Create transporter with Gmail-specific settings
const createTransporter = () => {
    console.log('Creating email transporter with config:', {
        service: process.env.EMAIL_SERVICE,
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER
        }
    });

    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
        debug: true,
        logger: true
    });
};

const transporter = createTransporter();

// Verify transporter connection on startup
(async () => {
    try {
        await transporter.verify();
        console.log('Email transporter verification successful');
        console.log('Email configuration:', {
            service: process.env.EMAIL_SERVICE,
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: process.env.EMAIL_SECURE === 'true',
            user: process.env.EMAIL_USER
        });
    } catch (error) {
        console.error('Email transporter verification failed:', {
            error: error.message,
            stack: error.stack,
            code: error.code,
            command: error.command,
            response: error.response
        });
        console.error('Current email configuration:', {
            service: process.env.EMAIL_SERVICE,
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: process.env.EMAIL_SECURE === 'true',
            user: process.env.EMAIL_USER
        });
    }
})();

// Format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
};

// Generate order confirmation email
const sendOrderConfirmationEmail = async (order, user) => {
    console.log('Starting email send process...');
    console.log('User data:', { email: user?.email, fullName: user?.fullName });
    console.log('Order data:', {
        orderId: order?._id,
        orderNumber: order?.orderNumber,
        totalAmount: order?.totalAmount,
        itemsCount: order?.items?.length
    });
    
    if (!user || !user.email) {
        const error = new Error('User email is required for sending confirmation email');
        console.error('Missing user email:', { user, error: error.stack });
        throw error;
    }

    if (!order || !order.items) {
        const error = new Error('Invalid order data for confirmation email');
        console.error('Invalid order data:', { order, error: error.stack });
        throw error;
    }

    // Generate items HTML
    const itemsHtml = order.items.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.productId?.name || 'Product'}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.size || 'N/A'}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${formatCurrency(item.price)}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${formatCurrency(item.totalPrice)}</td>
        </tr>
    `).join('');

    const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1976d2; text-align: center;">Thank You for Your Order!</h1>
            
            <p>Dear ${user.fullName || 'Valued Customer'},</p>
            
            <p>Thank you for shopping with Sigma Clothing. Your order has been successfully placed and is being processed.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0;">
                <h2 style="color: #333;">Order Details</h2>
                <p><strong>Order Number:</strong> ${order.orderNumber || order._id}</p>
                <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                <p><strong>Payment Status:</strong> ${order.paymentInfo.status}</p>
                <p><strong>Payment Method:</strong> ${order.paymentInfo.method}</p>
            </div>

            <h3 style="color: #333;">Items Ordered</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #f5f5f5;">
                        <th style="padding: 10px; text-align: left;">Product</th>
                        <th style="padding: 10px; text-align: left;">Quantity</th>
                        <th style="padding: 10px; text-align: left;">Size</th>
                        <th style="padding: 10px; text-align: left;">Price</th>
                        <th style="padding: 10px; text-align: left;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>

            <div style="margin-top: 20px; text-align: right;">
                <p><strong>Total Amount: ${formatCurrency(order.totalAmount)}</strong></p>
            </div>

            <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0;">
                <h3 style="color: #333;">Shipping Address</h3>
                <p>${order.shippingAddress.street}</p>
                <p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}</p>
                <p>${order.shippingAddress.country}</p>
            </div>

            <p>We will send you another email when your order ships. If you have any questions, please contact our customer service.</p>

            <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #f5f5f5;">
                <p>Thank you for choosing Sigma Clothing!</p>
            </div>
        </div>
    `;

    const mailOptions = {
        from: {
            name: 'Sigma Clothing',
            address: process.env.EMAIL_USER
        },
        to: user.email,
        subject: `Order Confirmation - ${order.orderNumber || order._id}`,
        html: emailHtml
    };

    console.log('Preparing to send email with options:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
    });

    try {
        console.log('Attempting to send email...');
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', {
            messageId: info.messageId,
            response: info.response,
            accepted: info.accepted,
            rejected: info.rejected,
            envelope: info.envelope
        });
        return info;
    } catch (error) {
        console.error('Error sending email:', {
            error: error.message,
            code: error.code,
            command: error.command,
            response: error.response,
            responseCode: error.responseCode,
            stack: error.stack,
            emailConfig: {
                service: process.env.EMAIL_SERVICE,
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                secure: process.env.EMAIL_SECURE === 'true',
                user: process.env.EMAIL_USER
            }
        });
        throw error;
    }
};

module.exports = {
    sendOrderConfirmationEmail
}; 