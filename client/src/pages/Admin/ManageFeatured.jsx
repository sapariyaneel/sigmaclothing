import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  IconButton,
  Button,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardMedia,
  CardContent,
  Chip
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import axios from '../../utils/axios';

const ManageFeatured = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [products, setProducts] = useState([]);
  const [featured, setFeatured] = useState({
    men: [],
    women: [],
    accessories: []
  });
  const [selectedCategory, setSelectedCategory] = useState('men');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, featuredRes] = await Promise.all([
        axios.get('/admin/products'),
        axios.get('/admin/featured')
      ]);

      setProducts(productsRes.data.data || []);
      
      // Organize featured products by category
      const featuredByCategory = {
        men: [],
        women: [],
        accessories: []
      };
      
      featuredRes.data.data.forEach(item => {
        featuredByCategory[item.category] = item.products || [];
      });
      
      setFeatured(featuredByCategory);
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching data');
      setLoading(false);
    }
  };

  const handleAddToFeatured = async (product) => {
    try {
      const currentFeatured = featured[selectedCategory];
      if (currentFeatured.some(p => p._id === product._id)) {
        setError('Product is already featured in this category');
        return;
      }

      const updatedProducts = [...currentFeatured, product];
      const productIds = updatedProducts.map(p => p._id);

      await axios.put(`/admin/featured/${selectedCategory}`, {
        productIds
      });

      setFeatured(prev => ({
        ...prev,
        [selectedCategory]: updatedProducts
      }));

      setSuccess('Featured products updated successfully');
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating featured products');
    }
  };

  const handleRemoveFromFeatured = async (productId) => {
    try {
      const currentFeatured = featured[selectedCategory];
      const updatedProducts = currentFeatured.filter(p => p._id !== productId);
      const productIds = updatedProducts.map(p => p._id);

      await axios.put(`/admin/featured/${selectedCategory}`, {
        productIds
      });

      setFeatured(prev => ({
        ...prev,
        [selectedCategory]: updatedProducts
      }));

      setSuccess('Product removed from featured successfully');
    } catch (error) {
      setError(error.response?.data?.message || 'Error removing product from featured');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 4, border: 1, borderColor: 'divider' }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/admin')}>
            <BackIcon />
          </IconButton>
          <Typography variant="h4">Manage Featured Products</Typography>
        </Box>

        {(error || success) && (
          <Alert 
            severity={error ? "error" : "success"} 
            sx={{ mb: 3 }}
            onClose={() => {
              setError('');
              setSuccess('');
            }}
          >
            {error || success}
          </Alert>
        )}

        <FormControl fullWidth sx={{ mb: 4 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategory}
            label="Category"
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <MenuItem value="men">Men</MenuItem>
            <MenuItem value="women">Women</MenuItem>
            <MenuItem value="accessories">Accessories</MenuItem>
          </Select>
        </FormControl>

        <Typography variant="h6" gutterBottom>
          Current Featured Products
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {featured[selectedCategory].map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product._id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={product.images[0]}
                  alt={product.name}
                  sx={{ objectFit: 'cover', objectPosition: 'top center' }}
                />
                <CardContent>
                  <Typography variant="subtitle1" noWrap>
                    {product.name}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body1" color="primary">
                      ₹{product.discountPrice || product.price}
                    </Typography>
                    <IconButton 
                      color="error" 
                      onClick={() => handleRemoveFromFeatured(product._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Typography variant="h6" gutterBottom>
          Available Products
        </Typography>
        <Grid container spacing={2}>
          {products
            .filter(product => 
              product.category === selectedCategory && 
              !featured[selectedCategory].some(p => p._id === product._id)
            )
            .map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product._id}>
                <Card>
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.images[0]}
                    alt={product.name}
                    sx={{ objectFit: 'cover', objectPosition: 'top center' }}
                  />
                  <CardContent>
                    <Typography variant="subtitle1" noWrap>
                      {product.name}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <Typography variant="body1" color="primary">
                        ₹{product.discountPrice || product.price}
                      </Typography>
                      <Button 
                        variant="contained" 
                        size="small"
                        onClick={() => handleAddToFeatured(product)}
                      >
                        Add to Featured
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>
      </Paper>
    </Container>
  );
};

export default ManageFeatured; 