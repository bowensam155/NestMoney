# NestMoney — Architecture Document
**Version:** 0.2 (AWS Backend)
**Last Updated:** March 2026
**Status:** Pre-build — decisions locked before first commit

---

## Table of Contents
1. [Guiding Principles](#1-guiding-principles)
2. [System Overview](#2-system-overview)
3. [Frontend Architecture](#3-frontend-architecture)
4. [Backend Architecture](#4-backend-architecture)
5. [Database Schema](#5-database-schema)
6. [Family Role & Permissions System](#6-family-role--permissions-system)
7. [Banking Infrastructure](#7-banking-infrastructure)
8. [AI Pipeline](#8-ai-pipeline)
9. [Video Generation Pipeline](#9-video-generation-pipeline)
10. [Internationalization Architecture](#10-internationalization-architecture)
11. [Authentication & Security](#11-authentication--security)
12. [Push Notifications](#12-push-notifications)
13. [Decision Log](#13-decision-log)

---

## 1. Guiding Principles

- **Solo founder velocity first.** No clever abstractions that take two days to understand later. Simple, readable, deletable code.
- **Don't build what you can buy.** Banking compliance, card issuance, video generation — use APIs. Only build what is uniquely NestMoney.
- **The permissions system is sacred.** A grandparent must never see a parent's full balance. A child must never see household debt. Get this right before anything else.
- **Mobile is the product.** The web is a companion. Every core decision optimizes for the phone experience.
- **i18n from day one.** Never hardcode a user-facing string. Retrofitting multilingual support is 10x harder than building it in.
- **Built to scale.** AWS gives us no ceiling — architect for growth from the start.

---

## 2. System Overview

```
┌─────────────────────────────────────────────────────┐
│                  Expo (React Native)                 │
│              iOS App        Android App              │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────┐
│            AWS API Gateway (REST + WebSocket)        │
└──────────────────────┬──────────────────────────────┘
                       │
        ┌──────────────┼──────────────────┐
        │              │                  │
┌───────▼──────┐ ┌─────▼──────┐  ┌───────▼────────┐
│  AWS Lambda  │ │ Aurora RDS │  │  AWS Cognito   │
│  Functions   │ │  Postgres  │  │  Auth / OTP    │
└───────┬──────┘ └────────────┘  └────────────────┘
        │
┌───────┴──────────────────────────────────┐
│              Third-Party APIs             │
├──────────────┬──────────────┬────────────┤
│   Unit.co    │  Anthropic   │  HeyGen    │
│ Card / KYC   │     AI       │  Video     │
└──────────────┴──────────────┴────────────┘

Supporting AWS Services:
┌─────────────┐  ┌──────┐  ┌──────────┐  ┌─────┐  ┌────────────┐
│  CloudFront │  │  S3  │  │ SQS/SNS  │  │ SES │  │  Secrets   │
│  Video CDN  │  │ Store│  │  Events  │  │Email│  │  Manager   │
└─────────────┘  └──────┘  └──────────┘  └─────┘  └────────────┘
```

The mobile app communicates with AWS API Gateway for all operations. Lambda functions handle all business logic and third-party API calls — API keys never touch the client. Cognito handles auth. Aurora Serverless Postgres stores all data.

---

## 3. Frontend Architecture

### Framework
**Expo SDK + Expo Router** — file-based routing, same mental model as Next.js App Router.

### Folder Structure
```
app/
├── (auth)/
│   ├── login.tsx
│   ├── signup.tsx
│   └── onboarding/
│       ├── language.tsx        # First screen — pick your language
│       ├── family-setup.tsx
│       └── invite.tsx
├── (tabs)/
│   ├── _layout.tsx
│   ├── dashboard/index.tsx
│   ├── cards/
│   │   ├── index.tsx
│   │   └── [cardId]/
│   │       ├── index.tsx
│   │       └── controls.tsx
│   ├── goals/
│   │   ├── index.tsx
│   │   └── [goalId].tsx
│   └── learn/index.tsx
├── modals/
│   ├── explain.tsx             # AI explainer bottom sheet
│   ├── approve.tsx             # Parent approval flow
│   └── contribute.tsx          # Grandparent contribution
└── _layout.tsx

components/
├── ui/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Avatar.tsx
│   └── BalanceDisplay.tsx
├── family/
│   ├── FamilyDashboard.tsx
│   ├── MemberRow.tsx
│   └── VisibilityBadge.tsx
├── cards/
│   ├── KidCard.tsx
│   └── SpendApproval.tsx
├── goals/
│   └── GoalProgress.tsx
└── ai/
    ├── ExplainerSheet.tsx
    └── VideoPlayer.tsx

lib/
├── api.ts                      # API Gateway client (Axios + Cognito token injection)
├── auth.ts                     # Cognito auth helpers
├── websocket.ts                # API Gateway WebSocket client
└── ai/
    └── prompts.ts

hooks/
├── useFamily.ts
├── useCard.ts
├── useGoals.ts
└── usePermissions.ts           # Role-based visibility checks

store/
├── authStore.ts                # Cognito session (Zustand)
├── familyStore.ts
└── languageStore.ts

i18n/
├── config.ts
├── fonts.ts
└── locales/
    ├── en.json
    ├── es.json
    ├── tl.json
    ├── vi.json
    ├── yue.json
    ├── zh.json
    ├── mn.json
    ├── hi.json
    └── pa.json

types/
├── api.ts                      # API request/response types
├── family.ts
└── cards.ts
```

### State Management
**Zustand** for global state. Server state managed via custom hooks calling API Gateway. Real-time updates via **API Gateway WebSocket** for live transaction notifications.

---

## 4. Backend Architecture

### AWS Services

| Service | Purpose |
|---|---|
| **API Gateway** | REST + WebSocket API — single entry point for all client requests |
| **Lambda** | All business logic and third-party API calls |
| **Aurora Serverless v2** | Postgres — scales to zero at idle, no ceiling at scale |
| **Cognito** | Auth — phone OTP, email/password, JWT management |
| **S3** | Education videos, user avatars |
| **CloudFront** | Video CDN — global low-latency delivery |
| **SQS** | Webhook event queue — decouples Unit webhooks from processing |
| **SNS** | Push notification routing to Expo |
| **SES** | Transactional email |
| **Secrets Manager** | All third-party API keys — never in env vars in production |
| **CloudWatch** | Logging, monitoring, alerts |

### Lambda Functions
```
lambda/
├── auth/
│   ├── confirm-otp/
│   └── refresh-token/
├── family/
│   ├── get-family/
│   ├── invite-member/
│   └── update-visibility/
├── cards/
│   ├── issue-card/             # Unit.co card creation
│   ├── card-action/            # Freeze, unfreeze, limits
│   └── approve-transaction/
├── goals/
│   ├── create-goal/
│   ├── contribute-to-goal/
│   └── get-goals/
├── webhooks/
│   └── receive-unit/           # Validates signature → SQS
├── processors/
│   └── process-transaction/    # Consumes SQS → DB + WebSocket + notifications
├── ai/
│   ├── explain/                # Anthropic API
│   └── health-score/
└── videos/
    └── trigger-video/          # HeyGen API → S3 → CloudFront
```

### Permission Enforcement
Permissions enforced in Lambda middleware — every function returning sensitive data validates the requesting user's role before querying the database.

```ts
// lambda/middleware/permissions.ts
export const validateFamilyAccess = async (
  userId: string,
  familyId: string,
  requiredRoles?: string[]
) => {
  const result = await db.query(
    'SELECT role FROM users WHERE id = $1 AND family_id = $2',
    [userId, familyId]
  );
  if (!result.rows.length) throw new ForbiddenError('Not a member of this family');
  if (requiredRoles && !requiredRoles.includes(result.rows[0].role)) {
    throw new ForbiddenError('Insufficient permissions');
  }
  return result.rows[0].role;
};
```

**The user ID always comes from the validated Cognito JWT — never from the request body.**

### Real-time WebSocket Flow
```
Unit webhook → API Gateway → Lambda (receive-unit)
  → Validates Unit HMAC signature
  → Publishes to SQS
  → Lambda (process-transaction) consumes SQS
  → Inserts to Aurora
  → Pushes event to parent's active WebSocket connection
  → If needs_approval → creates approval_request
  → If video trigger → async invokes trigger-video Lambda
```

---

## 5. Database Schema

### Provider: AWS Aurora Serverless v2 (Postgres)

```sql
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY,              -- Cognito sub
  family_id UUID REFERENCES families(id),
  role TEXT NOT NULL CHECK (role IN (
    'primary_parent', 'secondary_parent', 'child', 'contributor'
  )),
  display_name TEXT,
  language_code TEXT DEFAULT 'en',
  avatar_url TEXT,
  push_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id),
  child_user_id UUID REFERENCES users(id),
  unit_card_id TEXT UNIQUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'cancelled')),
  daily_limit INTEGER,              -- cents
  category_limits JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id),
  card_id UUID REFERENCES cards(id),
  user_id UUID REFERENCES users(id),
  amount INTEGER NOT NULL,          -- cents
  currency TEXT DEFAULT 'USD',
  merchant_name TEXT,
  category TEXT,
  status TEXT CHECK (status IN ('pending', 'cleared', 'declined', 'needs_approval')),
  unit_transaction_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id),
  requested_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id),
  title TEXT NOT NULL,
  target_amount INTEGER NOT NULL,   -- cents
  current_amount INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  owner_user_id UUID REFERENCES users(id),
  visible_to_contributors BOOLEAN DEFAULT TRUE,
  deadline DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE goal_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES savings_goals(id),
  contributed_by UUID REFERENCES users(id),
  amount INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE education_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_event TEXT NOT NULL,
  language_code TEXT NOT NULL,
  s3_key TEXT NOT NULL,
  cloudfront_url TEXT NOT NULL,
  heygen_video_id TEXT,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trigger_event, language_code)
);

CREATE TABLE video_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  video_id UUID REFERENCES education_videos(id),
  watched_at TIMESTAMPTZ DEFAULT NOW(),
  completed BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX idx_users_family_id ON users(family_id);
CREATE INDEX idx_cards_family_id ON cards(family_id);
CREATE INDEX idx_cards_child_user_id ON cards(child_user_id);
CREATE INDEX idx_transactions_family_id ON transactions(family_id);
CREATE INDEX idx_transactions_card_id ON transactions(card_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_savings_goals_family_id ON savings_goals(family_id);
```

---

## 6. Family Role & Permissions System

Enforced entirely in Lambda middleware. No database-level row security.

### Roles

| Role | Access |
|---|---|
| `primary_parent` | Full access — all balances, transactions, cards, goals |
| `secondary_parent` | Full access by default, configurable per family |
| `child` | Own card and transactions only, assigned goals |
| `contributor` | Savings goals with `visible_to_contributors = true` only |

### Contributor (Grandparent) Invite Flow
1. Primary parent creates a goal, enables `visible_to_contributors`
2. Calls `lambda/family/invite-member` → returns a signed JWT invite link (7-day expiry)
3. Link sent via WhatsApp or SMS
4. Contributor clicks link → creates Cognito account → added to family as `contributor`
5. All contributor API calls validate role — only goal endpoints accessible

---

## 7. Banking Infrastructure

### Provider: Unit.co

Unit handles: FDIC-insured accounts, virtual Visa card issuance, KYC/AML compliance, ACH transfers, and transaction webhooks.

### What We Build On Top
- Card freeze/unfreeze UI and API calls
- Spend limit configuration (stored in our DB, synced to Unit)
- Parent approval flow for over-limit transactions
- Transaction webhook processing pipeline

### Sandbox vs Production
- Development: Unit sandbox keys in `.env.local`
- Production: All keys in AWS Secrets Manager — Lambda reads at runtime

---

## 8. AI Pipeline

### Provider: Anthropic (Claude)

### Use Cases
- **Transaction Explainer** — "What is this charge?"
- **Term Explainer** — "What is an overdraft fee?"
- **Financial Health Narrative** — Monthly plain-language family summary
- **Savings Goal Suggestions** — AI-recommended goal amounts

### Architecture
Client → API Gateway → `lambda/ai/explain` → Anthropic API → response.
Anthropic API key retrieved from Secrets Manager at Lambda cold start.

### Safety Guardrails
- Claude instructed to explain, never advise
- Disclaimer appended to all responses: "For educational purposes only, not financial advice"
- Max 150 tokens for transaction explanations
- No user PII sent to Anthropic beyond transaction category and merchant name

---

## 9. Video Generation Pipeline

### Providers: HeyGen API + S3 + CloudFront

### Trigger Events
| Event | Topic |
|---|---|
| `first_paycheck` | Understanding your pay stub |
| `card_declined` | Why cards get declined |
| `credit_score_change` | What affects your credit score |
| `first_savings_goal` | How savings goals work |
| `overdraft_fee` | Overdraft fees and how to avoid them |
| `tax_season` | Filing taxes basics |

### Pipeline
```
Transaction event fires
  → Lambda (trigger-video) invoked async
  → Check education_videos for cached (event + language)
  → Cached: return CloudFront URL immediately
  → Not cached:
      → Call HeyGen API → generate video
      → HeyGen webhook fires on completion
      → Lambda downloads video → uploads to S3
      → CloudFront serves from S3 at edge
      → Record saved to education_videos
      → Push notification to user via SNS
```

### Caching
Videos cached indefinitely in S3 by `(trigger_event, language_code)`. One generation serves all users of that language. CloudFront caches at edge globally.

---

## 10. Internationalization Architecture

### Library: react-i18next

Each user has a `language_code` in the DB. Family members can each have a different language — this is intentional.

### Supported Languages

| Code | Language | Script |
|---|---|---|
| `en` | English | Latin |
| `es` | Spanish | Latin |
| `tl` | Tagalog | Latin |
| `vi` | Vietnamese | Latin |
| `yue` | Cantonese | Traditional Chinese |
| `zh` | Mandarin | Simplified Chinese |
| `mn` | Mongolian | Cyrillic |
| `hi` | Hindi | Devanagari |
| `pa` | Punjabi | Gurmukhi |

Non-Latin scripts require Noto Sans font variants loaded via `expo-font` at startup. See `i18n/fonts.ts`.

AI responses are prompted in the user's language — no secondary translation API call needed.

---

## 11. Authentication & Security

### Provider: AWS Cognito

### Auth Methods
- **Phone + OTP** — primary. Target demographic trusts SMS.
- **Email + password** — secondary
- **No social login**

### Session Management
Cognito issues JWT access + refresh tokens. Stored in Expo SecureStore — never AsyncStorage (not encrypted).

```ts
// lib/auth.ts
import * as SecureStore from 'expo-secure-store';
await SecureStore.setItemAsync('access_token', tokens.AccessToken);
await SecureStore.setItemAsync('refresh_token', tokens.RefreshToken);
```

### Security Rules
- All API Gateway endpoints require Cognito JWT authorizer
- Lambda always extracts user ID from JWT — never trusts client-supplied IDs
- All third-party keys in AWS Secrets Manager only
- Unit webhook endpoint validates HMAC signature before processing
- `.env.local` in `.gitignore` — no secrets in git

---

## 12. Push Notifications

### Provider: Expo Notifications + AWS SNS

### Events
| Event | Recipient | Message |
|---|---|---|
| Kid card transaction | Parent | "Sofia spent $12.50 at McDonald's" |
| Over-limit purchase | Parent | "Sofia needs your approval for $45 at Nike" |
| Goal contribution | Goal owner | "Lola added $50 to Sofia's college fund" |
| New education video | User | "New lesson ready: Understanding your pay stub" |
| Low balance | Parent | "Sofia's card balance is below $10" |

### Flow
```
Event in Lambda
  → Fetch push_token from users table
  → Publish to SNS
  → SNS → Expo Push Service
  → Expo → APNs (iOS) / FCM (Android)
```

---

## 13. Decision Log

| Date | Decision | Alternatives Considered | Reason |
|---|---|---|---|
| Mar 2026 | Expo over bare React Native | Bare RN, Flutter | Solo founder velocity; EAS handles store deployment |
| Mar 2026 | Unit.co over Stripe Issuing | Stripe Issuing, Synctera | Better family account primitives |
| Mar 2026 | AWS over Supabase | Supabase, Firebase | Full infrastructure control, no scaling ceiling, stronger investor narrative |
| Mar 2026 | Aurora Serverless v2 | RDS standard, DynamoDB | Scales to zero at low volume, standard Postgres, no ceiling |
| Mar 2026 | Lambda over custom server | Express on EC2, Fargate | No servers to manage, pay per invocation, auto-scales |
| Mar 2026 | Cognito over Auth0 | Auth0, custom JWT | Native AWS integration, phone OTP built-in |
| Mar 2026 | CloudFront + S3 for video | Cloudinary, Mux | Native AWS, cost-effective, global edge |
| Mar 2026 | Zustand over Redux | Redux Toolkit, Jotai | Minimal boilerplate, clean React Native DX |
| Mar 2026 | Phone OTP as primary auth | Email, social login | Target demographic trusts SMS; more accessible |
| Mar 2026 | HeyGen over Synthesia | Synthesia, D-ID | Better multilingual avatar support |
| Mar 2026 | Noto Sans for all scripts | System fonts | Consistent across 9 languages; Android system fonts unreliable |

---

*Update this document before making any decision that contradicts what's written here.*
