import React, { useState } from 'react';
import { FaGlobe, FaCogs, FaSave, FaShieldAlt, FaPercentage, FaExclamationTriangle } from 'react-icons/fa';

const SiteSettings: React.FC = () => {
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [platformFee, setPlatformFee] = useState(10);
    const [siteName, setSiteName] = useState('Otaku Merch HQ');

    const handleSave = () => {
        // Mock save
        alert('Transmission Encrypted. System Config Updated.');
    };

    return (
        <div className="space-y-10 max-w-4xl">
            <div>
                <h1 className="text-5xl font-black tracking-tighter text-white mb-2 uppercase">Core Configuration</h1>
                <p className="text-white/40 font-bold tracking-widest uppercase text-xs flex items-center gap-2">
                    <FaGlobe className="text-purple-500" /> Site-wide Parameters • Modify with Authority
                </p>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* General Settings */}
                <section className="bg-white/5 border border-white/5 p-10 rounded-[40px] shadow-2xl relative overflow-hidden">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                            <FaCogs size={20} />
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tight text-white">General Directives</h3>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-3 ml-1">Platform Designation</label>
                            <input
                                type="text"
                                value={siteName}
                                onChange={(e) => setSiteName(e.target.value)}
                                className="w-full h-16 px-6 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:border-purple-500 outline-none transition-all focus:bg-white/10"
                            />
                        </div>

                        <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5">
                            <div>
                                <h4 className="font-black uppercase tracking-tight text-white mb-1">Maintenance Protocol</h4>
                                <p className="text-xs text-white/40">Disable public access for scheduled maintenance.</p>
                            </div>
                            <button
                                onClick={() => setMaintenanceMode(!maintenanceMode)}
                                className={`w-14 h-8 rounded-full transition-all relative ${maintenanceMode ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-white/10'}`}
                            >
                                <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>
                </section>

                {/* Economic Settings */}
                <section className="bg-white/5 border border-white/5 p-10 rounded-[40px] shadow-2xl">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500">
                            <FaPercentage size={20} />
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tight text-white">Economic Model</h3>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-3 ml-1">Platform Tax (%)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={platformFee}
                                    onChange={(e) => setPlatformFee(Number(e.target.value))}
                                    className="w-full h-16 px-6 bg-white/5 border border-white/10 rounded-2xl text-white font-black text-2xl focus:border-green-500 outline-none transition-all"
                                />
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 font-black">PERCENT</div>
                            </div>
                            <p className="mt-3 text-[10px] text-white/20 font-bold uppercase tracking-widest flex items-center gap-2">
                                <FaExclamationTriangle className="text-yellow-500" /> Changing this affects all future orders.
                            </p>
                        </div>
                    </div>
                </section>

                <div className="pt-6">
                    <button
                        onClick={handleSave}
                        className="w-full h-20 bg-white text-black rounded-[28px] font-black uppercase tracking-[0.3em] text-sm hover:bg-purple-500 hover:text-white transition-all shadow-2xl flex items-center justify-center gap-4 group"
                    >
                        <FaSave className="text-xl group-hover:scale-125 transition-transform" />
                        Execute Save Sequence
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SiteSettings;
