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

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
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
        <aside style={{
            position: 'fixed',
            left: 0,
            top: 0,
            height: '100vh',
            width: '260px',
            background: 'var(--bg-secondary)',
            zIndex: 40,
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid var(--border)'
        }} className="hidden lg:flex">
            {/* Admin Header */}
            <div style={{
                height: '72px',
                display: 'flex',
                alignItems: 'center',
                padding: '0 24px',
                borderBottom: '1px solid var(--border)',
                background: 'linear-gradient(135deg, rgba(124, 90, 237, 0.08), transparent)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--accent-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(124, 90, 237, 0.3)'
                    }}>
                        <FaRocket style={{ color: 'white', fontSize: '16px' }} />
                    </div>
                    <span style={{
                        fontSize: '18px',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        letterSpacing: '-0.02em'
                    }}>
                        HQ <span style={{ color: 'var(--accent-primary)' }}>COMMAND</span>
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{
                flex: 1,
                overflowY: 'auto',
                padding: '24px 16px'
            }}>
                <div className="admin-nav-label">Operations</div>
                <div className="admin-nav-group">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
                        >
                            <item.icon />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </div>
            </nav>

            {/* Admin Footer */}
            <div style={{
                padding: '16px',
                borderTop: '1px solid var(--border)',
                background: 'rgba(0, 0, 0, 0.2)'
            }}>
                <button
                    onClick={handleLogout}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        padding: '12px 20px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(255, 92, 124, 0.1)',
                        border: '1px solid rgba(255, 92, 124, 0.2)',
                        color: 'var(--error)',
                        cursor: 'pointer',
                        transition: 'all 150ms',
                        fontSize: '12px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 92, 124, 0.15)';
                        e.currentTarget.style.transform = 'scale(0.98)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 92, 124, 0.1)';
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    <FaSignOutAlt />
                    <span>Terminate Session</span>
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
