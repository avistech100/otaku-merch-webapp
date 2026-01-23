import React from 'react';
import { FaTwitter, FaInstagram, FaDiscord, FaGithub } from 'react-icons/fa';

const Footer: React.FC = () => {
    return (
        <footer className="bg-primary text-white pt-20 pb-10">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-1">
                        <h2 className="text-2xl font-black mb-6 tracking-tighter">
                            OTAKU <span className="text-accent">MERCH</span>
                        </h2>
                        <p className="text-gray-400 mb-8 max-w-xs">
                            Premium Web3 and Anime-themed clothing for the decentralized generation. Designed by artists, worn by degens.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="hover:text-accent transition-standard"><FaTwitter size={20} /></a>
                            <a href="#" className="hover:text-accent transition-standard"><FaInstagram size={20} /></a>
                            <a href="#" className="hover:text-accent transition-standard"><FaDiscord size={20} /></a>
                            <a href="#" className="hover:text-accent transition-standard"><FaGithub size={20} /></a>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-6">SHOP</h3>
                        <ul className="flex flex-col gap-4 text-gray-400">
                            <li><a href="#" className="hover:text-white transition-standard">All Products</a></li>
                            <li><a href="#" className="hover:text-white transition-standard">New Arrivals</a></li>
                            <li><a href="#" className="hover:text-white transition-standard">Best Sellers</a></li>
                            <li><a href="#" className="hover:text-white transition-standard">Collections</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-6">SUPPORT</h3>
                        <ul className="flex flex-col gap-4 text-gray-400">
                            <li><a href="#" className="hover:text-white transition-standard">Help Center</a></li>
                            <li><a href="#" className="hover:text-white transition-standard">Shipping Details</a></li>
                            <li><a href="#" className="hover:text-white transition-standard">Return Policy</a></li>
                            <li><a href="#" className="hover:text-white transition-standard">Size Guide</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-6">NEWSLETTER</h3>
                        <p className="text-gray-400 mb-6">Join the whitelist for upcoming drops.</p>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 flex-1 focus:outline-none focus:border-accent"
                            />
                            <button className="bg-accent text-white font-bold px-4 py-2 rounded-lg hover:brightness-110 transition-standard">
                                JOIN
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-10 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
                    <p>© 2026 Otaku Merch. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white transition-standard">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-standard">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
