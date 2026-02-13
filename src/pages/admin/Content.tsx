import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FaFileAlt, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import DataTable, { type Column } from '../../components/shared/DataTable';

interface ContentItem {
    id: string;
    title: string;
    slug: string;
    type: string; // 'article' | 'announcement'
    status: string; // 'draft' | 'published'
    created_at: string;
}

const ContentManagement: React.FC = () => {
    const [content, setContent] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('content')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setContent(data);
        } catch (err) {
            console.error('Error fetching content:', err);
        } finally {
            setLoading(false);
        }
    };

    const columns: Column<ContentItem>[] = [
        {
            header: 'Title',
            accessor: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-[var(--text-primary)] text-xs">{row.title}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-70">{row.slug}</span>
                </div>
            )
        },
        {
            header: 'Type',
            accessor: (row) => (
                <span className="px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
                    {row.type}
                </span>
            )
        },
        {
            header: 'Status',
            accessor: (row) => (
                <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${row.status === 'published' ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]' : 'bg-yellow-500'}`} />
                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">{row.status}</span>
                </div>
            )
        },
        {
            header: 'Created',
            accessor: (row) => (
                <span className="text-[10px] font-bold text-[var(--text-muted)]">
                    {new Date(row.created_at).toLocaleDateString()}
                </span>
            )
        },
        {
            header: 'Operations',
            accessor: (row) => (
                <div className="flex gap-1">
                    <button
                        onClick={() => console.log('Edit', row.id)}
                        className="p-1.5 hover:bg-[var(--bg-elevated)] rounded-md transition-all text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                        <FaEdit size={10} />
                    </button>
                    <button
                        onClick={() => console.log('Delete', row.id)}
                        className="p-1.5 hover:bg-[var(--bg-elevated)] rounded-md transition-all text-[var(--text-muted)] hover:text-red-500"
                    >
                        <FaTrash size={10} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl md:text-2xl font-black tracking-tighter text-[var(--text-primary)] uppercase">Content System</h1>
                    <p className="text-[var(--text-muted)] font-bold tracking-widest uppercase text-[9px] flex items-center gap-2">
                        <FaFileAlt className="text-[var(--accent-primary)]" /> Platform Communication • Announcements & Articles
                    </p>
                </div>
                <button className="h-9 px-4 rounded-md bg-[var(--text-primary)] text-[var(--bg-primary)] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[var(--accent-primary)] hover:text-white transition-all shadow-md flex items-center gap-2">
                    <FaPlus size={10} /> New Transmission
                </button>
            </div>

            <section className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg shadow-sm overflow-hidden">
                <DataTable
                    columns={columns}
                    data={content}
                    isLoading={loading}
                />
            </section>
        </div>
    );
};

export default ContentManagement;
