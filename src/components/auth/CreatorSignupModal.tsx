import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FaTimes, FaEnvelope, FaLock, FaUser, FaStore, FaSpinner } from 'react-icons/fa';
import { useToast } from '../shared/Toast';

interface CreatorSignupModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreatorSignupModal: React.FC<CreatorSignupModalProps> = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [storeName, setStoreName] = useState('');
    const [bio, setBio] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const { showToast } = useToast();

    if (!isOpen) return null;

    const handleCreatorSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Step 1: Sign up the user
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: 'creator_pending',
                    },
                },
            });

            if (signUpError) throw signUpError;
            if (!authData.user) throw new Error('Failed to create user');

            // Step 2: Update profile with creator-specific fields
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    store_name: storeName,
                    bio: bio,
                    role: 'creator_pending',
                })
                .eq('id', authData.user.id);

            if (profileError) throw profileError;

            // Step 3: Create notification for admin
            const { error: notifError } = await supabase
                .from('notifications')
                .insert({
                    user_id: authData.user.id,
                    type: 'creator_application',
                    title: 'New Creator Application',
                    message: `${fullName} (${storeName}) has applied to become a creator.`,
                    data: {
                        applicant_id: authData.user.id,
                        store_name: storeName,
                    },
                });

            if (notifError) console.error('Failed to create notification:', notifError);

            // Success!
            setSuccess(true);
            showToast('success', 'Application submitted! Check your email for confirmation.');

            setTimeout(() => {
                onClose();
                setSuccess(false);
                // Reset form
                setEmail('');
                setPassword('');
                setFullName('');
                setStoreName('');
                setBio('');
            }, 2000);
        } catch (err: any) {
            setError(err.message);
            showToast('error', err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div
                    className="absolute inset-0 bg-primary-black/80 backdrop-blur-sm animate-fadeIn"
                    onClick={onClose}
                />
                <div className="relative w-full max-w-md bg-primary-white rounded-[40px] p-12 text-center shadow-2xl animate-slideUp">
                    <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                        <FaStore className="text-green-500 text-3xl" />
                    </div>
                    <h3 className="text-3xl font-black mb-4 tracking-tight uppercase">
                        Application Received!
                    </h3>
                    <p className="text-primary-dark-gray/70 font-medium leading-relaxed mb-2">
                        Your creator application is being reviewed by our team.
                    </p>
                    <p className="text-primary-dark-gray/70 font-medium leading-relaxed">
                        We'll notify you once you're approved!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-primary-black/80 backdrop-blur-sm animate-fadeIn"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-lg bg-primary-white rounded-[40px] overflow-hidden shadow-2xl animate-slideUp max-h-[90vh] overflow-y-auto">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-primary-dark-gray/40 hover:text-primary-black transition-all z-10"
                >
                    <FaTimes size={24} />
                </button>

                {/* Header Art */}
                <div className="h-32 bg-gradient-to-r from-accent-crypto to-accent-anime relative flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                        <img
                            src="https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&q=80&w=800"
                            alt="Creator Background"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="relative z-10 text-center">
                        <FaStore className="text-white text-4xl mx-auto mb-2" />
                        <h2 className="text-2xl font-black text-white tracking-widest">
                            BECOME A CREATOR
                        </h2>
                    </div>
                </div>

                <div className="p-10">
                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-black mb-2 tracking-tighter uppercase text-primary-black">
                            Join the Vanguard
                        </h3>
                        <p className="text-primary-dark-gray/60 font-medium text-sm">
                            Start selling your Web3 & anime apparel to thousands of collectors.
                        </p>
                    </div>

                    <form onSubmit={handleCreatorSignup} className="space-y-4">
                        <div className="relative">
                            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-dark-gray/30" />
                            <input
                                type="text"
                                placeholder="Full Name"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="input-text w-full pl-12 font-bold"
                            />
                        </div>

                        <div className="relative">
                            <FaStore className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-dark-gray/30" />
                            <input
                                type="text"
                                placeholder="Store Name"
                                required
                                value={storeName}
                                onChange={(e) => setStoreName(e.target.value)}
                                className="input-text w-full pl-12 font-bold"
                            />
                        </div>

                        <div className="relative">
                            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-dark-gray/30" />
                            <input
                                type="email"
                                placeholder="Email Address"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-text w-full pl-12 font-bold"
                            />
                        </div>

                        <div className="relative">
                            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-dark-gray/30" />
                            <input
                                type="password"
                                placeholder="Password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-text w-full pl-12 font-bold"
                            />
                        </div>

                        <div>
                            <textarea
                                placeholder="Tell us about your brand and what you want to sell..."
                                required
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={4}
                                className="input-text w-full font-medium resize-none"
                            />
                        </div>

                        {error && (
                            <p className="text-accent-anime text-xs font-bold text-center animate-pulse">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary h-16 rounded-full font-black uppercase tracking-widest shadow-xl shadow-accent-crypto/20 flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <FaSpinner className="animate-spin" />
                            ) : (
                                'Submit Application'
                            )}
                        </button>

                        <p className="text-xs text-primary-dark-gray/50 text-center font-medium">
                            Your application will be reviewed within 24-48 hours.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreatorSignupModal;
