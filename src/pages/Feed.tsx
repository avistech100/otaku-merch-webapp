import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import ProductCard from '../components/product/ProductCard';
import { FaUserCircle, FaSpinner, FaFire } from 'react-icons/fa';
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
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-end mb-12">
                <div>
                    <h1 className="text-5xl font-black uppercase tracking-tighter text-primary-black">Vanguard Feed</h1>
                    <p className="text-primary-dark-gray/60 font-medium uppercase tracking-[0.2em] text-xs">Intel from your followed creators</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Sidebar: Following List */}
                <div className="lg:col-span-1 hidden lg:block">
                    <div className="bg-primary-white p-8 rounded-[40px] shadow-xl shadow-black/5 border border-bg-light sticky top-24">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-primary-dark-gray/40 mb-6 border-b border-bg-light pb-4">
                            FOLLOWING ({followedCreators.length})
                        </h3>
                        <div className="space-y-4">
                            {followedCreators.map(creator => (
                                <Link key={creator.id} to={`/creator/${creator.id}`} className="flex items-center gap-3 hover:translate-x-1 transition-transform group">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-bg-light shadow-sm">
                                        <img src={creator.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.id}`} alt={creator.username} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-black truncate group-hover:text-accent-anime transition-colors uppercase tracking-tight">
                                            {creator.store_name || creator.full_name || 'Anonymous Creator'}
                                        </p>
                                        <p className="text-[10px] font-medium text-primary-dark-gray/40">@{creator.username || 'user'}</p>
                                    </div>
                                </Link>
                            ))}
                            {followedCreators.length === 0 && (
                                <p className="text-[10px] font-bold text-primary-dark-gray/30 italic">No creators followed yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main: Product Feed */}
                <div className="lg:col-span-3">
                    {products.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {products.map(p => {
                                const mappedProduct = {
                                    id: p.id,
                                    title: p.title,
                                    price: p.price,
                                    image: p.image_url,
                                    category: p.category,
                                    creator: p.profiles?.store_name || p.profiles?.full_name || 'Creator',
                                    creatorId: p.creator_id,
                                    isNew: new Date(p.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                                    inStock: p.stock_quantity > 0
                                };
                                return <ProductCard key={p.id} product={mappedProduct} />;
                            })}
                        </div>
                    ) : (
                        <div className="py-24 text-center bg-primary-white border-2 border-dashed border-bg-light rounded-[40px]">
                            <FaFire className="text-6xl text-primary-dark-gray/10 mx-auto mb-6" />
                            <h3 className="text-2xl font-black uppercase tracking-tight text-primary-black mb-4">Feed Offline</h3>
                            <p className="font-medium text-primary-dark-gray/60 max-w-sm mx-auto mb-8">
                                Follow creators to populate your command center with the latest drops and intelligence.
                            </p>
                            <Link
                                to="/products"
                                className="px-10 py-5 bg-primary-black text-white rounded-full font-black uppercase text-xs tracking-widest hover:bg-accent-anime transition-all shadow-xl shadow-accent-anime/20"
                            >
                                Discover Creators
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Feed;
