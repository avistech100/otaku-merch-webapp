import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export const useSocial = (targetUserId?: string, productId?: string) => {
    const { user } = useAuth();
    const [isFollowing, setIsFollowing] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Follow Logic
    useEffect(() => {
        if (user && targetUserId) {
            checkFollowStatus();
        }
        if (targetUserId) {
            fetchFollowerCount();
        }
    }, [user, targetUserId]);

    // Comments Logic
    useEffect(() => {
        if (productId) {
            fetchComments();
        }
    }, [productId]);

    const checkFollowStatus = async () => {
        const { data } = await supabase
            .from('follows')
            .select('*')
            .eq('follower_id', user?.id)
            .eq('following_id', targetUserId)
            .single();
        setIsFollowing(!!data);
    };

    const fetchFollowerCount = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('follower_count')
            .eq('id', targetUserId)
            .single();
        if (data) setFollowerCount(data.follower_count);
    };

    const toggleFollow = async () => {
        if (!user) return alert('Please login to follow creators');
        if (user.id === targetUserId) return alert("You can't follow yourself");

        setLoading(true);
        try {
            if (isFollowing) {
                await supabase
                    .from('follows')
                    .delete()
                    .eq('follower_id', user.id)
                    .eq('following_id', targetUserId);
                setIsFollowing(false);
                setFollowerCount(prev => prev - 1);
            } else {
                await supabase
                    .from('follows')
                    .insert({ follower_id: user.id, following_id: targetUserId });
                setIsFollowing(true);
                setFollowerCount(prev => prev + 1);
            }
        } catch (error) {
            console.error('Follow error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        const { data, error } = await supabase
            .from('comments')
            .select('*, profiles(full_name, avatar_url, username)')
            .eq('product_id', productId)
            .order('created_at', { ascending: false });
        
        if (data) setComments(data);
    };

    const postComment = async (content: string) => {
        if (!user) return alert('Please login to comment');
        if (!content.trim()) return;

        try {
            const { data, error } = await supabase
                .from('comments')
                .insert({
                    product_id: productId,
                    user_id: user.id,
                    content: content.trim()
                })
                .select('*, profiles(full_name, avatar_url, username)')
                .single();

            if (data) setComments([data, ...comments]);
            return data;
        } catch (error) {
            console.error('Comment error:', error);
        }
    };

    return {
        isFollowing,
        followerCount,
        comments,
        loading,
        toggleFollow,
        postComment,
        refreshComments: fetchComments
    };
};
