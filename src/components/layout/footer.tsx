import Link from 'next/link';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-orange-600 to-yellow-600 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4">FoodOrder</h3>
            <p className="text-orange-100">
              Bringing delicious food right to your car. Fast, convenient, and always fresh.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/menu" className="text-orange-100 hover:text-white transition-colors">
                  Menu
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-orange-100 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-orange-100 hover:text-white transition-colors">
                  Cart
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-orange-100 hover:text-white transition-colors">
                  Register
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-orange-100 hover:text-white transition-colors">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span className="text-orange-100">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="text-orange-100">info@foodorder.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-orange-100">Mon-Sun: 10AM - 10PM</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="text-orange-100">New York City Area</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-orange-400 mt-8 pt-6 text-center">
          <p className="text-orange-100">
            © {new Date().getFullYear()} FoodOrder. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
