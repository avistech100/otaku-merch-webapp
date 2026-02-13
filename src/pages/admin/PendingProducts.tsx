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

    if (loading) return <div className="p-10 text-center animate-pulse font-black text-sm text-[var(--text-muted)] uppercase tracking-widest">Analyzing Submissions...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-xl md:text-2xl font-black tracking-tighter text-[var(--text-primary)] uppercase">Drop Quality Control</h1>
                <p className="text-[var(--text-muted)] font-bold tracking-widest uppercase text-[9px] flex items-center gap-2">
                    <FaTag className="text-[var(--accent-primary)]" /> Technical Review of Upcoming Drops
                </p>
            </div>

            {products.length === 0 ? (
                <div className="border border-dashed border-[var(--border)] rounded-lg p-10 text-center bg-[var(--bg-secondary)]">
                    <p className="font-bold uppercase tracking-widest text-[10px] text-[var(--text-muted)]">No pending drops</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {products.map((product) => (
                        <div key={product.id} className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg overflow-hidden flex flex-col sm:flex-row group hover:border-[var(--accent-primary)] transition-all duration-200">
                            <div className="sm:w-32 h-32 sm:h-auto relative bg-[var(--bg-elevated)] shrink-0">
                                <img
                                    src={product.image_url || 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=400'}
                                    alt="Product"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute bottom-2 left-2">
                                    <span className="bg-black/70 backdrop-blur-sm text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest flex items-center gap-1">
                                        <FaTag size={8} className="text-[var(--accent-primary)]" /> ${product.price}
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1 p-4 flex flex-col justify-between gap-3">
                                <div>
                                    <div className="flex justify-between items-start mb-1">
                                        <div>
                                            <p className="text-[8px] font-black uppercase tracking-widest text-[var(--accent-primary)] mb-0.5">by {product.profiles?.full_name || 'Verified Creator'}</p>
                                            <h3 className="text-sm font-black uppercase tracking-tight text-[var(--text-primary)] leading-tight">{product.title}</h3>
                                        </div>
                                        <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                                            <FaExternalLinkAlt size={12} />
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed opacity-80">
                                        "{product.description}"
                                    </p>
                                </div>

                                <div className="flex gap-2 w-full">
                                    <button
                                        onClick={() => handleApproval(product.id, true)}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-[var(--accent-secondary)] text-white hover:bg-[var(--accent-secondary)]/90 transition-all text-[9px] font-black uppercase tracking-widest shadow-sm"
                                    >
                                        <FaCheck size={10} /> APPROVE
                                    </button>
                                    <button
                                        onClick={() => handleApproval(product.id, false)}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all text-[9px] font-black uppercase tracking-widest"
                                    >
                                        <FaTimes size={10} /> REJECT
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
