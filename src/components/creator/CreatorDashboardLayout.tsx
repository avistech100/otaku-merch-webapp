import React from 'react';
import { Outlet } from 'react-router-dom';
import CreatorSidebar from './CreatorSidebar';
import '../../styles/admin-theme.css';

const CreatorDashboardLayout: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    return (
        <div className="creator-theme">
            <CreatorSidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

            <div className="lg:ml-56 flex flex-col min-h-screen">
                {/* Creator Control Header */}
                <header
                    className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 border-b transition-all duration-200"
                    style={{
                        height: '56px',
                        background: 'var(--bg-primary)',
                        borderBottom: '1px solid var(--border)'
                    }}
                >
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
                        }} className="text-sm md:text-lg uppercase font-black tracking-widest">Creator Dashboard</h1>
                    </div>
                </header>


                {/* Main Content */}
                <main
                    className="flex-1 p-4 md:p-6 w-full mx-auto max-w-[1280px]"
                >
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default CreatorDashboardLayout;
