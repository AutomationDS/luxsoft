import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { client } from '@/lib/client';
import { useUserStore, useCartStore } from '@/lib/store';

export default function Checkout() {
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const { user, checkAuth, login } = useUserStore();
  const { items, products, fetchCart, getTotal } = useCartStore();

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

  const handleCheckout = async () => {
    if (!user) { login(); return; }
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setProcessing(true);
    try {
      const response = await client.apiCall.invoke({
        url: '/api/v1/payment/create_payment_session',
        method: 'POST',
        data: {},
      });
      if (response?.data?.url) {
        client.utils.openUrl(response.data.url);
      } else {
        toast.error('Failed to create checkout session');
      }
    } catch (e: unknown) {
      const err = e as { data?: { detail?: string }; response?: { data?: { detail?: string } }; message?: string };
      toast.error(err?.data?.detail || err?.response?.data?.detail || err?.message || 'Checkout failed');
    } finally {
      setProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-28 text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Please sign in to checkout</h2>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Order Items */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-card rounded-2xl border border-border/50 p-6">
                <h2 className="text-lg font-semibold mb-4">Order Items</h2>
                <div className="space-y-3">
                  {items.map((item) => {
                    const product = products[item.product_id];
                    if (!product) return null;
                    return (
                      <div key={item.id} className="flex items-center gap-4">
                        <img src={product.image_url} alt={product.name} className="w-16 h-16 rounded-xl object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold">${(product.price * item.quantity).toFixed(2)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border/50 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-muted-foreground">Your payment is secured with Stripe</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  You will be redirected to Stripe's secure checkout page to complete your payment.
                </p>
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-2xl border border-border/50 p-6 sticky top-28">
                <h2 className="text-lg font-bold mb-4">Payment Summary</h2>
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

                <Button
                  onClick={handleCheckout}
                  disabled={processing || items.length === 0}
                  className="w-full mt-6 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg"
                  size="lg"
                >
                  {processing ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Pay ${grandTotal.toFixed(2)}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}