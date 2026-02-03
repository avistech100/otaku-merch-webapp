import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { FaChartLine, FaShoppingBag, FaUsers, FaArrowTrendUp } from 'react-icons/fa6';
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
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
            const { data: sales, error } = await supabase
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
        { label: 'Avg Order Value', value: `$${stats.avgOrderValue.toFixed(2)}`, icon: FaArrowTrendUp, color: 'bg-primary-black' },
        { label: 'Conversion Rate', value: `${stats.conversionRate}%`, icon: FaUsers, color: 'bg-primary-dark-gray' },
    ];

    return (
        <div className="space-y-8 animate-fadeIn pb-20">
            <div>
                <h1 className="text-4xl font-black uppercase tracking-tighter text-primary-black mb-2">Analytics</h1>
                <p className="text-primary-dark-gray/60 font-medium">Deep dive into your performance metrics.</p>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {summaryCards.map((card, i) => (
                    <div key={i} className="bg-primary-white p-8 rounded-[40px] shadow-xl shadow-black/5 border border-bg-light group hover:-translate-y-1 transition-all">
                        <div className={`w-12 h-12 rounded-2xl ${card.color} text-white flex items-center justify-center mb-6 shadow-lg`}>
                            <card.icon />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary-dark-gray/40 mb-1">{card.label}</p>
                        <p className="text-3xl font-black text-primary-black tracking-tight">{card.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Chart */}
                <div className="bg-primary-white p-8 rounded-[40px] shadow-xl shadow-black/5 border border-bg-light">
                    <h3 className="text-xl font-black uppercase tracking-tight mb-8">Revenue Growth</h3>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} prefix="$" />
                                <Tooltip
                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Products Chart */}
                <div className="bg-primary-white p-8 rounded-[40px] shadow-xl shadow-black/5 border border-bg-light">
                    <h3 className="text-xl font-black uppercase tracking-tight mb-8">Top Selling Assets</h3>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topProducts} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 'bold' }}
                                    width={100}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
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
