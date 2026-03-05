# NestMoney 🪺

> The family financial brain for immigrant households.

NestMoney is a mobile-first fintech app that helps immigrant and first-generation American families navigate the US financial system — in their language, together, across borders.

---

## What It Does

- **Family dashboard** — shared financial overview with role-based visibility (parent, child, grandparent contributor)
- **Virtual kid cards** — parent-controlled debit cards with real-time approvals and spend limits
- **AI explainer** — tap any transaction or term to get a plain-language explanation in your language
- **Financial education videos** — AI-generated short videos triggered by real account events, in 9 languages
- **Grandparent contributor accounts** — family abroad can contribute to savings goals without a US bank account
- **Savings goals** — family-wide goal tracking with shared contributions

---

## Tech Stack

### Mobile
| Layer | Technology |
|---|---|
| App Framework | Expo (React Native) |
| Navigation | Expo Router |
| State | Zustand |
| i18n | react-i18next |

### AWS Backend
| Service | Purpose |
|---|---|
| API Gateway | REST + WebSocket API |
| Lambda | All business logic |
| Aurora Serverless v2 | Postgres database |
| Cognito | Authentication |
| S3 | Video + asset storage |
| CloudFront | Video CDN |
| SQS / SNS | Event queue + push notifications |
| SES | Transactional email |
| Secrets Manager | API key storage |

### Third-Party
| Service | Purpose |
|---|---|
| Unit.co | Card issuance + KYC/AML |
| Anthropic (Claude) | AI financial explainer |
| HeyGen | Multilingual education videos |
| Stripe | Subscription payments |

---

## Project Structure

```
nestmoney/
├── app/                    # Expo Router screens
│   ├── (auth)/             # Login, signup, onboarding
│   ├── (tabs)/             # Main tab navigation
│   └── modals/             # Bottom sheets and overlays
├── components/             # Reusable UI components
├── lib/                    # API client, auth helpers
├── hooks/                  # Custom React hooks
├── store/                  # Zustand global state
├── i18n/                   # Translation files (9 languages)
├── types/                  # TypeScript types
├── lambda/                 # AWS Lambda functions
│   ├── template.yaml       # SAM infrastructure definition
│   ├── layers/             # Shared Lambda dependencies
│   └── functions/          # Individual Lambda handlers
├── database/
│   └── migrations/         # SQL migration files
└── infrastructure/         # AWS CDK / CloudFormation configs
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`
- AWS CLI: `brew install awscli`
- AWS SAM CLI: `brew install aws-sam-cli`
- Docker (for SAM local)

### Installation

```bash
git clone https://github.com/yourusername/nestmoney.git
cd nestmoney
npm install
cp .env.example .env.local
```

Fill in `.env.local` with your keys — see `DEVELOPMENT.md` for the full variable reference.

### Run the App

```bash
npx expo start
```

Scan the QR code with Expo Go on your phone.

### Run the Backend Locally

```bash
cd lambda
sam local start-api --env-vars ../.env.local
```

---

## Languages Supported

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

Each family member can use the app in their own language simultaneously.

---

## Family Role System

| Role | Access |
|---|---|
| `primary_parent` | Full access — all balances, cards, goals, transactions |
| `secondary_parent` | Full access (configurable) |
| `child` | Own card and transactions only |
| `contributor` | Savings goals only (grandparent-friendly) |

All permissions enforced in Lambda middleware — never trust client-supplied roles.

---

## Documentation

| Doc | Contents |
|---|---|
| `ARCHITECTURE.md` | System design, AWS services, DB schema, permission model |
| `DEVELOPMENT.md` | Local setup, SAM, migrations, testing, deployment |
| `DESIGN.md` | Design language, colors, typography, components |

PRD lives in Notion — not in this repo.

---

## Deployment

```bash
# Deploy backend to AWS
cd lambda && sam build && sam deploy

# Build mobile app
eas build --platform all

# Submit to stores
eas submit --platform all
```

---

## Roadmap

**MVP (current focus)**
- [ ] Cognito auth with phone OTP
- [ ] Family account + role/permissions system
- [ ] Virtual kid card with parent controls
- [ ] AI transaction explainer
- [ ] Savings goals with grandparent contributions
- [ ] Spanish + Tagalog language support

**V2**
- [ ] AI education videos (HeyGen + CloudFront)
- [ ] Document translator
- [ ] Remittance optimizer
- [ ] Tax credit alerts
- [ ] Co-parent / blended family mode

---

## License

Private. All rights reserved.

---

*Built for the families the financial system forgot.*
