import React from 'react';
import { useParams } from 'react-router-dom';
import { creators, products } from '../data/mockData';
import ProductCard from '../components/product/ProductCard';
import { FaTwitter, FaInstagram, FaGlobe, FaTrophy, FaCalendarAlt, FaCheckCircle } from 'react-icons/fa';

const Creator: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const creator = creators.find(c => c.id === id);
    const creatorProducts = products.filter(p => p.creatorId === id);

    if (!creator) return <div className="py-40 text-center font-black text-4xl text-primary-black uppercase tracking-tighter animate-fadeIn">Creator Not Found</div>;

    return (
        <div className="animate-fadeIn">
            {/* Creator Banner */}
            <div className="h-80 w-full relative">
                <img src={creator.banner} alt="Banner" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-black via-primary-black/20 to-transparent"></div>
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 md:left-24 md:translate-x-0 w-32 h-32 rounded-[40px] border-4 border-primary-white overflow-hidden bg-primary-white shadow-2xl">
                    <img src={creator.avatar} alt={creator.name} className="w-full h-full object-cover" />
                </div>
            </div>

            <div className="layout-container mt-24 mb-24">
                <div className="flex flex-col md:flex-row justify-between items-start gap-12">
                    {/* Creator Details */}
                    <div className="md:w-1/3 animate-slideUp">
                        <h1 className="text-4xl font-black mb-2 tracking-tighter uppercase flex items-center gap-2 text-primary-black">
                            {creator.name} <FaCheckCircle className="text-accent-crypto" size={20} />
                        </h1>
                        <p className="text-primary-dark-gray/60 mb-6 font-medium leading-relaxed">{creator.bio}</p>

                        <div className="flex flex-wrap gap-4 mb-8">
                            <div className="bg-bg-light/50 border border-bg-light rounded-2xl px-6 py-4 shadow-sm">
                                <p className="text-2xl font-black tracking-tight text-primary-black">{(creator.followers / 1000).toFixed(1)}K</p>
                                <p className="text-[10px] font-black text-primary-dark-gray/30 uppercase tracking-widest">Followers</p>
                            </div>
                            <div className="bg-bg-light/50 border border-bg-light rounded-2xl px-6 py-4 shadow-sm">
                                <p className="text-2xl font-black tracking-tight text-primary-black">{creatorProducts.length}</p>
                                <p className="text-[10px] font-black text-primary-dark-gray/30 uppercase tracking-widest">Active Drops</p>
                            </div>
                        </div>

                        <div className="flex gap-4 mb-10">
                            {creator.socials.twitter && <a href="#" className="p-4 bg-primary-black text-primary-white rounded-2xl hover:bg-accent-crypto hover:scale-105 transition-all"><FaTwitter /></a>}
                            {creator.socials.instagram && <a href="#" className="p-4 bg-primary-black text-primary-white rounded-2xl hover:bg-accent-anime hover:scale-105 transition-all"><FaInstagram /></a>}
                            {creator.socials.website && <a href="#" className="p-4 bg-primary-black text-primary-white rounded-2xl hover:bg-accent-crypto hover:scale-105 transition-all"><FaGlobe /></a>}
                        </div>

                        <button className="w-full bg-accent-crypto text-primary-white font-black py-4 rounded-full uppercase tracking-widest hover:brightness-110 shadow-lg shadow-accent-crypto/20 transition-all mb-12">
                            FOLLOW CREATOR
                        </button>

                        <div className="space-y-6">
                            <h4 className="font-black text-xs uppercase tracking-widest text-primary-dark-gray/30 border-b border-bg-light pb-2">Recent Achievement</h4>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-accent-warning text-primary-black rounded-xl shadow-sm">
                                    <FaTrophy size={18} />
                                </div>
                                <div>
                                    <p className="font-black text-sm uppercase text-primary-black">Top 10 Creator</p>
                                    <p className="text-xs text-primary-dark-gray/40">December 2025 Rank</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-accent-crypto text-primary-white rounded-xl shadow-sm">
                                    <FaCalendarAlt size={18} />
                                </div>
                                <div>
                                    <p className="font-black text-sm uppercase text-primary-black">Early Adopter</p>
                                    <p className="text-xs text-primary-dark-gray/40">Joined Jan 2024</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Creator Collection */}
                    <div className="md:w-2/3 animate-fadeIn">
                        <h2 className="text-3xl font-black mb-10 tracking-tighter uppercase text-primary-black border-b border-bg-light pb-4">Current Collection</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            {creatorProducts.map(p => <ProductCard key={p.id} product={p} />)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Creator;
