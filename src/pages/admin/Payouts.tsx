import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FaWallet, FaCheck, FaTimes, FaUser, FaHistory } from 'react-icons/fa';
import DataTable, { type Column } from '../../components/shared/DataTable';

interface PayoutRequest {
    id: string;
    creator_id: string;
    amount: number;
    status: string;
    created_at: string;
    profiles: {
        display_name: string;
        username: string;
        wallet_balance: number;
    };
}

const Payouts: React.FC = () => {
    const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayouts();
    }, []);

    const fetchPayouts = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('payout_requests')
                .select('*, profiles(display_name, username, wallet_balance)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setPayouts(data as any);
        } catch (err) {
            console.error('Error fetching payouts:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePayoutAction = async (payout: PayoutRequest, approve: boolean) => {
        try {
            // In a real app, this would be a database function/transaction
            // 1. Update payout request status
            const { error: payoutError } = await supabase
                .from('payout_requests')
                .update({
                    status: approve ? 'completed' : 'rejected',
                    processed_at: new Date().toISOString()
                })
                .eq('id', payout.id);

            if (payoutError) throw payoutError;

            // 2. If approved, deduct from creator balance
            if (approve) {
                const { error: balanceError } = await supabase.rpc('deduct_balance', {
                    user_id: payout.creator_id,
                    amount: payout.amount
                });
                if (balanceError) throw balanceError;
            }

            fetchPayouts();
        } catch (err) {
            console.error('Payout processing error:', err);
            alert('Failed to process payout. Check system logs.');
        }
    };

    const columns: Column<PayoutRequest>[] = [
        {
            header: 'Creator',
            accessor: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                        <FaUser />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-white text-sm">{row.profiles?.display_name || row.profiles?.username}</span>
                        <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">@{row.profiles?.username}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Amount Requested',
            accessor: (row) => (
                <span className="font-black text-white text-lg">
                    ${row.amount.toFixed(2)}
                </span>
            )
        },
        {
            header: 'Current Balance',
            accessor: (row) => (
                <span className="text-xs font-bold text-white/40">
                    Total: ${row.profiles?.wallet_balance?.toFixed(2) || '0.00'}
                </span>
            )
        },
        {
            header: 'Status',
            accessor: (row) => (
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${row.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                    row.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                        'bg-yellow-500/10 text-yellow-500'
                    }`}>
                    {row.status}
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: (row) => (
                row.status === 'pending' ? (
                    <div className="flex gap-2">
                        <button
                            onClick={() => handlePayoutAction(row, true)}
                            className="p-2 bg-white text-black rounded-lg hover:bg-purple-500 hover:text-white transition-all shadow-lg"
                        >
                            <FaCheck size={12} />
                        </button>
                        <button
                            onClick={() => handlePayoutAction(row, false)}
                            className="p-2 bg-white/5 text-white/40 rounded-lg hover:text-red-500 hover:border-red-500/30 border border-white/5 transition-all"
                        >
                            <FaTimes size={12} />
                        </button>
                    </div>
                ) : (
                    <span className="text-[10px] font-black text-white/20 uppercase">No Action Required</span>
                )
            )
        }
    ];

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter text-white mb-2 uppercase">Finance Hub</h1>
                    <p className="text-white/40 font-bold tracking-widest uppercase text-xs flex items-center gap-2">
                        <FaWallet className="text-purple-500" /> Payout Approvals • Managing Platform Liquidity
                    </p>
                </div>
                <div className="flex gap-4">
                    <button className="h-14 px-8 rounded-2xl bg-white/5 border border-white/5 text-white/60 font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3">
                        <FaHistory /> Transaction History
                    </button>
                </div>
            </div>

            {/* Balances Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Pending Payouts', value: `$${payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0).toFixed(2)}`, color: 'text-yellow-500' },
                    { label: 'Authorized Today', value: '$8,450.00', color: 'text-purple-500' },
                    { label: 'Total Platform Payouts', value: '$142,800.00', color: 'text-green-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white/5 border border-white/5 p-8 rounded-[32px] overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-purple-500/10 transition-colors" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">{stat.label}</p>
                        <p className={`text-4xl font-black ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            <section className="bg-white/5 border border-white/5 p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
                <DataTable
                    columns={columns}
                    data={payouts}
                    isLoading={loading}
                />
            </section>
        </div>
    );
};

export default Payouts;
