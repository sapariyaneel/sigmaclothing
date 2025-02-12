import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Avatar,
  Divider,
  Alert,
  IconButton,
  CircularProgress,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Badge,
  Tooltip,
  Fade
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
  Lock as LockIcon,
  Delete as DeleteIcon,
  ShoppingBag as OrderIcon,
  Settings as SettingsIcon,
  PhotoCamera as CameraIcon,
  CreditCard as CreditCardIcon,
  LocalShipping as ShippingIcon,
  Favorite as FavoriteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../utils/axios';
import { updateProfile, logout } from '../store/slices/authSlice';
import { INDIAN_STATES } from '../utils/constants';
import { formatDate, formatCurrency } from '../utils/format';

// TabPanel component for tab content
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const Profile = () => {
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [orders, setOrders] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      landmark: ''
    }
  });
  const [paymentFormData, setPaymentFormData] = useState({
    cardNumber: '',
    cardHolderName: '',
    expiryDate: ''
  });
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = React.useRef();

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || '',
          country: user.address?.country || '',
          landmark: user.address?.landmark || ''
        }
      });
    }
  }, [user]);

  // Fetch orders and payment methods
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, paymentsRes] = await Promise.all([
          axios.get('/users/orders'),
          axios.get('/users/payment-methods')
        ]);
        setOrders(ordersRes.data);
        setPaymentMethods(paymentsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load some data. Please try again.');
      }
    };
    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePaymentFormChange = (e) => {
    const { name, value } = e.target;
    setPaymentFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setPasswordFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updatedUser = await dispatch(updateProfile(formData)).unwrap();
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      setError(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePicture', file);

    setUploadingPhoto(true);
    setError('');

    try {
      const response = await axios.post('/users/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data && response.data.profilePicture) {
        await dispatch(updateProfile(response.data)).unwrap();
        setSuccess('Profile picture updated successfully');
      } else {
        setError('Failed to update profile picture - invalid response');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleAddPaymentMethod = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/users/payment-methods', paymentFormData);
      setPaymentMethods([...paymentMethods, response.data]);
      setOpenPaymentDialog(false);
      setSuccess('Payment method added successfully');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add payment method');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePaymentMethod = async (id) => {
    try {
      await axios.delete(`/users/payment-methods/${id}`);
      setPaymentMethods(paymentMethods.filter(pm => pm._id !== id));
      setSuccess('Payment method removed successfully');
    } catch (error) {
      setError('Failed to remove payment method');
    }
  };

  const handlePasswordChange = async () => {
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setPasswordLoading(true);
    setError('');

    try {
      await axios.post('/users/change-password', {
        currentPassword: passwordFormData.currentPassword,
        newPassword: passwordFormData.newPassword,
        confirmPassword: passwordFormData.confirmPassword
      });

      setSuccess('Password changed successfully');
      setOpenPasswordDialog(false);
      setPasswordFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAccountDelete = async () => {
    setDeleteLoading(true);
    setError('');

    try {
      await axios.delete('/users/account');
      await dispatch(logout()).unwrap();
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete account');
      setDeleteLoading(false);
    }
  };

  // Add handleCancel function
  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      gender: user?.gender || '',
      address: {
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        zipCode: user?.address?.zipCode || '',
        country: user?.address?.country || '',
        landmark: user?.address?.landmark || ''
      }
    });
    setIsEditing(false);
    setError('');
  };

  if (authLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Profile Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <IconButton
                  color="primary"
                  aria-label="upload picture"
                  component="label"
                  disabled={uploadingPhoto}
                  sx={{
                    bgcolor: 'background.paper',
                    '&:hover': { bgcolor: 'background.paper' }
                  }}
                >
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={handlePhotoUpload}
                    ref={fileInputRef}
                  />
                  {uploadingPhoto ? (
                    <CircularProgress size={24} />
                  ) : (
                    <CameraIcon />
                  )}
                </IconButton>
              }
            >
              <Avatar
                src={user?.profilePicture ? `${import.meta.env.VITE_SERVER_URL}${user.profilePicture}` : ''}
                alt={user?.fullName}
                sx={{ width: 100, height: 100 }}
              >
                {!user?.profilePicture && user?.fullName?.[0]?.toUpperCase()}
              </Avatar>
            </Badge>
          </Grid>
          <Grid item xs>
            <Typography variant="h5" gutterBottom>
              {user?.fullName}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {user?.email}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="profile tabs"
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              transition: 'all 0.3s ease',
              '&.Mui-selected': {
                fontWeight: 'bold',
                borderBottom: 3,
                borderColor: 'primary.main'
              }
            }
          }}
        >
          <Tab label="Profile Details" />
          <Tab label="Orders" />
          <Tab label="Account Settings" />
        </Tabs>
      </Box>

      {/* Profile Details Tab */}
      <TabPanel value={activeTab} index={0}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Personal Information
                {!isEditing ? (
                  <IconButton onClick={() => setIsEditing(true)} size="small" sx={{ ml: 1 }}>
                    <EditIcon />
                  </IconButton>
                ) : (
                  <>
                    <IconButton type="submit" size="small" sx={{ ml: 1 }} disabled={loading}>
                      <SaveIcon />
                    </IconButton>
                    <IconButton onClick={() => {
                      setIsEditing(false);
                      handleCancel();
                    }} size="small">
                      <CancelIcon />
                    </IconButton>
                  </>
                )}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={!isEditing}>
                <InputLabel>Gender</InputLabel>
                <Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  label="Gender"
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Address Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Address Information
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                disabled={!isEditing}
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={!isEditing}>
                <InputLabel>State</InputLabel>
                <Select
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  label="State"
                >
                  {INDIAN_STATES.map((state) => (
                    <MenuItem key={state} value={state}>
                      {state}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ZIP Code"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Landmark"
                name="address.landmark"
                value={formData.address.landmark}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Grid>
          </Grid>
        </form>
      </TabPanel>

      {/* Orders Tab */}
      <TabPanel value={activeTab} index={1}>
        {orders && orders.length > 0 ? (
          <Grid container spacing={3}>
            {orders.map((order) => (
              <Grid item xs={12} key={order._id}>
                <Paper sx={{ p: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1">
                          Order #{order.orderNumber}
                        </Typography>
                        <Chip
                          label={order.status}
                          color={
                            order.status === 'Delivered' ? 'success' :
                            order.status === 'Shipped' ? 'primary' :
                            'warning'
                          }
                          size="small"
                        />
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', py: 1 }}>
                        {order.items && order.items.map((item) => (
                          <Box
                            key={item._id}
                            component={Link}
                            to={`/product/${item.productId?._id}`}
                            sx={{
                              textDecoration: 'none',
                              color: 'inherit'
                            }}
                          >
                            <Card sx={{ width: 100 }}>
                              <CardMedia
                                component="img"
                                height="100"
                                image={item.productId?.images?.[0]}
                                alt={item.productId?.name}
                              />
                            </Card>
                          </Box>
                        ))}
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="textSecondary">
                          Expected Delivery: {order.expectedDeliveryDate ? formatDate(order.expectedDeliveryDate) : 'Not available'}
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<ShippingIcon />}
                          component={Link}
                          to={`/order/track/${order._id}`}
                        >
                          Track Order
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="textSecondary" gutterBottom>
              It looks like you haven't placed any orders yet. Start shopping now!
            </Typography>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to="/shop"
              startIcon={<OrderIcon />}
              sx={{ mt: 2 }}
            >
              Shop Now
            </Button>
          </Paper>
        )}
      </TabPanel>

      {/* Account Settings Tab */}
      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3}>
          {/* Payment Methods */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Payment Methods
              <IconButton
                onClick={() => setOpenPaymentDialog(true)}
                size="small"
                sx={{ ml: 1 }}
              >
                <AddIcon />
              </IconButton>
            </Typography>

            <Grid container spacing={2}>
              {paymentMethods.map((method) => (
                <Grid item xs={12} sm={6} key={method._id}>
                  <Paper sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CreditCardIcon sx={{ mr: 1 }} />
                      <Typography variant="subtitle2">
                        •••• {method.lastFourDigits}
                      </Typography>
                      <IconButton
                        size="small"
                        sx={{ ml: 'auto' }}
                        onClick={() => handleDeletePaymentMethod(method._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      {method.cardHolderName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Expires: {method.expiryDate}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Account Security */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Account Security
            </Typography>
            <Button
              variant="outlined"
              startIcon={<LockIcon />}
              onClick={() => setOpenPasswordDialog(true)}
              sx={{ mr: 2 }}
            >
              Change Password
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setOpenDeleteDialog(true)}
            >
              Delete Account
            </Button>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Add Payment Method Dialog */}
      <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)}>
        <DialogTitle>Add Payment Method</DialogTitle>
        <form onSubmit={handleAddPaymentMethod}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Card Number"
                  name="cardNumber"
                  value={paymentFormData.cardNumber}
                  onChange={handlePaymentFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Card Holder Name"
                  name="cardHolderName"
                  value={paymentFormData.cardHolderName}
                  onChange={handlePaymentFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Expiry Date (MM/YY)"
                  name="expiryDate"
                  value={paymentFormData.expiryDate}
                  onChange={handlePaymentFormChange}
                  required
                  placeholder="MM/YY"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPaymentDialog(false)}>Cancel</Button>
            <LoadingButton type="submit" variant="contained" loading={loading}>
              Add
            </LoadingButton>
          </DialogActions>
        </form>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog 
        open={openPasswordDialog} 
        onClose={() => {
          setOpenPasswordDialog(false);
          setPasswordFormData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
        }}
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="password"
                label="Current Password"
                name="currentPassword"
                value={passwordFormData.currentPassword}
                onChange={handlePasswordFormChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="password"
                label="New Password"
                name="newPassword"
                value={passwordFormData.newPassword}
                onChange={handlePasswordFormChange}
                required
                helperText="Password must be at least 6 characters long and contain uppercase, lowercase, number and special character"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="password"
                label="Confirm New Password"
                name="confirmPassword"
                value={passwordFormData.confirmPassword}
                onChange={handlePasswordFormChange}
                required
                error={passwordFormData.newPassword !== passwordFormData.confirmPassword}
                helperText={
                  passwordFormData.newPassword !== passwordFormData.confirmPassword
                    ? "Passwords don't match"
                    : ''
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setOpenPasswordDialog(false);
              setPasswordFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
              });
            }}
          >
            Cancel
          </Button>
          <LoadingButton 
            variant="contained" 
            onClick={handlePasswordChange}
            loading={passwordLoading}
            disabled={!passwordFormData.currentPassword || !passwordFormData.newPassword || !passwordFormData.confirmPassword}
          >
            Change Password
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Typography color="error" paragraph>
            Warning: This action cannot be undone!
          </Typography>
          <Typography>
            Are you sure you want to delete your account? This will:
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <Typography component="li">Delete your profile and personal information</Typography>
            <Typography component="li">Remove all saved payment methods</Typography>
            <Typography component="li">Remove your wishlist items</Typography>
            <Typography component="li">Anonymize your order history</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <LoadingButton
            variant="contained"
            color="error"
            onClick={handleAccountDelete}
            loading={deleteLoading}
          >
            Delete Account
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile; 