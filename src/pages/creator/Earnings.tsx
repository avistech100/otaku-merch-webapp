import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { FaWallet, FaArrowUp, FaHistory, FaLandmark, FaSpinner } from 'react-icons/fa';
import DataTable, { type Column } from '../../components/shared/DataTable';

interface Transaction {
    id: string;
    amount: number;
    type: 'sale' | 'payout';
    status: 'completed' | 'pending' | 'failed';
    created_at: string;
    description: string;
}

const Earnings: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        total_earnings: 0,
        available_balance: 0,
        pending_balance: 0
    });
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [requestingPayout, setRequestingPayout] = useState(false);

    useEffect(() => {
        if (user) {
            fetchEarningsData();
        }
    }, [user]);

    const fetchEarningsData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Profile for balances
            const { data: profile } = await supabase
                .from('profiles')
                .select('total_earnings, wallet_balance, pending_balance')
                .eq('id', user?.id)
                .single();

            if (profile) {
                setStats({
                    total_earnings: profile.total_earnings || 0,
                    available_balance: profile.wallet_balance || 0,
                    pending_balance: profile.pending_balance || 0
                });
            }

            // 2. Fetch Payouts (as transactions for now)
            const { data: payouts } = await supabase
                .from('payouts')
                .select('*')
                .eq('creator_id', user?.id)
                .order('created_at', { ascending: false });

            // 3. Fetch Order Items (as sales)
            const { data: sales } = await supabase
                .from('order_items')
                .select('id, creator_earnings, created_at, product_title')
                .eq('creator_id', user?.id)
                .order('created_at', { ascending: false });

            const combined: Transaction[] = [
                ...(payouts || []).map(p => ({
                    id: p.id,
                    amount: -p.amount,
                    type: 'payout' as const,
                    status: p.status,
                    created_at: p.created_at,
                    description: `Payout to ${p.payment_method}`
                })),
                ...(sales || []).map(s => ({
                    id: s.id,
                    amount: s.creator_earnings,
                    type: 'sale' as const,
                    status: 'completed' as const,
                    created_at: s.created_at,
                    description: `Sale: ${s.product_title}`
                }))
            ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            setTransactions(combined);
        } catch (err) {
            console.error('Error fetching earnings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePayoutRequest = async () => {
        if (stats.available_balance < 50) {
            alert('Minimum payout amount is $50.00');
            return;
        }

        setRequestingPayout(true);
        try {
            const { error } = await supabase.from('payouts').insert({
                creator_id: user?.id,
                amount: stats.available_balance,
                status: 'pending',
                payment_method: 'Bank Transfer', // Default for demo
                payment_details: { bank: 'Example Bank', account: '****1234' }
            });

            if (error) throw error;

            alert('Payout request submitted successfully!');
            fetchEarningsData();
        } catch (err) {
            alert('Failed to request payout');
            console.error(err);
        } finally {
            setRequestingPayout(false);
        }
    };

    const columns: Column<Transaction>[] = [
        {
            header: 'Date',
            accessor: (row) => new Date(row.created_at).toLocaleDateString()
        },
        {
            header: 'Description',
            accessor: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-primary-black">{row.description}</span>
                    <span className="text-[10px] uppercase font-black tracking-widest text-primary-dark-gray/40">{row.type}</span>
                </div>
            )
        },
        {
            header: 'Status',
            accessor: (row) => (
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${row.status === 'completed' ? 'bg-green-100 text-green-800' :
                    row.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                    }`}>
                    {row.status}
                </span>
            )
        },
        {
            header: 'Amount',
            accessor: (row) => (
                <span className={`font-black ${row.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {row.amount > 0 ? '+' : ''}{row.amount.toFixed(2)}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="flex-1">
                    <h1 className="text-xl md:text-3xl font-black uppercase tracking-tighter text-[var(--text-primary)] mb-1">Earnings</h1>
                    <p className="text-[var(--text-muted)] font-medium text-xs md:text-sm">Manage your wealth and payouts.</p>
                </div>
                <button
                    onClick={handlePayoutRequest}
                    disabled={requestingPayout || stats.available_balance < 50}
                    className="w-full sm:w-auto bg-[var(--accent-primary)] text-white px-5 md:px-6 py-2.5 md:py-3 rounded-md font-black uppercase tracking-widest text-[9px] md:text-[10px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:bg-blue-600 transition-all"
                >
                    {requestingPayout ? <FaSpinner className="animate-spin" /> : <FaArrowUp />}
                    Withdraw Funds
                </button>
            </div>

            {/* Balances Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-[var(--bg-secondary)] p-4 md:p-6 rounded-lg border border-[var(--border)] text-[var(--text-primary)] shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--accent-crypto)]/20 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-[var(--accent-crypto)]/30 transition-colors" />
                    <FaWallet className="text-xl md:text-2xl text-[var(--accent-crypto)] mb-4" />
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Available for Payout</p>
                    <p className="text-2xl md:text-3xl font-black tracking-tight">${stats.available_balance.toFixed(2)}</p>
                </div>

                <div className="bg-[var(--bg-secondary)] p-4 md:p-6 rounded-lg shadow-sm border border-[var(--border)]">
                    <FaHistory className="text-xl md:text-2xl text-[var(--accent-anime)] mb-4" />
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Pending Clearance</p>
                    <p className="text-2xl md:text-3xl font-black tracking-tight text-[var(--text-primary)]">${stats.pending_balance.toFixed(2)}</p>
                </div>

                <div className="bg-[var(--bg-secondary)] p-4 md:p-6 rounded-lg shadow-sm border border-[var(--border)] sm:col-span-2 lg:col-span-1">
                    <FaLandmark className="text-xl md:text-2xl text-[var(--accent-crypto)] mb-4" />
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Lifetime Earnings</p>
                    <p className="text-2xl md:text-3xl font-black tracking-tight text-[var(--text-primary)]">${stats.total_earnings.toFixed(2)}</p>
                </div>
            </div>

            {/* Transactions Section */}
            <section className="bg-[var(--bg-secondary)] p-4 md:p-6 rounded-lg shadow-sm border border-[var(--border)]">
                <h3 className="text-base md:text-lg font-black uppercase tracking-tight mb-4 md:mb-6 text-[var(--text-primary)]">Transaction History</h3>
                <DataTable
                    columns={columns}
                    data={transactions}
                    isLoading={loading}
                />
            </section>
        </div>
    );
};

export default Earnings;
