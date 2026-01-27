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

    if (loading) return <div className="layout-container py-20 text-center animate-pulse font-black text-2xl uppercase">Loading Intelligence...</div>;

    const cards = [
        { title: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: <FaDollarSign />, color: 'bg-accent-crypto', trend: '+12.5%' },
        { title: 'Orders', value: stats.totalOrders, icon: <FaShoppingBag />, color: 'bg-accent-anime', trend: '+8.2%' },
        { title: 'Creators', value: stats.totalCreators, icon: <FaUsers />, color: 'bg-primary-black', trend: '+4.1%' },
        { title: 'Active Reach', value: stats.activeUsers, icon: <FaChartLine />, color: 'bg-primary-dark-gray', trend: '-2.4%' },
    ];

    return (
        <div className="layout-container py-12 animate-fadeIn">
            <h1 className="text-5xl font-black mb-4 tracking-tighter uppercase text-primary-black">Nexus Intelligence</h1>
            <p className="text-primary-dark-gray/60 font-medium mb-12 uppercase tracking-[0.3em] text-xs">Real-time Platform Analytics</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {cards.map((card, i) => (
                    <div key={i} className="bg-primary-white border border-bg-light p-8 rounded-[40px] shadow-xl shadow-black/5 hover:scale-105 transition-all cursor-pointer group">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl ${card.color} text-primary-white shadow-lg`}>
                                {card.icon}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${card.trend.startsWith('+') ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                {card.trend}
                            </span>
                        </div>
                        <h3 className="text-primary-dark-gray/40 font-black text-[10px] uppercase tracking-widest mb-1">{card.title}</h3>
                        <p className="text-4xl font-black text-primary-black tracking-tighter">{card.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-primary-white border border-bg-light p-10 rounded-[40px] shadow-xl shadow-black/5">
                    <h3 className="text-xl font-black mb-8 uppercase tracking-tight text-primary-black">Revenue Timeline</h3>
                    <div className="h-64 bg-bg-light/30 rounded-3xl flex items-end justify-between p-8 gap-4">
                        {[40, 70, 45, 90, 65, 80, 50, 85].map((h, i) => (
                            <div key={i} className="flex-1 bg-accent-crypto rounded-t-lg transition-all hover:bg-accent-anime" style={{ height: `${h}%` }}></div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-[10px] font-black text-primary-dark-gray/30 uppercase tracking-widest px-2">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                </div>

                <div className="bg-primary-white border border-bg-light p-10 rounded-[40px] shadow-xl shadow-black/5">
                    <h3 className="text-xl font-black mb-8 uppercase tracking-tight text-primary-black">System Logs</h3>
                    <div className="space-y-6">
                        {[
                            { msg: 'New Drop "Genesis" approved', time: '2m ago', status: 'success' },
                            { msg: 'Inventory low: Over Tee (M)', time: '15m ago', status: 'warning' },
                            { msg: 'System update: v2.4.1 deployed', time: '1h ago', status: 'neutral' },
                            { msg: 'Security firewall: 0 threats', time: '3h ago', status: 'success' },
                        ].map((log, i) => (
                            <div key={i} className="flex items-center gap-4 group">
                                <div className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-green-500' : log.status === 'warning' ? 'bg-amber-500' : 'bg-primary-dark-gray/30'}`}></div>
                                <p className="flex-1 text-sm font-bold text-primary-black group-hover:text-accent-anime transition-all">{log.msg}</p>
                                <span className="text-[10px] font-black text-primary-dark-gray/30 uppercase">{log.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
