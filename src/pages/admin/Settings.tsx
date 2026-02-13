import React, { useState } from 'react';
import { FaGlobe, FaCogs, FaSave, FaPercentage, FaExclamationTriangle } from 'react-icons/fa';

const SiteSettings: React.FC = () => {
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [platformFee, setPlatformFee] = useState(10);
    const [siteName, setSiteName] = useState('Otaku Merch HQ');

    const handleSave = () => {
        // Mock save
        alert('Transmission Encrypted. System Config Updated.');
    };

    return (
        <div className="space-y-6 max-w-3xl">
            <div className="flex flex-col gap-1">
                <h1 className="text-xl md:text-2xl font-black tracking-tighter text-[var(--text-primary)] uppercase">Core Configuration</h1>
                <p className="text-[var(--text-muted)] font-bold tracking-widest uppercase text-[9px] flex items-center gap-2">
                    <FaGlobe className="text-[var(--accent-primary)]" /> Site-wide Parameters • Modify with Authority
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {/* General Settings */}
                <section className="bg-[var(--bg-secondary)] border border-[var(--border)] p-5 rounded-lg shadow-sm">
                    <div className="flex items-center gap-3 mb-5 border-b border-[var(--border)] pb-3">
                        <div className="w-8 h-8 rounded-md bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--accent-primary)]">
                            <FaCogs size={14} />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-tight text-[var(--text-primary)]">General Directives</h3>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1.5 ml-0.5">Platform Designation</label>
                            <input
                                type="text"
                                value={siteName}
                                onChange={(e) => setSiteName(e.target.value)}
                                className="w-full h-10 px-3 bg-[var(--bg-primary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] font-medium focus:border-[var(--accent-primary)] outline-none transition-all focus:bg-[var(--bg-elevated)]"
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-[var(--bg-elevated)] rounded-md border border-[var(--border)]">
                            <div>
                                <h4 className="font-bold uppercase tracking-tight text-[var(--text-primary)] text-xs mb-0.5">Maintenance Protocol</h4>
                                <p className="text-[10px] text-[var(--text-muted)]">Disable public access for scheduled maintenance.</p>
                            </div>
                            <button
                                onClick={() => setMaintenanceMode(!maintenanceMode)}
                                className={`w-10 h-6 rounded-full transition-all relative ${maintenanceMode ? 'bg-[var(--error)] shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'bg-[var(--bg-secondary)] border border-[var(--border)]'}`}
                            >
                                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${maintenanceMode ? 'translate-x-4' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>
                </section>

                {/* Economic Settings */}
                <section className="bg-[var(--bg-secondary)] border border-[var(--border)] p-5 rounded-lg shadow-sm">
                    <div className="flex items-center gap-3 mb-5 border-b border-[var(--border)] pb-3">
                        <div className="w-8 h-8 rounded-md bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--accent-secondary)]">
                            <FaPercentage size={14} />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-tight text-[var(--text-primary)]">Economic Model</h3>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1.5 ml-0.5">Platform Tax (%)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={platformFee}
                                    onChange={(e) => setPlatformFee(Number(e.target.value))}
                                    className="w-full h-10 px-3 bg-[var(--bg-primary)] border border-[var(--border)] rounded-md text-[var(--text-primary)] font-bold text-sm focus:border-[var(--accent-secondary)] outline-none transition-all"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-black text-[9px] uppercase tracking-wider opacity-50">PERCENT</div>
                            </div>
                            <p className="mt-2 text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-widest flex items-center gap-1.5 opacity-70">
                                <FaExclamationTriangle className="text-[var(--warning)]" /> Changing this affects all future orders.
                            </p>
                        </div>
                    </div>
                </section>

                <div className="pt-2">
                    <button
                        onClick={handleSave}
                        className="w-full h-10 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-md font-black uppercase tracking-[0.2em] text-[10px] hover:bg-[var(--accent-primary)] hover:text-white transition-all shadow-lg flex items-center justify-center gap-2 group border border-transparent"
                    >
                        <FaSave className="text-sm group-hover:scale-110 transition-transform" />
                        Execute Save Sequence
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SiteSettings;
