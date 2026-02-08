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

            <div className="lg:ml-[260px] flex flex-col min-h-screen">
                {/* Control Center Header */}
                <header style={{
                    height: '72px',
                    padding: '0 32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: 0,
                    zIndex: 30,
                    background: 'var(--bg-primary)',
                    borderBottom: '1px solid var(--border)',
                    backdropFilter: 'blur(12px)'
                }}>
                    {/* Search */}
                    <div style={{ position: 'relative', width: '320px' }}>
                        <FaSearch style={{
                            position: 'absolute',
                            left: '14px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-muted)',
                            fontSize: '14px'
                        }} />
                        <input
                            type="text"
                            placeholder="Search control system..."
                            style={{
                                width: '100%',
                                height: '40px',
                                paddingLeft: '40px',
                                paddingRight: '14px',
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--text-primary)',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all 150ms'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'var(--accent-primary)';
                                e.target.style.background = 'var(--bg-elevated)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'var(--border)';
                                e.target.style.background = 'var(--bg-secondary)';
                            }}
                        />
                    </div>

                    {/* Right Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            transition: 'all 150ms'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--bg-elevated)';
                                e.currentTarget.style.color = 'var(--accent-primary)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'var(--bg-secondary)';
                                e.currentTarget.style.color = 'var(--text-muted)';
                            }}
                        >
                            <FaBell size={16} />
                        </button>

                        <div style={{
                            height: '32px',
                            width: '1px',
                            background: 'var(--border)'
                        }} />

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ textAlign: 'right' }}>
                                <p className="text-micro" style={{ color: 'var(--text-primary)', marginBottom: '2px' }}>System Admin</p>
                                <p style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: 500 }}>Master Access</p>
                            </div>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: 'var(--radius-sm)',
                                background: 'linear-gradient(135deg, var(--accent-primary), #6366f1)',
                                padding: '2px'
                            }}>
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '6px',
                                    background: 'var(--bg-primary)',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <img
                                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
                                        alt="Admin"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Viewport */}
                <main style={{
                    flex: 1,
                    padding: '32px',
                    position: 'relative',
                    maxWidth: '1400px',
                    margin: '0 auto',
                    width: '100%'
                }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminDashboardLayout;
