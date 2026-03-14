'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Phone, Mail, Car, Utensils } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-bold mb-4">About Us</h1>
          <p className="text-xl">Bringing delicious food right to your car</p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-12 space-y-12">
        {/* Our Story */}
        <Card className="shadow-xl border-2 border-orange-200">
          <CardHeader className="bg-gradient-to-r from-orange-400 to-yellow-400">
            <CardTitle className="text-white text-3xl">Our Story</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Welcome to our innovative food ordering service! We're revolutionizing the way you enjoy your favorite meals by bringing them directly to your car. No need to leave your vehicle - we come to you!
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Founded with a passion for convenience and quality, we combine cutting-edge technology with exceptional service to create a seamless dining experience. Whether you're on a lunch break, traveling, or simply prefer the comfort of your car, we've got you covered.
            </p>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-lg border-2 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <Car className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Curbside Delivery</h3>
              </div>
              <p className="text-gray-700">
                Stay in your car while we bring your order directly to you. Just provide your car details and parking location.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-2 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Utensils className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Fresh & Delicious</h3>
              </div>
              <p className="text-gray-700">
                All our meals are prepared fresh with high-quality ingredients. We take pride in every dish we serve.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-2 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Fast Service</h3>
              </div>
              <p className="text-gray-700">
                Quick preparation and delivery times. Most orders are ready in under 15 minutes!
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-2 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Geo-Fenced Zones</h3>
              </div>
              <p className="text-gray-700">
                We serve specific areas to ensure the fastest delivery. Check if you're in our service zone when ordering.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <Card className="shadow-xl border-2 border-orange-200">
          <CardHeader className="bg-gradient-to-r from-yellow-400 to-orange-400">
            <CardTitle className="text-white text-3xl">Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Phone className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Phone</p>
                  <p className="text-gray-700">+1 (555) 123-4567</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Mail className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Email</p>
                  <p className="text-gray-700">info@foodorder.com</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Hours</p>
                  <p className="text-gray-700">Mon-Sun: 10:00 AM - 10:00 PM</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Location</p>
                  <p className="text-gray-700">New York City Area</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center py-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Order?</h2>
          <p className="text-lg text-gray-700 mb-6">
            Browse our menu and place your order today!
          </p>
          <Link href="/menu">
            <Button className="h-14 px-8 text-lg bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 shadow-lg">
              View Menu
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
