import React from 'react';
import { Outlet } from 'react-router-dom';
import CreatorSidebar from './CreatorSidebar';
import { FaBars } from 'react-icons/fa';

const CreatorDashboardLayout: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    return (
        <div className="min-h-screen bg-bg-light/30">
            <CreatorSidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

            {/* Mobile Header */}
            <div className="lg:hidden h-16 bg-primary-black text-primary-white flex items-center justify-between px-6 sticky top-0 z-30 shadow-lg">
                <span className="font-black tracking-tighter uppercase text-xs">Creator <span className="text-accent-crypto">Center</span></span>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="w-10 h-10 flex items-center justify-center bg-primary-dark-gray/20 rounded-xl"
                >
                    <FaBars />
                </button>
            </div>

            {/* Main Content */}
            <main className="lg:ml-64 min-h-screen p-6 md:p-10 transition-all duration-300">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default CreatorDashboardLayout;
