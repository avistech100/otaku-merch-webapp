import React from 'react';
import { Outlet } from 'react-router-dom';
import CreatorSidebar from './CreatorSidebar';
import '../../styles/admin-theme.css';

const CreatorDashboardLayout: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    return (
        <div className="creator-theme">
            <CreatorSidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

            <div className="lg:ml-[260px] flex flex-col min-h-screen">
                {/* Creator Control Header */}
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
                    borderBottom: '1px solid var(--border)'
                }}>
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden p-2 text-primary hover:bg-white/5 rounded-lg"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <h1 style={{
                            font: 'var(--font-h3)',
                            color: 'var(--text-primary)'
                        }}>Creator Dashboard</h1>
                    </div>
                </header>


                {/* Main Content */}
                <main style={{
                    flex: 1,
                    padding: '32px',
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

export default CreatorDashboardLayout;
