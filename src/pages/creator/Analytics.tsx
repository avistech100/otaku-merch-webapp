import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { FaChartLine, FaShoppingBag, FaUsers, FaArrowUp } from 'react-icons/fa';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';

const Analytics: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        conversionRate: 2.4 // Mock
    });

    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [topProducts, setTopProducts] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            fetchAnalyticsData();
        }
    }, [user]);

    const fetchAnalyticsData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Order Items for Revenue & Top Products
            const { data: sales, error: _error } = await supabase
                .from('order_items')
                .select(`
                    creator_earnings,
                    created_at,
                    product_title,
                    quantity,
                    price
                `)
                .eq('creator_id', user?.id);

            if (sales) {
                // Process Revenue over time (Daily)
                const dailyRevenue: Record<string, number> = {};
                const productSales: Record<string, { count: number, revenue: number }> = {};
                let totalRev = 0;

                sales.forEach(s => {
                    const date = new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    dailyRevenue[date] = (dailyRevenue[date] || 0) + s.creator_earnings;

                    productSales[s.product_title] = productSales[s.product_title] || { count: 0, revenue: 0 };
                    productSales[s.product_title].count += s.quantity;
                    productSales[s.product_title].revenue += s.creator_earnings;

                    totalRev += s.creator_earnings;
                });

                setRevenueData(Object.entries(dailyRevenue).map(([name, value]) => ({ name, value })));
                setTopProducts(Object.entries(productSales)
                    .map(([name, data]) => ({ name, ...data }))
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 5)
                );

                setStats({
                    totalRevenue: totalRev,
                    totalOrders: sales.length,
                    avgOrderValue: sales.length ? totalRev / sales.length : 0,
                    conversionRate: 2.8
                });
            }
        } catch (err) {
            console.error('Error fetching analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 animate-pulse">Loading Intelligence...</div>;

    const summaryCards = [
        { label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: FaChartLine, color: 'bg-accent-crypto' },
        { label: 'Total Sales', value: stats.totalOrders, icon: FaShoppingBag, color: 'bg-accent-anime' },
        { label: 'Avg Order Value', value: `$${stats.avgOrderValue.toFixed(2)}`, icon: FaArrowUp, color: 'bg-primary-black' },
        { label: 'Conversion Rate', value: `${stats.conversionRate}%`, icon: FaUsers, color: 'bg-primary-dark-gray' },
    ];

    return (
        <div className="space-y-8 animate-fadeIn pb-20">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="flex-1">
                    <h1 className="text-xl md:text-3xl font-black uppercase tracking-tighter text-[var(--text-primary)] mb-1">Analytics</h1>
                    <p className="text-[var(--text-muted)] font-medium text-xs md:text-sm">Deep dive into your performance metrics.</p>
                </div>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {summaryCards.map((card, i) => (
                    <div key={i} className="bg-[var(--bg-secondary)] p-4 md:p-6 rounded-lg shadow-sm border border-[var(--border)] group hover:-translate-y-1 transition-all">
                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg ${card.color} text-white flex items-center justify-center mb-3 md:mb-4 shadow-sm`}>
                            <card.icon size={14} />
                        </div>
                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">{card.label}</p>
                        <p className="text-xl md:text-2xl font-black text-[var(--text-primary)] tracking-tight">{card.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Revenue Chart */}
                <div className="bg-[var(--bg-secondary)] p-4 md:p-6 rounded-lg shadow-sm border border-[var(--border)]">
                    <h3 className="text-base md:text-lg font-black uppercase tracking-tight mb-4 md:mb-6 text-[var(--text-primary)]">Revenue Growth</h3>
                    <div className="h-[200px] md:h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 'bold', fill: 'var(--text-muted)' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 'bold', fill: 'var(--text-muted)' }} tickFormatter={(value) => `$${value}`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Products Chart */}
                <div className="bg-[var(--bg-secondary)] p-4 md:p-6 rounded-lg shadow-sm border border-[var(--border)]">
                    <h3 className="text-base md:text-lg font-black uppercase tracking-tight mb-4 md:mb-6 text-[var(--text-primary)]">Top Selling Assets</h3>
                    <div className="h-[200px] md:h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topProducts} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 9, fontWeight: 'bold', fill: 'var(--text-muted)' }}
                                    width={80}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
                                />
                                <Bar dataKey="revenue" radius={[0, 10, 10, 0]} barSize={20}>
                                    {topProducts.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#6366F1' : '#E5E7EB'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
