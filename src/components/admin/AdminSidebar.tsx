import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    FaHome, FaUsers, FaUserCheck, FaBox,
    FaShoppingBag, FaChartBar, FaGlobe, FaWallet,
    FaSignOutAlt, FaRocket, FaFileAlt
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';

const AdminSidebar: React.FC = () => {
    const { signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    const navItems = [
        { icon: FaHome, label: 'Control Center', path: '/admin/dashboard' },
        { icon: FaUsers, label: 'User Operations', path: '/admin/users' },
        { icon: FaUserCheck, label: 'Seller Verifications', path: '/admin/pending-creators' },
        { icon: FaBox, label: 'Product Curation', path: '/admin/pending-products' },
        { icon: FaShoppingBag, label: 'Global Orders', path: '/admin/orders' },
        { icon: FaWallet, label: 'Finance Hub', path: '/admin/payouts' },
        { icon: FaChartBar, label: 'Platform Intel', path: '/admin/analytics' },
        { icon: FaFileAlt, label: 'Content System', path: '/admin/content' },
        { icon: FaGlobe, label: 'Site Settings', path: '/admin/settings' },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-72 bg-[#09090B] text-white z-40 hidden lg:flex flex-col border-r border-white/5 shadow-2xl">
            {/* Admin Header */}
            <div className="h-24 flex items-center px-10 border-b border-white/5 bg-gradient-to-r from-purple-900/10 to-transparent">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <FaRocket className="text-white text-lg" />
                    </div>
                    <span className="text-xl font-black tracking-tight">
                        HQ <span className="text-purple-500">OPERATIONS</span>
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-10 px-6 space-y-2">
                <div className="px-4 mb-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Intelligence</p>
                </div>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group
                            ${isActive
                                ? 'bg-purple-600 text-white shadow-xl shadow-purple-900/20 translate-x-1'
                                : 'hover:bg-white/5 text-white/50 hover:text-white'}
                        `}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon className={`text-lg transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-purple-500'}`} />
                                <span className="font-bold text-xs uppercase tracking-widest">{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Admin Footer */}
            <div className="p-6 border-t border-white/5 bg-black/20">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-2xl bg-white/5 hover:bg-red-500/10 hover:text-red-500 transition-all text-white/40 border border-white/5"
                >
                    <FaSignOutAlt />
                    <span className="font-bold text-xs uppercase tracking-widest">Terminate Session</span>
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
