import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';

const HeroSection = () => {
  const navigate = useNavigate();
  const [bannerUrl, setBannerUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const preloadImage = (url) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = resolve;
        img.onerror = reject;
      });
    };

    const fetchBannerImage = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get('/banner');
        
        if (response.data.success) {
          // Preload the image before showing it
          await preloadImage(response.data.data);
          setBannerUrl(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching banner image:', error);
        setError('Failed to load banner image');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBannerImage();
  }, []);

  return (
    <Box
      sx={{
        height: '90vh',
        width: '100vw',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(to right, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2))`,
          zIndex: 1,
        },
      }}
    >
      {/* Background Image with loading state */}
      {isLoading ? (
        <Skeleton 
          variant="rectangular" 
          width="100%" 
          height="100%" 
          sx={{ position: 'absolute', top: 0, left: 0 }} 
        />
      ) : (
        <Box
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${bannerUrl || '/images/hero-banner.jpg'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.9)',
          }}
        />
      )}

      <Container 
        maxWidth={false}
        disableGutters
        sx={{ 
          position: 'relative',
          zIndex: 2,
          color: 'white',
          px: { xs: 2, sm: 3, md: 4 }
        }}
      >
        <Box 
          sx={{ 
            maxWidth: '600px',
            background: 'rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(8px)',
            p: 4,
            borderRadius: 2,
            ml: { xs: 2, md: 6, lg: 10 }
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography
              variant="h1"
              sx={{
                fontWeight: 700,
                mb: 2,
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
              }}
            >
              Elevate Your Style
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Typography
              variant="h4"
              sx={{
                fontSize: { xs: '1.2rem', md: '1.5rem' },
                fontWeight: 400,
                mb: 4,
                opacity: 0.9,
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
              }}
            >
              Discover our curated collection of modern fashion essentials
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/shop')}
              sx={{
                bgcolor: 'white',
                color: 'black',
                fontSize: '1.1rem',
                py: 1.5,
                px: 4,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 24px rgba(0, 0, 0, 0.3)',
                  bgcolor: 'white'
                }
              }}
            >
              Shop Now
            </Button>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection; 