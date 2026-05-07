# Quickstart Guide: IronPulse Gym Frontend

**Feature**: 001-gym-frontend  
**Date**: 2026-04-20  
**Purpose**: Step-by-step guide to set up and develop the IronPulse Gym frontend

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm installed
- Git installed
- Code editor (VS Code recommended)
- Backend API running at `http://localhost:5000` (or configured URL)
- Basic knowledge of React, TypeScript, and Next.js

## Phase 0: Project Setup (Day 1)

### Step 1: Create Next.js Project

```bash
# Create new Next.js 15 project with TypeScript and Tailwind
npx create-next-app@latest frontend --typescript --tailwind --app --no-src-dir

cd frontend
```

**Configuration prompts**:
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- `src/` directory: No
- App Router: Yes
- Import alias: Yes (@/*)

### Step 2: Install Dependencies

```bash
# Core dependencies
npm install @tanstack/react-query zustand axios react-hook-form zod @hookform/resolvers framer-motion lucide-react sonner

# Development dependencies
npm install -D @types/node @types/react @types/react-dom
```

### Step 3: Initialize ShadCN/UI

```bash
# Initialize ShadCN
npx shadcn-ui@latest init
```

**Configuration**:
- Style: Default
- Base color: Slate
- CSS variables: Yes

**Install required ShadCN components**:
```bash
npx shadcn-ui@latest add button card input label dialog calendar select toast
```

### Step 4: Configure Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
```

### Step 5: Configure Tailwind for Dark Theme

Update `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#ef4444", // Red accent
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#f97316", // Orange accent
          foreground: "#ffffff",
        },
      },
      screens: {
        'xs': '375px',  // Mobile
        'sm': '640px',
        'md': '768px',  // Tablet
        'lg': '1024px',
        'xl': '1440px', // Desktop
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
```

### Step 6: Update Global Styles

Update `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 4%; /* #0a0a0a - Dark background */
    --foreground: 0 0% 98%;
    --card: 0 0% 8%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 8%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 84% 60%; /* Red */
    --primary-foreground: 0 0% 100%;
    --secondary: 25 95% 53%; /* Orange */
    --secondary-foreground: 0 0% 100%;
    --muted: 0 0% 15%;
    --muted-foreground: 0 0% 64%;
    --accent: 0 0% 15%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 15%;
    --input: 0 0% 15%;
    --ring: 0 84% 60%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}

/* Custom gym aesthetic styles */
.gym-gradient {
  background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
}

.gym-text-gradient {
  background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Step 7: Create Folder Structure

```bash
# Create all required directories
mkdir -p components/{ui,layout,common,features,forms}
mkdir -p lib hooks store types __tests__/{components,e2e}
mkdir -p app/{dashboard,plans,trainers,contact,\(auth\)/{login,signup}}
mkdir -p public/images
```

### Step 8: Set Up TypeScript Types

Create `types/index.ts`:

```typescript
// Copy types from data-model.md
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'MEMBER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  id: string;
  title: string;
  price: number;
  duration: number;
  features: string[];
  createdAt: string;
}

// ... (add all other types from data-model.md)
```

### Step 9: Configure Axios Instance

Create `lib/api.ts`:

```typescript
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Auto logout on 401
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default api;
```

### Step 10: Create Zustand Auth Store

Create `store/authStore.ts`:

```typescript
import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isAuthenticated: false,
  
  login: (token, user) => {
    localStorage.setItem('token', token);
    set({ token, user, isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null, isAuthenticated: false });
  },
  
  updateUser: (user) => {
    set({ user });
  },
}));
```

### Step 11: Set Up TanStack Query Provider

Create `app/providers.tsx`:

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}
```

Update `app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IronPulse Gym",
  description: "Transform your body, forge your strength",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### Step 12: Verify Setup

```bash
# Run development server
npm run dev

# Open http://localhost:3000
# You should see the default Next.js page with dark theme
```

## Phase 1: Layout & Navigation (Day 1-2)

### Create Navbar Component

Create `components/layout/Navbar.tsx`:

```typescript
'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-2xl font-bold gym-text-gradient">
            IronPulse
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/plans" className="hover:text-primary transition-colors">
              Plans
            </Link>
            <Link href="/trainers" className="hover:text-primary transition-colors">
              Trainers
            </Link>
            <Link href="/contact" className="hover:text-primary transition-colors">
              Contact
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <Button variant="outline" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button className="gym-gradient">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu />
          </Button>
        </div>
      </div>
    </nav>
  );
}
```

### Create Footer Component

Create `components/layout/Footer.tsx`:

```typescript
export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-muted-foreground">
          <p>&copy; 2026 IronPulse Gym. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
```

### Update Root Layout

Update `app/layout.tsx` to include Navbar and Footer:

```typescript
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
```

## Development Workflow

### Daily Development Process

1. **Start development server**: `npm run dev`
2. **Check TypeScript**: `npm run type-check` (add script to package.json)
3. **Run linter**: `npm run lint`
4. **Format code**: `npm run format` (add Prettier script)
5. **Test manually**: Check responsive design at 375px, 768px, 1440px

### Testing Strategy

**Unit Tests** (Jest + React Testing Library):
- Test form components (LoginForm, SignupForm, BookingModal, ContactForm)
- Test validation logic
- Test custom hooks

**E2E Tests** (Playwright):
- Test complete user journeys (signup → login → booking)
- Test authentication flow
- Test booking flow

**Manual Testing Checklist**:
- [ ] Responsive design (375px, 768px, 1440px)
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Loading states
- [ ] Error handling
- [ ] Toast notifications
- [ ] Animations (max 300ms)

### Git Workflow

```bash
# Create feature branch
git checkout -b feat/navbar-component

# Make changes and commit
git add .
git commit -m "feat: add navbar component with auth state"

# Push to remote
git push origin feat/navbar-component
```

## Next Steps

After completing Phase 0 and Phase 1:

1. Run `/sp.tasks` to generate detailed task breakdown
2. Implement Phase 2: Home Page
3. Implement Phase 3: Authentication System
4. Implement Phase 4: Plans Page
5. Implement Phase 5: Booking System
6. Implement Phase 6: Dashboard
7. Implement Phase 7: Remaining Pages
8. Implement Phase 8: Polish & Testing

## Troubleshooting

### Common Issues

**Issue**: "Module not found" errors
**Solution**: Ensure all dependencies are installed: `npm install`

**Issue**: TypeScript errors in ShadCN components
**Solution**: Ensure `@types/node`, `@types/react`, `@types/react-dom` are installed

**Issue**: Tailwind classes not working
**Solution**: Check `tailwind.config.ts` content paths include all component directories

**Issue**: API calls failing with CORS errors
**Solution**: Ensure backend has CORS configured to allow frontend origin

**Issue**: Authentication not persisting
**Solution**: Check localStorage is accessible (not in incognito mode)

## Performance Optimization

- Use Next.js `<Image>` component for all images
- Implement lazy loading for below-fold content
- Use dynamic imports for heavy components
- Configure TanStack Query caching appropriately
- Monitor bundle size with `@next/bundle-analyzer`

## Accessibility Checklist

- [ ] All interactive elements have focus indicators
- [ ] All images have alt text
- [ ] Forms have proper labels
- [ ] Color contrast ratios meet WCAG 2.1 AA (4.5:1)
- [ ] Keyboard navigation works throughout
- [ ] Screen reader announces important changes
- [ ] ARIA labels on custom components

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [ShadCN/UI Components](https://ui.shadcn.com)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Zod Documentation](https://zod.dev)
