import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Button,
  TextField,
  IconButton,
  Collapse,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  LocalOffer as CouponIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const OrderSummary = ({ items, totalAmount, shippingAddress }) => {
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [discount, setDiscount] = useState(0);

  const handleEditCart = () => {
    navigate('/cart');
  };

  const handleApplyCoupon = () => {
    // This is a placeholder for coupon validation logic
    // You should implement actual coupon validation here
    if (couponCode.trim() === '') {
      setCouponError('Please enter a coupon code');
      return;
    }
    
    // Example coupon logic (replace with actual implementation)
    if (couponCode.toUpperCase() === 'WELCOME10') {
      const discountAmount = totalAmount * 0.1;
      setDiscount(discountAmount);
      setCouponError('');
      setShowCouponInput(false);
    } else {
      setCouponError('Invalid coupon code');
    }
  };

  const handleRemoveCoupon = () => {
    setDiscount(0);
    setCouponCode('');
    setCouponError('');
  };

  const estimatedDeliveryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 5); // Add 5 days for delivery
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Order Summary {items.length === 1 ? '(Buy Now)' : ''}
          </Typography>
          <Button
            startIcon={<EditIcon />}
            onClick={handleEditCart}
            size="small"
          >
            Edit Cart
          </Button>
        </Box>

        <List disablePadding>
          {items.map((item) => (
            <ListItem key={item._id} sx={{ py: 1, px: 0 }}>
              <ListItemAvatar>
                <Avatar
                  variant="rounded"
                  src={item.productId.images[0]}
                  alt={item.productId.name}
                  sx={{ width: 60, height: 60, mr: 2 }}
                />
              </ListItemAvatar>
              <ListItemText
                primary={item.productId.name}
                secondary={`${item.size ? `Size: ${item.size} | ` : ''}Qty: ${item.quantity}`}
                sx={{ ml: 1 }}
              />
              <Typography variant="body2">₹{item.totalPrice}</Typography>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        {/* Coupon Section */}
        <Box sx={{ mb: 2 }}>
          {discount > 0 ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="success.main">
                Coupon WELCOME10 applied
              </Typography>
              <IconButton size="small" onClick={handleRemoveCoupon}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ) : (
            <Button
              startIcon={<CouponIcon />}
              onClick={() => setShowCouponInput(!showCouponInput)}
              size="small"
              sx={{ mb: 1 }}
            >
              Apply Coupon Code
            </Button>
          )}

          <Collapse in={showCouponInput}>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                size="small"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                error={!!couponError}
                helperText={couponError}
                fullWidth
              />
              <Button
                variant="outlined"
                onClick={handleApplyCoupon}
                sx={{ minWidth: 100 }}
              >
                Apply
              </Button>
            </Box>
          </Collapse>
        </Box>

        {/* Price Breakdown */}
        <List disablePadding>
          <ListItem sx={{ py: 1, px: 0 }}>
            <ListItemText primary="Subtotal" />
            <Typography variant="body2">₹{totalAmount}</Typography>
          </ListItem>

          {discount > 0 && (
            <ListItem sx={{ py: 1, px: 0 }}>
              <ListItemText primary="Discount" />
              <Typography variant="body2" color="success.main">
                -₹{discount}
              </Typography>
            </ListItem>
          )}

          <ListItem sx={{ py: 1, px: 0 }}>
            <ListItemText primary="Shipping" />
            <Typography variant="body2">Free</Typography>
          </ListItem>

          <Divider sx={{ my: 1 }} />

          <ListItem sx={{ py: 1, px: 0 }}>
            <ListItemText primary={<Typography variant="h6">Total</Typography>} />
            <Typography variant="h6">₹{totalAmount - discount}</Typography>
          </ListItem>
        </List>

        {/* Estimated Delivery */}
        <Box sx={{ mt: 2, bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Estimated Delivery Date:
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {estimatedDeliveryDate()}
          </Typography>
        </Box>

        {shippingAddress && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Shipping Address
            </Typography>
            <Typography variant="body2">
              {shippingAddress.fullName}
              <br />
              {shippingAddress.street}
              {shippingAddress.addressLine2 && (
                <>
                  <br />
                  {shippingAddress.addressLine2}
                </>
              )}
              {shippingAddress.landmark && (
                <>
                  <br />
                  Near {shippingAddress.landmark}
                </>
              )}
              <br />
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
              <br />
              Phone: {shippingAddress.phone}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderSummary; 