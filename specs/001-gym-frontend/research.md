# Research: IronPulse Gym Frontend

**Feature**: 001-gym-frontend  
**Date**: 2026-04-20  
**Purpose**: Document technology choices, best practices, and architectural decisions for frontend implementation

## Technology Stack Decisions

### 1. Framework: Next.js 15 (App Router)

**Decision**: Use Next.js 15 with App Router for the frontend framework

**Rationale**:
- **Server Components**: App Router enables React Server Components for better performance and SEO
- **File-based routing**: Intuitive routing structure with layouts and route groups
- **Built-in optimizations**: Automatic code splitting, image optimization, font optimization
- **TypeScript support**: First-class TypeScript integration
- **Deployment**: Seamless Vercel deployment (constitution requirement)
- **Developer experience**: Hot reload, fast refresh, excellent error messages

**Alternatives Considered**:
- **Pages Router**: Older Next.js routing - rejected because App Router is the future and provides better performance
- **Vite + React Router**: More manual setup required, lacks Next.js optimizations
- **Remix**: Good alternative but less mature ecosystem, team familiarity with Next.js

**Best Practices**:
- Use Server Components by default, Client Components only when needed (interactivity, hooks)
- Leverage route groups `(auth)` for organization without affecting URLs
- Use `loading.tsx` and `error.tsx` for automatic loading/error states
- Implement proper metadata for SEO in each page

### 2. Styling: Tailwind CSS + ShadCN/UI

**Decision**: Tailwind CSS for utility-first styling, ShadCN/UI for component library

**Rationale**:
- **Tailwind CSS**: Rapid development, consistent design system, excellent dark mode support
- **ShadCN/UI**: Copy-paste components (not npm package), full customization, built on Radix UI primitives
- **Accessibility**: ShadCN components have built-in ARIA attributes and keyboard navigation
- **Dark theme**: Easy to implement with Tailwind's dark mode utilities
- **Constitution compliance**: Enables responsive design at exact breakpoints (375px/768px/1440px)

**Alternatives Considered**:
- **Material-UI**: Too opinionated, harder to customize for gym aesthetic
- **Chakra UI**: Good but heavier bundle size
- **Plain CSS Modules**: More manual work, less consistency

