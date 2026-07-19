import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useUserStore, useCartStore } from '@/lib/store';

export default function Cart() {
  const navigate = useNavigate();
  const { user, loading: authLoading, checkAuth, login } = useUserStore();
  const { items, products, loading, fetchCart, updateQuantity, removeFromCart, getTotal, getItemCount } = useCartStore();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) fetchCart();
  }, [user]);

  const total = getTotal();
  const shipping = total >= 99 ? 0 : 9.99;
  const tax = total * 0.08;
  const grandTotal = total + shipping + tax;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-28 max-w-4xl mx-auto px-4 py-20">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-28 text-center py-20">
          <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Sign in to view your cart</h2>
          <p className="text-muted-foreground mb-6">Please sign in to add items and checkout</p>
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8">Shopping Cart ({getItemCount()} items)</h1>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">Start shopping to add items to your cart</p>
              <Link to="/shop">
                <Button className="rounded-full px-8">Continue Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => {
                  const product = products[item.product_id];
                  if (!product) return null;
                  return (
                    <div key={item.id} className="flex gap-4 p-4 bg-card rounded-2xl border border-border/50">
                      <Link to={`/product/${product.slug}`} className="shrink-0">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-24 h-24 rounded-xl object-cover"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <div>
                            <Link to={`/product/${product.slug}`} className="font-semibold text-sm hover:text-primary transition-colors line-clamp-1">
                              {product.name}
                            </Link>
                            <p className="text-xs text-muted-foreground mt-0.5">{product.brand}</p>
                            {(item.color || item.size) && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {item.color && <span>Color: {item.color}</span>}
                                {item.color && item.size && <span> · </span>}
                                {item.size && <span>Size: {item.size}</span>}
                              </p>
                            )}
                          </div>
                          <p className="font-bold text-lg">${(product.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border rounded-full">
                            <button
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-l-full"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-r-full"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-2xl border border-border/50 p-6 sticky top-28">
                  <h2 className="text-lg font-bold mb-4">Order Summary</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{shipping === 0 ? <span className="text-green-600">Free</span> : `$${shipping.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {shipping > 0 && (
                    <p className="text-xs text-muted-foreground mt-3 bg-muted/50 p-2 rounded-lg">
                      Add ${(99 - total).toFixed(2)} more for free shipping!
                    </p>
                  )}

                  <Button
                    onClick={() => navigate('/checkout')}
                    className="w-full mt-6 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg"
                    size="lg"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  <Link to="/shop" className="block text-center text-sm text-primary mt-4 hover:underline">
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}