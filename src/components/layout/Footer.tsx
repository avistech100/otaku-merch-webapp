import React from 'react';
import { FaTwitter, FaInstagram, FaDiscord } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <footer className="relative bg-[#111111] text-white pt-12 pb-8 border-t border-zinc-800 overflow-hidden">
            {/* Subtle radial gradient background pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #3B82F6 1px, transparent 0)', backgroundSize: '40px 40px' }}>
            </div>

            <div className="layout-container relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
                    {/* Brand & Social Section */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <Link to="/" className="text-xl font-black mb-4 tracking-tighter flex items-center gap-2">
                            OTAKU <span className="text-accent-anime">MERCH</span>
                        </Link>
                        <p className="text-zinc-500 mb-6 max-w-xs leading-relaxed text-xs font-medium">
                            Premium Web3 and Anime-themed clothing for the decentralized generation. Designed by artists, worn by degens.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-zinc-500 hover:text-accent-anime transition-all duration-300 hover:scale-110">
                                <FaTwitter size={18} />
                            </a>
                            <a href="#" className="text-zinc-500 hover:text-accent-anime transition-all duration-300 hover:scale-110">
                                <FaInstagram size={18} />
                            </a>
                            <a href="#" className="text-zinc-500 hover:text-accent-anime transition-all duration-300 hover:scale-110">
                                <FaDiscord size={18} />
                            </a>
                        </div>
                    </div>

                    {/* SHOP Column */}
                    <div className="text-center md:text-left">
                        <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-white/40 mb-6">SHOP</h3>
                        <ul className="flex flex-col gap-3 text-zinc-400 text-xs font-bold">
                            <li><Link to="/products" className="hover:text-accent-anime transition-all duration-300">All Products</Link></li>
                            <li><Link to="/products?category=New" className="hover:text-accent-anime transition-all duration-300">New Arrivals</Link></li>
                            <li><Link to="/products?category=Best" className="hover:text-accent-anime transition-all duration-300">Best Sellers</Link></li>
                            <li><Link to="/products?category=Collections" className="hover:text-accent-anime transition-all duration-300">Collections</Link></li>
                        </ul>
                    </div>

                    {/* HELP Column */}
                    <div className="text-center md:text-left">
                        <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-white/40 mb-6">HELP</h3>
                        <ul className="flex flex-col gap-3 text-zinc-400 text-xs font-bold">
                            <li><a href="#" className="hover:text-accent-anime transition-all duration-300">Help Center</a></li>
                            <li><a href="#" className="hover:text-accent-anime transition-all duration-300">Shipping Details</a></li>
                            <li><a href="#" className="hover:text-accent-anime transition-all duration-300">Return Policy</a></li>
                            <li><a href="#" className="hover:text-accent-anime transition-all duration-300">Size Guide</a></li>
                        </ul>
                    </div>

                    {/* NEWSLETTER Column */}
                    <div className="text-center md:text-left">
                        <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-white/40 mb-6">NEWSLETTER</h3>
                        <p className="text-zinc-500 mb-4 leading-relaxed text-xs">Join the whitelist for exclusive releases.</p>
                        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-2">
                            <input
                                type="email"
                                placeholder="Email"
                                className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 flex-1 focus:outline-none focus:border-accent-anime text-xs transition-all min-w-0 font-bold"
                            />
                            <button className="bg-accent-anime text-white font-black text-[9px] px-4 py-2 rounded-lg hover:brightness-110 transition-all duration-300 shadow-lg shadow-accent-anime/20 uppercase tracking-widest whitespace-nowrap shrink-0">
                                JOIN
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="pt-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-600 font-bold text-[10px] uppercase tracking-widest">
                    <p className="order-2 md:order-1">© 2026 Otaku Merch • Digital vanguard supply</p>
                    <div className="flex gap-6 order-1 md:order-2">
                        <a href="#" className="hover:text-white transition-all duration-300">Privacy</a>
                        <a href="#" className="hover:text-white transition-all duration-300">Terms</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
