import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { FaArrowLeft, FaBox, FaMapMarkerAlt, FaUser, FaShippingFast, FaCheckCircle, FaExclamationCircle, FaSpinner } from 'react-icons/fa';

const OrderDetails: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [trackingNum, setTrackingNum] = useState('');

    useEffect(() => {
        if (id && user) {
            fetchOrderDetails();
        }
    }, [id, user]);

    const fetchOrderDetails = async () => {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (
                    *,
                    products (
                        title,
                        image_url,
                        creator_id
                    )
                )
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching order details:', error);
        }

        if (data) {
            const creatorItems = data.order_items.filter((item: any) => item.products.creator_id === user?.id);
            setOrder({ ...data, order_items: creatorItems });
            // If items are shipped, might have tracking
            const firstItemWithTracking = creatorItems.find((p: any) => p.tracking_number);
            if (firstItemWithTracking) setTrackingNum(firstItemWithTracking.tracking_number);
        }
        setLoading(false);
    };

    const handleUpdateStatus = async (newStatus: string) => {
        setUpdating(true);
        try {
            // Update the order items for THIS creator
            const { error: itemError } = await supabase
                .from('order_items')
                .update({
                    tracking_number: trackingNum,
                    shipped_at: newStatus === 'shipped' ? new Date().toISOString() : null
                })
                .in('id', order.order_items.map((i: any) => i.id));

            if (itemError) throw itemError;

            // Also update the main order status if necessary
            // In a real system, the order status changes when all items are shipped
            const { error: orderError } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', id);

            if (orderError) throw orderError;

            await fetchOrderDetails();
            alert(`Order status updated to ${newStatus}`);
        } catch (err: any) {
            alert('Update failed: ' + err.message);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center font-black animate-pulse text-4xl">DECRYPTING ORDER DATA...</div>;
    if (!order) return <div className="p-20 text-center font-black text-2xl">ORDER_NOT_FOUND</div>;

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

    return (
        <div className="max-w-6xl mx-auto animate-fadeIn pb-32">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate('/creator/orders')} className="w-14 h-14 rounded-full bg-primary-white shadow-lg flex items-center justify-center hover:bg-primary-black hover:text-white transition-all group">
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <div className="flex items-center gap-4 mb-1">
                            <h1 className="text-4xl font-black uppercase tracking-tighter text-primary-black">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                                {order.status}
                            </span>
                        </div>
                        <p className="text-primary-dark-gray/60 font-medium uppercase tracking-widest text-[10px]">Transmission Logged: {new Date(order.created_at).toLocaleString()}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {order.status === 'pending' && (
                        <button
                            disabled={updating}
                            onClick={() => handleUpdateStatus('processing')}
                            className="px-8 py-4 bg-primary-black text-white rounded-full font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-accent-anime transition-all"
                        >
                            {updating ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />} Confirm Processing
                        </button>
                    )}
                    {(order.status === 'processing' || order.status === 'pending') && (
                        <button
                            disabled={updating}
                            onClick={() => handleUpdateStatus('cancelled')}
                            className="px-8 py-4 bg-bg-light text-primary-dark-gray rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-red-50 hover:text-red-500 transition-all"
                        >
                            Decline Mission
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Fulfillment Column */}
                <div className="lg:col-span-2 space-y-10">
                    <section className="bg-primary-white p-10 rounded-[40px] shadow-xl shadow-black/5 border border-bg-light">
                        <h3 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                            <FaBox className="text-accent-anime" /> Assets for Deployment
                        </h3>
                        <div className="space-y-6">
                            {order.order_items.map((item: any) => (
                                <div key={item.id} className="flex gap-6 p-6 rounded-3xl bg-bg-light/30 border border-bg-light group hover:border-accent-anime/30 transition-all">
                                    <div className="w-24 h-24 rounded-2xl bg-white overflow-hidden shrink-0 border border-bg-light shadow-sm">
                                        <img src={item.products.image_url} alt={item.products.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center">
                                        <h4 className="font-black text-primary-black uppercase tracking-tight mb-1">{item.products.title}</h4>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary-dark-gray/40">Qty: {item.quantity}</span>
                                            <span className="w-1 h-1 rounded-full bg-bg-light" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-accent-crypto">${item.price_at_purchase.toFixed(2)} UNIT</span>
                                        </div>
                                        {item.variant_name && (
                                            <span className="mt-3 px-3 py-1 bg-primary-black text-white text-[9px] font-black uppercase tracking-widest rounded-full w-fit">
                                                Size: {item.variant_name}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-col justify-center items-end">
                                        <span className="font-black text-xl text-primary-black">${(item.quantity * item.price_at_purchase).toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Logistics Control */}
                    <section className="bg-primary-white p-10 rounded-[40px] shadow-xl shadow-black/5 border border-bg-light">
                        <h3 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                            <FaShippingFast className="text-accent-crypto" /> Logistics Control
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary-dark-gray/40 mb-2 block">Tracking ID / Waybill</label>
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        value={trackingNum}
                                        onChange={(e) => setTrackingNum(e.target.value)}
                                        className="flex-1 h-14 px-6 rounded-2xl bg-bg-light/30 border-2 border-transparent focus:border-primary-black focus:bg-primary-white transition-all font-bold outline-none"
                                        placeholder="ENTER_TRACKING_ID"
                                    />
                                    <button
                                        disabled={updating || !trackingNum}
                                        onClick={() => handleUpdateStatus('shipped')}
                                        className="px-10 py-4 bg-accent-anime text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:brightness-110 transition-all shadow-lg shadow-accent-anime/20 flex items-center gap-2"
                                    >
                                        Mark as Shipped
                                    </button>
                                </div>
                            </div>
                            <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-4">
                                <FaExclamationCircle className="text-blue-500 mt-1" />
                                <p className="text-xs font-medium text-blue-700 leading-relaxed">
                                    Marking an order as shipped will notify the consumer and initiate the final settlement protocol. Ensure the Tracking ID is accurate to avoid disputes.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Consumer Meta Column */}
                <div className="space-y-10 text-primary-black">
                    <section className="bg-primary-white p-8 rounded-[40px] shadow-xl shadow-black/5 border border-bg-light">
                        <h3 className="text-xs font-black uppercase tracking-widest text-primary-dark-gray/40 mb-8 flex items-center gap-2">
                            <FaUser /> Consumer Meta
                        </h3>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-bg-light flex items-center justify-center font-black text-primary-dark-gray">
                                {order.shipping_address?.full_name?.charAt(0)}
                            </div>
                            <div>
                                <p className="font-black text-lg uppercase tracking-tight">{order.shipping_address?.full_name || 'GUEST_USER'}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-accent-anime">Verified Buyer</p>
                            </div>
                        </div>
                        <div className="space-y-4 pt-6 border-t border-bg-light">
                            <div>
                                <p className="text-[8px] font-black uppercase tracking-widest text-primary-dark-gray/40 mb-1">Email Terminal</p>
                                <p className="font-bold text-sm truncate">{order.customer_email || 'HIDDEN'}</p>
                            </div>
                            <div>
                                <p className="text-[8px] font-black uppercase tracking-widest text-primary-dark-gray/40 mb-1">Contact Dial</p>
                                <p className="font-bold text-sm">{order.shipping_address?.phone || 'NOT_PROVIDED'}</p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-primary-white p-8 rounded-[40px] shadow-xl shadow-black/5 border border-bg-light">
                        <h3 className="text-xs font-black uppercase tracking-widest text-primary-dark-gray/40 mb-8 flex items-center gap-2">
                            <FaMapMarkerAlt /> Drop Coordinates
                        </h3>
                        <div className="text-sm font-bold text-primary-black leading-relaxed space-y-1">
                            <p>{order.shipping_address?.address_line1}</p>
                            {order.shipping_address?.address_line2 && <p>{order.shipping_address?.address_line2}</p>}
                            <p>{order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.postal_code}</p>
                            <p className="pt-2 text-accent-crypto uppercase tracking-[0.2em]">{order.shipping_address?.country}</p>
                        </div>
                    </section>

                    <section className="bg-primary-black p-8 rounded-[40px] shadow-2xl text-white">
                        <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-8">Financial Summary</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-xs font-bold text-white/60">Subtotal</span>
                                <span className="font-bold">${order.total_amount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-xs font-bold text-white/60">Commission (10%)</span>
                                <span className="font-bold text-red-400">-${(order.total_amount * 0.1).toFixed(2)}</span>
                            </div>
                            <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                                <span className="text-xs font-black uppercase tracking-widest text-accent-crypto">Your Payout</span>
                                <span className="text-3xl font-black">${(order.total_amount * 0.9).toFixed(2)}</span>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
