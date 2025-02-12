import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import HeroSection from './HeroSection';
import FeaturedProducts from './FeaturedProducts';
import axios from '../../utils/axios';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState({
    men: [],
    women: [],
    accessories: []
  });

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        console.log('Fetching featured products...');
        const response = await axios.get('/products/featured');
        console.log('Raw featured products response:', response.data);
        
        if (response.data.success && Array.isArray(response.data.data)) {
          // Organize products by category
          const productsByCategory = {
            men: [],
            women: [],
            accessories: []
          };
          
          // Map the featured products to their categories
          response.data.data.forEach(item => {
            if (item.category && Array.isArray(item.products)) {
              // Filter out null products and ensure required fields exist
              // Also preserve image display settings
              productsByCategory[item.category] = item.products.filter(product => 
                product && product._id && product.name && product.images && product.images.length > 0
              ).map(product => ({
                ...product,
                imagePosition: product.imagePosition || 'center',
                imageScale: product.imageScale || 1,
                imageFit: product.imageFit || 'cover'
              }));
            }
          });
          
          console.log('Organized products by category with image settings:', productsByCategory);
          setFeaturedProducts(productsByCategory);
        } else {
          console.error('Invalid response format:', response.data);
        }
      } catch (error) {
        console.error('Error fetching featured products:', error.response || error);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <Box>
      <HeroSection />
      <FeaturedProducts products={featuredProducts} />
    </Box>
  );
};

export default Home; 