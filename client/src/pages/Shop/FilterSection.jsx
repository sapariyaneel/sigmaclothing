import React, { useCallback } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  Slider,
  Radio,
  RadioGroup,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { motion, AnimatePresence } from 'framer-motion';

const FilterSection = ({
  filters,
  setFilters,
  categories = ['men', 'women', 'accessories'],
  sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  priceRange = [0, 100000],
}) => {
  const handlePriceChange = useCallback((event, newValue) => {
    if (event) {
      event.preventDefault();
    }
    setFilters(prev => ({ ...prev, price: newValue }));
  }, [setFilters]);

  const handleCategoryChange = useCallback((event) => {
    setFilters(prev => ({ 
      ...prev, 
      category: event.target.value,
      // Clear sizes when switching to accessories
      sizes: event.target.value === 'accessories' ? [] : prev.sizes
    }));
  }, [setFilters]);

  const handleSizeChange = useCallback((size) => {
    setFilters(prev => {
      const newSizes = prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size];
      return {
        ...prev,
        sizes: newSizes
      };
    });
  }, [setFilters]);

  return (
    <Box sx={{ width: '100%', maxWidth: 280 }}>
      <AnimatePresence mode="wait">
        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Category</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <RadioGroup
                value={filters.category}
                onChange={handleCategoryChange}
              >
                <FormControlLabel
                  value=""
                  control={<Radio />}
                  label="All"
                />
                {categories.map((category) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FormControlLabel
                      value={category}
                      control={<Radio />}
                      label={category.charAt(0).toUpperCase() + category.slice(1)}
                    />
                  </motion.div>
                ))}
              </RadioGroup>
            </AccordionDetails>
          </Accordion>
        </motion.div>

        {/* Price Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2, delay: 0.1 }}
        >
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Price Range</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={filters.price}
                  onChange={handlePriceChange}
                  onChangeCommitted={handlePriceChange}
                  valueLabelDisplay="auto"
                  min={priceRange[0]}
                  max={priceRange[1]}
                  step={1000}
                  valueLabelFormat={(value) => `₹${value.toLocaleString()}`}
                  sx={{
                    '& .MuiSlider-thumb': {
                      height: 24,
                      width: 24,
                      '&:hover, &.Mui-focusVisible': {
                        boxShadow: '0 0 0 8px rgba(0, 0, 0, 0.16)'
                      }
                    }
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    ₹{filters.price[0].toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ₹{filters.price[1].toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        </motion.div>

        {/* Size Filter */}
        <AnimatePresence>
          {(!filters.category || filters.category !== 'accessories') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, delay: 0.2 }}
            >
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Size</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {sizes.map((size) => (
                      <motion.div
                        key={size}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={filters.sizes.includes(size)}
                              onChange={() => handleSizeChange(size)}
                            />
                          }
                          label={size}
                        />
                      </motion.div>
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatePresence>
    </Box>
  );
};

export default React.memo(FilterSection); 