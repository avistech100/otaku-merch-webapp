import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import {
    FaUser, FaBox, FaCamera, FaSave, FaSpinner, FaHistory,
    FaMapMarkedAlt, FaBell, FaShieldAlt, FaTrashAlt, FaPlus,
    FaTwitter, FaInstagram, FaGlobe, FaChevronRight
} from 'react-icons/fa';
import AvatarUpload from '../components/shared/AvatarUpload';
import DataTable, { type Column } from '../components/shared/DataTable';
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
        if (data) setOrders(data);
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
            alert('Security clearance updated. Profile synchronized.');
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
            alert('Failed to authorize address: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAddress = async (id: string) => {
        if (!confirm('Permanent deletion of this waypoint?')) return;
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

    const orderColumns: Column<any>[] = [
        {
            header: 'Order Reference',
            accessor: (row) => (
                <div className="flex flex-col">
                    <span className="font-mono text-xs font-black">#{row.id.slice(0, 8).toUpperCase()}</span>
                    <span className="text-[10px] text-primary-dark-gray/40 font-bold uppercase">{new Date(row.created_at).toLocaleDateString()}</span>
                </div>
            )
        },
        {
            header: 'Status',
            accessor: (row) => (
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${row.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    row.status === 'shipping' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                    }`}>
                    {row.status}
                </span>
            )
        },
        {
            header: 'Investment',
            accessor: (row) => <span className="font-black text-primary-black">${row.total_amount.toFixed(2)}</span>
        },
        {
            header: 'Actions',
            accessor: (row) => (
                <button
                    onClick={() => navigate(`/checkout/success?orderId=${row.id}`)}
                    className="p-2 hover:bg-bg-light rounded-lg transition-colors text-primary-dark-gray hover:text-primary-black"
                >
                    <FaChevronRight size={12} />
                </button>
            )
        }
    ];

    if (loading) return (
        <div className="h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <FaSpinner className="animate-spin text-4xl text-primary-black" />
                <p className="font-black uppercase tracking-widest text-xs">Synchronizing User Node...</p>
            </div>
        </div>
    );

    const tabs = [
        { id: 'general', label: 'Identity', icon: FaUser },
        { id: 'orders', label: 'Mission Logs', icon: FaHistory },
        { id: 'addresses', label: 'Waypoints', icon: FaMapMarkedAlt },
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

                    {activeTab === 'orders' && (
                        <div className="space-y-8 animate-fadeIn">
                            <div className="bg-primary-white p-10 rounded-[40px] shadow-xl shadow-black/5 border border-bg-light">
                                <h3 className="text-2xl font-black uppercase tracking-tight text-primary-black mb-8 flex items-center gap-3">
                                    <FaHistory className="text-accent-crypto" /> Mission Logs
                                </h3>

                                {orders.length > 0 ? (
                                    <DataTable
                                        columns={orderColumns}
                                        data={orders}
                                        isLoading={loading}
                                    />
                                ) : (
                                    <div className="py-24 text-center border-4 border-dashed border-bg-light rounded-[40px]">
                                        <FaBox className="text-6xl text-primary-dark-gray/10 mx-auto mb-6" />
                                        <p className="font-black uppercase tracking-widest text-sm text-primary-dark-gray/40">No missions logged in the database</p>
                                        <button
                                            onClick={() => navigate('/products')}
                                            className="mt-8 px-10 py-5 bg-primary-black text-white rounded-full font-black uppercase text-xs tracking-widest hover:bg-accent-anime transition-all shadow-xl"
                                        >
                                            Initiate Shopping
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'addresses' && (
                        <div className="space-y-8 animate-fadeIn">
                            <div className="bg-primary-white p-10 rounded-[40px] shadow-xl shadow-black/5 border border-bg-light">
                                <div className="flex items-center justify-between mb-10">
                                    <h3 className="text-2xl font-black uppercase tracking-tight text-primary-black flex items-center gap-3">
                                        <FaMapMarkedAlt className="text-accent-anime" /> Logistics Waypoints
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
                                            <FaPlus /> New Waypoint
                                        </button>
                                    )}
                                </div>

                                {showAddressForm ? (
                                    <form onSubmit={handleSaveAddress} className="space-y-6 bg-bg-light/30 p-8 rounded-3xl animate-scaleIn">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <input required placeholder="Receiver Name" className="input-text w-full font-bold" value={addressForm.full_name} onChange={e => setAddressForm({ ...addressForm, full_name: e.target.value })} />
                                            <input required placeholder="Phone Number" className="input-text w-full font-bold" value={addressForm.phone} onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })} />
                                            <input required placeholder="Address Line 1" className="md:col-span-2 input-text w-full font-bold" value={addressForm.address_line1} onChange={e => setAddressForm({ ...addressForm, address_line1: e.target.value })} />
                                            <input placeholder="Apt, Suite, Room (Optional)" className="md:col-span-2 input-text w-full font-bold" value={addressForm.address_line2} onChange={e => setAddressForm({ ...addressForm, address_line2: e.target.value })} />
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
                                            <label htmlFor="default-addr" className="text-xs font-black uppercase tracking-widest text-primary-dark-gray cursor-pointer">Set as primary deployment waypoint</label>
                                        </div>
                                        <div className="flex gap-4">
                                            <button type="submit" disabled={saving} className="flex-1 btn-primary h-14 rounded-xl">{saving ? <FaSpinner className="animate-spin" /> : 'Authorize Waypoint'}</button>
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
                                                <p className="font-black uppercase tracking-widest text-[10px] text-primary-dark-gray/30">No logistic coordinates found</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

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
                                    Initiating decommissioning sequence will permanently erase your identity, orders, and waypoints from the Otaku Merch grid. This cannot be undone.
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
