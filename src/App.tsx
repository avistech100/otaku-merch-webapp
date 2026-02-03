import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { supabase } from './lib/supabase';
import { useCartStore } from './store/useCartStore';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Creator = lazy(() => import('./pages/Creator'));
const Profile = lazy(() => import('./pages/Profile'));
const Feed = lazy(() => import('./pages/Feed'));
const Inbox = lazy(() => import('./pages/Inbox'));

// Creator Dashboard Pages
const CreatorDashboardLayout = lazy(() => import('./components/creator/CreatorDashboardLayout'));
const CreatorDashboard = lazy(() => import('./pages/creator/Dashboard'));
const CreatorProducts = lazy(() => import('./pages/creator/Products'));
const ProductEditor = lazy(() => import('./pages/creator/ProductEditor'));
const CreatorOrders = lazy(() => import('./pages/creator/Orders'));
const OrderDetails = lazy(() => import('./pages/creator/OrderDetails'));
const CreatorInventory = lazy(() => import('./pages/creator/Inventory'));
const CreatorAnalytics = lazy(() => import('./pages/creator/Analytics'));
const CreatorEarnings = lazy(() => import('./pages/creator/Earnings'));
const CreatorReviews = lazy(() => import('./pages/creator/CreatorReviews'));
const CreatorMessages = lazy(() => import('./pages/creator/Messages'));
const CreatorSettings = lazy(() => import('./pages/creator/Settings'));
const CreatorNotifications = lazy(() => import('./pages/creator/Notifications'));

// Admin Pages
const AdminDashboardLayout = lazy(() => import('./components/admin/AdminDashboardLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const PendingCreators = lazy(() => import('./pages/admin/PendingCreators'));
const PendingProducts = lazy(() => import('./pages/admin/PendingProducts'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const AdminPayouts = lazy(() => import('./pages/admin/Payouts'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const AdminContent = lazy(() => import('./pages/admin/Content'));

const App: React.FC = () => {
  const { loading: authLoading, user } = useAuth();
  const syncWithSupabase = useCartStore((state) => state.syncWithSupabase);

  useEffect(() => {
    // Initial sync
    const initializeApp = async () => {
      try {
        console.log('[App] Starting cart sync...');
        await syncWithSupabase();
        console.log('[App] Cart sync complete');
      } catch (error) {
        console.error('[App] Error during cart sync:', error);
        // Don't block app initialization on cart sync errors
      }
    };

    initializeApp();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, _session) => {
      console.log('[App] Auth state changed:', event);
      if (event === 'SIGNED_IN') {
        syncWithSupabase().catch(err => console.error('[App] Cart sync error after sign in:', err));
      }
    });

    return () => subscription.unsubscribe();
  }, [syncWithSupabase]);

  console.log('[App] Component rendering, authLoading:', authLoading, 'user:', user);

  if (authLoading) {
    console.log('[App] Showing loading screen');
    return (
      <div style={{ height: '100vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
        <div style={{ fontSize: '3rem', fontWeight: '900', color: '#000' }}>
          OTAKU <span style={{ color: '#EF4444', marginLeft: '1rem' }}>INITIALIZING...</span>
        </div>
      </div>
    );
  }

  console.log('[App] Rendering main app');
  return (
    <Router>
      <Layout>
        <Suspense fallback={
          <div className="h-screen w-full flex items-center justify-center font-black text-4xl animate-pulse">
            OTAKU <span className="text-accent ml-2">LOADING...</span>
          </div>
        }>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/creator/:id" element={<Creator />} />

            <Route path="/profile" element={<ProtectedRoute allowedRoles={['user', 'creator', 'admin']} />}>
              <Route index element={<Profile />} />
            </Route>

            <Route path="/feed" element={<ProtectedRoute allowedRoles={['user', 'creator', 'admin']} />}>
              <Route index element={<Feed />} />
            </Route>

            <Route path="/inbox" element={<ProtectedRoute allowedRoles={['user', 'creator', 'admin']} />}>
              <Route index element={<Inbox />} />
            </Route>

            {/* Creator Dashboard Routes */}
            <Route
              path="/creator"
              element={
                <ProtectedRoute allowedRoles={['creator', 'admin']} />
              }
            >
              <Route element={<CreatorDashboardLayout />}>
                <Route path="dashboard" element={<CreatorDashboard />} />
                <Route path="products" element={<CreatorProducts />} />
                <Route path="products/new" element={<ProductEditor />} />
                <Route path="products/edit/:id" element={<ProductEditor />} />
                <Route path="orders" element={<CreatorOrders />} />
                <Route path="orders/:id" element={<OrderDetails />} />
                <Route path="inventory" element={<CreatorInventory />} />
                <Route path="analytics" element={<CreatorAnalytics />} />
                <Route path="earnings" element={<CreatorEarnings />} />
                <Route path="reviews" element={<CreatorReviews />} />
                <Route path="messages" element={<CreatorMessages />} />
                <Route path="settings" element={<CreatorSettings />} />
                <Route path="notifications" element={<CreatorNotifications />} />
                <Route index element={<Navigate to="dashboard" replace />} />
              </Route>
            </Route>

            {/* Admin Dashboard Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']} />
              }
            >
              <Route element={<AdminDashboardLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="pending-creators" element={<PendingCreators />} />
                <Route path="pending-products" element={<PendingProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="payouts" element={<AdminPayouts />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="content" element={<AdminContent />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route index element={<Navigate to="dashboard" replace />} />
              </Route>
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
};

export default App;


