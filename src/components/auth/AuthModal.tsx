import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FaTimes, FaEnvelope, FaLock, FaUser, FaGoogle, FaGithub, FaSpinner } from 'react-icons/fa';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        },
                        emailRedirectTo: window.location.origin
                    }
                });
                if (error) throw error;

                // Check if email confirmation is required
                if (data?.user && !data.session) {
                    alert('✅ Account created! Check your email for the confirmation link.');
                } else if (data?.session) {
                    // Auto-confirmed (happens when email confirmation is disabled in Supabase)
                    alert('✅ Account created successfully! You are now logged in.');
                }
            }
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-primary-black/80 backdrop-blur-sm animate-fadeIn"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-sm bg-primary-white rounded-[32px] overflow-hidden shadow-2xl animate-slideUp border border-bg-light">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-primary-dark-gray/40 hover:text-primary-black transition-all z-10"
                >
                    <FaTimes size={18} />
                </button>

                {/* Header Art */}
                <div className="h-24 bg-primary-black relative flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-40">
                        <img
                            src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=800"
                            alt="Auth Header"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <h2 className="text-xl font-black text-primary-white tracking-widest relative z-10">
                        OTAKU <span className="text-accent-anime">MERCH</span>
                    </h2>
                </div>

                <div className="p-8">
                    <div className="text-center mb-6">
                        <h3 className="text-xl font-black mb-1 tracking-tighter uppercase text-primary-black">
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h3>
                        <p className="text-primary-dark-gray/60 font-bold text-[10px] uppercase tracking-wider">
                            {isLogin ? 'ENTER CLEARANCE KEY' : 'JOIN THE VANGUARD'}
                        </p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-3">
                        {!isLogin && (
                            <div className="relative">
                                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-dark-gray/30" size={14} />
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-bg-light/30 border border-transparent focus:border-primary-black outline-none font-bold text-xs"
                                />
                            </div>
                        )}
                        <div className="relative">
                            <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-dark-gray/30" size={14} />
                            <input
                                type="email"
                                placeholder="Email Address"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-11 pl-10 pr-4 rounded-xl bg-bg-light/30 border border-transparent focus:border-primary-black outline-none font-bold text-xs"
                            />
                        </div>
                        <div className="relative">
                            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-dark-gray/30" size={14} />
                            <input
                                type="password"
                                placeholder="Password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-11 pl-10 pr-4 rounded-xl bg-bg-light/30 border border-transparent focus:border-primary-black outline-none font-bold text-xs"
                            />
                        </div>

                        {error && (
                            <p className="text-accent-anime text-[10px] font-black text-center uppercase tracking-widest animate-pulse">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-black text-primary-white h-11 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-accent-anime transition-all shadow-lg flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? <FaSpinner className="animate-spin" /> : (isLogin ? 'Login' : 'Signup')}
                        </button>
                    </form>

                    <div className="mt-6">
                        <div className="relative flex items-center justify-center mb-4">
                            <div className="border-t border-bg-light w-full"></div>
                            <span className="bg-primary-white px-3 text-[9px] font-black text-primary-dark-gray/30 uppercase tracking-[0.2em] absolute">Or continue with</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex items-center justify-center gap-2 h-10 rounded-xl border border-bg-light font-black text-[10px] hover:border-primary-black transition-all text-primary-black uppercase tracking-widest">
                                <FaGoogle className="text-red-500" /> Google
                            </button>
                            <button className="flex items-center justify-center gap-2 h-10 rounded-xl border border-bg-light font-black text-[10px] hover:border-primary-black transition-all text-primary-black uppercase tracking-widest">
                                <FaGithub /> GitHub
                            </button>
                        </div>
                    </div>

                    <p className="mt-6 text-center text-[10px] font-bold text-primary-dark-gray/40 uppercase tracking-widest">
                        {isLogin ? "No account?" : "Already member?"}{' '}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-accent-anime font-black hover:underline"
                        >
                            {isLogin ? 'SIGN UP' : 'LOGIN'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
