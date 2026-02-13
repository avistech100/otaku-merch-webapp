import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { FaBell, FaCheck, FaTrash } from 'react-icons/fa';

const CreatorNotifications: React.FC = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        fetchNotifications();

        const subscription = supabase
            .channel('creator-notifications')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`
            }, (payload) => {
                setNotifications(prev => [payload.new, ...prev]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [user]);

    const fetchNotifications = async () => {
        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user?.id)
            .order('created_at', { ascending: false });

        if (data) setNotifications(data);
        setLoading(false);
    };

    const markAsRead = async (id: string) => {
        await supabase
            .from('notifications')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('id', id);

        setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    };

    const deleteNotification = async (id: string) => {
        await supabase.from('notifications').delete().eq('id', id);
        setNotifications(notifications.filter(n => n.id !== id));
    };

    if (loading) return <div className="p-10 text-center font-black animate-pulse">SYNCHRONIZING ALERTS...</div>;

    return (
        <div className="animate-fadeIn pb-20 max-w-4xl">
            <h1 className="text-xl md:text-3xl font-black uppercase tracking-tighter text-[var(--text-primary)] mb-6 md:mb-8">Alert Feed</h1>

            <div className="space-y-3">
                {notifications.length > 0 ? notifications.map((n) => (
                    <div
                        key={n.id}
                        className={`p-3 md:p-4 rounded-lg border transition-all flex gap-3 md:gap-4 ${n.is_read ? 'bg-[var(--bg-secondary)] border-[var(--border)] opacity-60' : 'bg-[var(--bg-elevated)] border-[var(--accent-anime)] shadow-sm shadow-[var(--accent-anime)]/10'}`}
                    >
                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-md flex items-center justify-center shrink-0 ${n.type === 'order' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                            {n.type === 'order' ? <FaCheck className="text-xs md:text-sm" /> : <FaBell className="text-xs md:text-sm" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1 gap-2">
                                <h3 className="font-black text-[var(--text-primary)] uppercase text-[10px] md:text-xs tracking-tight truncate">{n.title}</h3>
                                <span className="text-[8px] md:text-[9px] uppercase font-black tracking-widest text-[var(--text-muted)] shrink-0">{new Date(n.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-[10px] md:text-[11px] text-[var(--text-secondary)] font-medium leading-relaxed">{n.message}</p>
                            {!n.is_read && (
                                <button
                                    onClick={() => markAsRead(n.id)}
                                    className="mt-2 text-[8px] font-black uppercase tracking-widest text-[var(--accent-anime)] hover:underline"
                                >
                                    Acknowledge Transmission
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => deleteNotification(n.id)}
                            className="w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:text-red-500 transition-colors"
                        >
                            <FaTrash size={10} />
                        </button>
                    </div>
                )) : (
                    <div className="text-center py-12 md:py-20 bg-[var(--bg-secondary)] rounded-lg border border-dashed border-[var(--border)]">
                        <FaBell className="mx-auto mb-3 md:mb-4 text-[var(--text-muted)]/20 text-2xl md:text-4xl" />
                        <p className="font-black uppercase tracking-widest text-[8px] md:text-[9px] text-[var(--text-muted)]">No Signal Detected</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreatorNotifications;
