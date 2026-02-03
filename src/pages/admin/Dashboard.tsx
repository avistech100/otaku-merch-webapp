import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
    FaUsers, FaStore, FaBox, FaShoppingBag,
    FaShieldAlt, FaCircle, FaArrowUp
} from 'react-icons/fa';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        pendingSellers: 0,
        pendingProducts: 0,
        totalRevenue: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPlatformStats();
    }, []);

    const fetchPlatformStats = async () => {
        setLoading(true);
        try {
            // In a real app, these would be aggregated queries
            const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
            const { count: sellerCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'creator').eq('is_approved', false);
            const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_approved', false);

            setStats({
                totalUsers: userCount || 0,
                pendingSellers: sellerCount || 0,
                pendingProducts: productCount || 0,
                totalRevenue: 48500.00 // Mock
            });
        } catch (err) {
            console.error('Admin stats error:', err);
        } finally {
            setLoading(false);
        }
    };

    const chartData = [
        { name: 'Jan', value: 4000 },
        { name: 'Feb', value: 7500 },
        { name: 'Mar', value: 6000 },
        { name: 'Apr', value: 12000 },
        { name: 'May', value: 15000 },
        { name: 'Jun', value: 18500 },
    ];

    const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];
    const distributionData = [
        { name: 'Apparel', value: 45 },
        { name: 'Collectibles', value: 25 },
        { name: 'Accessories', value: 20 },
        { name: 'Digital', value: 10 },
    ];

    if (loading) return <div className="p-10 text-purple-500 font-black animate-pulse">SYNCHRONIZING PLATFORM DATA...</div>;

    return (
        <div className="space-y-10">
            {/* Page Header */}
            <div>
                <h1 className="text-5xl font-black tracking-tighter text-white mb-2 uppercase">Command Console</h1>
                <p className="text-white/40 font-bold tracking-widest uppercase text-xs flex items-center gap-2">
                    <FaShieldAlt className="text-purple-500" /> Secure Admin Link • System Operational
                </p>
            </div>

            {/* Platform Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Platform Users', value: stats.totalUsers, icon: FaUsers, sub: '+12% this month', trend: 'up' },
                    { label: 'Seller Verifications', value: stats.pendingSellers, icon: FaStore, sub: 'Needs Attention', trend: 'warning' },
                    { label: 'Product Moderation', value: stats.pendingProducts, icon: FaBox, sub: 'Pending Review', trend: 'warning' },
                    { label: 'Gross Merchandise Value', value: `$${stats.totalRevenue.toLocaleString()}`, icon: FaShoppingBag, sub: '+24% growth', trend: 'up' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white/5 border border-white/5 p-8 rounded-[32px] hover:border-purple-500/30 transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <stat.icon className="text-6xl" />
                        </div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                                <stat.icon />
                            </div>
                            <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${stat.trend === 'up' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                                }`}>
                                {stat.trend === 'up' ? <FaArrowUp className="inline mr-1" /> : <FaCircle className="inline mr-1 text-[6px]" />}
                                {stat.trend === 'up' ? 'Optimal' : 'Action Required'}
                            </span>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">{stat.label}</p>
                        <p className="text-3xl font-black text-white">{stat.value}</p>
                        <p className="text-xs text-white/20 mt-2 font-medium">{stat.sub}</p>
                    </div>
                ))}
            </div>

            {/* Visual Analytics Hub */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Growth */}
                <div className="lg:col-span-2 bg-[#09090B] border border-white/5 p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-xl font-black uppercase tracking-tight">Revenue Trajectory</h3>
                        <div className="flex gap-2">
                            <span className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                            <span className="w-3 h-3 rounded-full bg-white/5" />
                        </div>
                    </div>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="adminRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f1f23" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4b5563', fontWeight: 'bold' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4b5563', fontWeight: 'bold' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#09090B', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                                    itemStyle={{ color: '#8B5CF6' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={4} fillOpacity={1} fill="url(#adminRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Categories */}
                <div className="bg-[#09090B] border border-white/5 p-8 rounded-[40px]">
                    <h3 className="text-xl font-black uppercase tracking-tight mb-10">Market Share</h3>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={distributionData}
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {distributionData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#09090B', borderRadius: '16px', border: 'none' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-4 mt-8">
                        {distributionData.map((d, i) => (
                            <div key={i} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                                    <span className="text-xs font-bold text-white/40 group-hover:text-white transition-colors uppercase tracking-widest">{d.name}</span>
                                </div>
                                <span className="text-sm font-black text-white">{d.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
