# 📦 HubbyBox

> **Smart home organizer with AI Vision** — เปลี่ยนกล่องธรรมดาให้กลายเป็นกล่องอัจฉริยะ ค้นหาของด้วย AI หาเจอทุกชิ้นไม่ต้องเปิดกล่อง

## ✨ Features

- **AI Vision Scanner** — ถ่ายรูปของในกล่อง AI จำแนกสิ่งของและบันทึกเข้าระบบอัตโนมัติ
- **Smart QR System** — ปริ้นท์ QR Code แปะหน้ากล่อง สแกนดูของข้างในได้ทันที
- **AI Search (Hubby AI)** — ค้นหาด้วยข้อความหรือเสียง "กุญแจรถอยู่ไหน?" ระบบชี้เป้าให้ทันที
- **Cloud Storage** — ส่งกล่องเข้าคลังกลาง เรียกคืนเมื่อต้องการ
- **Admin Dashboard** — จัดการออร์เดอร์, คลัง, ผู้ใช้ ผ่านแดชบอร์ดเดียว

## 🏗️ Architecture

```
hubbybox/
├── src/
│   ├── app/
│   │   ├── landing_site/      # Marketing landing page (hubbybox.app)
│   │   ├── app_site/          # Main user app (app.hubbybox.app)
│   │   │   ├── api/           # API routes (auth, boxes, items, vision)
│   │   │   ├── box/[id]/      # Box detail page
│   │   │   ├── search/        # AI search (text, voice, image)
│   │   │   ├── storage/       # Cloud storage (deposit, recall)
│   │   │   ├── settings/      # User settings
│   │   │   └── checkout/      # Payment flow
│   │   ├── admin_site/        # Admin dashboard (admin.hubbybox.app)
│   │   │   ├── api/auth/      # Admin auth with rate limiting
│   │   │   ├── warehouse/     # Warehouse management
│   │   │   ├── orders/        # Order management
│   │   │   └── tickets/       # Support tickets
│   │   ├── api/               # Shared API routes (webhooks, stats)
│   │   └── auth/              # Auth callbacks
│   ├── components/
│   │   ├── boxes/             # Box-related components
│   │   ├── providers/         # LIFF, Confirm, Toast providers
│   │   └── ui/                # Shared UI components
│   ├── hooks/                 # Custom hooks (useBoxData)
│   └── lib/                   # Utilities & configs
│       ├── supabase.ts        # Client-side Supabase (anon key)
│       ├── supabase-service.ts # Server-side Supabase (service role)
│       ├── api-auth.ts        # HMAC session & ownership guards
│       ├── hubbybox-constants.ts
│       └── types.ts
├── public/                    # Static assets
└── middleware.ts              # Subdomain routing
```

## 🛠️ Tech Stack

| Layer | Technology |
|:---|:---|
| **Framework** | Next.js 16 (App Router + Turbopack) |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | LINE LIFF SDK + HMAC-signed session cookies |
| **AI** | Google Gemini (Vision + Search) |
| **Payments** | Stripe Checkout |
| **Styling** | Tailwind CSS |
| **Animations** | Framer Motion |
| **Deployment** | Vercel / Cloudflare |

## 🔐 Security Architecture

```
User → LINE LIFF Login → POST /api/auth/session
                                ↓
                         Set HMAC-signed HttpOnly cookie
                                ↓
User → fetch('/api/boxes/123', PATCH) → API Route
                                         ↓
                                   1. Verify cookie signature
                                   2. requireBoxOwner(userId, boxId)
                                   3. Execute with service role
```

- **All mutations** go through server-side API routes with ownership verification
- **Read queries** use client-side Supabase (anon key) — safe for public data
- **Admin auth** uses IP-based rate limiting (5 attempts / 15 min)
- **LINE Webhook** uses HMAC-SHA256 signature verification

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Supabase project
- LINE LIFF app
- Google Gemini API key

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_LIFF_ID=your_liff_id
LINE_CHANNEL_SECRET=your_line_secret
LINE_CHANNEL_ACCESS_TOKEN=your_line_token
GEMINI_API_KEY=your_gemini_key
STRIPE_SECRET_KEY=your_stripe_key
ADMIN_PASSCODE=your_admin_password
SESSION_SECRET=your_session_secret
```

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# The app uses subdomain routing:
# - http://lvh.me:3000        → Landing page
# - http://app.lvh.me:3000    → User app (LIFF)
# - http://admin.lvh.me:3000  → Admin dashboard
```

### Build

```bash
npm run build
```

## 📂 Subdomain Routing

HubbyBox uses `middleware.ts` to route subdomains to different site folders:

| Subdomain | Folder | Description |
|:---|:---|:---|
| `hubbybox.app` | `landing_site/` | Marketing + pricing |
| `app.hubbybox.app` | `app_site/` | Main user application |
| `admin.hubbybox.app` | `admin_site/` | Admin dashboard |

## 📄 License

Proprietary — All rights reserved © 2026 HubbyBox Labs
