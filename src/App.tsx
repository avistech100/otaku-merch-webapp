import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Creator = lazy(() => import('./pages/Creator'));

const App: React.FC = () => {
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
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
};

export default App;
