import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { FaStar, FaReply, FaStarHalfAlt, FaFilter, FaCheckCircle, FaClock } from 'react-icons/fa';
import DataTable, { type Column } from '../../components/shared/DataTable';

interface Review {
    id: string;
    product_id: string;
    rating: number;
    comment: string;
    created_at: string;
    creator_reply: string | null;
    products: {
        title: string;
        image_url: string;
    };
    profiles: {
        display_name: string;
    };
}

const Reviews: React.FC = () => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');

    useEffect(() => {
        if (user) {
            fetchReviews();
        }
    }, [user]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('reviews')
                .select(`
                    *,
                    products!inner(title, image_url, creator_id),
                    profiles(display_name)
                `)
                .eq('products.creator_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setReviews(data as any);
        } catch (err) {
            console.error('Error fetching reviews:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (reviewId: string) => {
        if (!replyText.trim()) return;

        try {
            const { error } = await supabase
                .from('reviews')
                .update({
                    creator_reply: replyText,
                    reply_date: new Date().toISOString()
                })
                .eq('id', reviewId);

            if (error) throw error;

            setReplyingTo(null);
            setReplyText('');
            fetchReviews();
        } catch (err) {
            alert('Failed to send reply');
        }
    };

    const avgRating = reviews.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0.0';
    const awaitingCount = reviews.filter(r => !r.creator_reply).length;

    const columns: Column<Review>[] = [
        {
            header: 'Subject Asset',
            accessor: (row) => (
                <div className="flex items-center gap-4">
                    <img src={row.products.image_url} alt="" className="w-12 h-12 rounded-xl object-cover border border-bg-light" />
                    <span className="font-extrabold text-xs text-primary-black uppercase tracking-tight max-w-[150px] truncate">{row.products.title}</span>
                </div>
            )
        },
        {
            header: 'Transmission Content',
            accessor: (row) => (
                <div className="flex flex-col gap-2 max-w-md py-2">
                    <div className="flex text-accent-crypto text-[10px] gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <FaStar key={i} className={i < row.rating ? 'fill-current' : 'text-bg-light'} />
                        ))}
                    </div>
                    <p className="text-sm text-primary-black font-medium leading-relaxed italic">"{row.comment}"</p>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] text-primary-dark-gray/40 font-black uppercase tracking-widest">
                            Origin: {row.profiles?.display_name || 'ANONYMOUS_ENTITY'}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-bg-light" />
                        <span className="text-[9px] text-primary-dark-gray/40 font-black uppercase tracking-widest">
                            {new Date(row.created_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            )
        },
        {
            header: 'Condition',
            accessor: (row) => (
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-2 w-fit ${row.creator_reply ? 'bg-green-50 text-green-600 border-green-100' : 'bg-yellow-50 text-yellow-600 border-yellow-100'}`}>
                    {row.creator_reply ? <FaCheckCircle size={10} /> : <FaClock size={10} />}
                    {row.creator_reply ? 'Resolved' : 'Awaiting Reply'}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-10 animate-fadeIn pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black uppercase tracking-tighter text-primary-black mb-2">Feedback Terminal</h1>
                    <p className="text-primary-dark-gray/60 font-medium uppercase tracking-[0.2em] text-xs">Processing consumer transmissions and performance ratings.</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-8 py-4 rounded-full bg-bg-light font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-primary-black hover:text-white transition-all shadow-lg shadow-black/5">
                        <FaFilter /> Advanced Filter
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-primary-black p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent-crypto/10 rounded-full blur-3xl -mr-16 -mt-16" />
                    <FaStarHalfAlt className="text-3xl text-accent-crypto mb-6" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Mean Asset Rating</p>
                    <p className="text-5xl font-black tracking-tighter">{avgRating}<span className="text-xl text-white/20">/5.0</span></p>
                </div>

                <div className="bg-primary-white p-10 rounded-[40px] shadow-xl shadow-black/5 border border-bg-light">
                    <FaReply className="text-3xl text-accent-anime mb-6" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary-dark-gray/40 mb-1">Awaiting Response</p>
                    <p className="text-5xl font-black tracking-tighter text-primary-black">{awaitingCount}</p>
                </div>

                <div className="bg-primary-white p-10 rounded-[40px] shadow-xl shadow-black/5 border border-bg-light">
                    <FaCheckCircle className="text-3xl text-green-500 mb-6" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary-dark-gray/40 mb-1">Total Intelligence</p>
                    <p className="text-5xl font-black tracking-tighter text-primary-black">{reviews.length}</p>
                </div>
            </div>

            <section className="bg-primary-white p-10 rounded-[40px] shadow-xl shadow-black/5 border border-bg-light">
                <DataTable
                    columns={columns}
                    data={reviews}
                    isLoading={loading}
                    actions={(row) => (
                        <button
                            onClick={() => setReplyingTo(row.id)}
                            className="bg-primary-black text-white px-6 py-3 rounded-full font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-accent-anime transition-all"
                        >
                            <FaReply /> Respond
                        </button>
                    )}
                />
            </section>

            {/* Reply Modal */}
            {replyingTo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-black/60 backdrop-blur-md">
                    <div className="bg-primary-white w-full max-w-lg rounded-[50px] p-10 shadow-2xl animate-slideUp border border-white/20">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-accent-anime/10 text-accent-anime flex items-center justify-center">
                                <FaReply />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tight text-primary-black">Encryption Terminal</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary-dark-gray/40">Responding to {reviews.find(r => r.id === replyingTo)?.profiles?.display_name}</p>
                            </div>
                        </div>
                        <textarea
                            className="w-full h-48 p-8 bg-bg-light/30 rounded-[30px] border-2 border-transparent focus:border-primary-black outline-none font-medium text-primary-black resize-none transition-all"
                            placeholder="Enter your cryptographic response..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                        />
                        <div className="flex gap-4 mt-10">
                            <button
                                onClick={() => setReplyingTo(null)}
                                className="flex-1 py-5 rounded-3xl bg-bg-light font-black text-xs uppercase tracking-widest text-primary-dark-gray hover:bg-primary-dark-gray hover:text-white transition-all"
                            >
                                Abort
                            </button>
                            <button
                                onClick={() => handleReply(replyingTo)}
                                className="flex-1 py-5 rounded-3xl bg-primary-black text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-black/20 hover:bg-accent-anime transition-all"
                            >
                                Broadcast
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reviews;
