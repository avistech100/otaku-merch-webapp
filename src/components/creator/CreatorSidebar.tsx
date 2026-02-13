import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaHome, FaBox, FaShoppingBag, FaChartLine, FaEnvelope, FaCog, FaSignOutAlt, FaStar, FaWarehouse, FaWallet } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';

interface CreatorSidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const CreatorSidebar: React.FC<CreatorSidebarProps> = ({ isOpen, onClose }) => {
    const { signOut, user } = useAuth();
    const { profile } = useProfile();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    const navItems = [
        { icon: FaHome, label: 'Dashboard', path: '/creator/dashboard' },
        { icon: FaBox, label: 'Products', path: '/creator/products' },
        { icon: FaShoppingBag, label: 'Orders', path: '/creator/orders' },
        { icon: FaWarehouse, label: 'Inventory', path: '/creator/inventory' },
        { icon: FaChartLine, label: 'Analytics', path: '/creator/analytics' },
        { icon: FaWallet, label: 'Earnings', path: '/creator/earnings' },
        { icon: FaStar, label: 'Reviews', path: '/creator/reviews' },
        { icon: FaEnvelope, label: 'Messages', path: '/creator/messages' },
        { icon: FaCog, label: 'Settings', path: '/creator/settings' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 lg:hidden transition-opacity duration-300"
                    onClick={onClose}
                />
            )}

            <aside className={`
                fixed left-0 top-0 h-screen w-56 bg-[var(--bg-secondary)] text-[var(--text-primary)] z-50 flex flex-col border-r border-[var(--border)]
                transition-transform duration-300 ease-in-out lg:translate-x-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Logo Area */}
                <div className="h-14 flex items-center px-6 border-b border-[var(--border)]">
                    <span className="text-sm font-black tracking-tighter text-[var(--text-primary)]">
                        CREATOR <span className="text-[var(--accent-primary)]">STUDIO</span>
                    </span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => onClose?.()}
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

                {/* Footer / User */}
                <div className="p-3 border-t border-[var(--border)] space-y-3">
                    <div className="flex items-center gap-2 px-2 py-1">
                        <div className="w-8 h-8 rounded overflow-hidden border border-[var(--border)] bg-[var(--bg-elevated)] shrink-0">
                            <img
                                src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black text-[var(--text-primary)] truncate uppercase tracking-tight">
                                {profile?.full_name || 'Pilot'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-all text-[var(--text-secondary)]"
                    >
                        <FaSignOutAlt className="text-xs" />
                        <span className="font-bold text-[9px] uppercase tracking-widest">Logout</span>
                    </button>
                </div>
            </aside>

        </>
    );
};

export default CreatorSidebar;
