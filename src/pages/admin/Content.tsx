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
                    <span className="font-bold text-white text-sm">{row.title}</span>
                    <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">{row.slug}</span>
                </div>
            )
        },
        {
            header: 'Type',
            accessor: (row) => (
                <span className="px-2 py-1 rounded bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/60 border border-white/5">
                    {row.type}
                </span>
            )
        },
        {
            header: 'Status',
            accessor: (row) => (
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${row.status === 'published' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-yellow-500'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{row.status}</span>
                </div>
            )
        },
        {
            header: 'Created',
            accessor: (row) => (
                <span className="text-xs text-white/40 font-bold">
                    {new Date(row.created_at).toLocaleDateString()}
                </span>
            )
        },
        {
            header: 'Operations',
            accessor: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => console.log('Edit', row.id)}
                        className="p-2 hover:bg-white/5 rounded-lg transition-all text-white/20 hover:text-white"
                    >
                        <FaEdit size={12} />
                    </button>
                    <button
                        onClick={() => console.log('Delete', row.id)}
                        className="p-2 hover:bg-white/5 rounded-lg transition-all text-white/20 hover:text-red-500"
                    >
                        <FaTrash size={12} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter text-white mb-2 uppercase">Content System</h1>
                    <p className="text-white/40 font-bold tracking-widest uppercase text-xs flex items-center gap-2">
                        <FaFileAlt className="text-purple-500" /> Platform Communication • Announcements & Articles
                    </p>
                </div>
                <button className="h-14 px-8 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-[0.2em] hover:bg-purple-500 hover:text-white transition-all shadow-xl flex items-center gap-3">
                    <FaPlus /> New Transmission
                </button>
            </div>

            <section className="bg-white/5 border border-white/5 p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
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
