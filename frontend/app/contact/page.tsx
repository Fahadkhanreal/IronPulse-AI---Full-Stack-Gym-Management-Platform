'use client';

import { ContactForm } from '@/components/forms/ContactForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react';
import Image from 'next/image';

export default function ContactPage() {
  const handleWhatsAppClick = () => {
    // Replace with actual WhatsApp number
    const phoneNumber = '1234567890';
    const message = encodeURIComponent('Hi! I would like to know more about IronPulse Gym.');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="relative h-[300px] mb-12">
        <Image
          src="https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=1920&q=80"
          alt="Contact us background"
          fill
          priority
          className="object-cover"
          quality={75}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div className="relative z-20 h-full flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Contact Us</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto px-4">
              Have questions? We&apos;re here to help
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
        {/* Contact Form */}
        <div>
          <ContactForm />
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-semibold">Address</p>
                  <p className="text-sm text-muted-foreground">
                    123 Fitness Street<br />
                    Gym City, GC 12345
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-semibold">Phone</p>
                  <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-semibold">Email</p>
                  <p className="text-sm text-muted-foreground">info@ironpulse.com</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleWhatsAppClick}
                className="w-full gym-gradient"
                size="lg"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Chat on WhatsApp
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hours of Operation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monday - Friday</span>
                <span className="font-semibold">5:00 AM - 11:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Saturday - Sunday</span>
                <span className="font-semibold">6:00 AM - 10:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Holidays</span>
                <span className="font-semibold">7:00 AM - 8:00 PM</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Google Map */}
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Find Us</CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href="https://www.google.com/maps/search/?api=1&query=40.7484,-73.9875"
              target="_blank"
              rel="noopener noreferrer"
              className="block aspect-video w-full rounded-lg overflow-hidden bg-muted hover:opacity-90 transition-opacity"
            >
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                <div className="text-center">
                  <MapPin className="h-16 w-16 text-primary mx-auto mb-4" />
                  <p className="text-lg font-semibold mb-2">IronPulse Gym Location</p>
                  <p className="text-sm text-muted-foreground">Click to open in Google Maps</p>
                </div>
              </div>
            </a>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}
