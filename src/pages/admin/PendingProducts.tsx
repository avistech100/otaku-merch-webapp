import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FaCheck, FaTimes, FaExternalLinkAlt, FaTag } from 'react-icons/fa';

const PendingProducts: React.FC = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPending = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('products')
            .select('*, profiles(full_name)')
            .eq('status', 'pending');
        if (data) setProducts(data);
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
        <div className="layout-container py-12 animate-fadeIn">
            <h1 className="text-5xl font-black mb-4 tracking-tighter uppercase text-primary-black">Drop Quality Control</h1>
            <p className="text-primary-dark-gray/60 font-medium mb-12 uppercase tracking-[0.3em] text-xs">Technical Review of Upcoming Drops</p>

            {products.length === 0 ? (
                <div className="bg-bg-light/30 border-2 border-dashed border-bg-light rounded-[40px] p-20 text-center">
                    <p className="font-black text-primary-dark-gray/20 uppercase tracking-widest">No pending drops</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8">
                    {products.map((product) => (
                        <div key={product.id} className="bg-primary-white border border-bg-light rounded-[40px] overflow-hidden shadow-2xl flex flex-col lg:flex-row group">
                            <div className="lg:w-72 bg-bg-light relative overflow-hidden">
                                <img src={product.image || 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=400'} alt="Product" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-primary-white/90 backdrop-blur-md text-primary-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-2">
                                        <FaTag size={8} /> ${product.price}
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1 p-10 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-[10px] font-black text-accent-crypto uppercase tracking-[0.2em] mb-1">by {product.profiles?.full_name || 'Verified Creator'}</p>
                                            <h3 className="text-3xl font-black text-primary-black uppercase tracking-tighter">{product.title}</h3>
                                        </div>
                                        <button className="text-primary-dark-gray/20 hover:text-primary-black transition-all">
                                            <FaExternalLinkAlt size={18} />
                                        </button>
                                    </div>
                                    <p className="text-primary-dark-gray/60 font-medium line-clamp-2 mb-8 leading-relaxed italic">
                                        "{product.description}"
                                    </p>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => handleApproval(product.id, true)}
                                        className="flex-1 bg-accent-crypto text-primary-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:brightness-110 shadow-lg shadow-accent-crypto/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <FaCheck /> APPROVE DROP
                                    </button>
                                    <button
                                        onClick={() => handleApproval(product.id, false)}
                                        className="flex-1 bg-accent-anime text-primary-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:brightness-110 shadow-lg shadow-accent-anime/20 transition-all flex items-center justify-center gap-2"
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
