import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FaUserShield, FaUserEdit, FaShieldAlt, FaUsers } from 'react-icons/fa';
import DataTable, { type Column } from '../../components/shared/DataTable';

interface UserProfile {
    id: string;
    username: string;
    display_name: string;
    full_name: string;
    role: string;
    created_at: string;
    is_approved: boolean;
}

const Users: React.FC = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setUsers(data);
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleRole = async (userId: string, currentRole: string) => {
        const nextRoleMap: Record<string, string> = {
            'user': 'creator',
            'creator': 'admin',
            'admin': 'user'
        };
        const nextRole = nextRoleMap[currentRole] || 'user';

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: nextRole })
                .eq('id', userId);

            if (error) throw error;
            fetchUsers();
        } catch (err) {
            alert('Security escalation failed');
        }
    };

    const columns: Column<UserProfile>[] = [
        {
            header: 'Identity',
            accessor: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 font-black">
                        {row.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-white text-sm">{row.display_name || row.username}</span>
                        <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">{row.id.slice(0, 8)}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Access Level',
            accessor: (row) => (
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${row.role === 'admin' ? 'bg-red-500/20 text-red-500' :
                    row.role === 'creator' ? 'bg-purple-500/20 text-purple-500' :
                        'bg-white/5 text-white/40'
                    }`}>
                    {row.role}
                </span>
            )
        },
        {
            header: 'Status',
            accessor: (row) => (
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${row.role === 'admin' ? 'bg-purple-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]' : 'bg-green-500'}`} />
                    <span className="text-xs font-medium text-white/60">Active Session</span>
                </div>
            )
        },
        {
            header: 'Joined',
            accessor: (row) => (
                <span className="text-xs text-white/40 font-bold">
                    {new Date(row.created_at).toLocaleDateString()}
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => toggleRole(row.id, row.role)}
                        title="Rotate Role"
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors text-purple-500"
                    >
                        <FaShieldAlt />
                    </button>
                    <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/20 hover:text-white">
                        <FaUserEdit />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-5xl font-black tracking-tighter text-white mb-2 uppercase">User Registry</h1>
                <p className="text-white/40 font-bold tracking-widest uppercase text-xs flex items-center gap-2">
                    <FaUserShield className="text-purple-500" /> Administrative Access Required to Modify Records
                </p>
            </div>

            <section className="bg-white/5 border border-white/5 p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 pointer-events-none opacity-5">
                    <FaUsers className="text-9xl" />
                </div>

                <DataTable
                    columns={columns}
                    data={users}
                    isLoading={loading}
                />
            </section>
        </div>
    );
};

export default Users;
