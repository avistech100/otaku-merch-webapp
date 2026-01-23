import React from 'react';
import { Link } from 'react-router-dom';
import { products } from '../data/mockData';
import ProductCard from '../components/product/ProductCard';
import { FaArrowRight, FaGem, FaRobot, FaFire } from 'react-icons/fa';

const Home: React.FC = () => {
    const featuredProducts = products.slice(0, 3);

    return (
        <div className="pb-20">
            {/* Hero Section */}
            <section className="relative h-[80vh] min-h-[600px] flex items-center bg-primary-black overflow-hidden">
                {/* Background Animation/Image Placeholder */}
                <div className="absolute inset-0 opacity-40">
                    <img
                        src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=1200"
                        alt="Hero Background"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-black via-primary-black/50 to-transparent"></div>

                <div className="layout-container relative z-10">
                    <div className="max-w-2xl animate-slideUp">
                        <span className="inline-block bg-accent-anime text-primary-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] mb-6">
                            Exclusive Drop: Nakamoto Genesis
                        </span>
                        <h1 className="text-6xl md:text-8xl font-black text-primary-white leading-none mb-8 tracking-tighter">
                            WEAR THE <br />
                            <span className="text-accent-anime underline decoration-white/20 underline-offset-8 italic">FUTURE.</span>
                        </h1>
                        <p className="text-xl text-primary-white/70 mb-10 leading-relaxed font-medium">
                            Premium Web3 and Anime apparel for the digital vanguard. Limited editions. Verified creators.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link
                                to="/products"
                                className="bg-primary-white text-primary-black font-black px-10 py-5 rounded-full hover:bg-accent-anime hover:text-primary-white transition-all flex items-center gap-2 group"
                            >
                                SHOP COLLECTION <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
                            </Link>
                            <Link
                                to="/creator/c1"
                                className="bg-primary-dark-gray text-primary-white border border-primary-dark-gray/30 font-black px-10 py-5 rounded-full hover:bg-primary-black transition-all"
                            >
                                VIEW CREATORS
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories / Collections */}
            <section className="layout-container layout-section">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Crypto Category */}
                    <Link to="/products?category=Crypto Brands" className="group relative h-[400px] rounded-3xl overflow-hidden bg-bg-light shadow-sm hover:shadow-xl transition-all duration-500">
                        <img
                            src="https://images.unsplash.com/photo-1622633054716-a618ee4e14f6?auto=format&fit=crop&q=80&w=800"
                            alt="Crypto Brands"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary-black/80 to-transparent flex flex-col justify-end p-10">
                            <div className="flex items-center gap-3 mb-4">
                                <FaGem className="text-accent-crypto" size={24} />
                                <span className="text-primary-white/60 font-black tracking-widest text-xs uppercase">Curated Drop</span>
                            </div>
                            <h2 className="text-4xl font-black text-primary-white mb-4 tracking-tighter">CRYPTO BRANDS</h2>
                            <p className="text-primary-white/70 mb-6 font-medium">Explore apparel from the most iconic projects in the space.</p>
                            <span className="text-primary-white font-bold border-b-2 border-accent-crypto w-fit pb-1 group-hover:pr-4 transition-all uppercase tracking-widest text-xs">EXPLORE NOW</span>
                        </div>
                    </Link>

                    {/* Anime Category */}
                    <Link to="/products?category=Anime Series" className="group relative h-[400px] rounded-3xl overflow-hidden bg-bg-light shadow-sm hover:shadow-xl transition-all duration-500">
                        <img
                            src="https://images.unsplash.com/photo-1541562232579-512a21360020?auto=format&fit=crop&q=80&w=800"
                            alt="Anime Series"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary-black/80 to-transparent flex flex-col justify-end p-10">
                            <div className="flex items-center gap-3 mb-4">
                                <FaRobot className="text-accent-anime" size={24} />
                                <span className="text-primary-white/60 font-black tracking-widest text-xs uppercase">Seasonal Drop</span>
                            </div>
                            <h2 className="text-4xl font-black text-primary-white mb-4 tracking-tighter">ANIME SERIES</h2>
                            <p className="text-primary-white/70 mb-6 font-medium">High-end mecha and cyberpunk inspired streetwear.</p>
                            <span className="text-primary-white font-bold border-b-2 border-accent-anime w-fit pb-1 group-hover:pr-4 transition-all uppercase tracking-widest text-xs">EXPLORE NOW</span>
                        </div>
                    </Link>
                </div>
            </section>

            {/* New Arrivals */}
            <section className="bg-bg-card layout-section border-y border-bg-light">
                <div className="layout-container">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-4 text-accent-anime">
                                <FaFire />
                                <span className="font-black text-xs uppercase tracking-widest">Trending Now</span>
                            </div>
                            <h2 className="text-5xl font-black mb-0 tracking-tighter uppercase text-primary-black">NEW ARRIVALS</h2>
                        </div>
                        <Link to="/products" className="font-bold flex items-center gap-2 hover:text-accent-anime transition-all text-primary-black">
                            VIEW ALL PRODUCTS <FaArrowRight size={14} />
                        </Link>
                    </div>

                    <div className="grid-products">
                        {featuredProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Creator Spotlight */}
            <section className="layout-container layout-section">
                <div className="bg-primary-black text-primary-white rounded-[40px] p-12 md:p-20 overflow-hidden relative shadow-2xl">
                    <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
                        <img src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=800" alt="Pattern" className="w-full h-full object-cover" />
                    </div>
                    <div className="md:w-1/2 relative z-10">
                        <h3 className="text-primary-dark-gray font-black text-xs uppercase tracking-[0.3em] mb-6">Creator Spotlight</h3>
                        <h2 className="text-5xl font-black mb-8 tracking-tighter leading-none">SATOSHI NAKAMOTO <br />CLONE</h2>
                        <p className="text-primary-white/60 text-lg mb-10 leading-relaxed">
                            "My goal is to merge the digital and physical worlds through apparel. Every piece represents a milestone in the decentralization movement."
                        </p>
                        <div className="flex items-center gap-8 mb-10">
                            <div>
                                <p className="text-3xl font-black">12.5k</p>
                                <p className="text-primary-dark-gray text-xs font-bold uppercase tracking-widest">Followers</p>
                            </div>
                            <div className="w-px h-10 bg-primary-dark-gray/30"></div>
                            <div>
                                <p className="text-3xl font-black">48</p>
                                <p className="text-primary-dark-gray text-xs font-bold uppercase tracking-widest">Total Drops</p>
                            </div>
                        </div>
                        <Link
                            to="/creator/c1"
                            className="bg-accent-anime text-primary-white font-black px-10 py-5 rounded-full hover:brightness-110 shadow-lg shadow-accent-anime/20 transition-all flex items-center gap-2 w-fit uppercase tracking-widest"
                        >
                            FOLLOW CREATOR
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
