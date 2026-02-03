import { supabase } from '../lib/supabase';

/**
 * Send a magic link for passwordless authentication
 */
export const sendMagicLink = async (email: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: window.location.origin,
        }
    });

    if (error) throw error;
    return data;
};

/**
 * Verify OTP code
 */
export const verifyOTP = async (email: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
    });

    if (error) throw error;
    return data;
};
