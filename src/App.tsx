import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { supabase } from './lib/supabase';
import { useCartStore } from './store/useCartStore';
import { useAuth } from './hooks/useAuth';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Creator = lazy(() => import('./pages/Creator'));

// Admin Pages
const PendingCreators = lazy(() => import('./pages/admin/PendingCreators'));
const PendingProducts = lazy(() => import('./pages/admin/PendingProducts'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));

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
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/creator/:id" element={<Creator />} />

            {/* Admin Routes */}
            <Route path="/admin/pending-creators" element={<PendingCreators />} />
            <Route path="/admin/pending-products" element={<PendingProducts />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
};

export default App;


