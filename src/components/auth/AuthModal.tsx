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
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        }
                    }
                });
                if (error) throw error;
                alert('Check your email for the confirmation link!');
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
            <div className="relative w-full max-w-md bg-primary-white rounded-[40px] overflow-hidden shadow-2xl animate-slideUp">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-primary-dark-gray/40 hover:text-primary-black transition-all z-10"
                >
                    <FaTimes size={24} />
                </button>

                {/* Header Art */}
                <div className="h-32 bg-primary-black relative flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-30">
                        <img
                            src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=800"
                            alt="Mantis"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <h2 className="text-3xl font-black text-primary-white tracking-widest relative z-10">
                        OTAKU <span className="text-accent-anime">MERCH</span>
                    </h2>
                </div>

                <div className="p-10">
                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-black mb-2 tracking-tighter uppercase text-primary-black">
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h3>
                        <p className="text-primary-dark-gray/60 font-medium text-sm">
                            {isLogin ? 'Login to access your personalized drop alerts.' : 'Join the elite vanguard of digital fashion.'}
                        </p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                        {!isLogin && (
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
                        )}
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
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-text w-full pl-12 font-bold"
                            />
                        </div>

                        {error && (
                            <p className="text-accent-anime text-xs font-bold text-center animate-pulse">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary h-16 rounded-full font-black uppercase tracking-widest shadow-xl shadow-accent-anime/20 flex items-center justify-center gap-3"
                        >
                            {loading ? <FaSpinner className="animate-spin" /> : (isLogin ? 'Login' : 'Signup')}
                        </button>
                    </form>

                    <div className="mt-8">
                        <div className="relative flex items-center justify-center mb-6">
                            <div className="border-t border-bg-light w-full"></div>
                            <span className="bg-primary-white px-4 text-[10px] font-black text-primary-dark-gray/30 uppercase tracking-[0.2em] absolute">Or continue with</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex items-center justify-center gap-2 h-12 rounded-full border-2 border-bg-light font-bold text-sm hover:border-primary-black transition-all text-primary-black">
                                <FaGoogle className="text-red-500" /> Google
                            </button>
                            <button className="flex items-center justify-center gap-2 h-12 rounded-full border-2 border-bg-light font-bold text-sm hover:border-primary-black transition-all text-primary-black">
                                <FaGithub /> GitHub
                            </button>
                        </div>
                    </div>

                    <p className="mt-8 text-center text-sm font-medium text-primary-dark-gray/60">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-accent-anime font-black uppercase tracking-widest text-xs ml-1 hover:underline"
                        >
                            {isLogin ? 'Sign Up' : 'Login'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
