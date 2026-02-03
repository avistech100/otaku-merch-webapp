import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { FaBars, FaBell, FaSearch } from 'react-icons/fa';

const AdminDashboardLayout: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#020203] text-white">
            <AdminSidebar />

            <div className="lg:ml-72 flex flex-col min-h-screen relative">
                {/* Global Admin Header */}
                <header className="h-24 px-10 flex items-center justify-between sticky top-0 z-30 bg-[#020203]/80 backdrop-blur-xl border-b border-white/5">
                    {/* Search / Status */}
                    <div className="hidden md:flex items-center gap-6">
                        <div className="relative group">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-purple-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search Command System..."
                                className="h-12 w-80 bg-white/5 rounded-xl pl-12 pr-6 border border-white/5 focus:border-purple-500 focus:bg-white/[0.07] outline-none transition-all text-sm font-medium"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <button className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-purple-500 hover:bg-purple-500/10 transition-all border border-white/5">
                            <FaBell />
                        </button>
                        <div className="h-10 w-[1px] bg-white/5 mx-2" />
                        <div className="flex items-center gap-3 pl-2">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-black text-white uppercase tracking-tighter">System Admin</p>
                                <p className="text-[10px] text-purple-500 font-bold uppercase tracking-widest">Master Access</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 p-[2px]">
                                <div className="w-full h-full rounded-[10px] bg-[#09090B] flex items-center justify-center overflow-hidden">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" className="w-full h-full object-cover" />
                                </div>
                            </div>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="lg:hidden w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <FaBars />
                        </button>
                    </div>
                </header>

                {/* Main Viewport */}
                <main className="flex-1 p-8 md:p-12 animate-fadeIn relative overflow-hidden">
                    {/* Abstract Background Elements */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-600/5 rounded-full blur-[100px] -ml-32 -mb-32 pointer-events-none" />

                    <div className="max-w-7xl mx-auto relative z-10">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboardLayout;
