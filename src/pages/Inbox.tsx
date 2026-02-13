import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { FaPaperPlane, FaSpinner, FaSearch, FaUserCircle, FaCircle } from 'react-icons/fa';

interface Message {
    id: string;
    sender_id: string;
    recipient_id: string;
    body: string;
    created_at: string;
    is_read: boolean;
}

interface Contact {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string;
    last_message?: string;
    last_message_time?: string;
    unread_count?: number;
}

const Inbox: React.FC = () => {
    const { user } = useAuth();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [activeContact, setActiveContact] = useState<Contact | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user) {
            fetchContacts();
        }
    }, [user]);

    useEffect(() => {
        if (activeContact && user) {
            fetchMessages(activeContact.id);
        }
    }, [activeContact, user]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchContacts = async () => {
        setLoading(true);
        try {
            // Get users the current user has messaged or received messages from
            // For simulation, let's just get creators you follow or admins
            const { data: follows } = await supabase
                .from('follows')
                .select('following_id, profiles!following_id(*)')
                .eq('follower_id', user?.id);

            const followContacts = (follows || []).map((f: any) => ({
                id: f.profiles.id,
                full_name: f.profiles.full_name,
                username: f.profiles.username,
                avatar_url: f.profiles.avatar_url,
                last_message: 'Initiate transmission...',
                unread_count: 0
            }));

            setContacts(followContacts);
        } catch (error) {
            console.error('Contacts error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (contactId: string) => {
        const { data } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${user?.id},recipient_id.eq.${contactId}),and(sender_id.eq.${contactId},recipient_id.eq.${user?.id})`)
            .order('created_at', { ascending: true });

        if (data) setMessages(data);
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeContact || !user) return;

        setSending(true);
        try {
            const { data, error: _error } = await supabase
                .from('messages')
                .insert({
                    sender_id: user.id,
                    recipient_id: activeContact.id,
                    body: newMessage.trim()
                })
                .select()
                .single();

            if (data) setMessages([...messages, data]);
            setNewMessage('');
        } catch (error) {
            console.error('Send error:', error);
        } finally {
            setSending(false);
        }
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <FaSpinner className="animate-spin text-4xl text-primary-black" />
                <p className="font-black uppercase tracking-widest text-xs">Accessing Encrypted Channel...</p>
            </div>
        </div>
    );

    return (
        <div className="layout-container py-12 animate-fadeIn h-[calc(100vh-100px)] flex flex-col">
            <h1 className="text-3xl font-black uppercase tracking-tighter text-primary-black mb-6">Secure Inbox</h1>

            <div className="flex-1 flex bg-primary-white rounded-3xl shadow-xl shadow-black/5 border border-bg-light overflow-hidden mb-8">
                {/* Contacts List */}
                <div className="w-full md:w-72 border-r border-bg-light flex flex-col">
                    <div className="p-4 border-b border-bg-light">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-dark-gray/30" size={12} />
                            <input
                                type="text"
                                placeholder="Search Intel..."
                                className="w-full h-10 pl-10 pr-4 rounded-xl bg-bg-light/30 border border-transparent focus:border-primary-black outline-none font-bold transition-all text-xs"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {contacts.map(contact => (
                            <button
                                key={contact.id}
                                onClick={() => setActiveContact(contact)}
                                className={`w-full p-4 flex items-center gap-3 hover:bg-bg-light/50 transition-all border-b border-bg-light/30 text-left ${activeContact?.id === contact.id ? 'bg-bg-light/50' : ''}`}
                            >
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-bg-light shadow-sm border border-bg-light">
                                        <img src={contact.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.id}`} alt={contact.username} className="w-full h-full object-cover" />
                                    </div>
                                    <FaCircle className="absolute -bottom-0.5 -right-0.5 text-green-500 border-2 border-primary-white text-[8px]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <p className="font-black text-xs uppercase tracking-tight text-primary-black truncate">{contact.full_name || contact.username}</p>
                                        <span className="text-[7px] font-black text-primary-dark-gray/30 leading-none">12:45</span>
                                    </div>
                                    <p className="text-[9px] font-bold text-primary-dark-gray/40 truncate mt-0.5">{contact.last_message}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-bg-light/5">
                    {activeContact ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 bg-primary-white border-b border-bg-light flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl overflow-hidden bg-bg-light shadow-sm border border-bg-light">
                                        <img src={activeContact.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeContact.id}`} alt={activeContact.username} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h3 className="font-black uppercase tracking-tight text-primary-black text-xs leading-none">{activeContact.full_name}</h3>
                                        <p className="text-[8px] text-green-500 font-black uppercase tracking-widest mt-1">Status: Linked</p>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4" ref={scrollRef}>
                                {messages.map(msg => {
                                    const isMe = msg.sender_id === user?.id;
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] p-4 rounded-2xl font-bold text-xs shadow-sm ${isMe
                                                ? 'bg-primary-black text-white rounded-tr-none'
                                                : 'bg-primary-white text-primary-black rounded-tl-none border border-bg-light'
                                                }`}>
                                                <p className="leading-relaxed">{msg.body}</p>
                                                <p className={`text-[7px] mt-1.5 font-black uppercase opacity-40 ${isMe ? 'text-white text-right' : 'text-primary-black'}`}>
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                {messages.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center opacity-20">
                                        <FaPaperPlane size={32} className="mb-4" />
                                        <p className="font-black uppercase tracking-widest text-[10px]">Intel stream silent</p>
                                    </div>
                                )}
                            </div>

                            {/* Input */}
                            <form onSubmit={sendMessage} className="p-4 bg-primary-white border-t border-bg-light flex gap-3">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type transmission..."
                                    className="flex-1 h-11 px-4 rounded-xl bg-bg-light/30 border border-transparent focus:border-primary-black outline-none font-bold transition-all text-xs"
                                />
                                <button
                                    type="submit"
                                    disabled={sending || !newMessage.trim()}
                                    className="w-11 h-11 bg-primary-black text-white rounded-xl flex items-center justify-center hover:bg-accent-anime transition-all shadow-lg shadow-accent-anime/20 disabled:opacity-50"
                                >
                                    {sending ? <FaSpinner className="animate-spin" size={14} /> : <FaPaperPlane size={14} />}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-20">
                            <FaUserCircle size={64} className="mb-4" />
                            <h3 className="text-xl font-black uppercase tracking-tighter text-primary-black mb-1">No Uplink Established</h3>
                            <p className="font-bold text-[10px] text-primary-dark-gray max-w-[200px] uppercase tracking-widest">Select target to initiate communication.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Inbox;
