import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  Stack,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  ShoppingBag as OrderIcon,
  Inventory as ProductIcon,
  People as UsersIcon,
  Star as StarIcon,
  MonetizationOn as MoneyIcon,
  Person as PersonIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import axios from '../../utils/axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSales: 0,
    totalProducts: 0,
    totalUsers: 0,
    recentOrders: [],
    lowStockProducts: [],
    salesTrend: [],
    newUsers: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await axios.get('/admin/dashboard');
        setStats(response.data.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchDashboardStats();
    }
  }, [user]);

  const statsCards = [
    {
      title: 'Total Sales',
      value: `₹${stats.totalSales?.toLocaleString() || 0}`,
      icon: <MoneyIcon sx={{ fontSize: 40, color: '#2e7d32' }} />,
      color: '#2e7d32'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders || 0,
      icon: <OrderIcon sx={{ fontSize: 40, color: '#1976d2' }} />,
      color: '#1976d2'
    },
    {
      title: 'Total Products',
      value: stats.totalProducts || 0,
      icon: <ProductIcon sx={{ fontSize: 40, color: '#9c27b0' }} />,
      color: '#9c27b0'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers || 0,
      icon: <PersonIcon sx={{ fontSize: 40, color: '#ed6c02' }} />,
      color: '#ed6c02'
    }
  ];

  const dashboardItems = [
    {
      title: 'Add Product',
      icon: <AddIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      description: 'Add new products to your store',
      link: '/admin/products/add'
    },
    {
      title: 'Manage Products',
      icon: <ProductIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      description: 'Edit or remove existing products',
      link: '/admin/products'
    },
    {
      title: 'Featured Products',
      icon: <StarIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      description: 'Manage featured products for each category on the home page',
      link: '/admin/featured'
    },
    {
      title: 'Manage Orders',
      icon: <OrderIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      description: 'View and manage customer orders',
      link: '/admin/orders'
    },
    {
      title: 'Manage Users',
      icon: <UsersIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      description: 'View and manage user accounts',
      link: '/admin/users'
    }
  ];

  if (authLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          You don't have permission to access this page.
        </Alert>
      </Container>
    );
  }

  const getOrderStatusColor = (status) => {
    if (!status) return 'default';
    
    switch (status.toLowerCase()) {
      case 'processing':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1">
            Admin Dashboard
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {stat.icon}
                    <Typography variant="h6" sx={{ ml: 2 }}>
                      {stat.title}
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ color: stat.color }}>
                    {stat.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Sales Chart */}
        <Card sx={{ mb: 4, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Sales Trend
          </Typography>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <TrendingUpIcon color="primary" />
            <Typography variant="body1">
              {stats.salesTrend?.length > 0 
                ? `Last 7 days sales trend shows ${stats.salesTrend[stats.salesTrend.length - 1].amount > stats.salesTrend[0].amount ? 'an increase' : 'a decrease'} in sales`
                : 'No sales data available for the last 7 days'}
            </Typography>
          </Box>
        </Card>

        {/* Recent Orders */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Orders
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.recentOrders?.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>{order._id}</TableCell>
                      <TableCell>{order.userId?.fullName}</TableCell>
                      <TableCell>₹{order.totalAmount}</TableCell>
                      <TableCell>
                        <Chip 
                          label={order.orderStatus || 'pending'} 
                          color={getOrderStatusColor(order.orderStatus || 'pending')}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          onClick={() => navigate(`/admin/orders/${order._id}`)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Low Stock Products */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Low Stock Products
              </Typography>
              <WarningIcon color="warning" />
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Current Stock</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.lowStockProducts?.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography>{product.stock}</Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={(product.stock / 10) * 100}
                            sx={{ width: 100 }}
                            color={product.stock < 5 ? "error" : "warning"}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>₹{product.price}</TableCell>
                      <TableCell>
                        <IconButton 
                          size="small"
                          onClick={() => navigate(`/admin/products/${product._id}`)}
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* User Activity */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: '#000000' }}>
              User Activity
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2,
                  bgcolor: 'rgba(25, 118, 210, 0.05)',
                  borderRadius: 1
                }}>
                  <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                    {stats.newUsers || 0}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#000000', mt: 1 }}>
                    New Users (Last 30 Days)
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2,
                  bgcolor: 'rgba(156, 39, 176, 0.05)',
                  borderRadius: 1
                }}>
                  <Typography variant="h4" sx={{ color: '#9c27b0', fontWeight: 'bold' }}>
                    {stats.activeUsers || 0}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#000000', mt: 1 }}>
                    Active Users
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Divider sx={{ my: 4 }} />

        {/* Management Cards */}
        <Grid container spacing={3}>
          {dashboardItems.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                onClick={() => navigate(item.link)}
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {item.icon}
                    <Typography variant="h6" sx={{ ml: 2 }}>
                      {item.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Container>
  );
};

export default AdminDashboard; 