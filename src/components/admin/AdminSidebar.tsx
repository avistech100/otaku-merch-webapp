import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    FaHome, FaUsers, FaUserCheck, FaBox,
    FaShoppingBag, FaChartBar, FaGlobe, FaWallet,
    FaSignOutAlt, FaRocket, FaFileAlt
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';

interface AdminSidebarProps {
    isMobileMenuOpen?: boolean;
    setIsMobileMenuOpen?: (open: boolean) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isMobileMenuOpen: _isMobileMenuOpen, setIsMobileMenuOpen: _setIsMobileMenuOpen }) => {
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
        <aside className="fixed left-0 top-0 h-screen w-56 bg-[var(--bg-secondary)] text-[var(--text-primary)] z-50 flex flex-col border-r border-[var(--border)] hidden lg:flex">
            {/* Admin Header */}
            <div className="h-14 flex items-center px-6 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-[var(--accent-primary)] flex items-center justify-center shadow-lg shadow-[var(--accent-primary)]/20">
                        <FaRocket className="text-white text-xs" />
                    </div>
                    <span className="text-sm font-black tracking-tighter text-[var(--text-primary)]">
                        HQ <span className="text-[var(--accent-primary)]">COMMAND</span>
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-50">Operations</div>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group relative
                            ${isActive
                                ? 'bg-[var(--bg-elevated)] text-[var(--accent-primary)] border-l-2 border-[var(--accent-primary)]'
                                : 'hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}
                        `}
                    >
                        <item.icon className="text-sm transition-colors" />
                        <span className="font-bold text-[10px] uppercase tracking-widest">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Admin Footer */}
            <div className="p-3 border-t border-[var(--border)] bg-[var(--bg-secondary)]">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 hover:border-red-500/30 transition-all"
                >
                    <FaSignOutAlt className="text-xs" />
                    <span className="font-bold text-[9px] uppercase tracking-widest">Terminate Session</span>
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
