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
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="flex-1">
                    <h1 className="text-xl md:text-3xl font-black uppercase tracking-tighter text-[var(--text-primary)] mb-1">Inventory Logic</h1>
                    <p className="text-[var(--text-muted)] font-medium uppercase tracking-[0.2em] text-[9px] md:text-[10px]">Stock Level Synchronization & Valuation Terminal.</p>
                </div>
                <div className="flex gap-3">
                    <button className="w-full sm:w-auto px-5 md:px-6 py-2.5 md:py-3 rounded-md bg-[var(--bg-elevated)] border border-[var(--border)] font-black text-[9px] md:text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[var(--accent-primary)] hover:text-white transition-all text-[var(--text-secondary)]">
                        <FaDownload /> CSV Export
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-[var(--bg-secondary)] p-4 md:p-6 rounded-lg border border-[var(--border)] text-[var(--text-primary)] shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--accent-primary)]/10 rounded-full blur-2xl -mr-12 -mt-12" />
                    <FaCalculator className="text-xl md:text-2xl text-[var(--accent-secondary)] mb-4" />
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Total Inventory Value</p>
                    <p className="text-xl md:text-2xl lg:text-3xl font-black tracking-tighter">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>

                <div className="bg-[var(--bg-secondary)] p-4 md:p-6 rounded-lg shadow-sm border border-[var(--border)]">
                    <FaBox className="text-xl md:text-2xl text-[var(--accent-primary)] mb-4" />
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Active Assets</p>
                    <p className="text-xl md:text-2xl lg:text-3xl font-black tracking-tighter text-[var(--text-primary)]">{inventory.length}</p>
                </div>

                <div className="bg-[var(--bg-secondary)] p-4 md:p-6 rounded-lg shadow-sm border border-[var(--border)] sm:col-span-2 lg:col-span-1">
                    <FaHistory className="text-xl md:text-2xl text-[var(--error)] mb-4" />
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Critical Stock</p>
                    <p className="text-xl md:text-2xl lg:text-3xl font-black tracking-tighter text-[var(--text-primary)]">{lowStockCount}</p>
                </div>
            </div>

            {/* Critical Stock Alerts */}
            {lowStockCount > 0 && (
                <div className="bg-red-900/10 border border-red-500/20 p-4 md:p-6 rounded-lg flex flex-col md:flex-row items-center gap-4 md:gap-6 animate-pulse text-center md:text-left">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-red-500/20 text-red-500 flex items-center justify-center shrink-0">
                        <FaExclamationTriangle className="text-lg md:text-xl" />
                    </div>
                    <div>
                        <h4 className="text-base md:text-lg font-black text-red-500 uppercase tracking-tight mb-1">Replenishment Required</h4>
                        <p className="text-xs text-red-400 font-medium">System reports {lowStockCount} items below safe operational density. Restock protocols recommended.</p>
                    </div>
                </div>
            )}

            <section className="bg-[var(--bg-secondary)] p-0 rounded-lg shadow-sm border border-[var(--border)]">
                <DataTable
                    columns={columns}
                    data={inventory}
                    isLoading={loading}
                    actions={(row) => (
                        <button
                            onClick={() => navigate(`/creator/products/edit/${row.id}`)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-[var(--bg-elevated)] rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
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
