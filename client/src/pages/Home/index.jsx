import React, { useState, useEffect } from 'react';
import { Box, Skeleton, Grid, Container } from '@mui/material';
import HeroSection from './HeroSection';
import FeaturedProducts from './FeaturedProducts';
import axios from '../../utils/axios';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState({
    men: [],
    women: [],
    accessories: []
  });
  const [loading, setLoading] = useState(true);
  const [imageLoadErrors, setImageLoadErrors] = useState({});

  // Preload images function with error tracking
  const preloadImages = async (products) => {
    const imagePromises = [];
    const errors = {};
    
    Object.values(products).flat().forEach(product => {
      if (product.images && product.images.length > 0) {
        product.images.forEach(imgSrc => {
          const img = new Image();
          const promise = new Promise((resolve) => {
            img.onload = () => {
              console.log('Image loaded successfully:', imgSrc);
              resolve(true);
            };
            img.onerror = () => {
              console.error('Image failed to load:', imgSrc);
              errors[product._id] = true;
              resolve(false);
            };
            img.src = imgSrc;
          });
          imagePromises.push(promise);
        });
      }
    });

    await Promise.all(imagePromises);
    setImageLoadErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        console.log('Fetching featured products...');
        const response = await axios.get('/products/featured');
        console.log('Raw featured products response:', response.data);
        
        if (response.data.success && Array.isArray(response.data.data)) {
          const productsByCategory = {
            men: [],
            women: [],
            accessories: []
          };
          
          response.data.data.forEach(item => {
            if (item.category && Array.isArray(item.products)) {
              productsByCategory[item.category] = item.products
                .filter(product => 
                  product && 
                  product._id && 
                  product.name && 
                  product.images && 
                  product.images.length > 0 &&
                  product.images.every(img => typeof img === 'string' && img.trim() !== '')
                )
                .map(product => ({
                  ...product,
                  imagePosition: product.imagePosition || 'center',
                  imageScale: product.imageScale || 1,
                  imageFit: product.imageFit || 'cover'
                }));
            }
          });
          
          // Preload images before setting state
          const success = await preloadImages(productsByCategory);
          if (success) {
            console.log('All images preloaded successfully');
          } else {
            console.warn('Some images failed to preload');
          }
          
          console.log('Organized products by category with image settings:', productsByCategory);
          setFeaturedProducts(productsByCategory);
        } else {
          console.error('Invalid response format:', response.data);
        }
      } catch (error) {
        console.error('Error fetching featured products:', error.response || error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Loading skeleton
  const LoadingSkeleton = () => (
    <Container maxWidth="xl">
      {['men', 'women', 'accessories'].map((category) => (
        <Box key={category} sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Skeleton variant="text" width={200} height={40} />
            <Skeleton variant="text" width={100} height={40} />
          </Box>
          <Grid container spacing={3}>
            {[1, 2, 3].map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item}>
                <Skeleton variant="rectangular" height={280} />
                <Skeleton variant="text" sx={{ mt: 1 }} />
                <Skeleton variant="text" width="60%" />
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Container>
  );

  return (
    <Box>
      <HeroSection />
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <FeaturedProducts 
          products={featuredProducts} 
          imageLoadErrors={imageLoadErrors}
        />
      )}
    </Box>
  );
};

export default Home; 