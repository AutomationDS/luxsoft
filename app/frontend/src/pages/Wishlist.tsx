import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { client } from '@/lib/client';
import { useUserStore } from '@/lib/store';
import type { Product, WishlistItem } from '@/lib/types';

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState<(WishlistItem & { product?: Product })[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, checkAuth, login } = useUserStore();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) loadWishlist();
  }, [user]);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const res = await client.entities.wishlists.query({ query: {}, sort: '-created_at' });
      const items = res?.data?.items || [];

      // Fetch product details
      const enriched = await Promise.all(
        items.map(async (item: WishlistItem) => {
          try {
            const pRes = await client.entities.products.get({ id: String(item.product_id) });
            return { ...item, product: pRes?.data };
          } catch {
            return item;
          }
        })
      );
      setWishlistItems(enriched);
    } catch (e) {
      console.error('Failed to load wishlist', e);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (id: number) => {
    try {
      await client.entities.wishlists.delete({ id: String(id) });
      setWishlistItems((prev) => prev.filter((i) => i.id !== id));
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-28 text-center py-20">
          <Heart className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Sign in to view your wishlist</h2>
          <p className="text-muted-foreground mb-6">Save your favorite items for later</p>
          <Button onClick={login} className="rounded-full px-8">Sign In</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8">My Wishlist ({wishlistItems.length} items)</h1>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : wishlistItems.length === 0 ? (
            <div className="text-center py-20">
              <Heart className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-6">Browse products and save your favorites</p>
              <Link to="/shop">
                <Button className="rounded-full px-8">Explore Products</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlistItems.map((item) =>
                item.product ? (
                  <div key={item.id} className="relative">
                    <ProductCard product={item.product} />
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : null
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}