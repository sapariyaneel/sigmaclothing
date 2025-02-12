import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AnimatePresence } from 'framer-motion';
import { theme } from './styles/theme';
import Layout from './components/layout/Layout';
import { Box, CircularProgress, Typography } from '@mui/material';
import PageTransition from './components/common/PageTransition';
import LoadingSpinner from './components/common/LoadingSpinner';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from './store/slices/authSlice';
import PrivateRoute from './components/common/PrivateRoute';
import AdminRoute from './components/common/AdminRoute';
import Notification from './components/common/Notification';

// Lazy load pages with error boundaries
const lazyLoad = (importFunc) => {
  return React.lazy(() => 
    importFunc.catch(error => {
      console.error('Error loading module:', error);
      return new Promise((resolve) => {
        resolve({
          default: () => (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="error">
                Error loading page. Please try refreshing.
              </Typography>
            </Box>
          )
        });
      });
    })
  );
};

// Lazy load pages
const Home = lazyLoad(import('./pages/Home'));
const Shop = lazyLoad(import('./pages/Shop'));
const ProductDetail = lazyLoad(import('./pages/ProductDetail'));
const About = lazyLoad(import('./pages/About'));
const Login = lazyLoad(import('./pages/Auth/Login'));
const Register = lazyLoad(import('./pages/Auth/Register'));
const ForgotPassword = lazyLoad(import('./pages/Auth/ForgotPassword'));
const ResetPassword = lazyLoad(import('./pages/Auth/ResetPassword'));
const Wishlist = lazyLoad(import('./pages/Wishlist'));
const Cart = lazyLoad(import('./pages/Cart'));
const Checkout = lazyLoad(import('./pages/Checkout'));
const Orders = lazyLoad(import('./pages/Orders'));
const OrderDetails = lazyLoad(import('./components/order/OrderDetails'));
const Profile = lazyLoad(import('./pages/Profile'));
const AdminDashboard = lazyLoad(import('./pages/Admin/Dashboard'));
const AddProduct = lazyLoad(import('./pages/Admin/AddProduct'));
const ManageProducts = lazyLoad(import('./pages/Admin/ManageProducts'));
const ManageFeatured = lazyLoad(import('./pages/Admin/ManageFeatured'));

// Temporary placeholder components until we create the actual pages
const Search = () => <div>Search Page</div>;

// Loading fallback component
const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <CircularProgress />
  </Box>
);

// AnimatedRoutes component to handle route transitions
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<LoadingFallback />}>
        <Routes location={location} key={location.pathname}>
          {/* Auth Routes */}
          <Route
            path="/login"
            element={
              <PageTransition>
                <Login />
              </PageTransition>
            }
          />
          <Route
            path="/register"
            element={
              <PageTransition>
                <Register />
              </PageTransition>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PageTransition>
                <ForgotPassword />
              </PageTransition>
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              <PageTransition>
                <ResetPassword />
              </PageTransition>
            }
          />

          {/* Main Routes with Layout */}
          <Route
            path="/"
            element={
              <PageTransition>
                <Home />
              </PageTransition>
            }
          />
          <Route
            path="/shop"
            element={
              <PageTransition>
                <Shop />
              </PageTransition>
            }
          />
          <Route
            path="/shop/:id"
            element={
              <PageTransition>
                <ProductDetail />
              </PageTransition>
            }
          />
          <Route
            path="/product/:id"
            element={
              <PageTransition>
                <ProductDetail />
              </PageTransition>
            }
          />
          <Route
            path="/about"
            element={
              <PageTransition>
                <About />
              </PageTransition>
            }
          />
          <Route
            path="/search"
            element={
              <PageTransition>
                <Search />
              </PageTransition>
            }
          />
          <Route
            path="/wishlist"
            element={
              <PageTransition>
                <Wishlist />
              </PageTransition>
            }
          />
          <Route
            path="/cart"
            element={
              <PageTransition>
                <Cart />
              </PageTransition>
            }
          />
          <Route
            path="/checkout"
            element={
              <PageTransition>
                <Checkout />
              </PageTransition>
            }
          />
          <Route
            path="/orders"
            element={
              <PageTransition>
                <PrivateRoute>
                  <Orders />
                </PrivateRoute>
              </PageTransition>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <PageTransition>
                <OrderDetails />
              </PageTransition>
            }
          />
          <Route
            path="/profile"
            element={
              <PageTransition>
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              </PageTransition>
            }
          />
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><ManageProducts /></AdminRoute>} />
          <Route path="/admin/products/add" element={<AdminRoute><AddProduct /></AdminRoute>} />
          <Route path="/admin/featured" element={<AdminRoute><ManageFeatured /></AdminRoute>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <>
      <Notification />
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Layout>
            <Box>
              <AnimatedRoutes />
            </Box>
          </Layout>
        </Router>
      </ThemeProvider>
    </>
  );
}

export default App;
