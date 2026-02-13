import React, { useState } from 'react';
import { FaEnvelope, FaSearch, FaCircle, FaPaperPlane, FaArrowLeft } from 'react-icons/fa';

const Messages: React.FC = () => {
    const [activeChat, setActiveChat] = useState<number | null>(null);

    const chats = [
        { id: 1, user: 'CryptoKage', lastMessage: 'Is the Genesis Hoodie still in stock?', time: '2m ago', unread: true },
        { id: 2, user: 'NeoTokyo', lastMessage: 'Thank you for the quick shipment!', time: '1h ago', unread: false },
        { id: 3, user: 'SynthWave88', lastMessage: 'Would love a collaboration on the next drop.', time: '5h ago', unread: false },
    ];

    return (
        <div className="h-[calc(100vh-180px)] md:h-[calc(100vh-140px)] flex gap-6 animate-fadeIn relative">
            {/* Sidebar */}
            <div className={`w-full lg:w-64 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] shadow-sm flex flex-col overflow-hidden ${activeChat ? 'hidden lg:flex' : 'flex'}`}>
                <div className="p-4 border-b border-[var(--border)]">
                    <h2 className="text-base font-black uppercase tracking-tight mb-3 text-[var(--text-primary)]">Messages</h2>
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-[10px]" />
                        <input
                            type="text"
                            placeholder="Search contacts..."
                            className="w-full h-8 pl-8 pr-3 bg-[var(--bg-elevated)] rounded-full text-[10px] font-bold outline-none border border-transparent focus:border-[var(--accent-primary)] text-[var(--text-primary)] transition-all"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {chats.map((chat) => (
                        <div
                            key={chat.id}
                            onClick={() => setActiveChat(chat.id)}
                            className={`p-4 border-b border-[var(--border)] cursor-pointer transition-all hover:bg-[var(--bg-elevated)] ${activeChat === chat.id ? 'bg-[var(--bg-elevated)] border-l-2 border-l-[var(--accent-anime)]' : ''}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <p className="font-extrabold text-[var(--text-primary)] text-xs">{chat.user}</p>
                                <span className="text-[9px] uppercase font-black tracking-widest text-[var(--text-muted)]">{chat.time}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-[10px] text-[var(--text-secondary)] truncate pr-2">{chat.lastMessage}</p>
                                {chat.unread && <FaCircle className="text-[6px] text-[var(--accent-anime)]" />}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] shadow-sm flex flex-col overflow-hidden ${!activeChat ? 'hidden lg:flex' : 'flex'}`}>
                {activeChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-3 md:p-4 border-b border-[var(--border)] flex justify-between items-center">
                            <div className="flex items-center gap-3 min-w-0">
                                <button
                                    onClick={() => setActiveChat(null)}
                                    className="lg:hidden p-1 -ml-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                                >
                                    <FaArrowLeft size={14} />
                                </button>
                                <div className="w-8 h-8 rounded-full bg-[var(--bg-elevated)] overflow-hidden shrink-0">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeChat}`} alt="Avatar" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-black text-xs md:text-sm text-[var(--text-primary)] truncate">{chats.find(c => c.id === activeChat)?.user}</p>
                                    <p className="text-[8px] uppercase font-black tracking-widest text-green-500">Online</p>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-4">
                            <div className="flex justify-start">
                                <div className="bg-[var(--bg-elevated)] p-3 rounded-lg rounded-tl-none max-w-[85%] md:max-w-md border border-[var(--border)]">
                                    <p className="text-xs font-medium text-[var(--text-secondary)] leading-relaxed">
                                        Hi there! I was looking at the Genesis Hoodie. Is the XL size still available for the next drop?
                                    </p>
                                    <span className="text-[8px] uppercase font-black tracking-widest text-[var(--text-muted)] mt-1 block text-right">09:41 AM</span>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <div className="bg-[var(--accent-primary)] p-3 rounded-lg rounded-tr-none max-w-[85%] md:max-w-md shadow-md">
                                    <p className="text-xs font-medium text-white leading-relaxed">
                                        Hello! Yes, the XL size is definitely in stock. We are releasing 50 units tomorrow at 6 PM UTC.
                                    </p>
                                    <span className="text-[8px] uppercase font-black tracking-widest text-white/50 mt-1 block text-right">09:45 AM</span>
                                </div>
                            </div>
                        </div>

                        {/* Input */}
                        <div className="p-3 md:p-4 border-t border-[var(--border)]">
                            <form className="relative" onSubmit={(e) => e.preventDefault()}>
                                <input
                                    type="text"
                                    placeholder="Type your transmission..."
                                    className="w-full h-10 pl-4 pr-12 bg-[var(--bg-elevated)] rounded-full text-xs font-bold outline-none border border-transparent focus:border-[var(--accent-primary)] text-[var(--text-primary)] transition-all"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 bg-[var(--accent-anime)] text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md"
                                >
                                    <FaPaperPlane className="text-xs" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                        <div className="w-16 h-16 bg-[var(--bg-elevated)] rounded-full flex items-center justify-center mb-4 text-[var(--text-muted)]">
                            <FaEnvelope size={24} />
                        </div>
                        <h3 className="text-lg font-black uppercase tracking-tight text-[var(--text-primary)] mb-1">Secure Communications</h3>
                        <p className="text-[var(--text-muted)] font-medium text-xs max-w-xs">
                            Select a transmission from the terminal to begin encrypted channel synchronization.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;
