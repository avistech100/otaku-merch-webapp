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
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--accent-primary)]">
                        <FaUser size={10} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-[var(--text-primary)] text-xs">{row.profiles?.display_name || row.profiles?.username}</span>
                        <span className="text-[8px] text-[var(--text-muted)] font-black uppercase tracking-widest opacity-70">@{row.profiles?.username}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Amount Requested',
            accessor: (row) => (
                <span className="font-black text-[var(--text-primary)] text-sm">
                    ${row.amount.toFixed(2)}
                </span>
            )
        },
        {
            header: 'Current Balance',
            accessor: (row) => (
                <span className="text-[10px] font-bold text-[var(--text-muted)] opacity-80">
                    Total: ${row.profiles?.wallet_balance?.toFixed(2) || '0.00'}
                </span>
            )
        },
        {
            header: 'Status',
            accessor: (row) => (
                <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border border-transparent ${row.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                    row.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                    }`}>
                    {row.status}
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: (row) => (
                row.status === 'pending' ? (
                    <div className="flex gap-1">
                        <button
                            onClick={() => handlePayoutAction(row, true)}
                            className="p-1.5 bg-[var(--accent-primary)] text-white rounded-md hover:bg-[var(--accent-primary)]/90 transition-all shadow-sm"
                        >
                            <FaCheck size={10} />
                        </button>
                        <button
                            onClick={() => handlePayoutAction(row, false)}
                            className="p-1.5 bg-[var(--bg-elevated)] text-[var(--text-muted)] rounded-md hover:text-red-500 hover:bg-red-500/10 border border-[var(--border)] transition-all"
                        >
                            <FaTimes size={10} />
                        </button>
                    </div>
                ) : (
                    <span className="text-[8px] font-black text-[var(--text-muted)] uppercase opacity-50">No Action Required</span>
                )
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl md:text-2xl font-black tracking-tighter text-[var(--text-primary)] uppercase">Finance Hub</h1>
                    <p className="text-[var(--text-muted)] font-bold tracking-widest uppercase text-[9px] flex items-center gap-2">
                        <FaWallet className="text-[var(--accent-primary)]" /> Payout Approvals • Managing Platform Liquidity
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="h-9 px-4 rounded-md bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-muted)] font-black text-[10px] uppercase tracking-widest hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-all flex items-center gap-2">
                        <FaHistory /> Transaction History
                    </button>
                </div>
            </div>

            {/* Balances Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Pending Payouts', value: `$${payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0).toFixed(2)}`, color: 'text-yellow-500' },
                    { label: 'Authorized Today', value: '$8,450.00', color: 'text-[var(--accent-secondary)]' },
                    { label: 'Total Platform Payouts', value: '$142,800.00', color: 'text-[var(--text-primary)]' },
                ].map((stat, i) => (
                    <div key={i} className="bg-[var(--bg-secondary)] border border-[var(--border)] p-5 rounded-lg overflow-hidden relative group hover:border-[var(--accent-primary)]/30 transition-all">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-[var(--bg-elevated)] rounded-full blur-xl -mr-8 -mt-8 group-hover:bg-[var(--accent-primary)]/10 transition-colors" />
                        <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-70 mb-1">{stat.label}</p>
                        <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            <section className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg shadow-sm overflow-hidden">
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
