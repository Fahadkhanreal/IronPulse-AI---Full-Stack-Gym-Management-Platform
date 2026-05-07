'use client';

import { useAdminStats } from '@/hooks/useAdminStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
  TrendingDown,
  Loader2,
  CreditCard,
  Package,
  ArrowUpRight,
  Clock
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useAdminStats();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Dashboard Overview</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {currentDate}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/admin/payments')}>
            View Payments
          </Button>
          <Button className="gym-gradient" onClick={() => router.push('/admin/plans')}>
            Manage Plans
          </Button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Revenue */}
        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-bold">
                PKR {stats?.totalRevenue?.toLocaleString() || '0'}
              </h2>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="h-3 w-3" />
                <span>From all payments</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Members */}
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Active Members</p>
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-bold">{stats?.activeMembers || 0}</h2>
              <div className="flex items-center gap-1 text-sm text-blue-600">
                <TrendingUp className="h-3 w-3" />
                <span>With subscriptions</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Bookings */}
        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-bold">{stats?.totalBookings || 0}</h2>
              <div className="flex items-center gap-1 text-sm text-purple-600">
                <Calendar className="h-3 w-3" />
                <span>All time</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest successful payments from members</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push('/admin/payments')}>
              View All
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {stats?.recentPayments && stats.recentPayments.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">Member</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">Plan</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentPayments.slice(0, 5).map((payment) => (
                      <tr key={payment.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-semibold text-primary">
                                {payment.user?.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{payment.user?.name}</p>
                              <p className="text-sm text-muted-foreground truncate">{payment.user?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium whitespace-nowrap">{payment.plan?.title}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-green-600 whitespace-nowrap">
                            PKR {payment.amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {new Date(payment.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 whitespace-nowrap">
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {stats.recentPayments.slice(0, 5).map((payment) => (
                  <Card key={payment.id} className="border">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-primary">
                            {payment.user?.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{payment.user?.name}</p>
                          <p className="text-sm text-muted-foreground truncate">{payment.user?.email}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Plan:</span>
                          <span className="font-medium">{payment.plan?.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Amount:</span>
                          <span className="font-semibold text-green-600">
                            PKR {payment.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date:</span>
                          <span>
                            {new Date(payment.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Status:</span>
                          <span className="px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100">
                            {payment.status}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No recent payments</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
