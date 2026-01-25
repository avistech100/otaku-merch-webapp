import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaBars, FaTimes, FaSearch, FaUser } from 'react-icons/fa';
import { useCartStore } from '../../store/useCartStore';

const Navbar: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const totalItems = useCartStore((state) => state.getTotalItems());

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
                    <Link to="/creator/c1" className="font-bold text-primary-dark-gray hover:text-accent-crypto transition-all duration-300">CREATORS</Link>
                </div>

                {/* Search Bar - Desktop */}
                <div className="hidden md:block relative w-[300px]">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-dark-gray/50" size={16} />
                    <input
                        type="text"
                        placeholder="Search Web3 & Anime merch..."
                        className="w-full h-10 pl-10 pr-10 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-black transition-all text-sm"
                    />
                </div>

                {/* Icons */}
                <div className="flex items-center gap-4 lg:gap-6 text-primary-black">
                    <button className="md:hidden hover:text-accent-anime transition-all duration-300">
                        <FaSearch size={20} />
                    </button>
                    <Link to="/cart" className="relative hover:text-accent-anime transition-all duration-300">
                        <FaShoppingCart size={22} />
                        {totalItems > 0 && (
                            <span className="absolute -top-2 -right-2 bg-accent-anime text-primary-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                {totalItems}
                            </span>
                        )}
                    </Link>
                    <button className="hidden md:block hover:text-accent-anime transition-all duration-300">
                        <FaUser size={20} />
                    </button>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden hover:text-accent-anime transition-all duration-300"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Search Bar Overlay (Always visible or toggleable) */}
            <div className="md:hidden px-4 pb-4">
                <div className="relative w-full">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-dark-gray/50" size={14} />
                    <input
                        type="text"
                        placeholder="Search merch..."
                        className="w-full h-9 pl-9 pr-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-black transition-all text-xs"
                    />
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-primary-white border-b border-bg-light p-6 flex flex-col gap-6 shadow-xl animate-fadeIn z-50">
                    <Link to="/products" onClick={() => setIsMenuOpen(false)} className="text-xl font-bold text-primary-black">SHOP ALL</Link>
                    <Link to="/products?category=Crypto Brands" onClick={() => setIsMenuOpen(false)} className="text-xl font-bold text-primary-black">CRYPTO BRANDS</Link>
                    <Link to="/products?category=Anime Series" onClick={() => setIsMenuOpen(false)} className="text-xl font-bold text-primary-black">ANIME SERIES</Link>
                    <Link to="/creator/c1" onClick={() => setIsMenuOpen(false)} className="text-xl font-bold text-primary-black">CREATORS</Link>
                    <hr className="border-bg-light" />
                    <div className="flex items-center gap-4 text-primary-black">
                        <FaUser />
                        <span className="font-bold">MY ACCOUNT</span>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
