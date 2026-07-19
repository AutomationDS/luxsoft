# Architecture Design

## System Overview
LuxeCart is a full-stack e-commerce web application with React frontend and Atoms Cloud backend providing auth, database, file storage, and Stripe payment integration.

## Tech Stack
- Frontend: React 18 + TypeScript + Vite + Tailwind CSS + Shadcn/ui
- State Management: Zustand
- Backend: Atoms Cloud (FastAPI, PostgreSQL, Auth, Object Storage)
- Payments: Stripe Checkout
- SDK: @metagptx/web-sdk for frontend-backend communication

## Module Design
| Module | Responsibility | Key Files |
|--------|---------------|-----------|
| Homepage | Hero, categories, featured/trending products | src/pages/Index.tsx |
| Shop | Product catalog with filters, sorting, search | src/pages/Shop.tsx |
| Product Detail | Full product view with options, related items | src/pages/ProductDetail.tsx |
| Cart | Shopping cart management | src/pages/Cart.tsx |
| Checkout | Stripe payment flow | src/pages/Checkout.tsx, PaymentSuccess.tsx |
| Wishlist | Saved products | src/pages/Wishlist.tsx |
| Orders | Order history | src/pages/Orders.tsx |
| Auth | Login/logout via Atoms Cloud | AuthCallback.tsx |
| Payment API | Stripe session creation and verification | backend/routers/payments.py |

## Tech Decisions
| Decision | Choice | Rationale |
|----------|--------|-----------|
| State management | Zustand | Lightweight, no boilerplate, perfect for cart/auth state |
| Payment | Stripe Checkout | Secure hosted checkout, minimal PCI scope |
| Styling | Tailwind + Shadcn/ui | Rapid development with consistent design system |
| Data access | web-sdk entities | Type-safe CRUD with built-in auth |

## File Tree Plan
```
app/frontend/src/
├── App.tsx
├── index.css
├── lib/
│   ├── client.ts
│   ├── types.ts
│   └── store.ts
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── ProductCard.tsx
└── pages/
    ├── Index.tsx
    ├── Shop.tsx
    ├── ProductDetail.tsx
    ├── Cart.tsx
    ├── Checkout.tsx
    ├── PaymentSuccess.tsx
    ├── Wishlist.tsx
    ├── Orders.tsx
    ├── AuthCallback.tsx
    └── AuthError.tsx

app/backend/routers/
└── payments.py
```

## Implementation Guide
1. Database tables auto-generated via BackendManager
2. Frontend uses web-sdk for all data access (entities + apiCall)
3. Payment flow: Cart -> Checkout -> Stripe -> PaymentSuccess (verify)
4. Auth handled by Atoms Cloud OIDC flow