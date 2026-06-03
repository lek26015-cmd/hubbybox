# HubbyBox — Architecture Documentation

## High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        LIFF["LINE LIFF App<br/>(app.hubbybox.app)"]
        ADMIN["Admin Dashboard<br/>(admin.hubbybox.app)"]
        LANDING["Landing Page<br/>(hubbybox.app)"]
    end

    subgraph "Next.js 16 (App Router)"
        MW["middleware.ts<br/>Subdomain Router"]
        API_AUTH["POST /api/auth/session"]
        API_BOXES["CRUD /api/boxes/[id]"]
        API_ITEMS["CRUD /api/items/[id]"]
        API_VISION["POST /api/vision"]
        API_WEBHOOK["POST /api/webhook"]
        API_STATS["GET /api/stats"]
    end

    subgraph "Data Layer"
        SB["Supabase PostgreSQL"]
        STORAGE["Supabase Storage<br/>(box-images)"]
        GEMINI["Google Gemini AI"]
        STRIPE["Stripe Payments"]
        LINE_API["LINE Messaging API"]
    end

    LIFF --> MW
    ADMIN --> MW
    LANDING --> MW
    MW --> API_AUTH & API_BOXES & API_ITEMS & API_VISION
    API_AUTH --> SB
    API_BOXES --> SB
    API_ITEMS --> SB
    API_VISION --> GEMINI
    API_WEBHOOK --> LINE_API
    API_STATS --> SB
    LIFF -.->|"Storage uploads<br/>(anon key)"| STORAGE
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User (LINE)
    participant LIFF as LIFF Provider
    participant API as /api/auth/session
    participant DB as Supabase
    participant C as Cookie Store

    U->>LIFF: Open app in LINE
    LIFF->>LIFF: liff.init() + liff.getProfile()
    LIFF->>API: POST { lineUserId }
    API->>DB: SELECT FROM users WHERE line_user_id = ?
    alt User exists
        DB-->>API: { id: uuid }
    else New user
        API->>DB: INSERT INTO users (line_user_id)
        DB-->>API: { id: uuid }
    end
    API->>C: Set-Cookie: hubby_user_session=<userId>.<HMAC-SHA256>
    API-->>LIFF: { userId }
    LIFF->>DB: SELECT id, box_quota FROM users (anon key)
    Note over LIFF: App ready with dbUser context
```

## Data Model

```mermaid
erDiagram
    USERS {
        uuid id PK
        text line_user_id UK
        int box_quota "default: 3"
        timestamp created_at
    }
    BOXES {
        uuid id PK
        uuid user_id FK
        text name
        text location "nullable"
        text status "nullable"
        text cover_image_url "nullable"
        text shipping_carrier "nullable"
        text tracking_number "nullable"
        boolean allow_staff_open "default: false"
        text access_code "nullable"
        timestamp access_code_expires_at "nullable"
        timestamp created_at
    }
    ITEMS {
        uuid id PK
        uuid box_id FK
        text name
        text image_url "nullable"
        timestamp created_at
    }

    USERS ||--o{ BOXES : owns
    BOXES ||--o{ ITEMS : contains
```

## Component Architecture (Box Detail)

```mermaid
graph TD
    PAGE["page.tsx<br/>(orchestrator ~230 lines)"]
    HOOK["useBoxData hook<br/>(data + mutations)"]

    PAGE --> HOOK
    PAGE --> BH["BoxHeader"]
    PAGE --> BSC["BoxStatusCard"]
    PAGE --> LS["LogisticsStepper"]
    PAGE --> LSC["LogisticsStatusCard"]
    PAGE --> MAF["ManualAddForm"]
    PAGE --> IL["ItemList"]
    PAGE --> SB["SelectionBar"]
    PAGE --> MM["MoveModal"]
    PAGE --> TM["TrackingModal"]
    PAGE --> ACM["AccessCodeModal"]
    PAGE --> FI["FullscreenImage"]
    PAGE --> PQR["PrintableQrLabel"]
```

## API Routes (Secured)

All mutation routes use HMAC-signed session cookies for authentication.

| Route | Method | Auth Guard | Purpose |
|:---|:---:|:---|:---|
| `/api/auth/session` | POST | None (creates session) | Create/find user + set cookie |
| `/api/boxes/[id]` | PATCH | `requireBoxOwner` | Update box fields |
| `/api/boxes/[id]` | DELETE | `requireBoxOwner` | Delete box + all items |
| `/api/boxes/[id]/items` | POST | `requireBoxOwner` | Add item (50 limit) |
| `/api/items/[id]` | DELETE | `requireItemOwner` | Delete single item |
| `/api/items/[id]` | PATCH | `requireItemOwner` | Move item to another box |
| `/api/items/bulk-move` | POST | `requireUser` + verify both boxes | Bulk move items |

## Subdomain Routing

`middleware.ts` inspects the `Host` header and rewrites paths:

```
hubbybox.app          → /landing_site/*
app.hubbybox.app      → /app_site/*
admin.hubbybox.app    → /admin_site/*
```

Development equivalents use `lvh.me`:
- `lvh.me:3000` → Landing
- `app.lvh.me:3000` → App
- `admin.lvh.me:3000` → Admin
