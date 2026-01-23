import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '../types';

interface CartState {
    items: CartItem[];
    addItem: (product: Product, size: string, color?: { name: string; hex: string }) => void;
    removeItem: (productId: string, size: string) => void;
    updateQuantity: (productId: string, size: string, quantity: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (product, size, color) => {
                set((state) => {
                    const existingItem = state.items.find(
                        (item) => item.id === product.id && item.selectedSize === size
                    );

                    if (existingItem) {
                        return {
                            items: state.items.map((item) =>
                                item.id === product.id && item.selectedSize === size
                                    ? { ...item, quantity: item.quantity + 1 }
                                    : item
                            ),
                        };
                    }

                    return {
                        items: [...state.items, { ...product, selectedSize: size, selectedColor: color, quantity: 1 }],
                    };
                });
            },

            removeItem: (productId, size) => {
                set((state) => ({
                    items: state.items.filter(
                        (item) => !(item.id === productId && item.selectedSize === size)
                    ),
                }));
            },

            updateQuantity: (productId, size, quantity) => {
                set((state) => ({
                    items: state.items.map((item) =>
                        item.id === productId && item.selectedSize === size
                            ? { ...item, quantity: Math.max(1, quantity) }
                            : item
                    ),
                }));
            },

            clearCart: () => set({ items: [] }),

            getTotalItems: () => {
                return get().items.reduce((total, item) => total + item.quantity, 0);
            },

            getSubtotal: () => {
                return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
            },
        }),
        {
            name: 'otaku-merch-cart',
        }
    )
);
