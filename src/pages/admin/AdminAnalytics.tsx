import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FaChartLine, FaShoppingBag, FaDollarSign, FaUsers } from 'react-icons/fa';

const AdminAnalytics: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                // In a production app, this would call the admin-api edge function
                // For now, we'll fetch from Supabase tables directly for the demo
                const { data: orders } = await supabase
                    .from('orders')
                    .select('total, created_at')
                    .eq('payment_status', 'paid');

                const { count: totalCreators } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true })
                    .eq('role', 'creator');

                const totalRevenue = orders?.reduce((acc, curr) => acc + curr.total, 0) || 0;
                const totalOrders = orders?.length || 0;

                setStats({
                    totalRevenue,
                    totalOrders,
                    totalCreators: totalCreators || 0,
                    activeUsers: 142 // Placeholder
                });
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    const cards = [
        { title: 'Total Revenue', value: `$${stats?.totalRevenue?.toFixed(2) || '0.00'}`, icon: <FaDollarSign />, color: 'text-[var(--accent-secondary)]', bg: 'bg-[var(--accent-secondary)]', trend: '+12.5%' },
        { title: 'Orders', value: stats?.totalOrders || 0, icon: <FaShoppingBag />, color: 'text-[var(--accent-primary)]', bg: 'bg-[var(--accent-primary)]', trend: '+8.2%' },
        { title: 'Creators', value: stats?.totalCreators || 0, icon: <FaUsers />, color: 'text-[var(--text-primary)]', bg: 'bg-[var(--text-primary)]', trend: '+4.1%' },
        { title: 'Active Reach', value: stats?.activeUsers || 0, icon: <FaChartLine />, color: 'text-[var(--text-secondary)]', bg: 'bg-[var(--text-secondary)]', trend: '-2.4%' },
    ];

    if (loading) return <div className="p-10 text-center animate-pulse font-black text-sm text-[var(--text-muted)] uppercase tracking-widest">Loading Intelligence...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-xl md:text-2xl font-black tracking-tighter text-[var(--text-primary)] uppercase">Nexus Intelligence</h1>
                <p className="text-[var(--text-muted)] font-bold tracking-widest uppercase text-[9px]">Real-time Platform Analytics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card, i) => (
                    <div key={i} className="bg-[var(--bg-secondary)] border border-[var(--border)] p-4 rounded-lg shadow-sm hover:border-[var(--accent-primary)]/30 transition-all cursor-pointer group">
                        <div className="flex justify-between items-start mb-3">
                            <div className={`p-2 rounded-md bg-[var(--bg-elevated)] ${card.color} shadow-sm`}>
                                {React.cloneElement(card.icon as React.ReactElement, { className: 'text-sm' })}
                            </div>
                            <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full ${card.trend.startsWith('+') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                {card.trend}
                            </span>
                        </div>
                        <h3 className="text-[var(--text-muted)] font-black text-[9px] uppercase tracking-widest mb-0.5 opacity-70">{card.title}</h3>
                        <p className="text-xl font-black text-[var(--text-primary)] tracking-tight">{card.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[var(--bg-secondary)] border border-[var(--border)] p-5 rounded-lg shadow-sm">
                    <h3 className="text-base font-black mb-4 uppercase tracking-tight text-[var(--text-primary)]">Revenue Timeline</h3>
                    <div className="h-48 bg-[var(--bg-elevated)]/30 rounded-lg flex items-end justify-between p-4 gap-2">
                        {[40, 70, 45, 90, 65, 80, 50, 85].map((h, i) => (
                            <div key={i} className={`flex-1 rounded-t-sm transition-all hover:opacity-80 ${i % 2 === 0 ? 'bg-[var(--accent-primary)]' : 'bg-[var(--accent-secondary)]'}`} style={{ height: `${h}%` }}></div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                </div>

                <div className="bg-[var(--bg-secondary)] border border-[var(--border)] p-5 rounded-lg shadow-sm">
                    <h3 className="text-base font-black mb-4 uppercase tracking-tight text-[var(--text-primary)]">System Logs</h3>
                    <div className="space-y-3">
                        {[
                            { msg: 'New Drop "Genesis" approved', time: '2m ago', status: 'success' },
                            { msg: 'Inventory low: Over Tee (M)', time: '15m ago', status: 'warning' },
                            { msg: 'System update: v2.4.1 deployed', time: '1h ago', status: 'neutral' },
                            { msg: 'Security firewall: 0 threats', time: '3h ago', status: 'success' },
                        ].map((log, i) => (
                            <div key={i} className="flex items-center gap-3 group p-2 hover:bg-[var(--bg-elevated)] rounded-md transition-colors">
                                <div className={`w-1.5 h-1.5 rounded-full ${log.status === 'success' ? 'bg-green-500 shadow-[0_0_6px_var(--accent-secondary)]' : log.status === 'warning' ? 'bg-yellow-500' : 'bg-[var(--text-muted)]'}`}></div>
                                <p className="flex-1 text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-all">{log.msg}</p>
                                <span className="text-[9px] font-black text-[var(--text-muted)] uppercase">{log.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
