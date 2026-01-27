import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { supabase } from '../lib/supabase';
import { FaCheck, FaLock, FaShippingFast, FaCreditCard, FaSpinner } from 'react-icons/fa';

// @ts-ignore
import PaystackPop from '@paystack/inline-js';

const Checkout: React.FC = () => {
    const navigate = useNavigate();
    const { items, getSubtotal, clearCart } = useCartStore();
    const subtotal = getSubtotal();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);

    const [shippingInfo, setShippingInfo] = useState({
        firstName: '',
        lastName: '',
        email: '',
        address: '',
        city: '',
        state: '',
        zip: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
    };

    const initiatePayment = async () => {
        setLoading(true);
        try {
            // 1. Create Order in Supabase
            const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const total = subtotal + 15; // Including shipping

            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    order_number: orderNumber,
                    total: total,
                    subtotal: subtotal,
                    shipping_fee: 15,
                    shipping_address: shippingInfo,
                    status: 'pending',
                    payment_status: 'pending',
                    currency: 'USD'
                })
                .select()
                .single();

            if (orderError) throw orderError;
            setOrderId(order.id);

            // 2. Insert Order Items
            const orderItems = items.map(item => ({
                order_id: order.id,
                product_id: item.id,
                title: item.title,
                price: item.price,
                quantity: item.quantity,
                metadata: { size: item.selectedSize, color: item.selectedColor }
            }));

            const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
            if (itemsError) throw itemsError;

            // 3. Initiate Paystack
            const paystack = new PaystackPop();
            paystack.newTransaction({
                key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
                email: shippingInfo.email,
                amount: Math.round(total * 100 * 1600), // Convert USD to NGN approximately or handle currency properly
                currency: 'NGN',
                onSuccess: (transaction: any) => {
                    handleSuccess(order.id, transaction.reference);
                },
                onCancel: () => {
                    setLoading(false);
                    alert('Payment cancelled');
                }
            });

        } catch (error) {
            console.error("Checkout error:", error);
            alert("Checkout failed. Please try again.");
            setLoading(false);
        }
    };

    const handleSuccess = async (id: string, reference: string) => {
        try {
            // Update order status in Supabase
            await supabase.rpc('handle_payment_success', {
                p_order_id: id,
                p_reference: reference
            });

            clearCart();
            setStep(4); // Success step
        } catch (error) {
            console.error("Error updating order:", error);
        } finally {
            setLoading(false);
        }
    };

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
                style={{ width: `${((Math.min(step, 3) - 1) / 2) * 100}%` }}
            ></div>
        </div>
    );

    if (step === 4) {
        return (
            <div className="layout-container py-40 text-center animate-fadeIn">
                <div className="w-24 h-24 bg-accent-crypto rounded-full flex items-center justify-center mx-auto mb-8 text-primary-white shadow-xl shadow-accent-crypto/20">
                    <FaCheck size={40} />
                </div>
                <h2 className="text-5xl font-black mb-4 text-primary-black uppercase tracking-tighter">ORDER PLACED!</h2>
                <p className="text-primary-dark-gray/60 font-medium mb-12 uppercase tracking-[0.2em] text-sm">Thank you for your purchase. We've sent a confirmation email.</p>
                <Link to="/products" className="btn-primary inline-block">CONTINUE SHOPPING</Link>
            </div>
        );
    }

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
                                    <input type="text" name="firstName" placeholder="First Name" value={shippingInfo.firstName} onChange={handleInputChange} className="input-text w-full font-bold" />
                                    <input type="text" name="lastName" placeholder="Last Name" value={shippingInfo.lastName} onChange={handleInputChange} className="input-text w-full font-bold" />
                                </div>
                                <input type="email" name="email" placeholder="Email Address" value={shippingInfo.email} onChange={handleInputChange} className="input-text w-full font-bold" />
                                <input type="text" name="address" placeholder="Address" value={shippingInfo.address} onChange={handleInputChange} className="input-text w-full font-bold" />
                                <div className="grid grid-cols-3 gap-4">
                                    <input type="text" name="city" placeholder="City" value={shippingInfo.city} onChange={handleInputChange} className="input-text w-full font-bold" />
                                    <input type="text" name="state" placeholder="State" value={shippingInfo.state} onChange={handleInputChange} className="input-text w-full font-bold" />
                                    <input type="text" name="zip" placeholder="Zip" value={shippingInfo.zip} onChange={handleInputChange} className="input-text w-full font-bold" />
                                </div>
                                <button
                                    onClick={() => setStep(2)}
                                    className="w-full btn-primary py-5 rounded-full uppercase tracking-widest shadow-xl shadow-black/10"
                                    disabled={!shippingInfo.email || !shippingInfo.address}
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
                                <div className="grid grid-cols-1 gap-4 mb-8">
                                    <div className="border-2 border-accent-anime rounded-3xl p-6 bg-accent-anime/5 cursor-pointer">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="font-black text-primary-black">Paystack</p>
                                            <FaCheck className="text-accent-anime" />
                                        </div>
                                        <p className="text-xs text-primary-dark-gray/60 font-bold">Secure Cards, Bank Transfer, USSD</p>
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
                                        <p className="font-bold text-primary-black">{shippingInfo.firstName} {shippingInfo.lastName}</p>
                                        <p className="text-sm text-primary-dark-gray/60">{shippingInfo.address}, {shippingInfo.city}, {shippingInfo.zip}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase text-primary-dark-gray/40 tracking-widest mb-2">Payment</h4>
                                        <p className="font-bold text-primary-black">Secure Payment via Paystack</p>
                                    </div>
                                </div>
                                <button
                                    onClick={initiatePayment}
                                    disabled={loading}
                                    className="w-full bg-accent-anime text-primary-white py-6 rounded-full font-black text-xl uppercase tracking-[0.2em] hover:brightness-110 shadow-xl shadow-accent-anime/20 transition-all flex items-center justify-center gap-3"
                                >
                                    {loading ? <FaSpinner className="animate-spin" /> : 'Pay Now'}
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
                                    <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4 items-center">
                                        <div className="w-12 h-15 bg-bg-light rounded-lg shrink-0 overflow-hidden shadow-sm">
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm truncate uppercase text-primary-black">{item.title}</p>
                                            <p className="text-[10px] text-primary-dark-gray/40 font-black uppercase tracking-widest">Size: {item.selectedSize} | Qty: {item.quantity}</p>
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

