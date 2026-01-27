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
        <div className="layout-container py-12 animate-fadeIn">
            <h1 className="text-5xl font-black mb-4 tracking-tighter uppercase text-primary-black">Creator Vanguard</h1>
            <p className="text-primary-dark-gray/60 font-medium mb-12 uppercase tracking-[0.3em] text-xs">Verify & Authorize New Creators</p>

            {creators.length === 0 ? (
                <div className="bg-bg-light/30 border-2 border-dashed border-bg-light rounded-[40px] p-20 text-center">
                    <p className="font-black text-primary-dark-gray/20 uppercase tracking-widest">No pending applications</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {creators.map((creator) => (
                        <div key={creator.id} className="bg-primary-white border border-bg-light p-8 rounded-[40px] shadow-xl shadow-black/5 flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-accent-anime transition-all duration-500">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary-black/10 shadow-lg group-hover:scale-110 transition-transform duration-500">
                                    <img src={creator.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.id}`} alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-primary-black uppercase tracking-tighter">{creator.full_name}</h3>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-primary-dark-gray/40 uppercase tracking-widest">
                                            <FaEnvelope className="text-accent-crypto" /> {creator.username}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-primary-dark-gray/40 uppercase tracking-widest">
                                            <FaClock className="text-accent-anime" /> Applied Recently
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 w-full md:w-auto">
                                <button
                                    onClick={() => handleApproval(creator.id, true)}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-primary-black text-primary-white px-8 py-4 rounded-full font-black uppercase text-xs tracking-widest hover:bg-accent-crypto transition-all shadow-lg"
                                >
                                    <FaUserCheck /> AUTHORIZE
                                </button>
                                <button
                                    onClick={() => handleApproval(creator.id, false)}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-3 border-2 border-bg-light text-primary-dark-gray hover:text-accent-anime hover:border-accent-anime px-8 py-4 rounded-full font-black uppercase text-xs tracking-widest transition-all"
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
