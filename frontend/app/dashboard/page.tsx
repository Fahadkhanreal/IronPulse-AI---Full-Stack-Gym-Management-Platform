'use client';

import { useAuthStore } from '@/store/authStore';
import { useActiveSubscription } from '@/hooks/useSubscriptions';
import { useBookings } from '@/hooks/useBookings';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { Loader2, Calendar, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useCancelBooking } from '@/hooks/useBookings';
import { X } from 'lucide-react';
import MyTestimonialsSection from '@/components/dashboard/MyTestimonialsSection';

function DashboardContent() {
  const { user } = useAuthStore();
  const { data: activeSubscription, isLoading: subLoading } = useActiveSubscription();
  const { data: bookings, isLoading: bookingsLoading } = useBookings();
  const cancelBooking = useCancelBooking();
  const router = useRouter();

  if (!user) {
    return null;
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }
    try {
      await cancelBooking.mutateAsync(bookingId);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const bookingsArray = Array.isArray(bookings) ? bookings : [];
  const upcomingBookings = bookingsArray.filter(b =>
    new Date(b.bookingDate) > new Date() && b.status !== 'CANCELLED'
  );
  const pastBookings = bookingsArray.filter(b =>
    new Date(b.bookingDate) <= new Date() || b.status === 'COMPLETED' || b.status === 'CANCELLED'
  );

  // Calculate days remaining
  const daysRemaining = activeSubscription
    ? Math.ceil((new Date(activeSubscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Calculate days since subscription started
  const daysSinceSubscription = activeSubscription
    ? Math.floor((new Date().getTime() - new Date(activeSubscription.startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back, {user.name}!</h1>
        <p className="text-muted-foreground">Track your fitness journey and manage your membership</p>
      </div>

      {/* Membership Hero Section */}
      {subLoading ? (
        <Card className="mb-8">
          <CardContent className="py-12 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      ) : activeSubscription ? (
        <Card className="mb-8 border-primary/50 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Your Membership</p>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">{activeSubscription.plan.title}</h2>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 font-medium">
                    Active until {new Date(activeSubscription.endDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => router.push('/plans')}>
                  View Plans
                </Button>
                <Button className="gym-gradient" onClick={() => router.push('/plans')}>
                  Renew Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8 border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold mb-2">No Active Membership</h2>
                <p className="text-muted-foreground">Choose a plan to start your fitness journey!</p>
              </div>
              <Button className="gym-gradient" onClick={() => router.push('/plans')}>
                Browse Plans
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      {activeSubscription && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{daysRemaining}</p>
                  <p className="text-sm text-muted-foreground">Days Remaining</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-blue-500/10">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xl font-bold">{activeSubscription.plan.title}</p>
                  <p className="text-sm text-muted-foreground">Plan Type</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-green-500/10">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">PKR {activeSubscription.plan.price}</p>
                  <p className="text-sm text-muted-foreground">Amount Paid</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => router.push('/plans')}>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Browse Plans</h3>
              <p className="text-sm text-muted-foreground">Explore membership options</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => router.push('/trainers')}>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="p-3 rounded-full bg-blue-500/10 w-fit mx-auto mb-3">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-1">Our Trainers</h3>
              <p className="text-sm text-muted-foreground">Meet our expert team</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => router.push('/contact')}>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="p-3 rounded-full bg-purple-500/10 w-fit mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-1">Contact Us</h3>
              <p className="text-sm text-muted-foreground">Get in touch with us</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Testimonials Section */}
      <MyTestimonialsSection />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
