import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/product/ProductCard';
import CreatorSignupModal from '../components/auth/CreatorSignupModal';
import { FaArrowRight, FaGem, FaRobot, FaFire, FaStore } from 'react-icons/fa';

const Home: React.FC = () => {
    const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch categories
                const { data: catData } = await supabase
                    .from('categories')
                    .select('*');

                if (catData) setCategories(catData);

                // Fetch featured products (approved status)
                const { data: prodData } = await supabase
                    .from('products')
                    .select(`
                        *,
                        profiles!creator_id(full_name, store_name, avatar_url),
                        categories(name),
                        product_images(src, alt_text),
                        product_variants(*)
                    `)
                    .eq('status', 'approved')
                    .order('created_at', { ascending: false })
                    .limit(35);

                if (prodData) {
                    // Map to existing Product type structure if needed
                    const mappedProducts = prodData.map(p => ({
                        id: p.id,
                        title: p.title,
                        price: p.price,
                        description: p.description,
                        image: p.image_url || p.product_images?.[0]?.src || 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=600',
                        category: p.categories?.name || '',
                        creatorId: p.creator_id,
                        creatorName: p.profiles?.store_name || p.profiles?.full_name || 'Verified Creator',
                        creatorAvatar: p.profiles?.avatar_url,
                        creatorBadge: p.profiles?.store_name ? 'Official Store' : 'Verified Creator',
                        isLimited: p.is_limited_edition,
                        hypeLevel: p.hype_score > 80 ? 'Legendary' : p.hype_score > 50 ? 'High' : 'Medium',
                        chain: p.crypto_chain
                    }));
                    setFeaturedProducts(mappedProducts);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }

        fetchData();
    }, []);

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'FaGem': return <FaGem className="text-accent-crypto" size={24} />;
            case 'FaRobot': return <FaRobot className="text-accent-anime" size={24} />;
            case 'FaFire': return <FaFire className="text-accent-anime" size={24} />;
            default: return <FaFire className="text-accent-anime" size={24} />;
        }
    };

    return (
        <div className="pb-20">
            {/* Hero Section */}
            <section className="relative h-[80vh] min-h-[600px] flex items-center bg-primary-black overflow-hidden">
                <div className="absolute inset-0 opacity-40">
                    <img
                        src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=1200"
                        alt="Hero Background"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-black via-primary-black/50 to-transparent"></div>

                <div className="layout-container relative z-10 flex flex-col justify-center h-full">
                    <div className="max-w-2xl animate-slideUp">
                        <span className="inline-block bg-accent-anime text-primary-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] mb-4">
                            Exclusive Drop: Nakamoto Genesis
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black text-primary-white leading-none mb-6 tracking-tighter">
                            WEAR THE <br />
                            <span className="text-accent-anime underline decoration-white/20 underline-offset-8 italic">FUTURE.</span>
                        </h1>
                        <p className="text-lg text-primary-white/70 mb-8 leading-relaxed font-medium max-w-lg">
                            Premium Web3 and Anime apparel for the digital vanguard. Limited editions. Verified creators.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                to="/products"
                                className="bg-primary-white text-primary-black font-black text-sm px-8 py-3 rounded-full hover:bg-accent-anime hover:text-primary-white transition-all flex items-center gap-2 group uppercase tracking-widest"
                            >
                                Shop Collection <FaArrowRight className="group-hover:translate-x-1 transition-transform" size={12} />
                            </Link>
                            <button
                                onClick={() => setIsCreatorModalOpen(true)}
                                className="bg-accent-crypto text-primary-white font-black text-sm px-8 py-3 rounded-full hover:bg-accent-anime transition-all flex items-center gap-2 uppercase tracking-widest"
                            >
                                <FaStore size={12} /> Join as Creator
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="layout-container py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categories.slice(0, 2).map((cat) => (
                        <Link
                            key={cat.id}
                            to={`/products?category=${cat.name}`}
                            className="group relative h-[300px] rounded-2xl overflow-hidden bg-bg-light shadow-sm hover:shadow-lg transition-all duration-300"
                        >
                            <img
                                src={cat.slug === 'crypto-brands' ? "https://images.unsplash.com/photo-1622633054716-a618ee4e14f6?auto=format&fit=crop&q=80&w=800" : "https://images.unsplash.com/photo-1541562232579-512a21360020?auto=format&fit=crop&q=80&w=800"}
                                alt={cat.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-primary-black/90 via-primary-black/20 to-transparent flex flex-col justify-end p-6">
                                <div className="flex items-center gap-2 mb-2">
                                    {getIcon(cat.icon)}
                                    <span className="text-primary-white/80 font-black tracking-widest text-[10px] uppercase">{cat.type === 'crypto' ? 'Curated Drop' : 'Seasonal Drop'}</span>
                                </div>
                                <h2 className="text-3xl font-black text-primary-white mb-2 tracking-tighter uppercase">{cat.name}</h2>
                                <p className="text-primary-white/70 mb-4 font-medium text-sm line-clamp-2 pr-4">{cat.description}</p>
                                <span className="text-primary-white font-bold border-b border-accent-anime w-fit pb-0.5 group-hover:text-accent-anime transition-all uppercase tracking-widest text-[10px]">EXPLORE NOW</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* New Arrivals */}
            {featuredProducts.length > 0 && (
                <section className="bg-bg-card py-12 border-y border-bg-light">
                    <div className="layout-container">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1 text-accent-anime">
                                    <FaFire size={12} />
                                    <span className="font-black text-[10px] uppercase tracking-widest">Trending Now</span>
                                </div>
                                <h2 className="text-3xl font-black mb-0 tracking-tighter uppercase text-primary-black">NEW ARRIVALS</h2>
                            </div>
                            <Link to="/products" className="text-xs font-bold flex items-center gap-2 hover:text-accent-anime transition-all text-primary-black uppercase tracking-widest">
                                SEE ALL <FaArrowRight size={10} />
                            </Link>
                        </div>

                        <div className="grid-products">
                            {featuredProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Creator Spotlight */}
            <section className="layout-container py-12">
                <div className="bg-primary-black text-primary-white rounded-3xl p-8 md:p-12 overflow-hidden relative shadow-xl">
                    <div className="absolute top-0 right-0 w-2/3 h-full opacity-20 pointer-events-none">
                        <img src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=800" alt="Pattern" className="w-full h-full object-cover grayscale" />
                    </div>
                    <div className="md:w-3/5 relative z-10">
                        <h3 className="text-primary-dark-gray font-black text-[10px] uppercase tracking-[0.3em] mb-4">Creator Spotlight</h3>
                        <h2 className="text-4xl font-black mb-4 tracking-tighter leading-none">SATOSHI NAKAMOTO <br />CLONE</h2>
                        <p className="text-primary-white/60 text-sm mb-8 leading-relaxed max-w-lg">
                            "My goal is to merge the digital and physical worlds through apparel. Every piece represents a milestone in the decentralization movement."
                        </p>
                        <div className="flex items-center gap-8 mb-8">
                            <div>
                                <p className="text-2xl font-black">12.5k</p>
                                <p className="text-primary-dark-gray text-[9px] font-bold uppercase tracking-widest">Followers</p>
                            </div>
                            <div className="w-px h-8 bg-primary-dark-gray/30"></div>
                            <div>
                                <p className="text-2xl font-black">48</p>
                                <p className="text-primary-dark-gray text-[9px] font-bold uppercase tracking-widest">Drops</p>
                            </div>
                        </div>
                        <Link
                            to="/products"
                            className="bg-accent-anime text-primary-white font-black px-6 py-3 rounded-full hover:bg-white hover:text-primary-black shadow-lg transition-all flex items-center gap-2 w-fit uppercase tracking-widest text-[10px]"
                        >
                            View Profile
                        </Link>
                    </div>
                </div>
            </section>

            {/* Creator Signup Modal */}
            <CreatorSignupModal
                isOpen={isCreatorModalOpen}
                onClose={() => setIsCreatorModalOpen(false)}
            />
        </div>
    );
};

export default Home;

