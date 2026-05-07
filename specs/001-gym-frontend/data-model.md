# Data Model: IronPulse Gym Frontend

**Feature**: 001-gym-frontend  
**Date**: 2026-04-20  
**Purpose**: Define TypeScript interfaces and types for frontend data structures

## Overview

This document defines the data models used in the IronPulse Gym frontend. These types represent data received from the backend API and used throughout the application. All types are defined in `frontend/types/index.ts`.

## Core Entities

### User

Represents an authenticated user (member or admin).

```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'MEMBER' | 'ADMIN';
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
}
```

**Fields**:
- `id`: Unique identifier (CUID from backend)
- `name`: User's full name
- `email`: User's email address (unique)
- `role`: User role (MEMBER or ADMIN)
- `createdAt`: Account creation timestamp
- `updatedAt`: Last update timestamp

**Validation Rules** (Zod schema):
- `name`: 2-100 characters, required
- `email`: Valid email format, required
- `role`: Enum ('MEMBER' | 'ADMIN')

**Usage**:
- Authentication state (Zustand store)
- Dashboard display
- Profile editing

### Membership Plan

Represents a gym membership plan offering.

```typescript
export interface Plan {
  id: string;
  title: string;
  price: number;
  duration: number; // in months
  features: string[];
  createdAt: string; // ISO 8601 date string
}
```

**Fields**:
- `id`: Unique identifier (CUID from backend)
- `title`: Plan name (e.g., "Basic", "Premium", "Elite")
- `price`: Monthly price in currency units
- `duration`: Plan duration in months
- `features`: Array of feature descriptions
- `createdAt`: Plan creation timestamp

**Validation Rules**:
- `title`: 2-50 characters, required
- `price`: Positive number, required
- `duration`: Positive integer (1-12 months typical)
- `features`: Array of strings, at least 1 feature

**Usage**:
- Plans page display (PlanCard component)
- Booking modal (plan selection)
- Dashboard (active plan display)

### Booking

Represents a member's gym session booking.

```typescript
export interface Booking {
  id: string;
  userId: string;
  planId: string;
  bookingDate: string; // ISO 8601 date string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string; // ISO 8601 date string
  
  // Populated relations (from backend joins)
  user?: User;
  plan?: Plan;
}
```

**Fields**:
- `id`: Unique identifier (CUID from backend)
- `userId`: Reference to User who made the booking
- `planId`: Reference to selected Plan
- `bookingDate`: Date of the booked session
- `status`: Booking status (lifecycle state)
- `createdAt`: Booking creation timestamp
- `user`: Optional populated User object (for admin views)
- `plan`: Optional populated Plan object (for display)

**Status Lifecycle**:
1. `PENDING`: Initial state after booking creation
2. `CONFIRMED`: Admin or system confirmed the booking
3. `CANCELLED`: User or admin cancelled the booking
4. `COMPLETED`: Session completed (past date)

**Validation Rules**:
- `bookingDate`: Must be present or future date
- `status`: Enum value
- `userId` and `planId`: Valid CUID references

**Usage**:
- Dashboard (upcoming bookings, booking history)
- Booking modal (creation)
- Admin views (all bookings)

### Trainer

Represents a gym trainer profile.

```typescript
export interface Trainer {
  id: string;
  name: string;
  specialization: string;
  experience: number; // years
  image: string; // URL or path
  bio?: string; // Optional biography
}
```

**Fields**:
- `id`: Unique identifier (CUID from backend)
- `name`: Trainer's full name
- `specialization`: Area of expertise (e.g., "Strength Training", "Yoga")
- `experience`: Years of experience
- `image`: Profile image URL or path
- `bio`: Optional detailed biography

**Validation Rules**:
- `name`: 2-100 characters, required
- `specialization`: 2-100 characters, required
- `experience`: Non-negative integer
- `image`: Valid URL or path
- `bio`: Optional, max 500 characters

