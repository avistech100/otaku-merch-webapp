import React, { useState } from 'react';
import { useSocial } from '../../hooks/useSocial';
import { FaPaperPlane, FaSpinner, FaUserCircle } from 'react-icons/fa';

interface CommentSectionProps {
    productId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ productId }) => {
    const { comments, loading: _loading, postComment } = useSocial(undefined, productId);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        await postComment(newComment);
        setNewComment('');
        setSubmitting(false);
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Post Comment */}
            <form onSubmit={handleSubmit} className="relative group">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts on this drop..."
                    className="w-full h-32 p-6 rounded-3xl bg-bg-light/30 border-2 border-transparent focus:border-primary-black transition-all font-medium outline-none resize-none"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e);
                        }
                    }}
                />
                <button
                    type="submit"
                    disabled={submitting || !newComment.trim()}
                    className="absolute bottom-4 right-4 bg-primary-black text-white p-4 rounded-2xl hover:bg-accent-anime transition-all shadow-lg disabled:opacity-50"
                >
                    {submitting ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                </button>
            </form>

            {/* Comments List */}
            <div className="space-y-6">
                {comments.length > 0 ? (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4 p-6 rounded-3xl border border-bg-light hover:border-bg-light/80 transition-all bg-primary-white shadow-sm">
                            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-bg-light shadow-sm">
                                {comment.profiles?.avatar_url ? (
                                    <img src={comment.profiles.avatar_url} alt={comment.profiles.username} className="w-full h-full object-cover" />
                                ) : (
                                    <FaUserCircle className="w-full h-full text-primary-dark-gray/20" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="font-extrabold text-sm text-primary-black uppercase tracking-tight">
                                        {comment.profiles?.username || comment.profiles?.full_name || 'Anonymous User'}
                                    </p>
                                    <span className="text-[10px] font-black text-primary-dark-gray/30 uppercase tracking-widest">
                                        {new Date(comment.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-primary-dark-gray/70 font-medium leading-relaxed text-sm">
                                    {comment.content}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-12 text-center border-2 border-dashed border-bg-light rounded-[32px]">
                        <p className="font-black uppercase tracking-widest text-[10px] text-primary-dark-gray/30">No transmissions found. Be the first to initiate lore.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentSection;
