import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
  Button,
  Grid,
  Divider,
  Paper,
  Collapse,
  Alert,
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  AccountBalance as NetBankingIcon,
  Payment as UPIIcon,
  AccountBalanceWallet as WalletIcon,
} from '@mui/icons-material';
import {
  createOrder,
  setPaymentInfo,
  initializePayment,
  verifyPayment,
  setStep
} from '../../store/slices/checkoutSlice';

const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const PaymentForm = ({ onBack, onNext }) => {
  const dispatch = useDispatch();
  const { shippingAddress, orderSummary } = useSelector((state) => state.checkout);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [showReview, setShowReview] = useState(false);
  const [errors, setErrors] = useState({});
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);

  // Ensure we stay on payment step until payment is complete
  useEffect(() => {
    if (!isPaymentComplete) {
      dispatch(setStep(2));
    }
  }, []);

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
    setShowReview(false);
    setErrors({});
  };

  const handleReviewOrder = () => {
    if (paymentMethod) {
      setShowReview(true);
    }
  };

  const handleSubmit = async () => {
    try {
      // Load Razorpay script
      const isRazorpayLoaded = await loadRazorpay();
      if (!isRazorpayLoaded) {
        setErrors({ submit: 'Failed to load payment gateway. Please try again.' });
        return;
      }

      // Initialize payment
      const initResult = await dispatch(initializePayment({
        amount: orderSummary.totalAmount,
        currency: 'INR'
      })).unwrap();
      
      console.log('Payment initialization response:', initResult);

      if (!initResult?.data?.id) {
        setErrors({ submit: 'Failed to initialize payment. Please try again.' });
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: initResult.data.amount,
        currency: initResult.data.currency,
        name: 'Sigma Clothing',
        description: 'Payment for your order',
        order_id: initResult.data.id,
        prefill: {
          name: shippingAddress.fullName,
          email: shippingAddress.email,
          contact: shippingAddress.phone,
        },
        handler: async function (response) {
          try {
            const verifyResult = await dispatch(verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            })).unwrap();

            if (verifyResult.success) {
              const orderData = {
                items: orderSummary.items.map(item => {
                  const orderItem = {
                    productId: item.productId._id,
                    quantity: item.quantity,
                    price: item.price,
                    totalPrice: item.totalPrice
                  };

                  // Only add size if the product has sizes
                  if (item.productId.sizes && item.productId.sizes.length > 0) {
                    orderItem.size = item.size || 'M';
                  }

                  return orderItem;
                }),
                totalAmount: orderSummary.totalAmount,
                shippingAddress: {
                  fullName: shippingAddress.fullName,
                  email: shippingAddress.email,
                  phone: shippingAddress.phone,
                  street: shippingAddress.street,
                  city: shippingAddress.city,
                  state: shippingAddress.state,
                  zipCode: shippingAddress.zipCode,
                  country: shippingAddress.country || 'India'
                },
                paymentInfo: {
                  method: 'razorpay',
                  status: 'completed',
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  amountPaid: orderSummary.totalAmount
                },
                orderStatus: 'processing'
              };

              const resultAction = await dispatch(createOrder(orderData)).unwrap();
              if (resultAction.success) {
                // Update payment info and step in a single batch
                dispatch(setPaymentInfo({
                  orderId: resultAction.data._id,
                  paymentId: response.razorpay_payment_id,
                  status: 'completed'
                }));
                
                // Set payment complete before changing step
                setIsPaymentComplete(true);
                
                // Use setTimeout to ensure state updates are processed
                setTimeout(() => {
                  dispatch(setStep(3));
                  onNext();
                }, 0);
              } else {
                setErrors({ submit: 'Failed to create order. Please contact support.' });
              }
            } else {
              setErrors({ submit: 'Payment verification failed. Please contact support.' });
            }
          } catch (error) {
            console.error('Payment processing error:', error);
            setErrors({ submit: 'Payment processing failed. Please try again.' });
          }
        },
        modal: {
          ondismiss: function() {
            setErrors({ submit: 'Payment cancelled. Please try again.' });
          }
        },
        theme: {
          color: '#1976d2'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment initialization error:', error);
      setErrors({ submit: error.message || 'An error occurred. Please try again.' });
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      {errors.submit && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.submit}
        </Alert>
      )}
      
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Payment Method
      </Typography>

      <FormControl component="fieldset" fullWidth>
        <RadioGroup
          value={paymentMethod}
          onChange={handlePaymentMethodChange}
        >
          {/* Razorpay */}
          <Paper variant="outlined" sx={{ mb: 2, p: 2 }}>
            <FormControlLabel
              value="razorpay"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CreditCardIcon color="action" />
                  <Typography>Pay with Razorpay (Credit/Debit Card, UPI, Netbanking)</Typography>
                </Box>
              }
            />
          </Paper>

          {/* Cash on Delivery - Disabled for now */}
          <Paper variant="outlined" sx={{ mb: 2, p: 2 }}>
            <FormControlLabel
              value="cod"
              disabled
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WalletIcon color="action" />
                  <Typography>Cash on Delivery (Currently Unavailable)</Typography>
                </Box>
              }
            />
          </Paper>
        </RadioGroup>
      </FormControl>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          onClick={onBack}
          sx={{ 
            minWidth: 120,
            textTransform: 'none'
          }}
        >
          Back
        </Button>
        {!showReview ? (
          <Button
            variant="contained"
            onClick={handleReviewOrder}
            disabled={!paymentMethod}
            sx={{
              minWidth: 200,
              py: 1.5,
              textTransform: 'none',
              fontSize: '1.1rem'
            }}
          >
            Review Order
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              minWidth: 200,
              py: 1.5,
              textTransform: 'none',
              fontSize: '1.1rem'
            }}
          >
            Place Order
          </Button>
        )}
      </Box>

      {/* Order Review Section */}
      <Collapse in={showReview}>
        <Box sx={{ mt: 3 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Please review your order details before proceeding with the payment.
          </Alert>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Total Amount:
              </Typography>
              <Typography variant="h6">
                ₹{orderSummary.totalAmount}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Payment Method:
              </Typography>
              <Typography variant="body1">
                {paymentMethod === 'razorpay' ? 'Razorpay (Credit/Debit Card, UPI, Netbanking)' : 'Cash on Delivery'}
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Collapse>
    </Box>
  );
};

export default PaymentForm;