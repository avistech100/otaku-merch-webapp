import React, { useState } from 'react';
import { FaEnvelope, FaSearch, FaCircle, FaArchive, FaPaperPlane } from 'react-icons/fa';

const Messages: React.FC = () => {
    const [activeChat, setActiveChat] = useState<number | null>(null);

    const chats = [
        { id: 1, user: 'CryptoKage', lastMessage: 'Is the Genesis Hoodie still in stock?', time: '2m ago', unread: true },
        { id: 2, user: 'NeoTokyo', lastMessage: 'Thank you for the quick shipment!', time: '1h ago', unread: false },
        { id: 3, user: 'SynthWave88', lastMessage: 'Would love a collaboration on the next drop.', time: '5h ago', unread: false },
    ];

    return (
        <div className="h-[calc(100vh-140px)] flex gap-6 animate-fadeIn">
            {/* Sidebar */}
            <div className="w-80 bg-primary-white rounded-[40px] shadow-xl shadow-black/5 flex flex-col overflow-hidden border border-bg-light">
                <div className="p-6 border-b border-bg-light">
                    <h2 className="text-xl font-black uppercase tracking-tight mb-4">Messages</h2>
                    <div className="relative">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-dark-gray/30 text-xs" />
                        <input
                            type="text"
                            placeholder="Search contacts..."
                            className="w-full h-10 pl-10 pr-4 bg-bg-light/30 rounded-full text-xs font-bold outline-none border border-transparent focus:border-primary-black transition-all"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {chats.map((chat) => (
                        <div
                            key={chat.id}
                            onClick={() => setActiveChat(chat.id)}
                            className={`p-6 border-b border-bg-light cursor-pointer transition-all hover:bg-bg-light/20 ${activeChat === chat.id ? 'bg-bg-light/40 border-l-4 border-l-accent-anime' : ''}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <p className="font-extrabold text-primary-black">{chat.user}</p>
                                <span className="text-[10px] uppercase font-black tracking-widest text-primary-dark-gray/40">{chat.time}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-xs text-primary-dark-gray/60 truncate pr-4">{chat.lastMessage}</p>
                                {chat.unread && <FaCircle className="text-[8px] text-accent-anime" />}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-primary-white rounded-[40px] shadow-xl shadow-black/5 flex flex-col overflow-hidden border border-bg-light">
                {activeChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-6 border-b border-bg-light flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-bg-light overflow-hidden">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeChat}`} alt="Avatar" />
                                </div>
                                <div>
                                    <p className="font-black text-primary-black">{chats.find(c => c.id === activeChat)?.user}</p>
                                    <p className="text-[10px] uppercase font-black tracking-widest text-green-500">Online</p>
                                </div>
                            </div>
                            <button className="p-3 bg-bg-light/50 rounded-full hover:bg-bg-light text-primary-dark-gray transition-colors">
                                <FaArchive size={14} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 p-8 overflow-y-auto space-y-6">
                            <div className="flex justify-start">
                                <div className="bg-bg-light/40 p-4 rounded-2xl rounded-tl-none max-w-md">
                                    <p className="text-sm font-medium text-primary-black">
                                        Hi there! I was looking at the Genesis Hoodie. Is the XL size still available for the next drop?
                                    </p>
                                    <span className="text-[8px] uppercase font-black tracking-widest text-primary-dark-gray/40 mt-2 block text-right">09:41 AM</span>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <div className="bg-primary-black p-4 rounded-2xl rounded-tr-none max-w-md">
                                    <p className="text-sm font-medium text-primary-white">
                                        Hello! Yes, the XL size is definitely in stock. We are releasing 50 units tomorrow at 6 PM UTC.
                                    </p>
                                    <span className="text-[8px] uppercase font-black tracking-widest text-primary-white/40 mt-2 block text-right">09:45 AM</span>
                                </div>
                            </div>
                        </div>

                        {/* Input */}
                        <div className="p-6 border-t border-bg-light">
                            <form className="relative" onSubmit={(e) => e.preventDefault()}>
                                <input
                                    type="text"
                                    placeholder="Type your transmission..."
                                    className="w-full h-14 pl-6 pr-16 bg-bg-light/30 rounded-full text-sm font-bold outline-none border border-transparent focus:border-primary-black transition-all"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-accent-anime text-primary-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg"
                                >
                                    <FaPaperPlane size={14} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                        <div className="w-20 h-20 bg-bg-light/50 rounded-full flex items-center justify-center mb-6 text-primary-dark-gray/20">
                            <FaEnvelope size={32} />
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tight text-primary-black mb-2">Secure Communications</h3>
                        <p className="text-primary-dark-gray/60 font-medium max-w-sm">
                            Select a transmission from the terminal to begin encrypted channel synchronization.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;
