import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import FileUpload from '../../components/shared/FileUpload';
import { FaSave, FaSpinner, FaInstagram, FaTwitter, FaGlobe, FaEnvelope } from 'react-icons/fa';

const CreatorSettings: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // Form State
    const [storeName, setStoreName] = useState('');
    const [bio, setBio] = useState('');
    const [email, setEmail] = useState('');
    const [logo, setLogo] = useState<string | null>(null);
    const [banner, setBanner] = useState<string | null>(null);
    const [socials, setSocials] = useState({
        twitter: '',
        instagram: '',
        website: ''
    });

    // File State
    const [newLogo, setNewLogo] = useState<File | null>(null);
    const [newBanner, setNewBanner] = useState<File | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (data) {
                setStoreName(data.store_name || '');
                setBio(data.store_description || '');
                setEmail(data.contact_email || user.email || '');
                setLogo(data.store_logo_url);
                setBanner(data.store_banner_url);
                setSocials({
                    twitter: data.social_links?.twitter || '',
                    instagram: data.social_links?.instagram || '',
                    website: data.social_links?.website || ''
                });
            }
            setFetching(false);
        };
        fetchProfile();
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);

        try {
            let logoUrl = logo;
            let bannerUrl = banner;

            // Upload Logo using new utility
            if (newLogo) {
                try {
                    const { uploadStoreLogo } = await import('../../utils/imageUpload');
                    logoUrl = await uploadStoreLogo(newLogo, user.id);
                } catch (error: any) {
                    throw new Error(`Logo upload failed: ${error.message}`);
                }
            }

            // Upload Banner using new utility
            if (newBanner) {
                try {
                    const { uploadStoreBanner } = await import('../../utils/imageUpload');
                    bannerUrl = await uploadStoreBanner(newBanner, user.id);
                } catch (error: any) {
                    throw new Error(`Banner upload failed: ${error.message}`);
                }
            }

            // Update Profile
            const { error } = await supabase
                .from('profiles')
                .update({
                    store_name: storeName,
                    store_description: bio,
                    store_logo_url: logoUrl,
                    store_banner_url: bannerUrl,
                    contact_email: email,
                    social_links: socials,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (error) throw error;

            alert('Settings saved successfully!');

        } catch (error: any) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="animate-pulse">Loading Settings...</div>;

    return (
        <div className="max-w-4xl mx-auto animate-fadeIn pb-20">
            <h1 className="text-4xl font-black uppercase tracking-tighter text-primary-black mb-2">Store Configuration</h1>
            <p className="text-primary-dark-gray/60 font-medium mb-12">Establish your digital presence.</p>

            <form onSubmit={handleSave} className="space-y-12">

                {/* Branding Section */}
                <section className="bg-primary-white p-8 rounded-[40px] shadow-xl shadow-black/5">
                    <h3 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-2">
                        <span className="w-2 h-8 bg-accent-crypto rounded-full"></span>
                        Branding Assets
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="col-span-1">
                            <label className="block text-xs font-black uppercase tracking-widest text-primary-dark-gray mb-4">Store Logo (1:1)</label>
                            <FileUpload
                                onFilesSelected={(files) => setNewLogo(files[0])}
                                maxFiles={1}
                                existingImages={logo ? [logo] : []}
                                label="Upload Logo"
                                onRemoveExisting={() => setLogo(null)}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-black uppercase tracking-widest text-primary-dark-gray mb-4">Store Banner (4:1)</label>
                            <FileUpload
                                onFilesSelected={(files) => setNewBanner(files[0])}
                                maxFiles={1}
                                existingImages={banner ? [banner] : []}
                                label="Upload Banner"
                                onRemoveExisting={() => setBanner(null)}
                            />
                        </div>
                    </div>
                </section>

                {/* Profile Info */}
                <section className="bg-primary-white p-8 rounded-[40px] shadow-xl shadow-black/5">
                    <h3 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-2">
                        <span className="w-2 h-8 bg-accent-anime rounded-full"></span>
                        Store Details
                    </h3>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-primary-dark-gray mb-2">Store Name</label>
                            <input
                                type="text"
                                value={storeName}
                                onChange={e => setStoreName(e.target.value)}
                                className="w-full h-14 px-6 rounded-2xl bg-bg-light/30 border-2 border-transparent focus:border-primary-black focus:bg-primary-white transition-all font-bold outline-none"
                                placeholder="Enter your store name"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-primary-dark-gray mb-2">Bio / Description</label>
                            <textarea
                                value={bio}
                                onChange={e => setBio(e.target.value)}
                                className="w-full h-32 p-6 rounded-2xl bg-bg-light/30 border-2 border-transparent focus:border-primary-black focus:bg-primary-white transition-all font-medium outline-none resize-none"
                                placeholder="Tell us about yourself and your art..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-primary-dark-gray mb-2">Contact Email</label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-6 top-1/2 -translate-y-1/2 text-primary-dark-gray/40" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full h-14 pl-14 pr-6 rounded-2xl bg-bg-light/30 border-2 border-transparent focus:border-primary-black focus:bg-primary-white transition-all font-bold outline-none"
                                    placeholder="business@example.com"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Social Links */}
                <section className="bg-primary-white p-8 rounded-[40px] shadow-xl shadow-black/5">
                    <h3 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-2">
                        <span className="w-2 h-8 bg-black rounded-full"></span>
                        Connections
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="relative">
                            <FaTwitter className="absolute left-6 top-1/2 -translate-y-1/2 text-primary-dark-gray/40" />
                            <input
                                type="text"
                                value={socials.twitter}
                                onChange={e => setSocials({ ...socials, twitter: e.target.value })}
                                className="w-full h-14 pl-14 pr-6 rounded-2xl bg-bg-light/30 border-2 border-transparent focus:border-primary-black focus:bg-primary-white transition-all font-bold outline-none"
                                placeholder="Twitter Handle"
                            />
                        </div>
                        <div className="relative">
                            <FaInstagram className="absolute left-6 top-1/2 -translate-y-1/2 text-primary-dark-gray/40" />
                            <input
                                type="text"
                                value={socials.instagram}
                                onChange={e => setSocials({ ...socials, instagram: e.target.value })}
                                className="w-full h-14 pl-14 pr-6 rounded-2xl bg-bg-light/30 border-2 border-transparent focus:border-primary-black focus:bg-primary-white transition-all font-bold outline-none"
                                placeholder="Instagram Handle"
                            />
                        </div>
                        <div className="relative">
                            <FaGlobe className="absolute left-6 top-1/2 -translate-y-1/2 text-primary-dark-gray/40" />
                            <input
                                type="text"
                                value={socials.website}
                                onChange={e => setSocials({ ...socials, website: e.target.value })}
                                className="w-full h-14 pl-14 pr-6 rounded-2xl bg-bg-light/30 border-2 border-transparent focus:border-primary-black focus:bg-primary-white transition-all font-bold outline-none"
                                placeholder="Website URL"
                            />
                        </div>
                    </div>
                </section>

                <button
                    type="submit"
                    disabled={loading}
                    className="fixed bottom-10 right-10 z-50 px-8 py-4 bg-primary-black text-primary-white rounded-full font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                >
                    {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
                    Save Changes
                </button>
            </form>
        </div>
    );
};

export default CreatorSettings;
