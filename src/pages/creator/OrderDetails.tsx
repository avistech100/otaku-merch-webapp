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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-8">
                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                    <button onClick={() => navigate('/creator/orders')} className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[var(--bg-secondary)] shadow-sm flex items-center justify-center hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-all group shrink-0 border border-[var(--border)] text-[var(--text-primary)]">
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform text-xs md:text-sm" />
                    </button>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-[var(--text-primary)]">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
                            <span className={`px-2 md:px-3 py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                                {order.status}
                            </span>
                        </div>
                        <p className="text-[var(--text-muted)] font-medium uppercase tracking-widest text-[8px] md:text-[9px] truncate">Transmission Logged: {new Date(order.created_at).toLocaleString()}</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3">
                    {order.status === 'pending' && (
                        <button
                            disabled={updating}
                            onClick={() => handleUpdateStatus('processing')}
                            className="px-4 md:px-6 py-2 md:py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 hover:bg-[var(--accent-anime)] hover:text-white transition-all"
                        >
                            {updating ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />} Confirm Processing
                        </button>
                    )}
                    {(order.status === 'processing' || order.status === 'pending') && (
                        <button
                            disabled={updating}
                            onClick={() => handleUpdateStatus('cancelled')}
                            className="px-4 md:px-6 py-2 md:py-3 bg-[var(--bg-elevated)] text-[var(--text-muted)] rounded-full font-black uppercase tracking-widest text-[9px] hover:bg-red-500/10 hover:text-red-500 transition-all text-center border border-[var(--border)]"
                        >
                            Decline Mission
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Fulfillment Column */}
                <div className="lg:col-span-2 space-y-4 md:space-y-6">
                    <section className="bg-[var(--bg-secondary)] p-4 md:p-6 rounded-lg border border-[var(--border)]">
                        <h3 className="text-base md:text-lg font-black uppercase tracking-tight mb-4 md:mb-6 flex items-center gap-2 text-[var(--text-primary)]">
                            <FaBox className="text-[var(--accent-anime)]" /> Assets for Deployment
                        </h3>
                        <div className="space-y-3 md:space-y-4">
                            {order.order_items.map((item: any) => (
                                <div key={item.id} className="flex flex-col sm:flex-row gap-3 md:gap-4 p-3 md:p-4 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] group hover:border-[var(--accent-anime)]/30 transition-all">
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-md bg-white overflow-hidden shrink-0 border border-[var(--border)] shadow-sm">
                                        <img src={item.products.image_url} alt={item.products.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center min-w-0">
                                        <h4 className="font-black text-xs md:text-sm text-[var(--text-primary)] uppercase tracking-tight mb-0.5 truncate">{item.products.title}</h4>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Qty: {item.quantity}</span>
                                            <span className="hidden sm:block w-0.5 h-0.5 rounded-full bg-[var(--text-muted)]" />
                                            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-[var(--accent-crypto)]">${item.price_at_purchase.toFixed(2)} UNIT</span>
                                        </div>
                                        {item.variant_name && (
                                            <span className="mt-1.5 md:mt-2 px-1.5 md:px-2 py-0.5 bg-[var(--bg-primary)] text-[var(--text-primary)] text-[7px] md:text-[8px] font-black uppercase tracking-widest rounded-sm w-fit border border-[var(--border)]">
                                                Size: {item.variant_name}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex sm:flex-col justify-center items-end border-t sm:border-t-0 pt-2 sm:pt-0 mt-2 sm:mt-0 border-[var(--border)]">
                                        <span className="font-black text-sm md:text-base text-[var(--text-primary)] ml-auto sm:ml-0">${(item.quantity * item.price_at_purchase).toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                    {/* Logistics Control */}
                    <section className="bg-[var(--bg-secondary)] p-4 md:p-6 rounded-lg border border-[var(--border)]">
                        <h3 className="text-base md:text-lg font-black uppercase tracking-tight mb-4 md:mb-6 flex items-center gap-2 text-[var(--text-primary)]">
                            <FaShippingFast className="text-[var(--accent-crypto)]" /> Logistics Control
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1.5 block">Tracking ID / Waybill</label>
                                <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                                    <input
                                        type="text"
                                        value={trackingNum}
                                        onChange={(e) => setTrackingNum(e.target.value)}
                                        className="flex-1 h-10 md:h-12 px-4 rounded-md bg-[var(--bg-elevated)] border border-[var(--border)] focus:border-[var(--accent-primary)] transition-all font-bold outline-none text-xs md:text-sm text-[var(--text-primary)]"
                                        placeholder="ENTER_TRACKING_ID"
                                    />
                                    <button
                                        disabled={updating || !trackingNum}
                                        onClick={() => handleUpdateStatus('shipped')}
                                        className="px-4 md:px-6 py-2 md:py-3 bg-[var(--accent-anime)] text-white rounded-md font-black uppercase tracking-widest text-[9px] hover:brightness-110 transition-all shadow-md flex items-center justify-center gap-2"
                                    >
                                        Mark as Shipped
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
                                <FaExclamationCircle className="text-blue-500 mt-0.5 text-xs" />
                                <p className="text-[10px] font-medium text-blue-400 leading-relaxed">
                                    Marking an order as shipped will notify the consumer and initiate the final settlement protocol. Ensure the Tracking ID is accurate to avoid disputes.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Consumer Meta Column */}
                {/* Consumer Meta Column */}
                <div className="space-y-4 md:space-y-6 text-[var(--text-primary)]">
                    <section className="bg-[var(--bg-secondary)] p-4 md:p-6 rounded-lg border border-[var(--border)]">
                        <h3 className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4 md:mb-6 flex items-center gap-1.5">
                            <FaUser /> Consumer Meta
                        </h3>
                        <div className="flex items-center gap-3 mb-3 md:mb-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center font-black text-[var(--text-muted)] shrink-0 text-sm">
                                {order.shipping_address?.full_name?.charAt(0)}
                            </div>
                            <div className="min-w-0">
                                <p className="font-black text-sm md:text-base uppercase tracking-tight truncate text-[var(--text-primary)]">{order.shipping_address?.full_name || 'GUEST_USER'}</p>
                                <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-[var(--accent-anime)]">Verified Buyer</p>
                            </div>
                        </div>
                        <div className="space-y-3 pt-4 border-t border-[var(--border)]">
                            <div>
                                <p className="text-[7px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-0.5">Email Terminal</p>
                                <p className="font-bold text-xs truncate text-[var(--text-secondary)]">{order.customer_email || 'HIDDEN'}</p>
                            </div>
                            <div>
                                <p className="text-[7px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-0.5">Contact Dial</p>
                                <p className="font-bold text-xs text-[var(--text-secondary)]">{order.shipping_address?.phone || 'NOT_PROVIDED'}</p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-[var(--bg-secondary)] p-4 md:p-6 rounded-lg border border-[var(--border)]">
                        <h3 className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4 md:mb-6 flex items-center gap-1.5">
                            <FaMapMarkerAlt /> Drop Coordinates
                        </h3>
                        <div className="text-xs font-bold text-[var(--text-secondary)] leading-relaxed space-y-0.5">
                            <p>{order.shipping_address?.address_line1}</p>
                            {order.shipping_address?.address_line2 && <p>{order.shipping_address?.address_line2}</p>}
                            <p>{order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.postal_code}</p>
                            <p className="pt-1 text-[var(--accent-crypto)] uppercase tracking-[0.2em]">{order.shipping_address?.country}</p>
                        </div>
                    </section>

                    <section className="bg-[var(--bg-primary)] p-4 md:p-6 rounded-lg border border-[var(--border)] text-[var(--text-primary)] shadow-md">
                        <h3 className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4 md:mb-6">Financial Summary</h3>
                        <div className="space-y-2 md:space-y-3">
                            <div className="flex justify-between">
                                <span className="text-[9px] md:text-[10px] font-bold text-[var(--text-muted)]">Subtotal</span>
                                <span className="font-bold text-xs md:text-sm">${order.total_amount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[9px] md:text-[10px] font-bold text-[var(--text-muted)]">Commission (10%)</span>
                                <span className="font-bold text-xs md:text-sm text-red-400">-${(order.total_amount * 0.1).toFixed(2)}</span>
                            </div>
                            <div className="pt-3 border-t border-[var(--border)] flex justify-between items-end">
                                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[var(--accent-crypto)]">Your Payout</span>
                                <span className="text-xl md:text-2xl font-black">${(order.total_amount * 0.9).toFixed(2)}</span>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
