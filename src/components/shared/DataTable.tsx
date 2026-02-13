import React from 'react';
import { FaChevronLeft, FaChevronRight, FaSort } from 'react-icons/fa';

export interface Column<T> {
    header: string;
    accessor: keyof T | ((row: T) => React.ReactNode);
    className?: string;
    sortable?: boolean;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    actions?: (row: T) => React.ReactNode;
    onRowClick?: (row: T) => void;
    isLoading?: boolean;
    pagination?: {
        currentPage: number;
        totalPages: number;
        onPageChange: (page: number) => void;
    };
}

const DataTable = <T extends { id: any }>({
    columns,
    data,
    actions,
    onRowClick,
    isLoading = false,
    pagination,
}: DataTableProps<T>) => {

    if (isLoading) {
        return (
            <div className="w-full bg-[var(--bg-secondary)] rounded-lg p-3 md:p-6 shadow-sm border border-[var(--border)] animate-pulse">
                <div className="h-8 bg-[var(--bg-elevated)] rounded-md mb-3"></div>
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-10 md:h-12 bg-[var(--bg-elevated)]/50 rounded-md mb-2"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="w-full admin-table-container rounded-lg border border-[var(--border)] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-[var(--border)] bg-[var(--bg-elevated)]/50">
                            {columns.map((col, i) => (
                                <th
                                    key={i}
                                    className={`p-3 md:p-4 text-left text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] ${col.className || ''}`}
                                >
                                    <div className="flex items-center gap-2">
                                        {col.header}
                                        {col.sortable && <FaSort className="opacity-30 hover:opacity-100 cursor-pointer" />}
                                    </div>
                                </th>
                            ))}
                            {actions && <th className="p-3 md:p-4 text-right text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] whitespace-nowrap">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0)} className="p-8 md:p-12 text-center text-[var(--text-muted)] font-medium italic text-xs">
                                    No records found.
                                </td>
                            </tr>
                        ) : (
                            data.map((row) => (
                                <tr
                                    key={row.id}
                                    onClick={() => onRowClick && onRowClick(row)}
                                    className={`border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-elevated)] transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                                >
                                    {columns.map((col, i) => (
                                        <td key={i} className="px-3 py-2 md:px-4 md:py-3 text-xs font-bold whitespace-nowrap lg:whitespace-normal text-[var(--text-secondary)]">
                                            {typeof col.accessor === 'function' ? col.accessor(row) : (row[col.accessor] as React.ReactNode)}
                                        </td>
                                    ))}
                                    {actions && (
                                        <td className="px-3 py-2 md:px-4 md:py-3 text-right whitespace-nowrap">
                                            {actions(row)}
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="p-4 border-t border-[var(--border)] flex items-center justify-between">
                    <button
                        disabled={pagination.currentPage === 1}
                        onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                        className="p-1.5 rounded-full hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] disabled:opacity-30 transition-all font-black text-[9px] md:text-[10px] uppercase tracking-widest flex items-center gap-1 text-[var(--text-muted)]"
                    >
                        <FaChevronLeft size={10} /> Prev
                    </button>
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <button
                        disabled={pagination.currentPage === pagination.totalPages}
                        onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                        className="p-1.5 rounded-full hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] disabled:opacity-30 transition-all font-black text-[9px] md:text-[10px] uppercase tracking-widest flex items-center gap-1 text-[var(--text-muted)]"
                    >
                        Next <FaChevronRight size={10} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default DataTable;
