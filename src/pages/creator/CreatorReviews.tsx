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
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="flex-1">
                    <h1 className="text-xl md:text-3xl font-black uppercase tracking-tighter text-[var(--text-primary)] mb-1">Feedback Terminal</h1>
                    <p className="text-[var(--text-muted)] font-medium uppercase tracking-[0.2em] text-[10px]">Processing consumer transmissions and performance ratings.</p>
                </div>
                <div className="flex gap-3">
                    <button className="w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 rounded-full bg-[var(--bg-elevated)] font-black text-[9px] md:text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-all shadow-sm">
                        <FaFilter /> Advanced Filter
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-[var(--bg-secondary)] p-4 md:p-6 rounded-lg border border-[var(--border)] text-[var(--text-primary)] shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--accent-crypto)]/10 rounded-full blur-2xl -mr-12 -mt-12" />
                    <FaStarHalfAlt className="text-xl md:text-2xl text-[var(--accent-crypto)] mb-3 md:mb-4" />
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Mean Asset Rating</p>
                    <p className="text-2xl md:text-3xl font-black tracking-tighter">{avgRating}<span className="text-sm md:text-base text-[var(--text-muted)]">/5.0</span></p>
                </div>

                <div className="bg-[var(--bg-secondary)] p-4 md:p-6 rounded-lg shadow-sm border border-[var(--border)]">
                    <FaReply className="text-xl md:text-2xl text-[var(--accent-anime)] mb-3 md:mb-4" />
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Awaiting Response</p>
                    <p className="text-2xl md:text-3xl font-black tracking-tighter text-[var(--text-primary)]">{awaitingCount}</p>
                </div>

                <div className="bg-[var(--bg-secondary)] p-4 md:p-6 rounded-lg shadow-sm border border-[var(--border)] sm:col-span-2 lg:col-span-1">
                    <FaCheckCircle className="text-xl md:text-2xl text-green-500 mb-3 md:mb-4" />
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Total Intelligence</p>
                    <p className="text-2xl md:text-3xl font-black tracking-tighter text-[var(--text-primary)]">{reviews.length}</p>
                </div>
            </div>

            <section className="bg-[var(--bg-secondary)] p-4 md:p-6 rounded-lg shadow-sm border border-[var(--border)]">
                <DataTable
                    columns={columns}
                    data={reviews}
                    isLoading={loading}
                    actions={(row) => (
                        <button
                            onClick={() => setReplyingTo(row.id)}
                            className="bg-[var(--accent-primary)] text-white px-3 md:px-4 py-1.5 md:py-2 rounded-full font-black uppercase tracking-widest text-[9px] flex items-center gap-1.5 hover:bg-[var(--accent-secondary)] transition-all"
                        >
                            <FaReply /> Respond
                        </button>
                    )}
                />
            </section>

            {/* Reply Modal */}
            {replyingTo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[var(--bg-secondary)] w-full max-w-lg rounded-lg p-6 shadow-2xl animate-slideUp border border-[var(--border)]">
                        <div className="flex items-center gap-3 mb-4 md:mb-6">
                            <div className="w-8 h-8 rounded-lg bg-[var(--accent-anime)]/10 text-[var(--accent-anime)] flex items-center justify-center">
                                <FaReply />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-black uppercase tracking-tight text-[var(--text-primary)] truncate">Encryption Terminal</h3>
                                <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] truncate">Responding to {reviews.find(r => r.id === replyingTo)?.profiles?.display_name}</p>
                            </div>
                        </div>
                        <textarea
                            className="w-full h-32 p-3 bg-[var(--bg-elevated)] rounded-md border border-[var(--border)] focus:border-[var(--accent-primary)] outline-none font-medium text-[var(--text-primary)] resize-none transition-all text-xs md:text-sm"
                            placeholder="Enter your cryptographic response..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                        />
                        <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mt-4 md:mt-6">
                            <button
                                onClick={() => setReplyingTo(null)}
                                className="order-2 sm:order-1 flex-1 py-3 rounded-md bg-[var(--bg-elevated)] font-black text-[9px] md:text-[10px] uppercase tracking-widest text-[var(--text-muted)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-all border border-[var(--border)]"
                            >
                                Abort
                            </button>
                            <button
                                onClick={() => handleReply(replyingTo)}
                                className="order-1 sm:order-2 flex-1 py-3 rounded-md bg-[var(--accent-primary)] text-white font-black text-[9px] md:text-[10px] uppercase tracking-widest shadow-lg hover:bg-[var(--accent-primary)]/90 transition-all"
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
