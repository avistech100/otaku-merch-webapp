import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FaShoppingBag, FaSearch, FaExternalLinkAlt, FaShippingFast, FaCheckCircle, FaClock } from 'react-icons/fa';
import DataTable, { type Column } from '../../components/shared/DataTable';
import { useNavigate } from 'react-router-dom';

interface Order {
    id: string;
    user_id: string;
    total_amount: number;
    status: string;
    created_at: string;
    profiles: {
        display_name: string;
        username: string;
    };
}

const Orders: React.FC = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, [filterStatus]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('orders')
                .select('*, profiles(display_name, username)')
                .order('created_at', { ascending: false });

            if (filterStatus !== 'all') {
                query = query.eq('status', filterStatus);
            }

            const { data, error } = await query;
            if (error) throw error;
            if (data) setOrders(data as any);
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status: string) => {
        const styles: Record<string, string> = {
            'pending': 'bg-yellow-500/10 text-yellow-500',
            'processing': 'bg-blue-500/10 text-blue-500',
            'shipped': 'bg-purple-500/10 text-purple-500',
            'delivered': 'bg-green-500/10 text-green-500',
            'cancelled': 'bg-red-500/10 text-red-500'
        };
        return styles[status] || 'bg-white/5 text-white/40';
    };

    const columns: Column<Order>[] = [
        {
            header: 'Transmission ID',
            accessor: (row) => (
                <span className="font-black text-[10px] text-[var(--text-primary)] uppercase tracking-widest font-mono">
                    #{row.id.slice(0, 8)}
                </span>
            )
        },
        {
            header: 'Ensign (User)',
            accessor: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-[var(--text-primary)] text-xs">{row.profiles?.display_name || row.profiles?.username}</span>
                    <span className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest opacity-70">@{row.profiles?.username}</span>
                </div>
            )
        },
        {
            header: 'Amount',
            accessor: (row) => (
                <span className="font-black text-[var(--accent-secondary)] text-xs">
                    ${row.total_amount.toFixed(2)}
                </span>
            )
        },
        {
            header: 'Status',
            accessor: (row) => (
                <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border border-transparent ${getStatusStyle(row.status)}`}>
                    {row.status}
                </span>
            )
        },
        {
            header: 'Time',
            accessor: (row) => (
                <span className="text-[10px] text-[var(--text-muted)] font-medium">
                    {new Date(row.created_at).toLocaleString()}
                </span>
            )
        },
        {
            header: 'Operations',
            accessor: (row) => (
                <button
                    onClick={() => navigate(`/admin/orders/${row.id}`)}
                    className="p-1.5 hover:bg-[var(--bg-elevated)] rounded-md transition-all text-[var(--text-muted)] hover:text-[var(--text-main)]"
                >
                    <FaExternalLinkAlt size={10} />
                </button>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-black tracking-tighter text-[var(--text-primary)] mb-1 uppercase">Order Intelligence</h1>
                    <p className="text-[var(--text-muted)] font-bold tracking-widest uppercase text-[9px] flex items-center gap-2">
                        <FaShoppingBag className="text-[var(--accent-primary)]" /> Platform Transaction Stream
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative group">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent-primary)] transition-colors text-xs" />
                        <input
                            type="text"
                            placeholder="Find Order..."
                            className="h-9 w-48 bg-[var(--bg-secondary)] rounded-md pl-9 pr-3 border border-[var(--border)] focus:border-[var(--accent-primary)] outline-none transition-all text-xs font-medium text-[var(--text-primary)] placeholder-[var(--text-muted)]"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="h-9 bg-[var(--bg-secondary)] rounded-md px-3 border border-[var(--border)] focus:border-[var(--accent-primary)] outline-none text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] appearance-none cursor-pointer hover:bg-[var(--bg-elevated)] transition-all"
                    >
                        <option value="all">Global (All)</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Active Transmissions', value: orders.filter(o => ['pending', 'processing'].includes(o.status)).length, icon: FaClock, color: 'text-yellow-500' },
                    { label: 'In Transit', value: orders.filter(o => o.status === 'shipped').length, icon: FaShippingFast, color: 'text-[var(--accent-secondary)]' },
                    { label: 'Completed Orders', value: orders.filter(o => o.status === 'delivered').length, icon: FaCheckCircle, color: 'text-green-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-[var(--bg-secondary)] border border-[var(--border)] p-4 rounded-lg flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-md bg-[var(--bg-elevated)] flex items-center justify-center ${stat.color}`}>
                            <stat.icon className="text-sm" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-70 mb-0.5">{stat.label}</p>
                            <p className="text-xl font-black text-[var(--text-primary)]">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <section className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg shadow-sm overflow-hidden">
                <DataTable
                    columns={columns}
                    data={orders}
                    isLoading={loading}
                />
            </section>
        </div>
    );
};

export default Orders;
