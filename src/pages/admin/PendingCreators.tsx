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

    if (loading) return <div className="layout-container py-20 text-center animate-pulse font-black text-2xl uppercase">Scanning Transmissions...</div>;

    return (
        <div className="animate-fadeIn space-y-10">
            <div>
                <h1 className="text-5xl font-black mb-2 tracking-tighter uppercase" style={{ color: 'var(--text-primary)' }}>Creator Vanguard</h1>
                <p className="font-medium uppercase tracking-[0.3em] text-xs flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                    <FaUserCheck className="text-accent-secondary" /> Verify & Authorize New Creators
                </p>
            </div>

            {creators.length === 0 ? (
                <div className="admin-card border-2 border-dashed border-border p-20 text-center">
                    <p className="font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>No pending applications</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {creators.map((creator) => (
                        <div key={creator.id} className="admin-card flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-accent-primary transition-all duration-500">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-xl overflow-hidden border border-border shadow-lg group-hover:scale-105 transition-transform duration-500">
                                    <img src={creator.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.id}`} alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter" style={{ color: 'var(--text-primary)' }}>{creator.full_name}</h3>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                                            <FaEnvelope className="text-accent-primary" /> {creator.username}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                                            <FaClock className="text-accent-secondary" /> Applied Recently
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 w-full md:w-auto">
                                <button
                                    onClick={() => handleApproval(creator.id, true)}
                                    className="admin-btn admin-btn-primary flex-1 md:flex-none uppercase text-xs tracking-widest shadow-lg"
                                >
                                    <FaUserCheck /> AUTHORIZE
                                </button>
                                <button
                                    onClick={() => handleApproval(creator.id, false)}
                                    className="admin-btn admin-btn-secondary flex-1 md:flex-none uppercase text-xs tracking-widest hover:text-error hover:border-error"
                                >
                                    <FaUserTimes /> REJECT
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
