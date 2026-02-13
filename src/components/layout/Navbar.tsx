import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaBars, FaTimes, FaSearch, FaUser, FaSignOutAlt, FaBell } from 'react-icons/fa';
import { useCartStore } from '../../store/useCartStore';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import AuthModal from '../auth/AuthModal';

const Navbar: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const { user, signOut } = useAuth();
    const { profile } = useProfile();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchTerm.length > 2) {
                const { data } = await supabase
                    .from('products')
                    .select('id, title, image_url, price, product_images(src)')
                    .ilike('title', `%${searchTerm}%`)
                    .eq('status', 'approved')
                    .limit(5);

                if (data) {
                    setSearchResults(data);
                    setShowResults(true);
                }
            } else {
                setSearchResults([]);
                setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const totalItems = useCartStore((state) => state.getTotalItems());

    useEffect(() => {
        if (!user) return;

        // Fetch initial notifications
        const fetchNotifications = async () => {
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .eq('read', false)
                .order('created_at', { ascending: false });
            if (data) setNotifications(data);
        };

        fetchNotifications();

        // Subscribe to NEW notifications
        const channel = supabase
            .channel(`notifications-${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    console.log('New notification:', payload);
                    setNotifications(current => [payload.new, ...current]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const handleSignOut = async () => {
        await signOut();
    };

    return (
        <nav className="fixed top-0 left-0 w-full bg-primary-white z-50 border-b border-bg-light shadow-sm">
            <div className="layout-container h-20 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="text-2xl font-black tracking-tighter flex items-center gap-2 text-primary-black">
                    OTAKU <span className="text-accent-anime">MERCH</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    <Link to="/products" className="font-bold text-primary-dark-gray hover:text-accent-anime transition-all duration-300">SHOP ALL</Link>
                    <Link to="/products?category=Crypto Brands" className="font-bold text-primary-dark-gray hover:text-accent-crypto transition-all duration-300">CRYPTO</Link>
                    <Link to="/products?category=Anime Series" className="font-bold text-primary-dark-gray hover:text-accent-anime transition-all duration-300">ANIME</Link>
                    <Link to="/products" className="font-bold text-primary-dark-gray hover:text-accent-crypto transition-all duration-300">CREATORS</Link>
                </div>

                {/* Search Bar - Desktop */}
                <div className="hidden md:block relative w-[300px]">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-dark-gray/50" size={16} />
                    <input
                        type="text"
                        placeholder="Search Web3 & Anime merch..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-10 pl-10 pr-10 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-black transition-all text-sm"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                window.location.href = `/products?search=${searchTerm}`;
                                setShowResults(false);
                            }
                        }}
                        onBlur={() => setTimeout(() => setShowResults(false), 200)}
                        onFocus={() => searchTerm.length > 2 && setShowResults(true)}
                    />

                    {/* Search Results Dropdown */}
                    {showResults && searchResults.length > 0 && (
                        <div className="absolute top-12 left-0 w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fadeIn">
                            {searchResults.map(product => (
                                <Link
                                    key={product.id}
                                    to={`/product/${product.id}`}
                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setShowResults(false);
                                    }}
                                >
                                    <img
                                        src={product.image_url || product.product_images?.[0]?.src || 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=100'}
                                        alt={product.title}
                                        className="w-10 h-10 rounded-md object-cover bg-gray-100"
                                    />
                                    <div>
                                        <div className="text-sm font-bold text-primary-black line-clamp-1">{product.title}</div>
                                        <div className="text-xs text-primary-dark-gray/60">${product.price}</div>
                                    </div>
                                </Link>
                            ))}
                            <div className="p-2 bg-gray-50 text-center">
                                <Link
                                    to={`/products?search=${searchTerm}`}
                                    className="text-[10px] font-black uppercase tracking-widest text-accent-anime hover:underline"
                                    onClick={() => setShowResults(false)}
                                >
                                    View all results
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Icons */}
                <div className="flex items-center gap-4 lg:gap-6 text-primary-black">
                    <Link to="/cart" className="relative hover:text-accent-anime transition-all duration-300">
                        <FaShoppingCart size={22} />
                        {totalItems > 0 && (
                            <span className="absolute -top-2 -right-2 bg-accent-anime text-primary-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                {totalItems}
                            </span>
                        )}
                    </Link>

                    {user && (
                        <div className="relative group">
                            <button className="hover:text-accent-anime transition-all duration-300 pt-1">
                                <FaBell size={20} />
                                {notifications.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-accent-anime w-2 h-2 rounded-full ring-2 ring-primary-white"></span>
                                )}
                            </button>
                            {/* Notification Dropdown */}
                            <div className="absolute right-0 top-full mt-4 w-64 bg-primary-white border border-bg-light rounded-2xl shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 p-4">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary-dark-gray/40 mb-3">Recent Alerts</h4>
                                <div className="space-y-3">
                                    {notifications.length === 0 ? (
                                        <p className="text-xs font-medium text-primary-dark-gray/40 italic">No new alerts</p>
                                    ) : (
                                        notifications.slice(0, 3).map((n: any) => (
                                            <div key={n.id} className="text-xs font-bold text-primary-black pb-2 border-b border-bg-light last:border-0">
                                                <p className="line-clamp-2">{n.message}</p>
                                                <span className="text-[8px] opacity-30 uppercase">{new Date(n.created_at).toLocaleTimeString()}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                                {notifications.length > 0 && (
                                    <Link to="/admin/analytics" className="block text-center text-[10px] font-black text-accent-crypto mt-4 uppercase tracking-widest hover:underline">View Intelligence</Link>
                                )}
                            </div>
                        </div>
                    )}

                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link to="/profile" className="w-8 h-8 rounded-full overflow-hidden border border-bg-light hover:border-accent-anime transition-all duration-300 bg-bg-light">
                                <img
                                    src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            </Link>
                            <button onClick={handleSignOut} className="text-primary-dark-gray/60 hover:text-accent-anime transition-all">
                                <FaSignOutAlt size={18} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAuthModalOpen(true)}
                            className="hidden md:flex items-center gap-2 font-black text-xs uppercase tracking-widest hover:text-accent-anime transition-all"
                        >
                            <FaUser size={18} /> LOGIN
                        </button>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden hover:text-accent-anime transition-all duration-300"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-primary-white border-b border-bg-light p-6 flex flex-col gap-6 shadow-xl animate-fadeIn z-50">
                    <div className="relative w-full">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-dark-gray/50" size={16} />
                        <input
                            type="text"
                            placeholder="Search merch..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-12 pl-10 pr-4 rounded-xl border-2 border-bg-light focus:outline-none focus:border-primary-black transition-all text-sm font-bold text-primary-black"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    navigate(`/products?search=${searchTerm}`);
                                    setIsMenuOpen(false);
                                }
                            }}
                        />
                    </div>
                    <Link to="/products" onClick={() => setIsMenuOpen(false)} className="text-xl font-bold text-primary-black">SHOP ALL</Link>
                    <Link to="/products?category=Crypto Brands" onClick={() => setIsMenuOpen(false)} className="text-xl font-bold text-primary-black">CRYPTO BRANDS</Link>
                    <Link to="/products?category=Anime Series" onClick={() => setIsMenuOpen(false)} className="text-xl font-bold text-primary-black">ANIME SERIES</Link>
                    <Link to="/products" onClick={() => setIsMenuOpen(false)} className="text-xl font-bold text-primary-black">CREATORS</Link>
                    <hr className="border-bg-light" />
                    {!user ? (
                        <button
                            onClick={() => { setIsAuthModalOpen(true); setIsMenuOpen(false); }}
                            className="flex items-center gap-4 text-primary-black font-black uppercase tracking-widest"
                        >
                            <FaUser /> LOGIN / SIGNUP
                        </button>
                    ) : (
                        <button
                            onClick={() => { handleSignOut(); setIsMenuOpen(false); }}
                            className="flex items-center gap-4 text-primary-black font-black uppercase tracking-widest"
                        >
                            <FaSignOutAlt /> LOGOUT
                        </button>
                    )}
                </div>
            )}

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </nav>
    );
};

export default Navbar;


