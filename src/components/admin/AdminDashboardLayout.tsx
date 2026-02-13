import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { FaBell, FaSearch } from 'react-icons/fa';
import '../../styles/admin-theme.css';

const AdminDashboardLayout: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="admin-theme">
            <AdminSidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

            <div className="lg:ml-56 flex flex-col min-h-screen">
                {/* Control Center Header */}
                <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 border-b border-[var(--border)] bg-[var(--bg-primary)]/80 backdrop-blur-md h-14 transition-all duration-200">
                    {/* Search */}
                    <div className="relative w-64 md:w-80 group">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent-primary)] transition-colors text-xs" />
                        <input
                            type="text"
                            placeholder="Search control system..."
                            className="w-full h-8 pl-9 pr-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] focus:bg-[var(--bg-elevated)] transition-all"
                        />
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3">
                        <button className="w-8 h-8 rounded-md bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--accent-primary)] transition-all">
                            <FaBell size={12} />
                        </button>

                        <div className="h-6 w-px bg-[var(--border)]" />

                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-[10px] uppercase font-black tracking-widest text-[var(--text-primary)] leading-none mb-1">System Admin</p>
                                <p className="text-[9px] font-bold text-[var(--accent-primary)] leading-none uppercase tracking-wider">Master Access</p>
                            </div>
                            <div className="w-8 h-8 rounded-md p-0.5 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)]">
                                <div className="w-full h-full rounded-[4px] bg-[var(--bg-primary)] overflow-hidden">
                                    <img
                                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
                                        alt="Admin"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Viewport */}
                <main className="flex-1 p-4 md:p-6 w-full mx-auto max-w-[1400px]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminDashboardLayout;
