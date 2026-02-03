import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaHome, FaBox, FaShoppingBag, FaChartLine, FaEnvelope, FaCog, FaSignOutAlt, FaStar, FaWarehouse, FaWallet } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';

interface CreatorSidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const CreatorSidebar: React.FC<CreatorSidebarProps> = ({ isOpen, onClose }) => {
    const { signOut } = useAuth();
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
                    className="fixed inset-0 bg-primary-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={`
                fixed left-0 top-0 h-screen w-64 bg-primary-black text-primary-white z-50 flex flex-col border-r border-primary-dark-gray/20
                transition-transform duration-300 lg:translate-x-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Logo Area */}
                <div className="h-20 flex items-center px-8 border-b border-primary-dark-gray/20">
                    <span className="text-xl font-black tracking-tighter text-primary-white">
                        CREATOR <span className="text-accent-crypto">STUDIO</span>
                    </span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                            flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group
                            ${isActive ? 'bg-accent-crypto text-primary-black shadow-lg text-primary-white' : 'hover:bg-primary-dark-gray/20 text-primary-dark-gray'}
                        `}
                        >
                            <item.icon className="text-lg" />
                            <span className="font-bold text-xs uppercase tracking-widest">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Footer / User */}
                <div className="p-4 border-t border-primary-dark-gray/20">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-primary-dark-gray/10 hover:bg-accent-anime/20 hover:text-accent-anime transition-all text-primary-dark-gray"
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
