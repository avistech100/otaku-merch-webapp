import React from 'react';
import { Outlet } from 'react-router-dom';
import CreatorSidebar from './CreatorSidebar';
import '../../styles/admin-theme.css';

const CreatorDashboardLayout: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    return (
        <div className="admin-theme">
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
                    <h1 style={{
                        font: 'var(--font-h3)',
                        color: 'var(--text-primary)'
                    }}>Creator Dashboard</h1>
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