**Usage**:
- Trainers page (TrainerCard component)
- Home page (trainer preview section)

### Contact Submission

Represents a contact form submission.

```typescript
export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'PENDING' | 'PROCESSED';
  createdAt: string; // ISO 8601 date string
}
```

**Fields**:
- `id`: Unique identifier (CUID from backend)
- `name`: Sender's name
- `email`: Sender's email
- `message`: Message content
- `status`: Processing status
- `createdAt`: Submission timestamp

**Validation Rules**:
- `name`: 2-100 characters, required
- `email`: Valid email format, required
- `message`: 10-1000 characters, required

**Usage**:
- Contact form submission
- Admin views (contact management - future)

## API Response Types

### Authentication Responses

```typescript
export interface LoginResponse {
  success: true;
  data: {
    token: string;
    user: User;
  };
}

export interface SignupResponse {
  success: true;
  data: {
    token: string;
    user: User;
  };
}
```

### Standard API Responses

```typescript
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
```

**Usage**: All API calls return this format for consistency

### List Responses

```typescript
export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

**Usage**: For paginated lists (bookings, plans if >20 items)

## Form Input Types

### Login Form

```typescript
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean; // Optional
}
```

### Signup Form

```typescript
export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}
```

### Booking Form

```typescript
export interface BookingFormData {
  planId: string;
  bookingDate: string; // ISO 8601 date string
  timeSlot?: string; // Optional for future enhancement
}
```

### Contact Form

```typescript
export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}
```

### Profile Update Form

```typescript
export interface ProfileUpdateFormData {
  name: string;
  email: string;
}
```

## Client State Types

### Authentication State (Zustand)

```typescript
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  
  // Actions
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}
```

**Storage**: Token persisted in localStorage, user in memory

### UI State Types

```typescript
export interface BookingModalState {
  isOpen: boolean;
  selectedPlan: Plan | null;
}

export interface MobileNavState {
  isOpen: boolean;
}
```

## Validation Schemas (Zod)

All form data types have corresponding Zod schemas for validation:

```typescript
// Example: Login schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
});

// Example: Signup schema
export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
```

## Type Guards

Utility functions for type checking:

```typescript
export const isApiError = (response: ApiResponse<any>): response is ApiErrorResponse => {
  return response.success === false;
};

export const isAuthenticated = (state: AuthState): state is AuthState & { user: User; token: string } => {
  return state.isAuthenticated && state.user !== null && state.token !== null;
};
```

## Relationships

```
User (1) ──── (N) Booking
Plan (1) ──── (N) Booking

User ──── Booking ──── Plan
  │                      │
  └──────────────────────┘
     (Many-to-Many through Booking)
```

**Notes**:
- A User can have multiple Bookings
- A Plan can have multiple Bookings
- A Booking belongs to one User and one Plan
- Trainers are independent (no direct relationships in MVP)
- ContactSubmissions are independent (no user relationship)

## Data Flow

1. **Authentication Flow**:
   - User submits LoginFormData → API returns LoginResponse → Store token in localStorage + user in Zustand → Redirect to dashboard

2. **Booking Flow**:
   - Fetch Plans (TanStack Query) → User selects Plan → BookingModal opens → User submits BookingFormData → API creates Booking → Refresh bookings query → Show success toast

3. **Dashboard Flow**:
   - Fetch User profile → Fetch Bookings (filtered by userId) → Display active plan + booking history

## Type Safety Notes

- All dates are ISO 8601 strings (not Date objects) for JSON serialization
- All IDs are strings (CUID format from backend)
- Optional fields use `?` syntax
- Enums use TypeScript union types for type safety
- Zod schemas provide runtime validation
- Type guards ensure type narrowing in conditional logic

## Future Enhancements

- Add `Review` entity for user reviews
- Add `Payment` entity for payment processing
- Add `Notification` entity for real-time notifications
- Add `Session` entity for detailed session tracking
- Add pagination metadata to all list responses
