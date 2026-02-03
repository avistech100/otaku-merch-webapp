import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

interface ProtectedRouteProps {
    allowedRoles?: ('user' | 'creator' | 'admin' | 'creator_pending')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const { user, loading: authLoading } = useAuth();
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkRole = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            // Check profile for output
            const { data } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (data) {
                setRole(data.role);
            }
            setLoading(false);
        };

        if (!authLoading) {
            checkRole();
        }
    }, [user, authLoading]);

    if (authLoading || loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-primary-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-accent-crypto mb-4 mx-auto"></div>
                    <p className="font-black text-xs uppercase tracking-widest text-primary-dark-gray">Verifying Clearance...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && role && !allowedRoles.includes(role as any)) {
        // Redirect logic based on role
        if (role === 'creator_pending') {
            return (
                <div className="h-screen w-full flex flex-col items-center justify-center bg-primary-white p-8 text-center">
                    <h1 className="text-4xl font-black mb-4 uppercase tracking-tighter">Application Pending</h1>
                    <p className="max-w-md text-primary-dark-gray mb-8">Your creator application is currently under review by our team. We'll notify you once you're approved!</p>
                    <button onClick={() => window.location.href = '/'} className="btn-primary px-8 py-3 rounded-full">Return Home</button>
                </div>
            );
        }
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
