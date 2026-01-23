import React, { useState } from 'react';
import { useCartStore } from '../store/useCartStore';
import { FaCheck, FaLock, FaShippingFast, FaCreditCard } from 'react-icons/fa';

const Checkout: React.FC = () => {
    const [step, setStep] = useState(1);
    const { items, getSubtotal } = useCartStore();
    const subtotal = getSubtotal();

    const renderStepIndicator = () => (
        <div className="flex items-center justify-between max-w-xl mx-auto mb-16 relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-bg-light -translate-y-1/2 -z-10"></div>
            {[1, 2, 3].map((s) => (
                <div
                    key={s}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all duration-300 z-10
            ${step >= s ? 'bg-accent-anime text-primary-white scale-110 shadow-lg shadow-accent-anime/40' : 'bg-primary-white border-2 border-bg-light text-primary-dark-gray/30'}`}
                >
                    {step > s ? <FaCheck size={14} /> : s}
                </div>
            ))}
            <div
                className="absolute top-1/2 left-0 h-1 bg-accent-anime -translate-y-1/2 -z-10 transition-all duration-500"
                style={{ width: `${((step - 1) / 2) * 100}%` }}
            ></div>
        </div>
    );

    return (
        <div className="layout-container py-12 animate-fadeIn">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-5xl font-black mb-4 tracking-tighter uppercase text-center text-primary-black">Checkout</h1>
                <p className="text-primary-dark-gray/60 text-center font-medium mb-12 uppercase tracking-[0.3em] text-xs">Secure Payment & Shipping</p>

                {renderStepIndicator()}

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
                    <div className="lg:col-span-3">
                        {step === 1 && (
                            <div className="space-y-8 animate-fadeIn">
                                <h2 className="text-3xl font-black tracking-tighter uppercase flex items-center gap-3 text-primary-black">
                                    <FaShippingFast size={24} className="text-accent-crypto" /> Shipping Info
                                </h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" placeholder="First Name" className="input-text w-full font-bold" />
                                    <input type="text" placeholder="Last Name" className="input-text w-full font-bold" />
                                </div>
                                <input type="email" placeholder="Email Address" className="input-text w-full font-bold" />
                                <input type="text" placeholder="Address" className="input-text w-full font-bold" />
                                <div className="grid grid-cols-3 gap-4">
                                    <input type="text" placeholder="City" className="input-text w-full font-bold" />
                                    <input type="text" placeholder="State" className="input-text w-full font-bold" />
                                    <input type="text" placeholder="Zip" className="input-text w-full font-bold" />
                                </div>
                                <button
                                    onClick={() => setStep(2)}
                                    className="w-full btn-primary py-5 rounded-full uppercase tracking-widest shadow-xl shadow-black/10"
                                >
                                    Continue to Payment
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-8 animate-fadeIn">
                                <h2 className="text-3xl font-black tracking-tighter uppercase flex items-center gap-3 text-primary-black">
                                    <FaCreditCard size={24} className="text-accent-anime" /> Payment Method
                                </h2>
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="border-2 border-accent-anime rounded-3xl p-6 bg-accent-anime/5">
                                        <p className="font-black mb-1 text-primary-black">Credit Card</p>
                                        <p className="text-xs text-primary-dark-gray/60 font-bold">Visa, Mastercard, AMEX</p>
                                    </div>
                                    <div className="border-2 border-bg-light rounded-3xl p-6 hover:border-primary-black transition-all cursor-pointer">
                                        <p className="font-black mb-1 text-primary-black">Crypto (BitPay)</p>
                                        <p className="text-xs text-primary-dark-gray/60 font-bold">BTC, ETH, SOL, USDC</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <input type="text" placeholder="Card Number" className="input-text w-full font-bold" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input type="text" placeholder="MM/YY" className="input-text w-full font-bold" />
                                        <input type="text" placeholder="CVV" className="input-text w-full font-bold" />
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => setStep(1)} className="flex-1 btn-secondary py-5 rounded-full uppercase tracking-widest">Back</button>
                                    <button onClick={() => setStep(3)} className="flex-1 btn-primary py-5 rounded-full uppercase tracking-widest shadow-xl shadow-black/10">Review Order</button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-8 animate-fadeIn">
                                <h2 className="text-3xl font-black tracking-tighter uppercase text-primary-black">Review & Confirm</h2>
                                <div className="bg-bg-light/50 rounded-[32px] p-8 space-y-6 border border-bg-light">
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase text-primary-dark-gray/40 tracking-widest mb-2">Shipping to</h4>
                                        <p className="font-bold text-primary-black">John Doe</p>
                                        <p className="text-sm text-primary-dark-gray/60">123 Web3 Lane, Satoshi City, 90210</p>
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase text-primary-dark-gray/40 tracking-widest mb-2">Payment</h4>
                                        <p className="font-bold text-primary-black">Visa ending in 4242</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => alert('Order Placed! (Simulation)')}
                                    className="w-full bg-accent-anime text-primary-white py-6 rounded-full font-black text-xl uppercase tracking-[0.2em] hover:brightness-110 shadow-xl shadow-accent-anime/20 transition-all"
                                >
                                    Place Order
                                </button>
                                <button onClick={() => setStep(2)} className="w-full text-primary-dark-gray/40 font-black uppercase tracking-widest text-xs hover:text-primary-black transition-all">Back to payment</button>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-2">
                        <div className="bg-primary-white border border-bg-light rounded-[40px] p-8 shadow-2xl shadow-black/5 animate-slideUp">
                            <h3 className="text-xl font-black mb-6 tracking-tight uppercase text-primary-black border-b border-bg-light pb-4">Order Summary</h3>
                            <div className="space-y-4 mb-6">
                                {items.map(item => (
                                    <div key={item.id} className="flex gap-4 items-center">
                                        <div className="w-12 h-15 bg-bg-light rounded-lg shrink-0 overflow-hidden shadow-sm">
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm truncate uppercase text-primary-black">{item.title}</p>
                                            <p className="text-[10px] text-primary-dark-gray/40 font-black uppercase tracking-widest">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-black text-primary-black tracking-tight">${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-6 border-t border-bg-light space-y-3">
                                <div className="flex justify-between font-bold text-sm">
                                    <span className="text-primary-dark-gray/40 tracking-widest uppercase">Subtotal</span>
                                    <span className="text-primary-black">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-sm">
                                    <span className="text-primary-dark-gray/40 tracking-widest uppercase">Shipping</span>
                                    <span className="text-primary-black">$15.00</span>
                                </div>
                                <div className="flex justify-between items-center pt-4 font-black text-2xl tracking-tighter border-t border-bg-light mt-4 text-primary-black">
                                    <span>TOTAL</span>
                                    <span className="text-3xl">${(subtotal + 15).toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="mt-8 flex items-center justify-center gap-2 text-primary-dark-gray/20 font-black text-[10px] uppercase tracking-widest">
                                <FaLock /> SSL Secure Transaction
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
