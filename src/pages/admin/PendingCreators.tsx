import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FaUserCheck, FaUserTimes, FaEnvelope, FaClock } from 'react-icons/fa';

const PendingCreators: React.FC = () => {
    const [creators, setCreators] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPending = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'creator_pending');
        if (data) setCreators(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleApproval = async (id: string, approve: boolean) => {
        const { error } = await supabase
            .from('profiles')
            .update({ role: approve ? 'creator' : 'user' })
            .eq('id', id);

        if (!error) {
            alert(`Creator ${approve ? 'approved' : 'rejected'}`);
            fetchPending();
        }
    };

    if (loading) return <div className="p-10 text-center animate-pulse font-black text-sm text-[var(--text-muted)] uppercase tracking-widest">Scanning Transmissions...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-xl md:text-2xl font-black tracking-tighter text-[var(--text-primary)] uppercase">Creator Vanguard</h1>
                <p className="text-[var(--text-muted)] font-bold tracking-widest uppercase text-[9px] flex items-center gap-2">
                    <FaUserCheck className="text-[var(--accent-secondary)]" /> Verify & Authorize New Creators
                </p>
            </div>

            {creators.length === 0 ? (
                <div className="border border-dashed border-[var(--border)] rounded-lg p-10 text-center bg-[var(--bg-secondary)]">
                    <p className="font-bold uppercase tracking-widest text-[10px] text-[var(--text-muted)]">No pending applications</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {creators.map((creator) => (
                        <div key={creator.id} className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4 group hover:border-[var(--accent-primary)] transition-all duration-200">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="w-12 h-12 rounded-lg overflow-hidden border border-[var(--border)] shadow-sm shrink-0">
                                    <img
                                        src={creator.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.id}`}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-tight text-[var(--text-primary)]">{creator.full_name}</h3>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                                        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                                            <FaEnvelope className="text-[var(--accent-primary)]" /> {creator.username}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                                            <FaClock className="text-[var(--accent-secondary)]" /> Applied Recently
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                                <button
                                    onClick={() => handleApproval(creator.id, true)}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-1.5 rounded bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary)]/90 transition-colors text-[10px] font-black uppercase tracking-widest shadow-sm"
                                >
                                    <FaUserCheck size={10} /> AUTHORIZE
                                </button>
                                <button
                                    onClick={() => handleApproval(creator.id, false)}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-1.5 rounded bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all text-[10px] font-black uppercase tracking-widest"
                                >
                                    <FaUserTimes size={10} /> REJECT
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PendingCreators;
