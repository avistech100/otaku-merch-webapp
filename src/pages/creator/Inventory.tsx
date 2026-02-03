import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { FaExclamationTriangle, FaDownload, FaEdit, FaBox, FaHistory, FaCalculator } from 'react-icons/fa';
import DataTable, { type Column } from '../../components/shared/DataTable';
import { useNavigate } from 'react-router-dom';

interface InventoryItem {
    id: string;
    title: string;
    sku: string;
    stock_quantity: number;
    price: number;
    category: string;
    status: string;
    image_url: string;
}

const Inventory: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchInventory();
        }
    }, [user]);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('creator_id', user?.id)
                .order('stock_quantity', { ascending: true }); // Low stock first

            if (error) throw error;
            if (data) setInventory(data);
        } catch (err) {
            console.error('Error fetching inventory:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStockStatus = (stock: number) => {
        if (stock <= 0) return { label: 'DELETED', color: 'bg-red-50 text-red-600 border-red-100' };
        if (stock < 10) return { label: 'CRITICAL', color: 'bg-yellow-50 text-yellow-600 border-yellow-100' };
        return { label: 'STABLE', color: 'bg-green-50 text-green-600 border-green-100' };
    };

    const columns: Column<InventoryItem>[] = [
        {
            header: 'Asset Signature',
            accessor: (row) => (
                <div className="flex items-center gap-4">
                    <img src={row.image_url} alt="" className="w-12 h-12 rounded-xl object-cover border border-bg-light" />
                    <div className="flex flex-col">
                        <span className="font-extrabold text-xs text-primary-black uppercase tracking-tight">{row.title}</span>
                        <span className="text-[9px] text-primary-dark-gray/40 font-black uppercase tracking-widest">{row.sku || 'SKU_MISSING'}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Quantum Density',
            accessor: (row) => (
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${row.stock_quantity < 10 ? 'bg-red-500 animate-ping' : 'bg-green-500'}`} />
                    <span className="font-black text-primary-black font-mono">{row.stock_quantity.toString().padStart(3, '0')}</span>
                </div>
            )
        },
        {
            header: 'Integrity',
            accessor: (row) => {
                const status = getStockStatus(row.stock_quantity);
                return (
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${status.color}`}>
                        {status.label}
                    </span>
                );
            }
        },
        {
            header: 'Asset Value',
            accessor: (row) => (
                <div className="flex flex-col">
                    <span className="font-black text-primary-black">
                        ${(row.stock_quantity * row.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[8px] font-black text-primary-dark-gray/30 uppercase tracking-widest">Calculated MSRP</span>
                </div>
            )
        }
    ];

    const totalValue = inventory.reduce((sum, item) => sum + (item.stock_quantity * item.price), 0);
    const lowStockCount = inventory.filter(i => i.stock_quantity < 10).length;

    return (
        <div className="space-y-10 animate-fadeIn pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black uppercase tracking-tighter text-primary-black mb-2">Inventory Logic</h1>
                    <p className="text-primary-dark-gray/60 font-medium uppercase tracking-[0.2em] text-xs">Stock Level Synchronization & Valuation Terminal.</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-8 py-4 rounded-full bg-bg-light font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-primary-black hover:text-white transition-all shadow-lg shadow-black/5">
                        <FaDownload /> CSV Export
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-primary-black p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent-anime/10 rounded-full blur-3xl -mr-16 -mt-16" />
                    <FaCalculator className="text-3xl text-accent-crypto mb-6" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary-white/40 mb-1">Total Inventory Value</p>
                    <p className="text-4xl font-black tracking-tighter">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>

                <div className="bg-primary-white p-10 rounded-[40px] shadow-xl shadow-black/5 border border-bg-light">
                    <FaBox className="text-3xl text-accent-anime mb-6" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary-dark-gray/40 mb-1">Active Assets</p>
                    <p className="text-4xl font-black tracking-tighter text-primary-black">{inventory.length}</p>
                </div>

                <div className="bg-primary-white p-10 rounded-[40px] shadow-xl shadow-black/5 border border-bg-light">
                    <FaHistory className="text-3xl text-red-500 mb-6" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary-dark-gray/40 mb-1">Critical Stock</p>
                    <p className="text-4xl font-black tracking-tighter text-primary-black">{lowStockCount}</p>
                </div>
            </div>

            {/* Critical Stock Alerts */}
            {lowStockCount > 0 && (
                <div className="bg-red-50 border border-red-100 p-8 rounded-[40px] flex flex-col md:flex-row items-center gap-8 animate-pulse">
                    <div className="w-16 h-16 rounded-[20px] bg-red-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-500/30">
                        <FaExclamationTriangle size={24} />
                    </div>
                    <div>
                        <h4 className="text-xl font-black text-red-800 uppercase tracking-tight mb-2">Replenishment Required</h4>
                        <p className="text-sm text-red-600 font-medium">System reports {lowStockCount} items below safe operational density. Restock protocols recommended to maintain market presence.</p>
                    </div>
                </div>
            )}

            <section className="bg-primary-white p-10 rounded-[40px] shadow-xl shadow-black/5 border border-bg-light">
                <DataTable
                    columns={columns}
                    data={inventory}
                    isLoading={loading}
                    actions={(row) => (
                        <button
                            onClick={() => navigate(`/creator/products/edit/${row.id}`)}
                            className="w-10 h-10 flex items-center justify-center hover:bg-bg-light rounded-xl text-primary-dark-gray hover:text-primary-black transition-all"
                        >
                            <FaEdit />
                        </button>
                    )}
                />
            </section>
        </div>
    );
};

export default Inventory;
