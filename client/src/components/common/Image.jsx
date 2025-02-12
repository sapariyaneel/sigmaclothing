import React from 'react';
import { Box } from '@mui/material';

const Image = ({ 
  src, 
  alt, 
  width, 
  height, 
  sx = {}, 
  loading = 'lazy',
  ...props 
}) => {
  const [error, setError] = React.useState(false);
  const placeholderSrc = '/placeholder.jpg';

  const handleError = () => {
    if (!error) {
      setError(true);
    }
  };

  return (
    <Box
      component="img"
      src={error ? placeholderSrc : src}
      alt={alt}
      onError={handleError}
      loading={loading}
      sx={{
        width: width || '100%',
        height: height || 'auto',
        objectFit: 'cover',
        ...sx
      }}
      {...props}
    />
  );
};

export default Image; 