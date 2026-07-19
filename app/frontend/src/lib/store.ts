import { create } from 'zustand';
import { client } from './client';
import type { CartItem, Product } from './types';

interface UserState {
  user: { id: string; email?: string } | null;
  loading: boolean;
  setUser: (user: { id: string; email?: string } | null) => void;
  setLoading: (loading: boolean) => void;
  checkAuth: () => Promise<void>;
  login: () => void;
  logout: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  checkAuth: async () => {
    try {
      const res = await client.auth.me();
      if (res?.data) {
        set({ user: res.data, loading: false });
      } else {
        set({ user: null, loading: false });
      }
    } catch {
      set({ user: null, loading: false });
    }
  },
  login: () => {
    client.auth.toLogin();
  },
  logout: async () => {
    await client.auth.logout();
    set({ user: null });
  },
}));

interface CartState {
  items: CartItem[];
  products: Record<number, Product>;
  loading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity: number, color?: string, size?: string) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  products: {},
  loading: false,
  fetchCart: async () => {
    set({ loading: true });
    try {
      const res = await client.entities.cart_items.query({ query: {}, sort: '-created_at' });
      const cartItems = (res?.data?.items as CartItem[]) || [];
      set({ items: cartItems, loading: false });

      // Fetch product details for cart items
      if (cartItems.length > 0) {
        const productIds = [...new Set(cartItems.map((i: CartItem) => i.product_id))];
        const productsMap: Record<number, Product> = {};
        for (const pid of productIds) {
          try {
            const pRes = await client.entities.products.get({ id: String(pid) });
            if (pRes?.data) productsMap[pid] = pRes.data;
          } catch { /* skip */ }
        }
        set({ products: productsMap });
      }
    } catch {
      set({ items: [], loading: false });
    }
  },
  addToCart: async (productId, quantity, color, size) => {
    try {
      await client.entities.cart_items.create({
        data: { product_id: productId, quantity, color: color || '', size: size || '' },
      });
      await get().fetchCart();
    } catch (e) {
      console.error('Failed to add to cart', e);
    }
  },
  updateQuantity: async (itemId, quantity) => {
    try {
      await client.entities.cart_items.update({
        id: String(itemId),
        data: { quantity },
      });
      await get().fetchCart();
    } catch (e) {
      console.error('Failed to update quantity', e);
    }
  },
  removeFromCart: async (itemId) => {
    try {
      await client.entities.cart_items.delete({ id: String(itemId) });
      await get().fetchCart();
    } catch (e) {
      console.error('Failed to remove from cart', e);
    }
  },
  clearCart: () => set({ items: [], products: {} }),
  getTotal: () => {
    const { items, products } = get();
    return items.reduce((sum, item) => {
      const product = products[item.product_id];
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
  },
  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));