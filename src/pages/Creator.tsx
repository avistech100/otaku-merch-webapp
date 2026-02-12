import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/product/ProductCard';
import { FaTwitter, FaInstagram, FaGlobe, FaTrophy, FaCalendarAlt, FaCheckCircle, FaSpinner, FaPlus, FaCheck } from 'react-icons/fa';
import { useSocial } from '../hooks/useSocial';

const Creator: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { isFollowing, followerCount, toggleFollow, loading: followLoading } = useSocial(id);
    const [creator, setCreator] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchCreatorData();
    }, [id]);

    const fetchCreatorData = async () => {
        setLoading(true);
        try {
            // Fetch Creator Profile
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', id)
                .single();

            if (profileError) throw profileError;
            setCreator(profile);

            // Fetch Creator Products
            const { data: creatorProducts, error: productsError } = await supabase
                .from('products')
                .select('*, profiles(*)')
                .eq('creator_id', id)
                .eq('status', 'approved') // Only show approved products
                .order('created_at', { ascending: false });

            if (productsError) throw productsError;

            // Map to ProductCard format if needed, or pass directly if compatible
            // Assuming ProductCard can handle the Supabase shape or we map it
            // Let's standardise the shape to what ProductCard expects
            const mappedProducts = (creatorProducts || []).map((p: any) => ({
                id: p.id,
                title: p.title,
                price: p.price,
                image: p.image_url,
                category: p.category,
                creatorId: p.creator_id,
                creatorName: p.profiles?.store_name || p.profiles?.full_name || 'Creator',
                creatorAvatar: p.profiles?.avatar_url,
                creatorBadge: p.profiles?.store_name ? 'Official Store' : 'Verified Creator',
                sizes: [], // Add if needed, Product interface requires it
                isLimited: p.is_limited_edition,
                hypeLevel: p.hype_score > 80 ? 'Legendary' : 'High',
            }));

            setProducts(mappedProducts);

        } catch (err) {
            console.error('Error fetching creator data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <FaSpinner className="animate-spin text-4xl text-primary-black" />
                <p className="font-black uppercase tracking-widest text-xs">Loading Creator Profile...</p>
            </div>
        </div>
    );

    if (!creator) return <div className="py-40 text-center font-black text-4xl text-primary-black uppercase tracking-tighter animate-fadeIn">Creator Not Found</div>;

    const socialLinks = creator.social_links || {};

    return (
        <div className="animate-fadeIn">
            {/* Creator Banner */}
            <div className="h-80 w-full relative">
                <img src={creator.store_banner_url || 'https://via.placeholder.com/1500x500?text=NO+BANNER'} alt="Banner" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-black via-primary-black/20 to-transparent"></div>
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 md:left-24 md:translate-x-0 w-32 h-32 rounded-[40px] border-4 border-primary-white overflow-hidden bg-primary-white shadow-2xl">
                    <img src={creator.store_logo_url || creator.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.id}`} alt={creator.store_name} className="w-full h-full object-cover" />
                </div>
            </div>

            <div className="layout-container mt-24 mb-24">
                <div className="flex flex-col md:flex-row justify-between items-start gap-12">
                    {/* Creator Details */}
                    <div className="md:w-1/3 animate-slideUp">
                        <h1 className="text-4xl font-black mb-2 tracking-tighter uppercase flex items-center gap-2 text-primary-black">
                            {creator.store_name || creator.full_name || 'Anonymous Creator'} <FaCheckCircle className="text-accent-crypto" size={20} />
                        </h1>
                        <p className="text-primary-dark-gray/60 mb-6 font-medium leading-relaxed">{creator.store_description || creator.bio || 'No bio available.'}</p>

                        <div className="flex flex-wrap gap-4 mb-8">
                            <div className="bg-bg-light/50 border border-bg-light rounded-2xl px-6 py-4 shadow-sm">
                                <p className="text-2xl font-black tracking-tight text-primary-black">{followerCount}</p>
                                <p className="text-[10px] font-black text-primary-dark-gray/30 uppercase tracking-widest">Followers</p>
                            </div>
                            <div className="bg-bg-light/50 border border-bg-light rounded-2xl px-6 py-4 shadow-sm">
                                <p className="text-2xl font-black tracking-tight text-primary-black">{products.length}</p>
                                <p className="text-[10px] font-black text-primary-dark-gray/30 uppercase tracking-widest">Active Drops</p>
                            </div>
                        </div>

                        <div className="flex gap-4 mb-10">
                            {socialLinks.twitter && <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-4 bg-primary-black text-primary-white rounded-2xl hover:bg-accent-crypto hover:scale-105 transition-all"><FaTwitter /></a>}
                            {socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-4 bg-primary-black text-primary-white rounded-2xl hover:bg-accent-anime hover:scale-105 transition-all"><FaInstagram /></a>}
                            {socialLinks.website && <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="p-4 bg-primary-black text-primary-white rounded-2xl hover:bg-accent-crypto hover:scale-105 transition-all"><FaGlobe /></a>}
                        </div>

                        <button
                            onClick={toggleFollow}
                            disabled={followLoading}
                            className={`w-full font-black py-4 rounded-full uppercase tracking-widest transition-all mb-12 flex items-center justify-center gap-2 shadow-lg ${isFollowing
                                ? 'bg-bg-light text-primary-black border-2 border-primary-black hover:bg-red-50 hover:text-red-500 hover:border-red-500'
                                : 'bg-accent-crypto text-primary-white hover:brightness-110 shadow-accent-crypto/20'
                                }`}
                        >
                            {followLoading ? <FaSpinner className="animate-spin" /> : (isFollowing ? <><FaCheck /> FOLLOWING</> : <><FaPlus /> FOLLOW CREATOR</>)}
                        </button>

                        <div className="space-y-6">
                            <h4 className="font-black text-xs uppercase tracking-widest text-primary-dark-gray/30 border-b border-bg-light pb-2">Verified Status</h4>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-accent-warning text-primary-black rounded-xl shadow-sm">
                                    <FaTrophy size={18} />
                                </div>
                                <div>
                                    <p className="font-black text-sm uppercase text-primary-black">Verified Seller</p>
                                    <p className="text-xs text-primary-dark-gray/40">Identity Confirmed</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-accent-crypto text-primary-white rounded-xl shadow-sm">
                                    <FaCalendarAlt size={18} />
                                </div>
                                <div>
                                    <p className="font-black text-sm uppercase text-primary-black">Joined</p>
                                    <p className="text-xs text-primary-dark-gray/40">{new Date(creator.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Creator Collection */}
                    <div className="md:w-2/3 animate-fadeIn">
                        <h2 className="text-3xl font-black mb-10 tracking-tighter uppercase text-primary-black border-b border-bg-light pb-4">Current Collection</h2>
                        {products.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                {products.map(p => <ProductCard key={p.id} product={p} />)}
                            </div>
                        ) : (
                            <div className="text-center py-20 border-2 border-dashed border-bg-light rounded-[40px]">
                                <p className="font-black uppercase tracking-widest text-primary-dark-gray/40 text-xs">No active drops available</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Creator;
