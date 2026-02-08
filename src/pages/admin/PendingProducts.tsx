import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FaCheck, FaTimes, FaExternalLinkAlt, FaTag } from 'react-icons/fa';

const PendingProducts: React.FC = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPending = async () => {
        setLoading(true);
        console.log('[Admin] Fetching pending products...');
        const { data, error } = await supabase
            .from('products')
            .select('*, profiles!creator_id(full_name)')
            .eq('status', 'pending');

        if (error) {
            console.error('[Admin] Error fetching pending products:', error);
        } else {
            console.log('[Admin] Pending products data:', data);
            if (data) setProducts(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleApproval = async (id: string, approve: boolean) => {
        const { error } = await supabase
            .from('products')
            .update({ status: approve ? 'approved' : 'rejected' })
            .eq('id', id);

        if (!error) {
            alert(`Product ${approve ? 'approved' : 'rejected'}`);
            fetchPending();
        }
    };

    if (loading) return <div className="layout-container py-20 text-center animate-pulse font-black text-2xl uppercase">Analyzing Submissions...</div>;

    return (
        <div className="animate-fadeIn space-y-10">
            <div>
                <h1 className="text-5xl font-black mb-2 tracking-tighter uppercase" style={{ color: 'var(--text-primary)' }}>Drop Quality Control</h1>
                <p className="font-medium uppercase tracking-[0.3em] text-xs flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                    <FaTag className="text-accent-primary" /> Technical Review of Upcoming Drops
                </p>
            </div>

            {products.length === 0 ? (
                <div className="admin-card border-2 border-dashed border-border p-20 text-center">
                    <p className="font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>No pending drops</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8">
                    {products.map((product) => (
                        <div key={product.id} className="admin-card border-0 rounded-[40px] overflow-hidden shadow-2xl flex flex-col lg:flex-row group p-0 bg-bg-secondary">
                            <div className="lg:w-72 relative overflow-hidden bg-bg-primary">
                                <img src={product.image_url || 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=400'} alt="Product" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-primary-black/80 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-2">
                                        <FaTag size={8} className="text-accent-primary" /> ${product.price}
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1 p-10 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--accent-primary)' }}>by {product.profiles?.full_name || 'Verified Creator'}</p>
                                            <h3 className="text-3xl font-black uppercase tracking-tighter" style={{ color: 'var(--text-primary)' }}>{product.title}</h3>
                                        </div>
                                        <button className="transition-all" style={{ color: 'var(--text-muted)' }}>
                                            <FaExternalLinkAlt size={18} />
                                        </button>
                                    </div>
                                    <p className="font-medium line-clamp-2 mb-8 leading-relaxed italic" style={{ color: 'var(--text-secondary)' }}>
                                        "{product.description}"
                                    </p>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => handleApproval(product.id, true)}
                                        className="admin-btn admin-btn-success flex-1 py-4 uppercase text-xs tracking-widest shadow-lg"
                                    >
                                        <FaCheck /> APPROVE DROP
                                    </button>
                                    <button
                                        onClick={() => handleApproval(product.id, false)}
                                        className="admin-btn admin-btn-danger flex-1 py-4 uppercase text-xs tracking-widest shadow-lg"
                                    >
                                        <FaTimes /> REJECT DROP
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PendingProducts;
