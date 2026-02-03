import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { FaUser, FaBox, FaCamera, FaSave, FaSpinner, FaHistory } from 'react-icons/fa';
import AvatarUpload from '../components/shared/AvatarUpload';
import DataTable, { type Column } from '../components/shared/DataTable';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Profile State
    const [profile, setProfile] = useState<any>({
        full_name: '',
        username: '',
        bio: '',
        avatar_url: ''
    });

    // Orders State
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            fetchProfileData();
        }
    }, [user]);

    const fetchProfileData = async () => {
        setLoading(true);
        try {
            // Fetch Profile
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user?.id)
                .single();

            if (profileError) throw profileError;
            if (profileData) {
                setProfile({
                    full_name: profileData.full_name || '',
                    username: profileData.username || '',
                    bio: profileData.bio || '',
                    avatar_url: profileData.avatar_url || ''
                });
            }

            // Fetch Orders
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false });

            if (ordersError) throw ordersError;
            if (ordersData) setOrders(ordersData);

        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
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
                    updated_at: new Date().toISOString()
                })
                .eq('id', user?.id);

            if (error) throw error;
            alert('Profile updated successfully!');
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
            setProfile(prev => ({ ...prev, avatar_url: url }));
        } catch (err) {
            console.error('Error updating avatar:', err);
        }
    };

    const orderColumns: Column<any>[] = [
        {
            header: 'Order ID',
            accessor: (row) => <span className="font-mono text-xs font-black">#{row.id.slice(0, 8).toUpperCase()}</span>
        },
        {
            header: 'Date',
            accessor: (row) => new Date(row.created_at).toLocaleDateString()
        },
        {
            header: 'Status',
            accessor: (row) => (
                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${row.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        row.status === 'shipping' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                    }`}>
                    {row.status}
                </span>
            )
        },
        {
            header: 'Total',
            accessor: (row) => <span className="font-black">${row.total_amount.toFixed(2)}</span>
        },
        {
            header: 'Items',
            accessor: (row) => row.items_count || 1
        }
    ];

    if (loading) return (
        <div className="h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <FaSpinner className="animate-spin text-4xl text-primary-black" />
                <p className="font-black uppercase tracking-widest text-xs">Loading User Data...</p>
            </div>
        </div>
    );

    return (
        <div className="layout-container py-12 animate-fadeIn">
            <h1 className="text-4xl font-black uppercase tracking-tighter text-primary-black mb-10">User Command Center</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column: Profile Edit */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-primary-white p-8 rounded-[40px] shadow-xl shadow-black/5 border border-bg-light">
                        <div className="flex flex-col items-center mb-8">
                            <AvatarUpload
                                url={profile.avatar_url}
                                onUpload={handleAvatarUpdate}
                                bucket="avatars"
                            />
                            <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-primary-dark-gray/40">Tap to Change Avatar</p>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-primary-dark-gray/60 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={profile.full_name}
                                    onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                                    className="w-full h-12 px-4 rounded-xl bg-bg-light/30 border-2 border-transparent focus:border-primary-black outline-none font-bold transition-all text-sm"
                                    placeholder="Enter your name"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-primary-dark-gray/60 mb-2">Username</label>
                                <input
                                    type="text"
                                    value={profile.username}
                                    onChange={e => setProfile({ ...profile, username: e.target.value })}
                                    className="w-full h-12 px-4 rounded-xl bg-bg-light/30 border-2 border-transparent focus:border-primary-black outline-none font-bold transition-all text-sm"
                                    placeholder="@username"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-primary-dark-gray/60 mb-2">Bio / Status</label>
                                <textarea
                                    value={profile.bio}
                                    onChange={e => setProfile({ ...profile, bio: e.target.value })}
                                    className="w-full h-32 p-4 rounded-xl bg-bg-light/30 border-2 border-transparent focus:border-primary-black outline-none font-medium transition-all text-sm resize-none"
                                    placeholder="Tell us about yourself..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full h-12 bg-primary-black text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-accent-anime transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {saving ? <FaSpinner className="animate-spin" /> : <FaSave />} Save Changes
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column: Order History */}
                <div className="lg:col-span-2">
                    <div className="bg-primary-white p-8 rounded-[40px] shadow-xl shadow-black/5 border border-bg-light h-full">
                        <h2 className="text-2xl font-black uppercase tracking-tight text-primary-black mb-6 flex items-center gap-3">
                            <FaHistory className="text-accent-crypto" /> Order History
                        </h2>

                        {orders.length > 0 ? (
                            <DataTable
                                columns={orderColumns}
                                data={orders}
                                isLoading={loading}
                            />
                        ) : (
                            <div className="py-20 text-center border-2 border-dashed border-bg-light rounded-3xl">
                                <FaBox className="text-4xl text-primary-dark-gray/20 mx-auto mb-4" />
                                <p className="font-black uppercase tracking-widest text-xs text-primary-dark-gray/40">No orders yet</p>
                                <button
                                    onClick={() => navigate('/products')}
                                    className="mt-6 px-6 py-3 bg-primary-black text-white rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-accent-anime transition-all"
                                >
                                    Start Shopping
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
