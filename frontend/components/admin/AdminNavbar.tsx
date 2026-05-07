'use client';

import { useAuthStore } from '@/store/authStore';
import { ThemeToggle } from '@/components/common/ThemeToggle';

export function AdminNavbar() {
  const { user } = useAuthStore();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between pl-20 lg:pl-4">
        <div>
          <h1 className="text-xl font-semibold">IronPulse Gym Admin</h1>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="text-sm hidden sm:block">
            <p className="font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
