import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Footer() {
  return (
    <footer className="bg-foreground text-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="text-xl font-bold text-white">LuxeCart</span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Discover premium products curated for modern living. Quality meets elegance in every purchase.
            </p>
            <div className="flex gap-3 pt-2">
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-primary/80 flex items-center justify-center transition-colors">
                <span className="text-sm font-bold">f</span>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-primary/80 flex items-center justify-center transition-colors">
                <span className="text-sm font-bold">t</span>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-primary/80 flex items-center justify-center transition-colors">
                <span className="text-sm font-bold">in</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              <li><Link to="/shop" className="text-sm hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/shop?category=electronics" className="text-sm hover:text-white transition-colors">Electronics</Link></li>
              <li><Link to="/shop?category=fashion" className="text-sm hover:text-white transition-colors">Fashion</Link></li>
              <li><Link to="/shop?category=home-living" className="text-sm hover:text-white transition-colors">Home & Living</Link></li>
              <li><Link to="/shop?category=beauty" className="text-sm hover:text-white transition-colors">Beauty</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-accent" />
                123 Commerce St, New York, NY
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-accent" />
                +1 (555) 123-4567
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-accent" />
                hello@luxecart.com
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold mb-4">Stay Updated</h3>
            <p className="text-sm text-white/60 mb-4">Get exclusive deals and new arrivals straight to your inbox.</p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Your email"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-full"
              />
              <Button size="sm" className="rounded-full bg-accent hover:bg-accent/90 text-white px-4 shrink-0">
                Join
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/40">© 2026 LuxeCart. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-white/40">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}