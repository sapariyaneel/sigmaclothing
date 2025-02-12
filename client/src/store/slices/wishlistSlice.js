import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axios';

// Helper function to clean Mongoose documents
const cleanMongooseDoc = (doc) => {
  if (!doc) return null;
  
  // If it's a plain object with _id, return it as is
  if (doc._id && typeof doc._id === 'string') {
    return doc;
  }
  
  // If it's a Mongoose document with _doc property
  if (doc._doc) {
    const cleanedDoc = { ...doc._doc };
    if (doc._id) {
      cleanedDoc._id = doc._id.toString();
    }
    return cleanedDoc;
  }

  // If it's a product object without _doc (might be already cleaned)
  if (doc.product) {
    return {
      _id: doc.product._id?.toString() || doc._id?.toString(),
      ...doc.product,
    };
  }

  console.warn('Invalid document structure:', doc);
  return null;
};

// Async thunks
export const getWishlist = createAsyncThunk(
  'wishlist/getWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/wishlist');
      console.log('Wishlist API Response:', response.data);
      
      if (!response.data.data || !Array.isArray(response.data.data)) {
        console.warn('Invalid wishlist data format:', response.data);
        return { data: [] };
      }

      // Clean the Mongoose documents
      const cleanedData = response.data.data
        .map(item => cleanMongooseDoc(item))
        .filter(Boolean);
      
      console.log('Cleaned wishlist data:', cleanedData);
      
      return {
        ...response.data,
        data: cleanedData
      };
    } catch (error) {
      console.error('Wishlist fetch error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wishlist');
    }
  }
);

export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (productId, { rejectWithValue, getState }) => {
    try {
      const currentState = getState();
      const isAlreadyInWishlist = currentState.wishlist.items.some(item => item._id === productId);
      
      if (isAlreadyInWishlist) {
        return {
          success: true,
          message: 'Product is already in your wishlist',
          data: currentState.wishlist.items
        };
      }

      const response = await axios.post('/wishlist/add', { productId });
      
      if (!response.data.data || !Array.isArray(response.data.data)) {
        console.warn('Invalid add to wishlist response format:', response.data);
        return {
          success: true,
          message: 'Added to wishlist successfully',
          data: currentState.wishlist.items
        };
      }

      // Clean the Mongoose documents
      const cleanedData = response.data.data.map(cleanMongooseDoc).filter(Boolean);
      
      return {
        ...response.data,
        data: cleanedData,
        message: 'Added to wishlist successfully'
      };
    } catch (error) {
      console.error('Add to wishlist error:', error);
      if (error.response?.status === 400 && error.response?.data?.message === 'Product already in wishlist') {
        const currentState = getState();
        return {
          success: true,
          message: 'Product is already in your wishlist',
          data: currentState.wishlist.items
        };
      }
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to add to wishlist'
      });
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/wishlist/${productId}`);
      
      // Clean the Mongoose documents if they exist
      const cleanedData = Array.isArray(response.data.data) 
        ? response.data.data.map(cleanMongooseDoc).filter(Boolean)
        : [];
      
      return {
        ...response.data,
        data: cleanedData
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from wishlist');
    }
  }
);

export const clearWishlist = createAsyncThunk(
  'wishlist/clearWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.delete('/wishlist');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear wishlist');
    }
  }
);

export const moveToCart = createAsyncThunk(
  'wishlist/moveToCart',
  async ({ productId, quantity, size, color }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/wishlist/move-to-cart', { 
        productId, 
        quantity, 
        size, 
        color 
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to move item to cart');
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Wishlist
      .addCase(getWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload.data) ? action.payload.data : [];
      })
      .addCase(getWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.items = [];
      })

      // Add to Wishlist
      .addCase(addToWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload.data) ? action.payload.data : [];
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Remove from Wishlist
      .addCase(removeFromWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data || [];
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Clear Wishlist
      .addCase(clearWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearWishlist.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
      })
      .addCase(clearWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Move to Cart
      .addCase(moveToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(moveToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data?.wishlist || [];
      })
      .addCase(moveToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = wishlistSlice.actions;
export default wishlistSlice.reducer; 