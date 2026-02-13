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
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-xl md:text-2xl font-black tracking-tighter text-[var(--text-primary)] uppercase">Command Console</h1>
                <p className="text-[var(--text-muted)] font-bold tracking-widest uppercase text-[9px] flex items-center gap-2">
                    <FaShieldAlt className="text-[var(--accent-primary)]" /> Secure Admin Link • System Operational
                </p>
            </div>

            {/* Platform Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Platform Users', value: stats.totalUsers, icon: FaUsers, sub: '+12% this month', trend: 'up' },
                    { label: 'Seller Verifications', value: stats.pendingSellers, icon: FaStore, sub: 'Needs Attention', trend: 'warning' },
                    { label: 'Product Moderation', value: stats.pendingProducts, icon: FaBox, sub: 'Pending Review', trend: 'warning' },
                    { label: 'Gross Merchandise Value', value: `$${stats.totalRevenue.toLocaleString()}`, icon: FaShoppingBag, sub: '+24% growth', trend: 'up' },
                ].map((stat, i) => (
                    <div key={i} className="bg-[var(--bg-secondary)] border border-[var(--border)] p-4 rounded-lg hover:border-[var(--accent-primary)]/30 transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                            <stat.icon className="text-4xl" />
                        </div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-8 h-8 rounded-md bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--accent-primary)]">
                                <stat.icon className="text-sm" />
                            </div>
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${stat.trend === 'up' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                                }`}>
                                {stat.trend === 'up' ? <FaArrowUp className="inline mr-1" /> : <FaCircle className="inline mr-1 text-[4px]" />}
                                {stat.trend === 'up' ? 'Optimal' : 'Action Required'}
                            </span>
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-0.5">{stat.label}</p>
                        <p className="text-xl font-black text-[var(--text-primary)]">{stat.value}</p>
                        <p className="text-[10px] text-[var(--text-secondary)] mt-1 font-medium opacity-60">{stat.sub}</p>
                    </div>
                ))}
            </div>

            {/* Visual Analytics Hub */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Growth */}
                <div className="lg:col-span-2 bg-[var(--bg-secondary)] border border-[var(--border)] p-5 rounded-lg shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-base font-black uppercase tracking-tight text-[var(--text-primary)]">Revenue Trajectory</h3>
                        <div className="flex gap-2">
                            <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)]" />
                            <span className="w-2 h-2 rounded-full bg-[var(--bg-elevated)]" />
                        </div>
                    </div>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="adminRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'var(--text-muted)', fontWeight: 'bold' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'var(--text-muted)', fontWeight: 'bold' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--bg-elevated)', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px' }}
                                    itemStyle={{ color: 'var(--accent-primary)' }}
                                    labelStyle={{ color: 'var(--text-muted)' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="var(--accent-primary)" strokeWidth={2} fillOpacity={1} fill="url(#adminRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Categories */}
                <div className="bg-[var(--bg-secondary)] border border-[var(--border)] p-5 rounded-lg shadow-sm">
                    <h3 className="text-base font-black uppercase tracking-tight mb-6 text-[var(--text-primary)]">Market Share</h3>
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={distributionData}
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={4}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {distributionData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--bg-elevated)', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px' }}
                                    itemStyle={{ color: 'var(--text-primary)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-3 mt-4">
                        {distributionData.map((d, i) => (
                            <div key={i} className="flex items-center justify-between group">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                                    <span className="text-[9px] font-bold text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors uppercase tracking-widest">{d.name}</span>
                                </div>
                                <span className="text-xs font-black text-[var(--text-primary)]">{d.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
