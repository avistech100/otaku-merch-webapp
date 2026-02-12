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
                fixed left-0 top-0 h-screen w-64 bg-[#121215] text-[#FAFAFA] z-50 flex flex-col border-r border-[#27272A]
                transition-transform duration-300 ease-in-out lg:translate-x-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Logo Area */}
                <div className="h-20 flex items-center px-8 border-b border-[#27272A]">
                    <span className="text-xl font-black tracking-tighter text-[#FAFAFA]">
                        CREATOR <span className="text-[#3B82F6]">STUDIO</span>
                    </span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => onClose?.()}
                            className={({ isActive }) => `
                            flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group relative
                            ${isActive
                                    ? 'bg-[#3B82F6]/10 text-[#3B82F6] shadow-[0_0_20px_rgba(59,130,246,0.15)] border-l-2 border-[#3B82F6]'
                                    : 'hover:bg-white/5 text-[#71717A] hover:text-[#FAFAFA]'}
                        `}
                        >
                            <item.icon className={`text-lg transition-colors ${item.path === '/creator/dashboard' ? 'group-hover:text-[#3B82F6]' : ''}`} />
                            <span className="font-bold text-xs uppercase tracking-widest">{item.label}</span>

                            {/* Glow effect for active state */}
                            <div className="absolute inset-0 rounded-lg opacity-0 active-glow transition-opacity pointer-events-none" />
                        </NavLink>
                    ))}
                </nav>

                {/* Footer / User */}
                <div className="p-4 border-t border-[#27272A] space-y-4">
                    <div className="flex items-center gap-3 px-2 py-1">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#27272A] bg-[#18181B] shrink-0">
                            <img
                                src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-[#FAFAFA] truncate uppercase tracking-tight">
                                {profile?.full_name || 'Pilot'}
                            </p>
                            <p className="text-[10px] text-[#71717A] font-medium truncate">
                                {user?.email}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-[#18181B] border border-[#27272A] hover:border-[#3B82F6]/50 hover:bg-[#3B82F6]/10 hover:text-[#3B82F6] transition-all text-[#71717A]"
                    >
                        <FaSignOutAlt />
                        <span className="font-bold text-xs uppercase tracking-widest">Logout</span>
                    </button>
                </div>
            </aside>

        </>
    );
};

export default CreatorSidebar;
