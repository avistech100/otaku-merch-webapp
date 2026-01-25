import React from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { FaTrash, FaMinus, FaPlus, FaArrowLeft, FaShoppingCart } from 'react-icons/fa';

const Cart: React.FC = () => {
    const { items, removeItem, updateQuantity, getSubtotal } = useCartStore();
    const subtotal = getSubtotal();
    const shipping = items.length > 0 ? 15.00 : 0;
    const total = subtotal + shipping;

    if (items.length === 0) {
        return (
            <div className="layout-container py-40 text-center animate-fadeIn">
                <div className="w-24 h-24 bg-bg-light rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
                    <FaShoppingCart size={40} className="text-primary-dark-gray/20" />
                </div>
                <h2 className="text-4xl font-black mb-6 tracking-tighter text-primary-black uppercase">Your Cart is Empty</h2>
                <p className="text-primary-dark-gray/60 mb-10 font-medium tracking-tight">Looks like you haven't added any items to your cart yet.</p>
                <Link to="/products" className="btn-primary inline-block uppercase tracking-widest shadow-xl shadow-black/10">
                    START SHOPPING
                </Link>
            </div>
        );
    }

    return (
        <div className="layout-container py-12 animate-fadeIn">
            <h1 className="text-5xl font-black mb-12 tracking-tighter uppercase text-primary-black">Shopping Cart</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                {/* Cart Items List */}
                <div className="lg:col-span-2 space-y-8">
                    {items.map((item) => (
                        <div key={`${item.id}-${item.selectedSize}`} className="flex flex-col sm:flex-row gap-6 pb-8 border-b border-bg-light last:border-0 animate-slideUp">
                            <div className="w-full sm:w-40 aspect-[4/5] bg-bg-light rounded-2xl overflow-hidden shrink-0 shadow-sm">
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                            </div>

                            <div className="flex-1 flex flex-col justify-between py-2">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-2xl font-black tracking-tight leading-tight uppercase text-primary-black">{item.title}</h3>
                                        <p className="font-black text-2xl text-primary-black">${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                    <p className="text-primary-dark-gray/40 font-bold text-sm uppercase mb-4 tracking-widest">
                                        Size: <span className="text-primary-black ml-1">{item.selectedSize}</span>
                                    </p>
                                </div>

                                <div className="flex justify-between items-center mt-6">
                                    <div className="flex items-center border border-bg-light rounded-full px-3 py-1 gap-4 text-primary-black font-bold">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                                            className="text-primary-dark-gray/30 hover:text-accent-anime transition-all p-1"
                                        >
                                            <FaMinus size={10} />
                                        </button>
                                        <span className="font-black w-6 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                                            className="text-primary-dark-gray/30 hover:text-accent-anime transition-all p-1"
                                        >
                                            <FaPlus size={10} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.id, item.selectedSize)}
                                        className="flex items-center gap-2 text-primary-dark-gray/30 hover:text-accent-anime font-black transition-all text-xs uppercase tracking-widest"
                                    >
                                        <FaTrash size={12} /> REMOVE
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    <Link to="/products" className="inline-flex items-center gap-2 text-primary-black font-black text-sm uppercase tracking-widest hover:text-accent-anime transition-all pt-4">
                        <FaArrowLeft size={10} /> CONTINUE SHOPPING
                    </Link>
                </div>

                {/* Order Summary */}
                <div className="bg-primary-white p-8 md:p-10 rounded-[40px] h-fit sticky top-32 border border-bg-light shadow-2xl shadow-black/5 animate-slideUp">
                    <h2 className="text-3xl font-black mb-8 tracking-tighter uppercase text-primary-black">Summary</h2>

                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between font-bold text-primary-black">
                            <span className="text-primary-dark-gray/40 uppercase tracking-widest text-xs">Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-primary-black">
                            <span className="text-primary-dark-gray/40 uppercase tracking-widest text-xs">Shipping</span>
                            <span>${shipping.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-primary-black">
                            <span className="text-primary-dark-gray/40 uppercase tracking-widest text-xs">Tax</span>
                            <span className="italic opacity-50">At checkout</span>
                        </div>
                    </div>

                    <div className="py-6 border-t border-bg-light mb-8">
                        <div className="flex justify-between items-center text-primary-black">
                            <span className="font-black text-xl uppercase tracking-tighter">Total</span>
                            <span className="font-black text-3xl tracking-tighter">${total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="mb-8">
                        <label className="block text-xs font-black uppercase tracking-widest mb-3 text-primary-dark-gray/60">Promo Code</label>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="text"
                                placeholder="ENTER CODE"
                                className="input-text flex-1 uppercase font-black text-sm min-w-0"
                            />
                            <button className="bg-primary-black text-primary-white px-6 py-3 rounded-xl font-black hover:bg-primary-dark-gray transition-all whitespace-nowrap shrink-0">
                                APPLY
                            </button>
                        </div>
                    </div>

                    <Link
                        to="/checkout"
                        className="block w-full bg-accent-anime text-primary-white font-black text-center py-5 rounded-full text-lg uppercase tracking-[0.2em] hover:brightness-110 shadow-xl shadow-accent-anime/20 transition-all"
                    >
                        Checkout Now
                    </Link>

                    <div className="mt-8 flex justify-center gap-4 opacity-20 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="Paypal" className="h-5" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
