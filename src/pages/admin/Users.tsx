import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FaUserShield, FaUserEdit, FaShieldAlt } from 'react-icons/fa';
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
                    <div className="w-8 h-8 rounded-md bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--accent-primary)] font-black text-xs">
                        {row.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-xs text-[var(--text-primary)]">{row.display_name || row.username}</span>
                        <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-70">{row.id.slice(0, 8)}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Access Level',
            accessor: (row) => (
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border border-transparent ${row.role === 'admin' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                    row.role === 'creator' ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border-[var(--accent-primary)]/20' :
                        'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border)]'
                    }`}>
                    {row.role}
                </span>
            )
        },
        {
            header: 'Status',
            accessor: (row) => (
                <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${row.role === 'admin' ? 'bg-[var(--accent-secondary)] shadow-[0_0_8px_var(--accent-secondary)]' : 'bg-green-500'}`} />
                    <span className="text-[10px] font-medium text-[var(--text-secondary)]">Active Session</span>
                </div>
            )
        },
        {
            header: 'Joined',
            accessor: (row) => (
                <span className="text-[10px] font-bold text-[var(--text-muted)]">
                    {new Date(row.created_at).toLocaleDateString()}
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: (row) => (
                <div className="flex gap-1">
                    <button
                        onClick={() => toggleRole(row.id, row.role)}
                        title="Rotate Role"
                        className="p-1.5 hover:bg-[var(--bg-elevated)] rounded-md transition-colors text-[var(--accent-primary)]"
                    >
                        <FaShieldAlt className="text-xs" />
                    </button>
                    <button className="p-1.5 hover:bg-[var(--bg-elevated)] rounded-md transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                        <FaUserEdit className="text-xs" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-xl md:text-2xl font-black tracking-tighter text-[var(--text-primary)] uppercase">User Registry</h1>
                <p className="text-[var(--text-muted)] font-bold tracking-widest uppercase text-[9px] flex items-center gap-2">
                    <FaUserShield className="text-[var(--accent-primary)]" /> Administrative Access Required to Modify Records
                </p>
            </div>

            <section className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg overflow-hidden shadow-sm">
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
