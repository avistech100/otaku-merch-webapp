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
            <h1 className="text-3xl font-black mb-8 tracking-tighter uppercase text-primary-black">Shopping Cart</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items List */}
                <div className="lg:col-span-2 space-y-4">
                    {items.map((item) => (
                        <div key={`${item.id}-${item.selectedSize}`} className="flex flex-col sm:flex-row gap-4 pb-4 border-b border-bg-light last:border-0 animate-slideUp">
                            <div className="w-full sm:w-24 aspect-[4/5] bg-bg-light rounded-xl overflow-hidden shrink-0 shadow-sm border border-bg-light">
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                            </div>

                            <div className="flex-1 flex flex-col justify-between py-1">
                                <div>
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="text-sm font-black tracking-tight uppercase text-primary-black leading-tight line-clamp-2 pr-4">{item.title}</h3>
                                        <p className="font-black text-sm text-primary-black">${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                    <p className="text-primary-dark-gray/40 font-bold text-[10px] uppercase mb-2 tracking-widest">
                                        Size: <span className="text-primary-black ml-1">{item.selectedSize}</span>
                                    </p>
                                </div>

                                <div className="flex justify-between items-center mt-2">
                                    <div className="flex items-center border border-bg-light rounded-lg px-2 py-1 gap-3 text-primary-black font-bold h-8">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                                            className="text-primary-dark-gray/30 hover:text-accent-anime transition-all p-0.5"
                                        >
                                            <FaMinus size={8} />
                                        </button>
                                        <span className="font-black w-4 text-center text-xs">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                                            className="text-primary-dark-gray/30 hover:text-accent-anime transition-all p-0.5"
                                        >
                                            <FaPlus size={8} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.id, item.selectedSize)}
                                        className="flex items-center gap-1.5 text-primary-dark-gray/30 hover:text-red-500 font-bold transition-all text-[10px] uppercase tracking-widest"
                                    >
                                        <FaTrash size={10} /> Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    <Link to="/products" className="inline-flex items-center gap-2 text-primary-black font-black text-[10px] uppercase tracking-widest hover:text-accent-anime transition-all pt-2">
                        <FaArrowLeft size={8} /> Continue Shopping
                    </Link>
                </div>

                {/* Order Summary */}
                <div className="bg-primary-white p-6 rounded-3xl h-fit sticky top-24 border border-bg-light shadow-xl shadow-black/5 animate-slideUp">
                    <h2 className="text-lg font-black mb-6 tracking-tighter uppercase text-primary-black">Order Summary</h2>

                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between font-bold text-primary-black text-sm">
                            <span className="text-primary-dark-gray/40 uppercase tracking-widest text-[10px]">Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-primary-black text-sm">
                            <span className="text-primary-dark-gray/40 uppercase tracking-widest text-[10px]">Shipping</span>
                            <span>${shipping.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-primary-black text-sm">
                            <span className="text-primary-dark-gray/40 uppercase tracking-widest text-[10px]">Tax</span>
                            <span className="italic opacity-50 text-[10px]">Calculated at checkout</span>
                        </div>
                    </div>

                    <div className="py-4 border-t border-bg-light mb-6">
                        <div className="flex justify-between items-center text-primary-black">
                            <span className="font-black text-sm uppercase tracking-tighter">Total</span>
                            <span className="font-black text-xl tracking-tighter">${total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-[10px] font-black uppercase tracking-widest mb-2 text-primary-dark-gray/60">Promo Code</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="CODE"
                                className="w-full h-10 px-3 rounded-lg bg-bg-light/30 border border-transparent focus:border-primary-black outline-none font-bold text-xs uppercase transition-all"
                            />
                            <button className="bg-primary-black text-primary-white px-4 h-10 rounded-lg font-black hover:bg-primary-dark-gray transition-all whitespace-nowrap text-[10px] uppercase">
                                Apply
                            </button>
                        </div>
                    </div>

                    <Link
                        to="/checkout"
                        className="block w-full bg-accent-anime text-primary-white font-black text-center py-4 rounded-xl text-sm uppercase tracking-[0.2em] hover:brightness-110 shadow-lg shadow-accent-anime/20 transition-all"
                    >
                        Checkout
                    </Link>

                    <div className="mt-6 flex justify-center gap-3 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="Paypal" className="h-4" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
