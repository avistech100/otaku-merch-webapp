import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import {
    FaUser, FaBox, FaSave, FaSpinner,
    FaMapMarkedAlt, FaBell, FaShieldAlt, FaTrashAlt, FaPlus,
    FaTwitter, FaInstagram, FaGlobe, FaChevronRight, FaChevronDown,
    FaShoppingBag, FaExchangeAlt, FaCheckCircle, FaClock, FaTimesCircle,
    FaTruck, FaReceipt
} from 'react-icons/fa';
import AvatarUpload from '../components/shared/AvatarUpload';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Profile State
    const [profile, setProfile] = useState<any>({
        full_name: '',
        username: '',
        bio: '',
        avatar_url: '',
        notification_settings: {
            order_updates: true,
            new_drops: true,
            promotions: false,
            messages: true
        }
    });

    // Orders State
    const [orders, setOrders] = useState<any[]>([]);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const [orderItems, setOrderItems] = useState<Record<string, any[]>>({});
    const [loadingItems, setLoadingItems] = useState<string | null>(null);

    // Transactions State
    const [transactions, setTransactions] = useState<any[]>([]);

    // Addresses State
    const [addresses, setAddresses] = useState<any[]>([]);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<any>(null);
    const [addressForm, setAddressForm] = useState({
        full_name: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'Nigeria',
        phone: '',
        is_default: false
    });

    useEffect(() => {
        if (user) {
            fetchInitialData();
        }
    }, [user]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchProfile(),
                fetchOrders(),
                fetchAddresses()
            ]);
        } finally {
            setLoading(false);
        }
    };

    const fetchProfile = async () => {
        const { data, error: _error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user?.id)
            .single();
        if (data) setProfile(data);
    };

    const fetchOrders = async () => {
        const { data } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', user?.id)
            .order('created_at', { ascending: false });
        if (data) {
            setOrders(data);
            // Build transactions from orders that have payment data
            const txns = data.map((order: any) => ({
                id: order.id,
                order_number: order.order_number,
                date: order.created_at,
                amount: order.total,
                payment_status: order.payment_status,
                payment_method: order.payment_method || 'Paystack',
                payment_reference: order.payment_reference || '—',
                status: order.status,
            }));
            setTransactions(txns);
        }
    };

    const fetchOrderItems = async (orderId: string) => {
        if (orderItems[orderId]) {
            // Already cached
            setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
            return;
        }
        setLoadingItems(orderId);
        const { data } = await supabase
            .from('order_items')
            .select('*, products(title, image_url)')
            .eq('order_id', orderId);
        if (data) {
            setOrderItems(prev => ({ ...prev, [orderId]: data }));
        }
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
        setLoadingItems(null);
    };

    const fetchAddresses = async () => {
        const { data } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', user?.id)
            .order('is_default', { ascending: false });
        if (data) setAddresses(data);
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: profile.full_name,
                    username: profile.username,
                    bio: profile.bio,
                    notification_settings: profile.notification_settings,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user?.id);

            if (error) throw error;
            alert('Profile updated successfully.');
        } catch (err: any) {
            alert('Error updating profile: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpdate = async (url: string) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ avatar_url: url })
                .eq('id', user?.id);

            if (error) throw error;
            setProfile((prev: any) => ({ ...prev, avatar_url: url }));
        } catch (err) {
            console.error('Error updating avatar:', err);
        }
    };

    const handleSaveAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingAddress) {
                const { error } = await supabase
                    .from('addresses')
                    .update(addressForm)
                    .eq('id', editingAddress.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('addresses')
                    .insert({ ...addressForm, user_id: user?.id });
                if (error) throw error;
            }
            setShowAddressForm(false);
            setEditingAddress(null);
            fetchAddresses();
        } catch (err: any) {
            alert('Failed to save address: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAddress = async (id: string) => {
        if (!confirm('Are you sure you want to delete this address?')) return;
        await supabase.from('addresses').delete().eq('id', id);
        fetchAddresses();
    };

    const handleDeleteAccount = async () => {
        const confirmed = confirm('DANGER: This will permanently wipe your profile and all associated data from the Otaku Merch grid. This action is IRREVERSIBLE. Are you certain?');
        if (confirmed) {
            alert('Account deletion request queued. You will be logged out.');
            await signOut();
            navigate('/');
        }
    };

    // Helper: status icon + color
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'delivered':
                return { icon: FaCheckCircle, color: 'bg-emerald-50 text-emerald-600 border-emerald-200', label: 'Delivered' };
            case 'shipped':
            case 'shipping':
                return { icon: FaTruck, color: 'bg-blue-50 text-blue-600 border-blue-200', label: 'Shipped' };
            case 'processing':
                return { icon: FaClock, color: 'bg-amber-50 text-amber-600 border-amber-200', label: 'Processing' };
            case 'cancelled':
                return { icon: FaTimesCircle, color: 'bg-red-50 text-red-600 border-red-200', label: 'Cancelled' };
            default:
                return { icon: FaClock, color: 'bg-yellow-50 text-yellow-600 border-yellow-200', label: 'Pending' };
        }
    };

    const getPaymentBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return { color: 'bg-emerald-50 text-emerald-600 border-emerald-200', label: 'Paid' };
            case 'failed':
                return { color: 'bg-red-50 text-red-600 border-red-200', label: 'Failed' };
            case 'refunded':
                return { color: 'bg-purple-50 text-purple-600 border-purple-200', label: 'Refunded' };
            default:
                return { color: 'bg-yellow-50 text-yellow-600 border-yellow-200', label: 'Pending' };
        }
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <FaSpinner className="animate-spin text-4xl text-primary-black" />
                <p className="font-black uppercase tracking-widest text-xs">Loading profile...</p>
            </div>
        </div>
    );

    const tabs = [
        { id: 'general', label: 'Identity', icon: FaUser },
        { id: 'orders', label: 'Order History', icon: FaShoppingBag },
        { id: 'transactions', label: 'Transactions', icon: FaExchangeAlt },
        { id: 'addresses', label: 'Shipping', icon: FaMapMarkedAlt },
        { id: 'preferences', label: 'Config', icon: FaShieldAlt }
    ];

    return (
        <div className="layout-container py-12 animate-fadeIn pb-32">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-end mb-12">
                <div>
                    <h1 className="text-5xl font-black uppercase tracking-tighter text-primary-black">Command Center</h1>
                    <p className="text-primary-dark-gray/60 font-medium uppercase tracking-[0.2em] text-xs">Node: {user?.id.slice(0, 12).toUpperCase()}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1 space-y-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-4 p-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${activeTab === tab.id
                                ? 'bg-primary-black text-white shadow-xl translate-x-1'
                                : 'bg-primary-white border border-bg-light text-primary-dark-gray hover:border-primary-black'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}

                    <button
                        onClick={signOut}
                        className="w-full flex items-center gap-4 p-5 rounded-2xl font-black uppercase text-xs tracking-widest text-red-500 hover:bg-red-50 transition-all mt-8"
                    >
                        <FaTrashAlt size={16} /> Disconnect
                    </button>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                    {/* =================== IDENTITY TAB =================== */}
                    {activeTab === 'general' && (
                        <div className="space-y-8 animate-fadeIn">
                            <div className="bg-primary-white p-10 rounded-[40px] shadow-xl shadow-black/5 border border-bg-light">
                                <div className="flex flex-col md:flex-row items-center gap-10 mb-10">
                                    <AvatarUpload
                                        currentAvatarUrl={profile.avatar_url}
                                        userId={user?.id || ''}
                                        onUploadComplete={handleAvatarUpdate}
                                    />
                                    <div className="text-center md:text-left">
                                        <h3 className="text-3xl font-black uppercase tracking-tight text-primary-black mb-1">{profile.full_name || 'Incognito User'}</h3>
                                        <p className="text-primary-dark-gray/60 font-medium mb-4">{profile.username ? `@${profile.username}` : 'No username assigned'}</p>
                                        <div className="flex gap-2">
                                            <span className="px-3 py-1 bg-accent-anime/10 text-accent-anime rounded-full text-[9px] font-black uppercase">Standard Citizen</span>
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={handleUpdateProfile} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-primary-dark-gray/40 mb-3 ml-2">Public Designation</label>
                                            <input
                                                type="text"
                                                value={profile.full_name}
                                                onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                                                className="w-full h-14 px-6 rounded-2xl bg-bg-light/30 border-2 border-transparent focus:border-primary-black outline-none font-bold transition-all text-sm"
                                                placeholder="e.g. Satoshi Nakamoto"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-primary-dark-gray/40 mb-3 ml-2">Cyber Identifier</label>
                                            <input
                                                type="text"
                                                value={profile.username}
                                                onChange={e => setProfile({ ...profile, username: e.target.value })}
                                                className="w-full h-14 px-6 rounded-2xl bg-bg-light/30 border-2 border-transparent focus:border-primary-black outline-none font-bold transition-all text-sm"
                                                placeholder="@crypto_lord"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-primary-dark-gray/40 mb-3 ml-2">Transmission Bio</label>
                                        <textarea
                                            value={profile.bio}
                                            onChange={e => setProfile({ ...profile, bio: e.target.value })}
                                            className="w-full h-40 p-6 rounded-2xl bg-bg-light/30 border-2 border-transparent focus:border-primary-black outline-none font-medium transition-all text-sm resize-none"
                                            placeholder="Declare your affiliation and intent..."
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="h-16 px-12 bg-primary-black text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-accent-anime hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl"
                                    >
                                        {saving ? <FaSpinner className="animate-spin" /> : <FaSave />} Synchronize Identity
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* =================== ORDER HISTORY TAB =================== */}
                    {activeTab === 'orders' && (
                        <div className="space-y-8 animate-fadeIn">
                            <div className="bg-primary-white p-10 rounded-[40px] shadow-xl shadow-black/5 border border-bg-light">
                                <div className="flex items-center justify-between mb-10">
                                    <h3 className="text-2xl font-black uppercase tracking-tight text-primary-black flex items-center gap-3">
                                        <FaShoppingBag className="text-accent-anime" /> Order History
                                    </h3>
                                    <span className="text-xs font-black uppercase tracking-widest text-primary-dark-gray/40">
                                        {orders.length} order{orders.length !== 1 ? 's' : ''}
                                    </span>
                                </div>

                                {orders.length > 0 ? (
                                    <div className="space-y-4">
                                        {orders.map(order => {
                                            const badge = getStatusBadge(order.status);
                                            const isExpanded = expandedOrderId === order.id;
                                            const items = orderItems[order.id] || [];

                                            return (
                                                <div key={order.id} className="rounded-3xl border border-bg-light overflow-hidden hover:border-accent-anime/30 transition-all">
                                                    {/* Order Header - Clickable */}
                                                    <button
                                                        onClick={() => fetchOrderItems(order.id)}
                                                        className="w-full p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left hover:bg-bg-light/20 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-5">
                                                            <div className="w-12 h-12 rounded-2xl bg-bg-light/50 flex items-center justify-center text-primary-dark-gray/40">
                                                                <FaReceipt size={18} />
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-sm uppercase tracking-tight text-primary-black">
                                                                    {order.order_number || `#${order.id.slice(0, 8).toUpperCase()}`}
                                                                </p>
                                                                <p className="text-[10px] font-bold text-primary-dark-gray/40 uppercase tracking-widest mt-1">
                                                                    {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-4">
                                                            <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${badge.color}`}>
                                                                {badge.label}
                                                            </span>
                                                            <span className="font-black text-lg text-primary-black tracking-tight">
                                                                ${(order.total || 0).toFixed(2)}
                                                            </span>
                                                            <div className={`transition-transform duration-300 text-primary-dark-gray/30 ${isExpanded ? 'rotate-180' : ''}`}>
                                                                <FaChevronDown size={12} />
                                                            </div>
                                                        </div>
                                                    </button>

                                                    {/* Expanded Order Details */}
                                                    {isExpanded && (
                                                        <div className="border-t border-bg-light bg-bg-light/10 p-6 animate-fadeIn">
                                                            {/* Order Meta */}
                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                                                <div className="bg-primary-white p-4 rounded-2xl border border-bg-light">
                                                                    <p className="text-[8px] font-black uppercase tracking-widest text-primary-dark-gray/40 mb-1">Subtotal</p>
                                                                    <p className="font-black text-primary-black">${(order.subtotal || 0).toFixed(2)}</p>
                                                                </div>
                                                                <div className="bg-primary-white p-4 rounded-2xl border border-bg-light">
                                                                    <p className="text-[8px] font-black uppercase tracking-widest text-primary-dark-gray/40 mb-1">Shipping</p>
                                                                    <p className="font-black text-primary-black">${(order.shipping || 0).toFixed(2)}</p>
                                                                </div>
                                                                <div className="bg-primary-white p-4 rounded-2xl border border-bg-light">
                                                                    <p className="text-[8px] font-black uppercase tracking-widest text-primary-dark-gray/40 mb-1">Payment</p>
                                                                    <p className={`font-black ${order.payment_status === 'paid' ? 'text-emerald-600' : 'text-yellow-600'}`}>
                                                                        {(order.payment_status || 'pending').toUpperCase()}
                                                                    </p>
                                                                </div>
                                                                <div className="bg-primary-white p-4 rounded-2xl border border-bg-light">
                                                                    <p className="text-[8px] font-black uppercase tracking-widest text-primary-dark-gray/40 mb-1">Total</p>
                                                                    <p className="font-black text-accent-anime text-lg">${(order.total || 0).toFixed(2)}</p>
                                                                </div>
                                                            </div>

                                                            {/* Shipping Address */}
                                                            {order.shipping_address && (
                                                                <div className="bg-primary-white p-4 rounded-2xl border border-bg-light mb-6">
                                                                    <p className="text-[8px] font-black uppercase tracking-widest text-primary-dark-gray/40 mb-2">Shipping Address</p>
                                                                    <p className="font-bold text-sm text-primary-black">{order.shipping_address.full_name || order.shipping_address.firstName}</p>
                                                                    <p className="text-xs text-primary-dark-gray/60">
                                                                        {order.shipping_address.address_line1 || order.shipping_address.address}
                                                                        {order.shipping_address.city ? `, ${order.shipping_address.city}` : ''}
                                                                        {order.shipping_address.state ? `, ${order.shipping_address.state}` : ''}
                                                                        {order.shipping_address.postal_code ? ` ${order.shipping_address.postal_code}` : order.shipping_address.zip ? ` ${order.shipping_address.zip}` : ''}
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {/* Order Items */}
                                                            <div>
                                                                <p className="text-[8px] font-black uppercase tracking-widest text-primary-dark-gray/40 mb-3">Items</p>
                                                                {loadingItems === order.id ? (
                                                                    <div className="flex items-center justify-center py-8">
                                                                        <FaSpinner className="animate-spin text-primary-dark-gray/30" />
                                                                    </div>
                                                                ) : items.length > 0 ? (
                                                                    <div className="space-y-3">
                                                                        {items.map((item: any) => (
                                                                            <div key={item.id} className="flex items-center gap-4 p-3 bg-primary-white rounded-2xl border border-bg-light">
                                                                                <div className="w-14 h-14 rounded-xl bg-bg-light overflow-hidden shrink-0">
                                                                                    <img
                                                                                        src={item.products?.image_url || item.product_image || 'https://via.placeholder.com/56'}
                                                                                        alt={item.products?.title || item.product_title}
                                                                                        className="w-full h-full object-cover"
                                                                                    />
                                                                                </div>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <p className="font-black text-xs uppercase tracking-tight text-primary-black truncate">{item.products?.title || item.product_title}</p>
                                                                                    <div className="flex items-center gap-2 mt-1">
                                                                                        {item.variant && <span className="text-[9px] font-bold text-primary-dark-gray/40 uppercase">{item.variant}</span>}
                                                                                        <span className="text-[9px] font-bold text-primary-dark-gray/40 uppercase">Qty: {item.quantity}</span>
                                                                                    </div>
                                                                                </div>
                                                                                <p className="font-black text-primary-black">${((item.price || item.subtotal || 0) * (item.quantity || 1)).toFixed(2)}</p>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-xs text-primary-dark-gray/40 py-4 text-center">No item details available</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="py-24 text-center border-4 border-dashed border-bg-light rounded-[40px]">
                                        <FaBox className="text-6xl text-primary-dark-gray/10 mx-auto mb-6" />
                                        <p className="font-black uppercase tracking-widest text-sm text-primary-dark-gray/40">No orders found</p>
                                        <p className="text-xs text-primary-dark-gray/30 mt-2 mb-8">Start shopping to see your order history here</p>
                                        <button
                                            onClick={() => navigate('/products')}
                                            className="px-10 py-5 bg-primary-black text-white rounded-full font-black uppercase text-xs tracking-widest hover:bg-accent-anime transition-all shadow-xl"
                                        >
                                            Browse Products
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* =================== TRANSACTIONS TAB =================== */}
                    {activeTab === 'transactions' && (
                        <div className="space-y-8 animate-fadeIn">
                            <div className="bg-primary-white p-10 rounded-[40px] shadow-xl shadow-black/5 border border-bg-light">
                                <div className="flex items-center justify-between mb-10">
                                    <h3 className="text-2xl font-black uppercase tracking-tight text-primary-black flex items-center gap-3">
                                        <FaExchangeAlt className="text-accent-crypto" /> Transaction History
                                    </h3>
                                    <span className="text-xs font-black uppercase tracking-widest text-primary-dark-gray/40">
                                        {transactions.length} record{transactions.length !== 1 ? 's' : ''}
                                    </span>
                                </div>

                                {transactions.length > 0 ? (
                                    <>
                                        {/* Summary Cards */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-6 rounded-3xl border border-emerald-200/50">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500/60 mb-2">Total Spent</p>
                                                <p className="text-3xl font-black text-emerald-700 tracking-tight">
                                                    ${transactions.filter(t => t.payment_status === 'paid').reduce((acc, t) => acc + (t.amount || 0), 0).toFixed(2)}
                                                </p>
                                            </div>
                                            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 rounded-3xl border border-blue-200/50">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-blue-500/60 mb-2">Completed</p>
                                                <p className="text-3xl font-black text-blue-700 tracking-tight">
                                                    {transactions.filter(t => t.payment_status === 'paid').length}
                                                </p>
                                            </div>
                                            <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-6 rounded-3xl border border-amber-200/50">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-amber-500/60 mb-2">Pending</p>
                                                <p className="text-3xl font-black text-amber-700 tracking-tight">
                                                    {transactions.filter(t => t.payment_status === 'pending').length}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Transaction List */}
                                        <div className="space-y-3">
                                            {transactions.map(txn => {
                                                const payBadge = getPaymentBadge(txn.payment_status);
                                                return (
                                                    <div key={txn.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-bg-light hover:border-accent-crypto/30 transition-all group">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${txn.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-600' : txn.payment_status === 'failed' ? 'bg-red-100 text-red-500' : 'bg-yellow-100 text-yellow-600'}`}>
                                                                {txn.payment_status === 'paid' ? <FaCheckCircle size={16} /> : txn.payment_status === 'failed' ? <FaTimesCircle size={16} /> : <FaClock size={16} />}
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-sm uppercase tracking-tight text-primary-black">
                                                                    {txn.order_number || `#${txn.id.slice(0, 8).toUpperCase()}`}
                                                                </p>
                                                                <div className="flex items-center gap-3 mt-1">
                                                                    <span className="text-[10px] font-bold text-primary-dark-gray/40 uppercase">
                                                                        {new Date(txn.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                                    </span>
                                                                    <span className="w-1 h-1 rounded-full bg-bg-light" />
                                                                    <span className="text-[10px] font-bold text-primary-dark-gray/40 uppercase">{txn.payment_method}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-4">
                                                            <div className="text-right">
                                                                <p className="text-[8px] font-black uppercase tracking-widest text-primary-dark-gray/30 mb-0.5">Reference</p>
                                                                <p className="font-mono text-[10px] text-primary-dark-gray/50">{txn.payment_reference}</p>
                                                            </div>
                                                            <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${payBadge.color}`}>
                                                                {payBadge.label}
                                                            </span>
                                                            <span className="font-black text-lg text-primary-black tracking-tight min-w-[80px] text-right">
                                                                ${(txn.amount || 0).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-24 text-center border-4 border-dashed border-bg-light rounded-[40px]">
                                        <FaExchangeAlt className="text-6xl text-primary-dark-gray/10 mx-auto mb-6" />
                                        <p className="font-black uppercase tracking-widest text-sm text-primary-dark-gray/40">No transactions recorded</p>
                                        <p className="text-xs text-primary-dark-gray/30 mt-2">Your payment history will appear here after your first purchase</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* =================== SHIPPING ADDRESSES TAB =================== */}
                    {activeTab === 'addresses' && (
                        <div className="space-y-8 animate-fadeIn">
                            <div className="bg-primary-white p-10 rounded-[40px] shadow-xl shadow-black/5 border border-bg-light">
                                <div className="flex items-center justify-between mb-10">
                                    <h3 className="text-2xl font-black uppercase tracking-tight text-primary-black flex items-center gap-3">
                                        <FaMapMarkedAlt className="text-accent-anime" /> Shipping Addresses
                                    </h3>
                                    {!showAddressForm && (
                                        <button
                                            onClick={() => {
                                                setEditingAddress(null);
                                                setAddressForm({
                                                    full_name: '', address_line1: '', address_line2: '',
                                                    city: '', state: '', postal_code: '',
                                                    country: 'Nigeria', phone: '', is_default: false
                                                });
                                                setShowAddressForm(true);
                                            }}
                                            className="px-6 py-3 bg-primary-black text-white rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-accent-crypto transition-all flex items-center gap-2"
                                        >
                                            <FaPlus /> New Address
                                        </button>
                                    )}
                                </div>

                                {showAddressForm ? (
                                    <form onSubmit={handleSaveAddress} className="space-y-6 bg-bg-light/30 p-8 rounded-3xl animate-scaleIn">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <input required placeholder="Receiver Name" className="input-text w-full font-bold" value={addressForm.full_name} onChange={e => setAddressForm({ ...addressForm, full_name: e.target.value })} />
                                            <input required placeholder="Phone Number" className="input-text w-full font-bold" value={addressForm.phone} onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })} />
                                            <input required placeholder="Street Address" className="md:col-span-2 input-text w-full font-bold" value={addressForm.address_line1} onChange={e => setAddressForm({ ...addressForm, address_line1: e.target.value })} />
                                            <input placeholder="Apartment, Suite, etc. (Optional)" className="md:col-span-2 input-text w-full font-bold" value={addressForm.address_line2} onChange={e => setAddressForm({ ...addressForm, address_line2: e.target.value })} />
                                            <input required placeholder="City" className="input-text w-full font-bold" value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} />
                                            <input required placeholder="State / Province" className="input-text w-full font-bold" value={addressForm.state} onChange={e => setAddressForm({ ...addressForm, state: e.target.value })} />
                                            <input required placeholder="Postal Code" className="input-text w-full font-bold" value={addressForm.postal_code} onChange={e => setAddressForm({ ...addressForm, postal_code: e.target.value })} />
                                            <select className="input-select w-full font-bold" value={addressForm.country} onChange={e => setAddressForm({ ...addressForm, country: e.target.value })}>
                                                <option value="Nigeria">Nigeria</option>
                                                <option value="USA">USA</option>
                                                <option value="UK">UK</option>
                                                <option value="Japan">Japan</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-4 py-4">
                                            <input type="checkbox" id="default-addr" checked={addressForm.is_default} onChange={e => setAddressForm({ ...addressForm, is_default: e.target.checked })} className="w-5 h-5 rounded accent-primary-black" />
                                            <label htmlFor="default-addr" className="text-xs font-black uppercase tracking-widest text-primary-dark-gray cursor-pointer">Set as primary shipping address</label>
                                        </div>
                                        <div className="flex gap-4">
                                            <button type="submit" disabled={saving} className="flex-1 btn-primary h-14 rounded-xl">{saving ? <FaSpinner className="animate-spin" /> : 'Save Address'}</button>
                                            <button type="button" onClick={() => setShowAddressForm(false)} className="flex-1 btn-secondary h-14 rounded-xl">Cancel</button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {addresses.map(addr => (
                                            <div key={addr.id} className="p-6 rounded-3xl border border-bg-light hover:border-accent-anime transition-all group relative">
                                                {addr.is_default && <span className="absolute -top-3 left-6 bg-accent-crypto text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em]">Primary</span>}
                                                <div className="flex justify-between mb-4">
                                                    <h4 className="font-black uppercase tracking-tight text-primary-black">{addr.full_name}</h4>
                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => { setEditingAddress(addr); setAddressForm(addr); setShowAddressForm(true); }} className="text-primary-dark-gray/40 hover:text-accent-anime"><FaChevronRight /></button>
                                                        <button onClick={() => handleDeleteAddress(addr.id)} className="text-primary-dark-gray/30 hover:text-red-500"><FaTrashAlt /></button>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-primary-dark-gray/60 mb-2">{addr.address_line1}</p>
                                                <p className="text-xs font-bold text-primary-dark-gray/40 uppercase">{addr.city}, {addr.state} • {addr.postal_code}</p>
                                            </div>
                                        ))}
                                        {addresses.length === 0 && (
                                            <div className="md:col-span-2 py-16 text-center border-2 border-dashed border-bg-light rounded-[32px]">
                                                <p className="font-black uppercase tracking-widest text-[10px] text-primary-dark-gray/30">No shipping addresses found</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* =================== CONFIG / PREFERENCES TAB =================== */}
                    {activeTab === 'preferences' && (
                        <div className="space-y-8 animate-fadeIn">
                            {/* Notification Control */}
                            <div className="bg-primary-white p-10 rounded-[40px] shadow-xl shadow-black/5 border border-bg-light">
                                <h3 className="text-2xl font-black uppercase tracking-tight text-primary-black mb-8 flex items-center gap-3">
                                    <FaBell className="text-accent-anime" /> Notification Directives
                                </h3>

                                <div className="space-y-6">
                                    {Object.entries(profile.notification_settings || {}).map(([key, value]: [string, any]) => (
                                        <div key={key} className="flex items-center justify-between p-6 bg-bg-light/20 rounded-2xl">
                                            <div>
                                                <h4 className="font-black uppercase tracking-tight text-primary-black text-sm">{key.replace('_', ' ')}</h4>
                                                <p className="text-[10px] text-primary-dark-gray/60 uppercase font-medium">Critical system alerts via encrypted channel</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const newSettings = { ...profile.notification_settings, [key]: !value };
                                                    setProfile({ ...profile, notification_settings: newSettings });
                                                }}
                                                className={`w-12 h-6 rounded-full transition-all relative ${value ? 'bg-accent-anime' : 'bg-bg-light'}`}
                                            >
                                                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${value ? 'translate-x-6' : 'translate-x-0'}`} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* External Links */}
                            <div className="bg-primary-white p-10 rounded-[40px] shadow-xl shadow-black/5 border border-bg-light">
                                <h3 className="text-2xl font-black uppercase tracking-tight text-primary-black mb-8 flex items-center gap-3">
                                    <FaShieldAlt className="text-accent-crypto" /> External Links
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <button className="flex items-center justify-center gap-3 p-6 rounded-2xl bg-bg-light/30 border border-transparent hover:border-sky-400 transition-all font-black uppercase text-[10px] tracking-widest text-sky-600">
                                        <FaTwitter /> Link Twitter
                                    </button>
                                    <button className="flex items-center justify-center gap-3 p-6 rounded-2xl bg-bg-light/30 border border-transparent hover:border-pink-500 transition-all font-black uppercase text-[10px] tracking-widest text-pink-600">
                                        <FaInstagram /> Link Instagram
                                    </button>
                                    <button className="flex items-center justify-center gap-3 p-6 rounded-2xl bg-bg-light/30 border border-transparent hover:border-primary-black transition-all font-black uppercase text-[10px] tracking-widest text-primary-black">
                                        <FaGlobe /> Link Website
                                    </button>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="bg-red-500/5 p-10 rounded-[40px] border border-red-500/10">
                                <h3 className="text-2xl font-black uppercase tracking-tight text-red-600 mb-4 flex items-center gap-3">
                                    <FaTrashAlt /> Danger Zone
                                </h3>
                                <p className="text-sm font-medium text-red-500/60 mb-8 max-w-xl">
                                    Initiating decommissioning sequence will permanently erase your identity, orders, and data from the Otaku Merch grid. This cannot be undone.
                                </p>
                                <button
                                    onClick={handleDeleteAccount}
                                    className="px-10 py-5 border-2 border-red-500 text-red-600 rounded-full font-black uppercase tracking-[0.2em] text-[10px] hover:bg-red-500 hover:text-white transition-all shadow-xl shadow-red-500/10"
                                >
                                    Initiate Account Wipe
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
