import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Minus, Plus, ArrowLeft, Truck, Shield, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { client } from '@/lib/client';
import { useUserStore, useCartStore } from '@/lib/store';
import type { Product } from '@/lib/types';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const { user, login, checkAuth } = useUserStore();
  const { addToCart } = useCartStore();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (slug) loadProduct();
  }, [slug]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const res = await client.entities.products.query({ query: { slug }, limit: 1 });
      const items = res?.data?.items || [];
      if (items.length > 0) {
        const p = items[0];
        setProduct(p);
        if (p.colors) setSelectedColor(p.colors.split(',')[0]);
        if (p.sizes && p.sizes !== 'One Size') setSelectedSize(p.sizes.split(',')[0]);

        // Load related products
        const relRes = await client.entities.products.query({
          query: { category_id: p.category_id },
          limit: 5,
        });
        setRelatedProducts((relRes?.data?.items || []).filter((rp: Product) => rp.id !== p.id).slice(0, 4));
      }
    } catch (e) {
      console.error('Failed to load product', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) { login(); return; }
    if (!product) return;
    await addToCart(product.id, quantity, selectedColor, selectedSize);
    toast.success(`${product.name} added to cart`);
  };

  const handleWishlist = async () => {
    if (!user) { login(); return; }
    if (!product) return;
    try {
      await client.entities.wishlists.create({ data: { product_id: product.id } });
      toast.success('Added to wishlist');
    } catch {
      toast.error('Failed to add to wishlist');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="aspect-square rounded-3xl bg-muted animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 w-48 bg-muted animate-pulse rounded" />
              <div className="h-12 w-full bg-muted animate-pulse rounded" />
              <div className="h-24 w-full bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-28 text-center py-20">
          <p className="text-xl font-semibold">Product not found</p>
          <Link to="/shop"><Button className="mt-4 rounded-full">Back to Shop</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  const colors = product.colors ? product.colors.split(',').map(c => c.trim()) : [];
  const sizes = product.sizes && product.sizes !== 'One Size' ? product.sizes.split(',').map(s => s.trim()) : [];
  const discount = product.original_price ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-primary">Shop</Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-muted">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {discount > 0 && (
                  <Badge className="absolute top-4 left-4 bg-accent text-white text-sm px-3 py-1">
                    -{discount}% OFF
                  </Badge>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-1">{product.brand}</p>
                <h1 className="text-3xl font-bold">{product.name}</h1>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">{product.rating} ({product.review_count} reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
                {product.original_price > product.price && (
                  <span className="text-xl text-muted-foreground line-through">${product.original_price.toFixed(2)}</span>
                )}
                {discount > 0 && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">Save ${(product.original_price - product.price).toFixed(2)}</Badge>
                )}
              </div>

              <Separator />

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>

              {/* Colors */}
              {colors.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-3">Color: <span className="text-muted-foreground">{selectedColor}</span></p>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 rounded-full text-sm border-2 transition-all ${
                          selectedColor === color
                            ? 'border-primary bg-primary/5 text-primary font-medium'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {sizes.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-3">Size: <span className="text-muted-foreground">{selectedSize}</span></p>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-12 rounded-xl text-sm font-medium border-2 transition-all ${
                          selectedSize === size
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <p className="text-sm font-medium mb-3">Quantity</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border rounded-full">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-muted rounded-l-full transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-muted rounded-r-full transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-sm text-muted-foreground">{product.stock} in stock</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  className="flex-1 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  onClick={handleWishlist}
                  size="lg"
                  variant="outline"
                  className="rounded-full px-6"
                >
                  <Heart className="w-5 h-5" />
                </Button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                {[
                  { icon: Truck, text: 'Free Shipping' },
                  { icon: Shield, text: 'Secure Payment' },
                  { icon: RotateCcw, text: '30-Day Returns' },
                ].map((badge) => (
                  <div key={badge.text} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/50">
                    <badge.icon className="w-5 h-5 text-primary" />
                    <span className="text-xs text-muted-foreground text-center">{badge.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="mt-20">
              <h2 className="text-2xl font-bold mb-8">You May Also Like</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}