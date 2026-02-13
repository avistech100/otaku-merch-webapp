import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { FaWallet, FaShoppingBag, FaBoxOpen, FaChartLine, FaArrowUp, FaFire, FaPlus } from 'react-icons/fa';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useNavigate } from 'react-router-dom';

const CreatorDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalSales: 0,
        activeOrders: 0,
        totalProducts: 0,
        views: 0,
        conversionRate: 2.4
    });
    const [loading, setLoading] = useState(true);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return;

            try {
                // 1. Fetch Products count
                const { count: productsCount } = await supabase
                    .from('products')
                    .select('*', { count: 'exact', head: true })
                    .eq('creator_id', user.id);

                // 2. Fetch Active Orders
                const { data: orderItems } = await supabase
                    .from('order_items')
                    .select(`
                        id,
                        creator_earnings,
                        created_at,
                        product_title,
                        orders!inner (
                            id,
                            status,
                            shipping_address
                        )
                    `)
                    .eq('creator_id', user.id)
                    .order('created_at', { ascending: false });

                if (orderItems) {
                    const totalRev = orderItems.reduce((sum, s) => sum + s.creator_earnings, 0);
                    const activeCount = orderItems.filter((i: any) => ['pending', 'processing'].includes(i.orders.status)).length;

                    setStats(prev => ({
                        ...prev,
                        totalSales: totalRev,
                        activeOrders: activeCount,
                        totalProducts: productsCount || 0,
                    }));

                    setRecentOrders(orderItems.slice(0, 5));
                }
            } catch (err) {
                console.error('Error fetching dashboard stats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user]);

    const chartData = [
        { name: '01 Jan', sales: 400 },
        { name: '05 Jan', sales: 300 },
        { name: '10 Jan', sales: 600 },
        { name: '15 Jan', sales: 200 },
        { name: '20 Jan', sales: 900 },
        { name: '25 Jan', sales: 1200 },
        { name: '30 Jan', sales: 800 },
    ];

    if (loading) return <div className="h-screen flex items-center justify-center font-black animate-pulse text-4xl">SYNCING COMMAND CENTER...</div>;

    const cards = [
        { title: 'Net Earnings', value: `$${stats.totalSales.toFixed(2)}`, icon: FaWallet, color: 'text-accent-crypto', bg: 'bg-accent-crypto/10' },
        { title: 'Active Deployments', value: stats.activeOrders, icon: FaShoppingBag, color: 'text-accent-anime', bg: 'bg-accent-anime/10' },
        { title: 'Asset Inventory', value: stats.totalProducts, icon: FaBoxOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { title: 'Conv. Frequency', value: `${stats.conversionRate}%`, icon: FaChartLine, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    ];

    return (
        <div className="space-y-10 animate-fadeIn pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="flex-1">
                    <h1 className="text-xl md:text-3xl font-black uppercase tracking-tighter text-[var(--text-primary)] mb-1">Command Center</h1>
                    <p className="text-[var(--text-muted)] font-medium uppercase tracking-[0.2em] text-[9px] md:text-[10px]">Vanguard Protocol Active. Welcome back, Pilot.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => navigate('/creator/products/new')} className="w-full sm:w-auto bg-[var(--accent-primary)] text-white px-5 md:px-6 py-2.5 md:py-3 rounded-md font-black uppercase tracking-widest text-[9px] md:text-[10px] flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all">
                        <FaPlus /> <span className="whitespace-nowrap">Initialize Drop</span>
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {cards.map((card, i) => (
                    <div key={i} className="bg-[var(--bg-secondary)] p-4 md:p-5 rounded-lg border border-[var(--border)] group hover:border-[var(--accent-primary)]/30 transition-all duration-300">
                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-md ${card.bg} ${card.color} flex items-center justify-center mb-3 md:mb-4 border border-white/5`}>
                            <card.icon size={14} />
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">{card.title}</p>
                        <p className="text-xl md:text-2xl lg:text-3xl font-black text-[var(--text-primary)] tracking-tighter">{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Main Dashboard Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Visualization */}
                <div className="lg:col-span-2 bg-[var(--bg-secondary)] p-4 md:p-6 rounded-lg border border-[var(--border)]">
                    <div className="flex items-center justify-between mb-6 md:mb-8">
                        <div>
                            <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-[var(--text-primary)]">Income Trajectory</h3>
                            <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Operational Log: 30D</p>
                        </div>
                        <div className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-[#10B981]/10 text-[#10B981] rounded-lg border border-[#10B981]/20">
                            <FaArrowUp size={8} />
                            <span className="text-[9px] md:text-[10px] font-black">+12.5%</span>
                        </div>
                    </div>
                    <div className="h-[250px] md:h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272A" />
                                <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 'bold', fill: '#A1A1AA' }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis tick={{ fontSize: 9, fontWeight: 'bold', fill: '#A1A1AA' }} axisLine={false} tickLine={false} dx={-10} tickFormatter={(val) => `$${val}`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '6px', border: '1px solid #27272A', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', background: '#18181B', color: '#FAFAFA', fontSize: '11px' }}
                                    itemStyle={{ color: '#3B82F6' }}
                                    cursor={{ stroke: '#3B82F6', strokeWidth: 1 }}
                                />
                                <Area type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Panel - Recent Activity & Top Creators */}
                <div className="space-y-4 md:space-y-6">
                    <div className="bg-[var(--bg-secondary)] p-4 md:p-6 rounded-lg border border-[var(--border)] h-full">
                        <div className="flex items-center justify-between mb-4 md:mb-6">
                            <h3 className="text-base md:text-lg font-black uppercase tracking-tight text-[var(--text-primary)] flex items-center gap-2">
                                <FaFire className="text-[var(--accent-secondary)]" /> Recent Logic
                            </h3>
                            <button className="text-[9px] font-black uppercase tracking-widest text-[var(--accent-primary)] hover:underline" onClick={() => navigate('/creator/orders')}>View All</button>
                        </div>
                        <div className="space-y-6">
                            {recentOrders.length > 0 ? recentOrders.map((order, i) => (
                                <div key={i} className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate(`/creator/orders/${order.orders.id}`)}>
                                    <div className="w-10 h-10 rounded bg-[var(--bg-elevated)] flex items-center justify-center text-[9px] font-black shrink-0 border border-[var(--border)] group-hover:border-[var(--accent-primary)]/50 transition-all text-[var(--text-muted)]">
                                        ORD
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="font-extrabold text-xs text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors truncate uppercase tracking-tight">#{order.orders.id.slice(0, 8)} - {order.product_title}</p>
                                        <p className="text-[9px] text-[var(--text-muted)] uppercase font-black tracking-widest">{new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <span className="text-[#10B981] font-black text-xs shrink-0">+${order.creator_earnings.toFixed(2)}</span>
                                </div>
                            )) : (
                                <div className="text-center py-10">
                                    <p className="text-[var(--text-muted)] font-black uppercase text-[9px] tracking-widest">No Transmissions Recorded</p>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => navigate('/creator/analytics')}
                            className="w-full mt-6 py-3 rounded bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] font-black text-[9px] uppercase tracking-widest hover:border-[var(--accent-primary)]/50 hover:bg-[var(--accent-primary)]/5 transition-all"
                        >
                            Intelligence Report
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default CreatorDashboard;
