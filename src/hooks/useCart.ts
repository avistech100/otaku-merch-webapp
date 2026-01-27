import { useCartStore } from '../store/useCartStore';

export const useCart = () => {
  const store = useCartStore();

  return {
    items: store.items,
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    getTotalItems: store.getTotalItems,
    getSubtotal: store.getSubtotal,
    sync: store.syncWithSupabase,
  };
};
