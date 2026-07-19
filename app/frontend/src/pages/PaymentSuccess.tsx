import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { client } from '@/lib/client';
import { useUserStore, useCartStore } from '@/lib/store';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const { checkAuth } = useUserStore();
  const { clearCart } = useCartStore();

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    checkAuth();
    if (sessionId) verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      const response = await client.apiCall.invoke({
        url: '/api/v1/payment/verify_payment',
        method: 'POST',
        data: { session_id: sessionId },
      });
      if (response?.data?.status === 'paid') {
        setVerified(true);
        setOrderId(response.data.order_id);
        clearCart();
      }
    } catch (e) {
      console.error('Verification failed', e);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-28 pb-20">
        <div className="max-w-lg mx-auto px-4 text-center py-16">
          {verifying ? (
            <div className="space-y-4">
              <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
              <p className="text-lg font-medium">Verifying your payment...</p>
            </div>
          ) : verified ? (
            <div className="space-y-6 animate-slide-up">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold">Payment Successful!</h1>
              <p className="text-muted-foreground">
                Thank you for your purchase. Your order #{orderId} has been confirmed.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Link to="/orders">
                  <Button className="rounded-full px-6">
                    <Package className="w-4 h-4 mr-2" />
                    View Orders
                  </Button>
                </Link>
                <Link to="/shop">
                  <Button variant="outline" className="rounded-full px-6">
                    Continue Shopping
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg font-medium">Payment verification pending</p>
              <p className="text-muted-foreground">Your payment is being processed. Please check your orders shortly.</p>
              <Link to="/orders">
                <Button className="rounded-full mt-4">View Orders</Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}