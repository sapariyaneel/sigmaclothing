import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Alert,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Input
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ArrowBack as BackIcon,
  CloudUpload as UploadIcon,
  DeleteOutline as RemoveImageIcon
} from '@mui/icons-material';
import axios from '../../utils/axios';

const ManageProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialog, setEditDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    stock: '',
    category: '',
    subCategory: '',
    sizes: [],
    images: [],
    newImages: [],
    imagePosition: 'center',
    imageScale: 1,
    imageFit: 'cover'
  });

  const categories = ['men', 'women', 'accessories'];
  const subCategories = {
    men: ['shirts', 'pants', 't-shirts', 'jeans', 'jackets'],
    women: ['dresses', 'tops', 'pants', 'skirts', 'jackets'],
    accessories: ['bags', 'jewelry', 'watches', 'belts', 'sunglasses']
  };
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const positions = [
    'center', 'top', 'bottom', 'left', 'right',
    'top left', 'top center', 'top right',
    'center left', 'center center', 'center right',
    'bottom left', 'bottom center', 'bottom right'
  ];

  const defaultImage = useMemo(() => 'https://res.cloudinary.com/dibb74win/image/upload/v1707665378/sigma-clothing/product-placeholder.png', []);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await axios.get('/admin/products');
      const productsData = Array.isArray(response.data.data) ? response.data.data : [];
      
      // Process products once to ensure all required fields
      const processedProducts = productsData.map(product => ({
        ...product,
        _id: product._id || `temp-${Math.random()}`,
        name: product.name || 'Unnamed Product',
        category: product.category || 'Uncategorized',
        price: product.price || 0,
        stock: product.stock || 0,
        images: Array.isArray(product.images) && product.images.length > 0 
          ? product.images.filter(img => img && typeof img === 'string' && (img.includes('cloudinary.com') || img.startsWith('http')))
          : [defaultImage]
      }));
      
      setProducts(processedProducts);
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching products');
    } finally {
      setLoading(false);
    }
  }, [defaultImage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleEdit = useCallback((product) => {
    setSelectedProduct(product);
    setEditForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      discountPrice: product.discountPrice || '',
      stock: product.stock || '',
      category: product.category || '',
      subCategory: product.subCategory || '',
      sizes: product.sizes || [],
      images: product.images || [],
      newImages: [],
      imagePosition: product.imagePosition || 'center',
      imageScale: product.imageScale || 1,
      imageFit: product.imageFit || 'cover'
    });
    setEditDialog(true);
  }, []);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + editForm.images.length + editForm.newImages.length > 6) {
      setError('Maximum 6 images allowed');
      return;
    }

    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setEditForm(prev => ({
      ...prev,
      newImages: [...prev.newImages, ...newImages]
    }));
  };

  const handleRemoveExistingImage = (index) => {
    setEditForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveNewImage = (index) => {
    setEditForm(prev => ({
      ...prev,
      newImages: prev.newImages.filter((_, i) => i !== index)
    }));
  };

  const handleImagePositionChange = (position) => {
    setEditForm(prev => ({
      ...prev,
      imagePosition: position
    }));
  };

  const handleEditSubmit = async () => {
    try {
      const formData = new FormData();
      
      // Append all text fields
      Object.keys(editForm).forEach(key => {
        if (key !== 'images' && key !== 'newImages') {
          if (Array.isArray(editForm[key])) {
            formData.append(key, JSON.stringify(editForm[key]));
          } else {
            formData.append(key, editForm[key]);
          }
        }
      });

      // Append existing images
      formData.append('existingImages', JSON.stringify(editForm.images));

      // Append new images
      editForm.newImages.forEach(image => {
        formData.append('images', image.file);
      });

      await axios.put(`/admin/products/${selectedProduct._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setEditDialog(false);
      fetchProducts();
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating product');
    }
  };

  const handleDelete = useCallback(async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/admin/products/${productId}`);
        fetchProducts();
      } catch (error) {
        setError(error.response?.data?.message || 'Error deleting product');
      }
    }
  }, [fetchProducts]);

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
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate('/admin')}>
              <BackIcon />
            </IconButton>
            <Typography variant="h4">Manage Products</Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/products/add')}
          >
            Add New Product
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products && products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <Box
                        component="img"
                        src={product.images[0]}
                        alt={product.name}
                        sx={{ 
                          width: 50, 
                          height: 50, 
                          objectFit: 'cover',
                          objectPosition: 'top center',
                          borderRadius: 1,
                          border: '1px solid #eee'
                        }}
                        onError={(e) => {
                          if (e.target.src !== defaultImage) {
                            e.target.src = defaultImage;
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>
                      {`${product.category}${product.subCategory ? ` / ${product.subCategory}` : ''}`}
                    </TableCell>
                    <TableCell>₹{product.price}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      <Chip
                        label={product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        color={product.stock > 0 ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        onClick={() => handleEdit(product)} 
                        color="primary"
                        title="Edit product"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDelete(product._id)}
                        color="error"
                        title="Delete product"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body1" color="textSecondary">
                      No products found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Enhanced Edit Dialog */}
        <Dialog 
          open={editDialog} 
          onClose={() => setEditDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Edit Product</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Product Name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Description"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={editForm.category}
                      label="Category"
                      onChange={(e) => setEditForm({ 
                        ...editForm, 
                        category: e.target.value,
                        subCategory: '' // Reset subcategory when category changes
                      })}
                    >
                      {categories.map(category => (
                        <MenuItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!editForm.category}>
                    <InputLabel>Sub Category</InputLabel>
                    <Select
                      value={editForm.subCategory}
                      label="Sub Category"
                      onChange={(e) => setEditForm({ ...editForm, subCategory: e.target.value })}
                    >
                      {editForm.category && subCategories[editForm.category].map(subCategory => (
                        <MenuItem key={subCategory} value={subCategory}>
                          {subCategory.charAt(0).toUpperCase() + subCategory.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Price"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    InputProps={{
                      startAdornment: '₹'
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Discount Price"
                    value={editForm.discountPrice}
                    onChange={(e) => setEditForm({ ...editForm, discountPrice: e.target.value })}
                    InputProps={{
                      startAdornment: '₹'
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Stock"
                    value={editForm.stock}
                    onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Sizes</InputLabel>
                    <Select
                      multiple
                      value={editForm.sizes}
                      label="Sizes"
                      onChange={(e) => setEditForm({ ...editForm, sizes: e.target.value })}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} />
                          ))}
                        </Box>
                      )}
                    >
                      {availableSizes.map(size => (
                        <MenuItem key={size} value={size}>
                          {size}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Current Images
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    {editForm.images.map((image, index) => (
                      <Box key={index} sx={{ position: 'relative' }}>
                        <Box
                          sx={{
                            position: 'relative',
                            width: 100,
                            height: 100,
                            borderRadius: 1,
                            overflow: 'hidden',
                            border: '1px solid',
                            borderColor: 'divider'
                          }}
                        >
                          <img
                            src={image}
                            alt={`Product ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: editForm.imageFit,
                              objectPosition: editForm.imagePosition,
                              transform: `scale(${editForm.imageScale})`,
                              transition: 'all 0.3s ease'
                            }}
                          />
                        </Box>
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            bgcolor: 'background.paper'
                          }}
                          onClick={() => handleRemoveExistingImage(index)}
                        >
                          <RemoveImageIcon />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>

                  {/* Image Position Adjustment */}
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Image Position</InputLabel>
                    <Select
                      value={editForm.imagePosition}
                      label="Image Position"
                      onChange={(e) => handleImagePositionChange(e.target.value)}
                    >
                      {positions.map(position => (
                        <MenuItem key={position} value={position}>
                          {position.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Image Fit</InputLabel>
                        <Select
                          value={editForm.imageFit}
                          label="Image Fit"
                          onChange={(e) => setEditForm(prev => ({
                            ...prev,
                            imageFit: e.target.value
                          }))}
                        >
                          <MenuItem value="cover">Cover</MenuItem>
                          <MenuItem value="contain">Contain</MenuItem>
                          <MenuItem value="fill">Fill</MenuItem>
                          <MenuItem value="scale-down">Scale Down</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography gutterBottom>Image Scale: {editForm.imageScale.toFixed(1)}x</Typography>
                      <Box sx={{ px: 1 }}>
                        <input
                          type="range"
                          min="0.1"
                          max="2"
                          step="0.1"
                          value={editForm.imageScale}
                          onChange={(e) => setEditForm(prev => ({
                            ...prev,
                            imageScale: parseFloat(e.target.value)
                          }))}
                          style={{ width: '100%' }}
                        />
                      </Box>
                    </Grid>
                  </Grid>

                  <Typography variant="caption" sx={{ display: 'block', mb: 2, color: 'text.secondary' }}>
                    Adjust image position, fit, and scale to control how products appear in the shop. 
                    Use these controls to ensure your products are displayed optimally.
                  </Typography>

                  <Typography variant="subtitle1" gutterBottom>
                    New Images
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    {editForm.newImages.map((image, index) => (
                      <Box key={index} sx={{ position: 'relative' }}>
                        <img
                          src={image.preview}
                          alt={`New ${index + 1}`}
                          style={{
                            width: 100,
                            height: 100,
                            objectFit: 'cover',
                            borderRadius: 4
                          }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            bgcolor: 'background.paper'
                          }}
                          onClick={() => handleRemoveNewImage(index)}
                        >
                          <RemoveImageIcon />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>

                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<UploadIcon />}
                    disabled={editForm.images.length + editForm.newImages.length >= 6}
                  >
                    Upload Images
                    <input
                      type="file"
                      hidden
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </Button>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Maximum 6 images allowed. {6 - (editForm.images.length + editForm.newImages.length)} slots remaining.
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialog(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit} variant="contained">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default React.memo(ManageProducts); 