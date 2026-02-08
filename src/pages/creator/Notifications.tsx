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
            <h1 className="text-5xl font-black uppercase tracking-tighter text-primary-black mb-10">Alert Feed</h1>

            <div className="space-y-4">
                {notifications.length > 0 ? notifications.map((n) => (
                    <div
                        key={n.id}
                        className={`p-6 rounded-[32px] border transition-all flex gap-6 ${n.is_read ? 'bg-primary-white border-bg-light opacity-60' : 'bg-primary-white border-accent-anime shadow-lg shadow-accent-anime/5'}`}
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${n.type === 'order' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                            {n.type === 'order' ? <FaCheck /> : <FaBell />}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-black text-primary-black uppercase text-sm tracking-tight">{n.title}</h3>
                                <span className="text-[10px] uppercase font-black tracking-widest text-primary-dark-gray/30">{new Date(n.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-primary-dark-gray/60 font-medium leading-relaxed">{n.message}</p>
                            {!n.is_read && (
                                <button
                                    onClick={() => markAsRead(n.id)}
                                    className="mt-4 text-[9px] font-black uppercase tracking-widest text-accent-anime hover:underline"
                                >
                                    Acknowledge Transmission
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => deleteNotification(n.id)}
                            className="w-10 h-10 flex items-center justify-center text-primary-dark-gray/20 hover:text-red-500 transition-colors"
                        >
                            <FaTrash size={12} />
                        </button>
                    </div>
                )) : (
                    <div className="text-center py-40 bg-bg-light/30 rounded-[50px] border-2 border-dashed border-bg-light">
                        <FaBell size={40} className="mx-auto mb-6 text-primary-dark-gray/10" />
                        <p className="font-black uppercase tracking-widest text-[10px] text-primary-dark-gray/40">No Signal Detected</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreatorNotifications;