**Best Practices**:
- Configure custom colors in `tailwind.config.ts` (red/orange accents for gym theme)
- Use `cn()` utility from ShadCN for conditional class merging
- Create custom variants for gym-specific components
- Use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`) for breakpoints

### 3. State Management: Zustand + TanStack Query

**Decision**: Zustand for client state (auth), TanStack Query for server state (API data)

**Rationale**:
- **Zustand**: Minimal boilerplate, TypeScript-friendly, no context providers needed
- **TanStack Query**: Automatic caching, request deduplication, background refetching, optimistic updates
- **Separation of concerns**: Client state (auth, UI) vs server state (plans, bookings)
- **Performance**: TanStack Query reduces unnecessary API calls through intelligent caching
- **Constitution compliance**: Meets performance requirements (<300ms interaction response)

**Alternatives Considered**:
- **Redux Toolkit**: Too much boilerplate for this project size
- **Context API**: No built-in caching or request management
- **SWR**: Similar to TanStack Query but less feature-rich

**Best Practices**:
- Use Zustand for: authentication state, UI state (modals, theme)
- Use TanStack Query for: all API data fetching (plans, bookings, profile)
- Configure staleTime and cacheTime appropriately (5 minutes for plans, 30 seconds for bookings)
- Implement optimistic updates for booking creation

### 4. Forms: React Hook Form + Zod

**Decision**: React Hook Form for form state management, Zod for validation schemas

**Rationale**:
- **React Hook Form**: Minimal re-renders, excellent performance, built-in validation
- **Zod**: Type-safe schema validation, reusable schemas, great TypeScript inference
- **Integration**: `@hookform/resolvers/zod` provides seamless integration
- **Constitution compliance**: Zod validation on frontend before API submission (Principle II)
- **User experience**: Inline validation errors, field-level validation

**Alternatives Considered**:
- **Formik**: More re-renders, heavier bundle
- **Yup**: Less type-safe than Zod
- **Manual validation**: Error-prone, not reusable

**Best Practices**:
- Define Zod schemas in separate files for reusability
- Use `zodResolver` for React Hook Form integration
- Implement custom error messages for user-friendly feedback
- Validate on blur for better UX (not on every keystroke)

### 5. HTTP Client: Axios with Interceptors

**Decision**: Axios for HTTP requests with request/response interceptors

**Rationale**:
- **Interceptors**: Automatic token attachment, centralized error handling
- **Request transformation**: Easy to add headers, modify requests globally
- **Response transformation**: Consistent error format handling
- **Constitution compliance**: Enables security-first development (Principle I)
- **TypeScript support**: Good type inference for requests/responses

**Alternatives Considered**:
- **Fetch API**: No interceptors, more manual error handling
- **ky**: Lighter but less mature ecosystem

**Best Practices**:
- Create single Axios instance in `lib/api.ts`
- Request interceptor: Attach JWT token from localStorage
- Response interceptor: Handle 401 errors (auto-logout), transform error responses
- Set base URL from environment variable
- Configure timeout (10 seconds)

### 6. Animations: Framer Motion

**Decision**: Framer Motion for animations and transitions

**Rationale**:
- **Declarative API**: Easy to understand and maintain
- **Performance**: GPU-accelerated animations
- **Gestures**: Built-in drag, hover, tap interactions
- **Constitution compliance**: Can enforce max 300ms duration (Principle III)
- **Variants**: Reusable animation configurations

**Alternatives Considered**:
- **CSS transitions**: Less powerful, harder to orchestrate
- **GSAP**: More powerful but heavier, overkill for this project
- **React Spring**: Physics-based, less intuitive API

**Best Practices**:
- Use `motion` components for animated elements
- Define animation variants for consistency
- Keep animations under 300ms (constitution requirement)
- Use `AnimatePresence` for exit animations
- Implement page transitions with `motion.div`

### 7. Authentication Strategy

**Decision**: JWT tokens stored in localStorage with Axios interceptors

**Rationale**:
- **Simplicity**: Easy to implement for MVP
- **Stateless**: No server-side session management needed
- **Cross-domain**: Works with separate frontend/backend deployments
- **Constitution note**: Acknowledged as acceptable for MVP, httpOnly cookies noted as future improvement

**Security Considerations**:
- **XSS vulnerability**: localStorage is vulnerable to XSS attacks
- **Mitigation**: Strict CSP headers, input sanitization, no eval()
- **Token expiry**: Implement automatic logout on token expiry (401 response)
- **Future improvement**: Migrate to httpOnly cookies for production

**Best Practices**:
- Store only JWT token in localStorage (no sensitive user data)
- Clear token on logout
- Implement token refresh logic if backend supports it
- Use Axios interceptor to attach token to all requests
- Redirect to login on 401 responses

### 8. Testing Strategy

**Decision**: Jest + React Testing Library for unit/component tests, Playwright for E2E tests

**Rationale**:
- **Jest**: Standard for React testing, fast, good mocking
- **React Testing Library**: Tests user behavior, not implementation details
- **Playwright**: Cross-browser E2E testing, reliable, fast
- **Constitution compliance**: TDD required for critical paths (Principle V)

**Test Coverage Requirements**:
- **Unit tests**: Form components (LoginForm, SignupForm, BookingModal, ContactForm)
- **Integration tests**: Authentication flow, booking flow
- **E2E tests**: Complete user journeys (signup → login → booking)
- **Target coverage**: 80% for critical paths

**Best Practices**:
- Test user interactions, not implementation
- Mock API calls with MSW (Mock Service Worker)
- Use data-testid sparingly (prefer accessible queries)
- Run E2E tests in CI/CD pipeline

## Architecture Patterns

### Component Organization

**Pattern**: Feature-based component organization with shared UI library

**Structure**:
- `components/ui/`: ShadCN components (shared, reusable)
- `components/layout/`: Layout components (Navbar, Footer)
- `components/common/`: Common utilities (LoadingSpinner, ErrorMessage)
- `components/features/`: Feature-specific components (PlanCard, BookingModal)
- `components/forms/`: Form components with validation

**Rationale**: Clear separation of concerns, easy to locate components, scalable

### Data Fetching Pattern

**Pattern**: TanStack Query hooks with custom wrappers

**Implementation**:
```typescript
// hooks/usePlans.ts
export const usePlans = () => {
  return useQuery({
    queryKey: ['plans'],
    queryFn: () => api.get('/plans'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

**Rationale**: Centralized data fetching, automatic caching, easy to test

### Authentication Pattern

**Pattern**: Zustand store + Axios interceptors + route protection

**Implementation**:
- Zustand store manages auth state (user, token, isAuthenticated)
- Axios interceptor attaches token to requests
- Client-side route protection in layouts (redirect if not authenticated)
- Backend enforces authorization (frontend protection is UX only)

**Rationale**: Separation of concerns, centralized auth logic, secure

## Performance Optimizations

### Image Optimization
- Use Next.js `<Image>` component for automatic optimization
- Lazy load below-fold images
- Use WebP format with fallbacks
- Implement blur placeholders

### Code Splitting
- Next.js automatic code splitting by route
- Dynamic imports for heavy components (BookingModal)
- Lazy load Framer Motion animations

### Caching Strategy
- TanStack Query caching for API responses
- Service Worker for static assets (future enhancement)
- CDN caching for images and fonts

### Bundle Size
- Tree-shaking with ES modules
- Analyze bundle with `@next/bundle-analyzer`
- Target: <200KB initial bundle

## Accessibility Requirements

### WCAG 2.1 AA Compliance
- Semantic HTML elements
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus indicators
- Color contrast ratios (4.5:1 for text)
- Screen reader testing

### Implementation
- Use ShadCN components (built-in accessibility)
- Test with Lighthouse accessibility audit (target: 90%)
- Test with keyboard navigation
- Test with screen reader (NVDA/JAWS)

## Development Workflow

### Setup Process
1. Initialize Next.js 15 with TypeScript
2. Install and configure Tailwind CSS
3. Initialize ShadCN/UI
4. Install dependencies (Zustand, TanStack Query, Axios, etc.)
5. Configure ESLint + Prettier
6. Set up folder structure
7. Configure environment variables

### Development Process
1. Create component with TypeScript types
2. Write tests (TDD for critical components)
3. Implement component with ShadCN/UI
4. Add Framer Motion animations
5. Test responsiveness (375px/768px/1440px)
6. Test accessibility (keyboard, screen reader)
7. Commit with conventional commit message

### Quality Gates
- TypeScript strict mode (no errors)
- ESLint (no warnings)
- Prettier formatting
- Tests passing
- Lighthouse score >90

## Risks and Mitigations

### Risk 1: localStorage XSS Vulnerability
**Mitigation**: Implement CSP headers, plan migration to httpOnly cookies

### Risk 2: Client-side Route Protection Bypass
**Mitigation**: Backend must enforce authorization, frontend protection is UX only

### Risk 3: Large Bundle Size
**Mitigation**: Code splitting, tree-shaking, bundle analysis

### Risk 4: Performance on 3G
**Mitigation**: Image optimization, code splitting, caching strategy

### Risk 5: Accessibility Compliance
**Mitigation**: Use ShadCN components, regular Lighthouse audits, manual testing

## Conclusion

All technology choices align with constitution principles and project requirements. No unresolved clarifications remain. Ready to proceed to Phase 1 (Design & Contracts).
