# Sigma Clothing

A full-stack e-commerce platform for clothing and accessories.

## Features

- User authentication and authorization
- Product catalog with categories and filters
- Shopping cart and wishlist functionality
- Secure payment integration with Razorpay
- Admin dashboard for product and order management
- Responsive design for all devices
- Image optimization with Cloudinary
- Email notifications for orders and updates

## Tech Stack

### Frontend
- React.js
- Redux Toolkit for state management
- Tailwind CSS for styling
- Axios for API calls
- React Router for navigation

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Cloudinary for image management
- Nodemailer for email services

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Cloudinary account
- Gmail account (for email notifications)

### Installation

1. Clone the repository
```bash
git clone https://github.com/sapariyaneel/sigmaclothing.git
cd sigmaclothing
```

2. Install server dependencies
```bash
cd server
npm install
```

3. Install client dependencies
```bash
cd ../client
npm install
```

4. Set up environment variables:

Create `.env` file in server directory with:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_password
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

Create `.env` file in client directory with:
```
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=your_razorpay_key
```

5. Start the development servers:

For backend:
```bash
cd server
npm run dev
```

For frontend:
```bash
cd client
npm run dev
```

## Deployment

The application is deployed using:
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas
- Image Storage: Cloudinary

Live demo: [https://sigmaclothing.vercel.app](https://sigmaclothing.vercel.app)

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)