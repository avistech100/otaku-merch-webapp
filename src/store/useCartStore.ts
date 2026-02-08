import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { CartItem, Product } from '../types';

interface CartState {
    items: CartItem[];
    addItem: (product: Product, size: string, color?: { name: string; hex: string }) => Promise<void>;
    removeItem: (productId: string, size: string) => Promise<void>;
    updateQuantity: (productId: string, size: string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    syncWithSupabase: () => Promise<void>;
    getTotalItems: () => number;
    getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: async (product, size, color) => {
                const { data: { session } } = await supabase.auth.getSession();
                const userId = session?.user?.id;

                set((state) => {
                    const existingItem = state.items.find(
                        (item) => item.id === product.id && item.selectedSize === size
                    );

                    let newItems;
                    if (existingItem) {
                        newItems = state.items.map((item) =>
                            item.id === product.id && item.selectedSize === size
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        );
                    } else {
                        newItems = [...state.items, { ...product, selectedSize: size, selectedColor: color, quantity: 1 }];
                    }

                    return { items: newItems };
                });

                // Supabase Sync
                if (userId) {
                    try {
                        // Ensure cart exists
                        const { data: cart } = await supabase.from('cart').select('id').eq('user_id', userId).single();
                        let cartId = cart?.id;
                        
                        if (!cartId) {
                            const { data: newCart } = await supabase.from('cart').insert({ user_id: userId }).select().single();
                            cartId = newCart?.id;
                        }

                        const existingItem = get().items.find(i => i.id === product.id && i.selectedSize === size);
                        if (existingItem) {
                            await supabase.from('cart_items').upsert({
                                cart_id: cartId,
                                product_id: product.id,
                                variant_id: null, // Should link to actual variant ID in a real system
                                quantity: existingItem.quantity,
                                metadata: { size, color }
                            }, { onConflict: 'cart_id, product_id, variant_id' });
                        }
                    } catch (e) {
                        console.error("Cart sync error:", e);
                    }
                }
            },

            removeItem: async (productId, size) => {
                const { data: { session } } = await supabase.auth.getSession();
                const userId = session?.user?.id;

                set((state) => ({
                    items: state.items.filter(
                        (item) => !(item.id === productId && item.selectedSize === size)
                    ),
                }));

                if (userId) {
                    const { data: cart } = await supabase.from('cart').select('id').eq('user_id', userId).single();
                    if (cart) {
                        await supabase.from('cart_items')
                            .delete()
                            .eq('cart_id', cart.id)
                            .eq('product_id', productId);
                    }
                }
            },

            updateQuantity: async (productId, size, quantity) => {
                const { data: { session } } = await supabase.auth.getSession();
                const userId = session?.user?.id;

                set((state) => ({
                    items: state.items.map((item) =>
                        item.id === productId && item.selectedSize === size
                            ? { ...item, quantity: Math.max(1, quantity) }
                            : item
                    ),
                }));

                if (userId) {
                    const { data: cart } = await supabase.from('cart').select('id').eq('user_id', userId).single();
                    if (cart) {
                        await supabase.from('cart_items')
                            .update({ quantity })
                            .eq('cart_id', cart.id)
                            .eq('product_id', productId);
                    }
                }
            },

            clearCart: async () => {
                const { data: { session } } = await supabase.auth.getSession();
                const userId = session?.user?.id;
                
                set({ items: [] });

                if (userId) {
                    const { data: cart } = await supabase.from('cart').select('id').eq('user_id', userId).single();
                    if (cart) {
                        await supabase.from('cart_items').delete().eq('cart_id', cart.id);
                    }
                }
            },

            syncWithSupabase: async () => {
                const { data: { session } } = await supabase.auth.getSession();
                const userId = session?.user?.id;

                if (userId) {
                    const { data: cart } = await supabase.from('cart').select('id').eq('user_id', userId).single();
                    if (cart) {
                        const { data: items } = await supabase
                            .from('cart_items')
                            .select('*, products(*)')
                            .eq('cart_id', cart.id);

                        if (items) {
                            const mappedItems: CartItem[] = items.map(item => ({
                                id: item.products.id,
                                title: item.products.title,
                                price: item.products.price,
                                description: item.products.description,
                                image: '', // Need to handle images if needed
                                images: [],
                                category: 'Crypto Brands', // Placeholder
                                creatorId: item.products.creator_id,
                                creatorName: 'Verified Creator', // Default name
                                creatorBadge: 'Verified',
                                sizes: [],
                                isLimited: item.products.is_limited_edition,
                                hypeLevel: 'Medium',
                                reviews: [],
                                details: { materials: '', designStory: '' },
                                selectedSize: item.metadata?.size || 'M',
                                selectedColor: item.metadata?.color,
                                quantity: item.quantity
                            }));
                            set({ items: mappedItems });
                        }
                    }
                }
            },

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

