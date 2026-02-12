import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import DataTable, { type Column } from '../../components/shared/DataTable';
import { FaPlus, FaEdit, FaTrash, FaExternalLinkAlt, FaEye } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface Product {
    id: string;
    title: string;
    price: number;
    category: string;
    stock_quantity: number;
    status: 'draft' | 'pending' | 'approved' | 'rejected';
    image_url: string;
    views_count?: number;
}

const CreatorProducts: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, [user]);

    const fetchProducts = async () => {
        if (!user) return;
        setLoading(true);
        const { data } = await supabase
            .from('products')
            .select('*')
            .eq('creator_id', user.id)
            .order('created_at', { ascending: false });

        if (data) setProducts(data);
        setLoading(false);
    };

    const handleDelete = async (product: Product) => {
        if (product.status === 'approved') {
            alert('Admin-approved products cannot be deleted. Please contact support to archive this asset.');
            return;
        }

        if (!confirm('Are you sure you want to decommission this asset? This action is irreversible.')) return;

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', product.id);

        if (!error) {
            setProducts(products.filter(p => p.id !== product.id));
        } else {
            alert('Error deleting product');
        }
    };

    const columns: Column<Product>[] = [
        {
            header: 'Asset Control',
            accessor: (row) => (
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg bg-[#18181B] overflow-hidden border border-[#27272A] shadow-sm">
                        <img src={row.image_url || 'https://via.placeholder.com/150'} alt={row.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <p className="font-extrabold text-[#FAFAFA] text-sm uppercase tracking-tight">{row.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] uppercase font-black tracking-widest text-[#71717A]">{row.category}</span>
                            <span className="w-1 h-1 rounded-full bg-[#27272A]" />
                            <span className="text-[9px] uppercase font-black tracking-widest text-[#71717A]">ID: {row.id.slice(0, 8)}</span>
                        </div>
                    </div>
                </div>
            )

        },
        {
            header: 'Valuation',
            accessor: (row) => (
                <div className="flex flex-col">
                    <span className="font-black text-[#FAFAFA]">${row.price.toFixed(2)}</span>
                    <span className="text-[10px] text-[#71717A] font-bold">BASE_UNIT</span>
                </div>
            )

        },
        {
            header: 'Inventory',
            accessor: (row) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${row.stock_quantity > 10 ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                        <span className="font-black text-[#FAFAFA] text-xs">{row.stock_quantity} UNITS</span>
                    </div>
                    <div className="w-16 h-1 bg-[#18181B] rounded-full overflow-hidden">
                        <div
                            className={`h-full ${row.stock_quantity > 10 ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(100, (row.stock_quantity / 50) * 100)}%` }}
                        />
                    </div>
                </div>
            )

        },
        {
            header: 'Status',
            accessor: (row) => (
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${row.status === 'approved' ? 'bg-green-50 text-green-600 border-green-100' :
                    row.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                        row.status === 'draft' ? 'bg-gray-100 text-gray-500 border-gray-200' :
                            'bg-yellow-50 text-yellow-600 border-yellow-100'
                    }`}>
                    {row.status}
                </span>
            )
        },
        {
            header: 'Intelligence',
            accessor: (row) => (
                <div className="flex items-center gap-2 text-primary-dark-gray/40">
                    <FaEye className="text-xs" />
                    <span className="text-[10px] font-black">{row.views_count || 0}</span>
                </div>
            )
        }
    ];

    return (
        <div className="animate-fadeIn pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div>
                    <h1 className="text-5xl font-black uppercase tracking-tighter text-[#FAFAFA] mb-2">My Arsenal</h1>
                    <p className="text-[#71717A] font-medium uppercase tracking-[0.2em] text-xs">Inventory Synchronized. Ready for deployment.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => navigate('/creator/products/new')}
                        className="bg-[#3B82F6] text-white px-10 py-5 rounded-lg font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:bg-[#3B82F6]/90 transition-all group"
                    >
                        <FaPlus className="group-hover:rotate-90 transition-transform" /> New Drop
                    </button>
                </div>
            </div>

            <section className="bg-[#121215] p-8 rounded-xl border border-[#27272A] transition-all overflow-hidden">

                <DataTable
                    columns={columns}
                    data={products}
                    isLoading={loading}
                    actions={(row) => (
                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => navigate(`/product/${row.id}`)}
                                className="w-10 h-10 flex items-center justify-center hover:bg-[#18181B] rounded-lg text-[#71717A] hover:text-[#FAFAFA] transition-all border border-transparent hover:border-[#27272A]"
                                title="View Landing Page"
                            >
                                <FaExternalLinkAlt size={14} />
                            </button>
                            <button
                                onClick={() => navigate(`/creator/products/edit/${row.id}`)}
                                className="w-10 h-10 flex items-center justify-center hover:bg-[#18181B] rounded-lg text-[#71717A] hover:text-[#FAFAFA] transition-all border border-transparent hover:border-[#27272A]"
                                title="Edit Configuration"
                            >
                                <FaEdit size={14} />
                            </button>
                            <button
                                onClick={() => handleDelete(row)}
                                className="w-10 h-10 flex items-center justify-center hover:bg-[#EF4444]/10 rounded-lg text-[#71717A] hover:text-[#EF4444] transition-all border border-transparent hover:border-[#EF4444]/20"
                                title="Decommission"
                            >
                                <FaTrash size={14} />
                            </button>
                        </div>
                    )}

                />
            </section>
        </div>
    );
};

export default CreatorProducts;
