import React from 'react';
import { FaTwitter, FaInstagram, FaDiscord } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <footer className="relative bg-[#111111] text-white pt-20 pb-10 border-t border-zinc-800 overflow-hidden">
            {/* Subtle radial gradient background pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #3B82F6 1px, transparent 0)', backgroundSize: '40px 40px' }}>
            </div>

            <div className="layout-container relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand & Social Section */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <Link to="/" className="text-2xl font-black mb-6 tracking-tighter flex items-center gap-2">
                            OTAKU <span className="text-accent-anime">MERCH</span>
                        </Link>
                        <p className="text-zinc-400 mb-8 max-w-xs leading-relaxed">
                            Premium Web3 and Anime-themed clothing for the decentralized generation. Designed by artists, worn by degens.
                        </p>
                        <div className="flex gap-5">
                            <a href="#" className="text-zinc-400 hover:text-accent-anime transition-all duration-300 hover:scale-110">
                                <FaTwitter size={24} />
                            </a>
                            <a href="#" className="text-zinc-400 hover:text-accent-anime transition-all duration-300 hover:scale-110">
                                <FaInstagram size={24} />
                            </a>
                            <a href="#" className="text-zinc-400 hover:text-accent-anime transition-all duration-300 hover:scale-110">
                                <FaDiscord size={24} />
                            </a>
                        </div>
                    </div>

                    {/* SHOP Column */}
                    <div className="text-center md:text-left">
                        <h3 className="font-black text-sm uppercase tracking-widest text-white mb-8">SHOP</h3>
                        <ul className="flex flex-col gap-4 text-zinc-400">
                            <li><Link to="/products" className="hover:text-accent-anime hover:underline transition-all duration-300">All Products</Link></li>
                            <li><Link to="/products?category=New" className="hover:text-accent-anime hover:underline transition-all duration-300">New Arrivals</Link></li>
                            <li><Link to="/products?category=Best" className="hover:text-accent-anime hover:underline transition-all duration-300">Best Sellers</Link></li>
                            <li><Link to="/products?category=Collections" className="hover:text-accent-anime hover:underline transition-all duration-300">Collections</Link></li>
                        </ul>
                    </div>

                    {/* HELP Column */}
                    <div className="text-center md:text-left">
                        <h3 className="font-black text-sm uppercase tracking-widest text-white mb-8">HELP</h3>
                        <ul className="flex flex-col gap-4 text-zinc-400">
                            <li><a href="#" className="hover:text-accent-anime hover:underline transition-all duration-300">Help Center</a></li>
                            <li><a href="#" className="hover:text-accent-anime hover:underline transition-all duration-300">Shipping Details</a></li>
                            <li><a href="#" className="hover:text-accent-anime hover:underline transition-all duration-300">Return Policy</a></li>
                            <li><a href="#" className="hover:text-accent-anime hover:underline transition-all duration-300">Size Guide</a></li>
                        </ul>
                    </div>

                    {/* NEWSLETTER Column */}
                    <div className="text-center md:text-left">
                        <h3 className="font-black text-sm uppercase tracking-widest text-white mb-8">NEWSLETTER</h3>
                        <p className="text-zinc-400 mb-6 leading-relaxed">Join the whitelist for upcoming drops and exclusive releases.</p>
                        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="bg-[#1a1a1a] border border-zinc-800 rounded-lg px-4 py-3 flex-1 focus:outline-none focus:border-accent-anime text-sm transition-all min-w-0"
                            />
                            <button className="bg-accent-anime text-white font-bold px-6 py-3 rounded-lg hover:brightness-110 transition-all duration-300 shadow-lg shadow-red-900/20 whitespace-nowrap shrink-0">
                                SUBSCRIBE
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="pt-10 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-6 text-zinc-500 text-xs">
                    <p className="order-2 md:order-1">© 2026 Otaku Merch. All rights reserved.</p>
                    <div className="flex gap-8 order-1 md:order-2">
                        <a href="#" className="hover:text-white transition-all duration-300">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-all duration-300">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
