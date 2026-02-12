import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import DataTable, { type Column } from '../../components/shared/DataTable';
import { FaEye, FaShippingFast, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface Order {
    id: string;
    created_at: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    total_amount: number;
    shipping_address: any;
    items_count: number;
}

const CreatorOrders: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, [user]);

    const fetchOrders = async () => {
        if (!user) return;
        setLoading(true);

        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items!inner (
                    id,
                    product_id,
                    products!inner (
                        creator_id
                    )
                )
            `)
            .eq('order_items.products.creator_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching orders:', error);
        }

        if (data) {
            const formattedOrders = data.map((o: any) => ({
                id: o.id,
                created_at: o.created_at,
                status: o.status,
                total_amount: o.total_amount,
                shipping_address: o.shipping_address,
                items_count: o.order_items.length
            }));

            // In a marketplace, subtotal for the creator should be shown, but for now we show order total
            const uniqueOrders = Array.from(new Map(formattedOrders.map((item: any) => [item.id, item])).values());
            setOrders(uniqueOrders as Order[]);
        }
        setLoading(false);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <FaClock className="text-yellow-500" />;
            case 'processing': return <FaShippingFast className="text-blue-500" />;
            case 'shipped': return <FaShippingFast className="text-purple-500" />;
            case 'delivered': return <FaCheckCircle className="text-green-500" />;
            case 'cancelled': return <FaTimesCircle className="text-red-500" />;
            default: return <FaClock className="text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
            case 'processing': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'shipped': return 'bg-purple-50 text-purple-600 border-purple-100';
            case 'delivered': return 'bg-green-50 text-green-600 border-green-100';
            case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    const columns: Column<Order>[] = [
        {
            header: 'Order Signature',
            accessor: (row) => (
                <div className="flex flex-col">
                    <span className="font-mono text-xs font-black text-[#FAFAFA]">#{row.id.slice(0, 8).toUpperCase()}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#71717A]">{new Date(row.created_at).toLocaleDateString()} @ {new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            )

        },
        {
            header: 'Recipient',
            accessor: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-xs text-[#FAFAFA] uppercase tracking-tight">{row.shipping_address?.full_name || 'ANONYMOUS_ENTITY'}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#71717A]">{row.shipping_address?.city}, {row.shipping_address?.country}</span>
                </div>
            )

        },
        {
            header: 'Payload',
            accessor: (row) => (
                <div className="flex items-center gap-2">
                    <span className="font-black text-xs text-[#FAFAFA]">{row.items_count} ITEMS</span>
                    <span className="w-1 h-1 rounded-full bg-[#27272A]" />
                    <span className="font-black text-[#3B82F6] text-xs">${row.total_amount.toFixed(2)}</span>
                </div>
            )

        },
        {
            header: 'Condition',
            accessor: (row) => (
                <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-2 ${getStatusColor(row.status)}`}>
                        {getStatusIcon(row.status)}
                        {row.status}
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="animate-fadeIn pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div>
                    <h1 className="text-5xl font-black uppercase tracking-tighter text-[#FAFAFA] mb-2">Order Terminal</h1>
                    <p className="text-[#71717A] font-medium uppercase tracking-[0.2em] text-xs">Tracking global deployments and asset distribution.</p>
                </div>
            </div>

            <section className="bg-[#121215] p-8 rounded-xl border border-[#27272A] transition-all overflow-hidden text-[#FAFAFA]">

                <DataTable
                    columns={columns}
                    data={orders}
                    isLoading={loading}
                    actions={(row) => (
                        <button
                            onClick={() => navigate(`/creator/orders/${row.id}`)}
                            className="bg-[#18181B] border border-[#27272A] text-[#FAFAFA] px-6 py-3 rounded-lg font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:border-[#3B82F6]/50 transition-all shadow-lg"
                        >
                            <FaEye className="text-[#3B82F6]" /> Inspect
                        </button>
                    )}

                />
            </section>
        </div>
    );
};

export default CreatorOrders;
