import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import ProductCard from '../components/product/ProductCard';
import { FaSpinner, FaFire } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Feed: React.FC = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState<any[]>([]);
    const [followedCreators, setFollowedCreators] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchFeed();
        }
    }, [user]);

    const fetchFeed = async () => {
        setLoading(true);
        try {
            // 1. Get IDs of followed creators
            const { data: follows } = await supabase
                .from('follows')
                .select('following_id')
                .eq('follower_id', user?.id);

            const followingIds = (follows || []).map(f => f.following_id);

            if (followingIds.length === 0) {
                setLoading(false);
                return;
            }

            // 2. Fetch products from these creators
            const { data: feedProducts } = await supabase
                .from('products')
                .select('*, profiles(full_name, avatar_url, store_name)')
                .in('creator_id', followingIds)
                .eq('status', 'approved')
                .order('created_at', { ascending: false });

            // 3. Fetch creator profiles for the "Who to follow" or "Following" section
            const { data: creators } = await supabase
                .from('profiles')
                .select('*')
                .in('id', followingIds);

            if (feedProducts) setProducts(feedProducts);
            if (creators) setFollowedCreators(creators);

        } catch (error) {
            console.error('Feed error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <FaSpinner className="animate-spin text-4xl text-primary-black" />
                <p className="font-black uppercase tracking-widest text-xs">Calibrating Feed...</p>
            </div>
        </div>
    );

    return (
        <div className="layout-container py-12 animate-fadeIn">
            <div className="flex flex-col md:flex-row gap-2 justify-between items-start md:items-end mb-10">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-primary-black">Vanguard Feed</h1>
                    <p className="text-primary-dark-gray/40 font-black uppercase tracking-[0.2em] text-[10px]">Transmission intelligence from your perimeter</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar: Following List */}
                <div className="lg:col-span-1 hidden lg:block">
                    <div className="bg-primary-white p-6 rounded-3xl shadow-xl shadow-black/5 border border-bg-light sticky top-24">
                        <h3 className="text-[9px] font-black uppercase tracking-widest text-primary-dark-gray/40 mb-5 border-b border-bg-light pb-3">
                            ACTIVE FOLLOWS ({followedCreators.length})
                        </h3>
                        <div className="space-y-4">
                            {followedCreators.map(creator => (
                                <Link key={creator.id} to={`/creator/${creator.id}`} className="flex items-center gap-3 hover:translate-x-1 transition-transform group">
                                    <div className="w-9 h-9 rounded-xl overflow-hidden bg-bg-light shadow-sm border border-bg-light">
                                        <img src={creator.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.id}`} alt={creator.username} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-black truncate group-hover:text-accent-anime transition-colors uppercase tracking-tight">
                                            {creator.store_name || creator.full_name || 'Anonymous Creator'}
                                        </p>
                                        <p className="text-[9px] font-bold text-primary-dark-gray/30 uppercase">@{creator.username || 'unknown'}</p>
                                    </div>
                                </Link>
                            ))}
                            {followedCreators.length === 0 && (
                                <p className="text-[9px] font-black text-primary-dark-gray/30 italic uppercase tracking-wider">No active perimeter intel.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main: Product Feed */}
                <div className="lg:col-span-3">
                    {products.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {products.map(p => {
                                const mappedProduct = {
                                    id: p.id,
                                    title: p.title,
                                    price: p.price,
                                    description: p.description || '',
                                    image: p.image_url,
                                    images: p.product_images?.map((img: any) => img.url) || [p.image_url],
                                    category: p.category || 'Crypto Brands',
                                    creatorId: p.creator_id,
                                    creatorName: p.profiles?.store_name || p.profiles?.full_name || 'Verified Creator',
                                    creatorBadge: 'Verified',
                                    sizes: p.sizes || ['M', 'L', 'XL'],
                                    isLimited: p.is_limited_edition || false,
                                    hypeLevel: 'Medium' as const,
                                    reviews: [],
                                    details: {
                                        materials: p.materials || '',
                                        designStory: p.design_story || ''
                                    }
                                };
                                return <ProductCard key={p.id} product={mappedProduct} />;
                            })}
                        </div>
                    ) : (
                        <div className="py-20 text-center bg-primary-white border-2 border-dashed border-bg-light rounded-3xl p-8">
                            <FaFire className="text-4xl text-primary-dark-gray/10 mx-auto mb-6" />
                            <h3 className="text-xl font-black uppercase tracking-tighter text-primary-black mb-3">No Intel Available</h3>
                            <p className="font-bold text-primary-dark-gray/40 uppercase tracking-widest text-[10px] max-w-xs mx-auto mb-8">
                                Broaden your perimeter search to receive incoming drops.
                            </p>
                            <Link
                                to="/products"
                                className="inline-block px-8 py-4 bg-primary-black text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-accent-anime transition-all shadow-lg shadow-accent-anime/20"
                            >
                                DISCOVER CREATORS
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Feed;
