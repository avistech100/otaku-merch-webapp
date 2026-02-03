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
            <div className="w-full bg-primary-white rounded-[40px] p-8 shadow-xl shadow-black/5 animate-pulse">
                <div className="h-10 bg-bg-light/50 rounded-xl mb-4"></div>
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-16 bg-bg-light/30 rounded-xl mb-2"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="w-full bg-primary-white rounded-[40px] shadow-xl shadow-black/5 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-bg-light">
                            {columns.map((col, i) => (
                                <th
                                    key={i}
                                    className={`p-6 text-left text-xs font-black uppercase tracking-widest text-primary-dark-gray/60 ${col.className || ''}`}
                                >
                                    <div className="flex items-center gap-2">
                                        {col.header}
                                        {col.sortable && <FaSort className="opacity-30 hover:opacity-100 cursor-pointer" />}
                                    </div>
                                </th>
                            ))}
                            {actions && <th className="p-6 text-right text-xs font-black uppercase tracking-widest text-primary-dark-gray/60">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0)} className="p-10 text-center text-primary-dark-gray/60 font-medium italic">
                                    No records found.
                                </td>
                            </tr>
                        ) : (
                            data.map((row) => (
                                <tr
                                    key={row.id}
                                    onClick={() => onRowClick && onRowClick(row)}
                                    className={`border-b border-bg-light last:border-0 hover:bg-bg-light/20 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                                >
                                    {columns.map((col, i) => (
                                        <td key={i} className="p-6 text-sm font-bold text-primary-black">
                                            {typeof col.accessor === 'function' ? col.accessor(row) : (row[col.accessor] as React.ReactNode)}
                                        </td>
                                    ))}
                                    {actions && (
                                        <td className="p-6 text-right">
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
                <div className="p-6 border-t border-bg-light flex items-center justify-between">
                    <button
                        disabled={pagination.currentPage === 1}
                        onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                        className="p-2 rounded-full hover:bg-bg-light disabled:opacity-30 transition-all font-black text-xs uppercase tracking-widest flex items-center gap-2"
                    >
                        <FaChevronLeft /> Prev
                    </button>
                    <span className="text-xs font-black uppercase tracking-widest text-primary-dark-gray">
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <button
                        disabled={pagination.currentPage === pagination.totalPages}
                        onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                        className="p-2 rounded-full hover:bg-bg-light disabled:opacity-30 transition-all font-black text-xs uppercase tracking-widest flex items-center gap-2"
                    >
                        Next <FaChevronRight />
                    </button>
                </div>
            )}
        </div>
    );
};

export default DataTable;
