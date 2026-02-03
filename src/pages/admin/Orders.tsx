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
                <span className="font-black text-xs text-white uppercase tracking-widest">
                    #{row.id.slice(0, 8)}
                </span>
            )
        },
        {
            header: 'Ensign (User)',
            accessor: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-white text-sm">{row.profiles?.display_name || row.profiles?.username}</span>
                    <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">{row.profiles?.username}</span>
                </div>
            )
        },
        {
            header: 'Amount',
            accessor: (row) => (
                <span className="font-black text-purple-500">
                    ${row.total_amount.toFixed(2)}
                </span>
            )
        },
        {
            header: 'Status',
            accessor: (row) => (
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getStatusStyle(row.status)}`}>
                    {row.status}
                </span>
            )
        },
        {
            header: 'Time',
            accessor: (row) => (
                <span className="text-xs text-white/40 font-medium">
                    {new Date(row.created_at).toLocaleString()}
                </span>
            )
        },
        {
            header: 'Operations',
            accessor: (row) => (
                <button
                    onClick={() => navigate(`/admin/orders/${row.id}`)}
                    className="p-2 hover:bg-white/5 rounded-lg transition-all text-white/20 hover:text-white"
                >
                    <FaExternalLinkAlt size={12} />
                </button>
            )
        }
    ];

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter text-white mb-2 uppercase">Order Intelligence</h1>
                    <p className="text-white/40 font-bold tracking-widest uppercase text-xs flex items-center gap-2">
                        <FaShoppingBag className="text-purple-500" /> Platform Transaction Stream • Tracking Global Sales
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-purple-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Find Order..."
                            className="h-12 w-64 bg-white/5 rounded-xl pl-12 pr-6 border border-white/5 focus:border-purple-500 outline-none transition-all text-sm font-medium"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="h-12 bg-white/5 rounded-xl px-6 border border-white/5 focus:border-purple-500 outline-none text-xs font-black uppercase tracking-widest text-white/60 appearance-none cursor-pointer hover:bg-white/10 transition-all"
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Active Transmissions', value: orders.filter(o => ['pending', 'processing'].includes(o.status)).length, icon: FaClock, color: 'text-yellow-500' },
                    { label: 'In Transit', value: orders.filter(o => o.status === 'shipped').length, icon: FaShippingFast, color: 'text-purple-500' },
                    { label: 'Completed Orders', value: orders.filter(o => o.status === 'delivered').length, icon: FaCheckCircle, color: 'text-green-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-[30px] flex items-center gap-6">
                        <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${stat.color}`}>
                            <stat.icon />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{stat.label}</p>
                            <p className="text-2xl font-black text-white">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <section className="bg-white/5 border border-white/5 p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
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
