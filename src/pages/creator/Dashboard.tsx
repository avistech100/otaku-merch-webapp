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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black uppercase tracking-tighter text-[#FAFAFA] mb-2">Command Center</h1>
                    <p className="text-[#A1A1AA] font-medium uppercase tracking-[0.2em] text-xs">Vanguard Protocol Active. Welcome back, Pilot.</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => navigate('/creator/products/new')} className="bg-[#3B82F6] text-white px-8 py-4 rounded-lg font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:bg-[#3B82F6]/90 transition-all">
                        <FaPlus /> Initialize Drop
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {cards.map((card, i) => (
                    <div key={i} className="bg-[#121215] p-8 rounded-xl border border-[#27272A] group hover:border-[#3B82F6]/30 transition-all duration-300">
                        <div className={`w-12 h-12 rounded-lg ${card.bg} ${card.color} flex items-center justify-center mb-6 border border-white/5`}>
                            <card.icon size={18} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#71717A] mb-1">{card.title}</p>
                        <p className="text-4xl font-black text-[#FAFAFA] tracking-tighter">{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Main Dashboard Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Revenue Visualization */}
                <div className="lg:col-span-2 bg-[#121215] p-10 rounded-xl border border-[#27272A]">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-2xl font-black uppercase tracking-tight text-[#FAFAFA]">Income Trajectory</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#71717A]">Last 30 Days of Operational Data</p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-[#10B981]/10 text-[#10B981] rounded-lg border border-[#10B981]/20">
                            <FaArrowUp size={10} />
                            <span className="text-[10px] font-black">+12.5%</span>
                        </div>
                    </div>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272A" />
                                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 'bold', fill: '#71717A' }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis tick={{ fontSize: 10, fontWeight: 'bold', fill: '#71717A' }} axisLine={false} tickLine={false} dx={-10} tickFormatter={(val) => `$${val}`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #27272A', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', background: '#18181B', color: '#FAFAFA' }}
                                    itemStyle={{ color: '#3B82F6' }}
                                    cursor={{ stroke: '#3B82F6', strokeWidth: 1 }}
                                />
                                <Area type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Panel - Recent Activity & Top Creators */}
                <div className="space-y-10">
                    <div className="bg-[#121215] p-10 rounded-xl border border-[#27272A] h-full">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black uppercase tracking-tight text-[#FAFAFA] flex items-center gap-3">
                                <FaFire className="text-[#A855F7]" /> Recent Logic
                            </h3>
                            <button className="text-[10px] font-black uppercase tracking-widest text-[#3B82F6] hover:underline" onClick={() => navigate('/creator/orders')}>View All</button>
                        </div>
                        <div className="space-y-8">
                            {recentOrders.length > 0 ? recentOrders.map((order, i) => (
                                <div key={i} className="flex items-center gap-5 group cursor-pointer" onClick={() => navigate(`/creator/orders/${order.orders.id}`)}>
                                    <div className="w-12 h-12 rounded-lg bg-[#18181B] flex items-center justify-center text-[10px] font-black shrink-0 border border-[#27272A] group-hover:border-[#3B82F6]/50 transition-all text-[#71717A]">
                                        ORD
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="font-extrabold text-sm text-[#FAFAFA] group-hover:text-[#3B82F6] transition-colors truncate uppercase tracking-tight">#{order.orders.id.slice(0, 8)} - {order.product_title}</p>
                                        <p className="text-[9px] text-[#71717A] uppercase font-black tracking-widest">{new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <span className="text-[#10B981] font-black text-sm shrink-0">+${order.creator_earnings.toFixed(2)}</span>
                                </div>
                            )) : (
                                <div className="text-center py-20">
                                    <p className="text-[#71717A] font-black uppercase text-[10px] tracking-widest">No Transmissions Recorded</p>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => navigate('/creator/analytics')}
                            className="w-full mt-10 py-5 rounded-lg bg-[#18181B] border border-[#27272A] text-[#FAFAFA] font-black text-[10px] uppercase tracking-widest hover:border-[#3B82F6]/50 hover:bg-[#3B82F6]/5 transition-all"
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
