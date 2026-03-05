# NestMoney — Development Setup & Environment Guide
**Version:** 0.2 (AWS Backend)
**Last Updated:** March 2026

> Read ARCHITECTURE.md before this. This document covers local setup, running the app, and day-to-day development workflow.

---

## Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Initial Setup](#2-initial-setup)
3. [Environment Variables](#3-environment-variables)
4. [AWS Local Development](#4-aws-local-development)
5. [Running the App](#5-running-the-app)
6. [Running Lambda Functions Locally](#6-running-lambda-functions-locally)
7. [Unit.co Sandbox](#7-unitco-sandbox)
8. [Database Migrations](#8-database-migrations)
9. [Testing](#9-testing)
10. [Deploying to AWS](#10-deploying-to-aws)
11. [Building for the App Stores](#11-building-for-the-app-stores)
12. [Workflow & Conventions](#12-workflow--conventions)
13. [Common Issues](#13-common-issues)

---

## 1. Prerequisites

### Tools

| Tool | Version | Install |
|---|---|---|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| npm | 9+ | Comes with Node |
| Expo CLI | Latest | `npm install -g expo-cli` |
| EAS CLI | Latest | `npm install -g eas-cli` |
| AWS CLI | Latest | `brew install awscli` |
| AWS SAM CLI | Latest | `brew install aws-sam-cli` |
| Docker | Latest | Required for SAM local — [docker.com](https://docker.com) |
| Expo Go app | Latest | App Store / Play Store |

### Accounts You Need
- [AWS](https://aws.amazon.com) — free tier covers development
- [Unit.co](https://unit.co) — apply for sandbox access (1–2 business days)
- [Anthropic](https://console.anthropic.com) — API key
- [HeyGen](https://heygen.com) — API key
- [Expo](https://expo.dev) — free account for EAS builds
- [Stripe](https://stripe.com) — test mode keys

### AWS Setup (First Time)
```bash
# Configure AWS CLI with your credentials
aws configure
# AWS Access Key ID: [from AWS IAM console]
# AWS Secret Access Key: [from AWS IAM console]
# Default region: us-west-2
# Default output format: json
```

---

## 2. Initial Setup

```bash
git clone https://github.com/yourusername/nestmoney.git
cd nestmoney
npm install
cp .env.example .env.local
```

Fill in `.env.local` — see [Section 3](#3-environment-variables).

---

## 3. Environment Variables

```env
# App environment
EXPO_PUBLIC_APP_ENV=development

# AWS API Gateway
EXPO_PUBLIC_API_URL=https://your-api-id.execute-api.us-west-2.amazonaws.com/dev
EXPO_PUBLIC_WS_URL=wss://your-ws-id.execute-api.us-west-2.amazonaws.com/dev

# AWS Cognito
EXPO_PUBLIC_COGNITO_USER_POOL_ID=us-west-2_xxxxxxxxx
EXPO_PUBLIC_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
EXPO_PUBLIC_COGNITO_REGION=us-west-2

# AWS Region
AWS_REGION=us-west-2

# Unit.co — ALWAYS sandbox locally
UNIT_API_KEY=your_unit_sandbox_key
UNIT_ENV=sandbox

# Anthropic (Lambda only — never client)
ANTHROPIC_API_KEY=sk-ant-...

# HeyGen (Lambda only — never client)
HEYGEN_API_KEY=your_heygen_key

# Database (Lambda only — never client)
DB_HOST=your-aurora-cluster.cluster-xxxx.us-west-2.rds.amazonaws.com
DB_PORT=5432
DB_NAME=nestmoney
DB_USER=nestmoney_app
DB_PASSWORD=your_db_password
```

### Rules
- Variables prefixed `EXPO_PUBLIC_` are bundled into the client — safe for public values only
- `ANTHROPIC_API_KEY`, `HEYGEN_API_KEY`, `DB_*`, `UNIT_API_KEY` are Lambda-only — never reference in `app/` or `components/`
- In production, Lambda reads all secrets from **AWS Secrets Manager** — not environment variables
- **Never commit `.env.local`** — it's in `.gitignore`
- **Never use production Unit keys locally**

---

## 4. AWS Local Development

We use **AWS SAM CLI** to run Lambda functions locally. This lets you develop and test the backend without deploying to AWS on every change.

### Project Structure for SAM
```
lambda/
├── template.yaml           # SAM template — defines all Lambda functions and API Gateway
├── layers/
│   └── nodejs/             # Shared dependencies (db client, auth middleware)
└── functions/
    ├── ai/explain/
    ├── cards/card-action/
    └── ...

infrastructure/
├── cognito.yaml            # Cognito user pool config
├── rds.yaml                # Aurora Serverless config
└── cloudfront.yaml         # CloudFront + S3 config
```

### Start Local API
```bash
cd lambda
sam local start-api --env-vars ../.env.local
```

This runs all Lambda functions locally at `http://localhost:3000`. Update `EXPO_PUBLIC_API_URL` in `.env.local` to point here during local development.

### Start Local WebSocket
```bash
sam local start-lambda --env-vars ../.env.local
```

### Invoke a Function Directly
```bash
sam local invoke "AiExplainFunction" \
  --event events/ai-explain-test.json \
  --env-vars .env.local
```

Test event files live in `lambda/events/` — one per function for easy local testing.

---

## 5. Running the App

```bash
npx expo start
```

| Action | Command |
|---|---|
| Open on phone | Scan QR code with Expo Go |
| iOS Simulator | Press `i` |
| Android Emulator | Press `a` |
| Tunnel mode (public WiFi) | Press `t` |

### Physical Device Recommended
Non-Latin font rendering, push notifications, and Cognito OTP must be tested on a real device. Simulators miss edge cases that matter for your users.

---

## 6. Running Lambda Functions Locally

```bash
# Start all functions
cd lambda && sam local start-api --env-vars ../.env.local

# Test AI explainer
curl -X POST http://localhost:3000/ai/explain \
  -H "Authorization: Bearer YOUR_COGNITO_JWT" \
  -H "Content-Type: application/json" \
  -d '{"context": "McDonald'\''s $12.50", "language": "tl", "type": "transaction"}'
```

### Getting a Local Cognito JWT
For local development, generate a test JWT:
```bash
aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id YOUR_CLIENT_ID \
  --auth-parameters USERNAME=test@example.com,PASSWORD=TestPass123!
```

### Unit Webhook Testing
Unit webhooks can't reach localhost. Use [ngrok](https://ngrok.com):
```bash
# Expose local SAM API
ngrok http 3000

# Set Unit sandbox webhook URL to:
# https://abc123.ngrok.io/webhooks/unit
```

---

## 7. Unit.co Sandbox

### Simulating Transactions
1. Log in to [app.s.unit.co](https://app.s.unit.co)
2. Find your test card
3. Use "Simulate Purchase" to fire a test transaction
4. Watch your Aurora DB `transactions` table populate via the webhook pipeline

### Sandbox Behaviors
- KYC always succeeds — no real identity verification
- All transactions are simulated — no real money moves
- Webhooks fire in real-time just like production

---

## 8. Database Migrations

Migrations are plain SQL files in `database/migrations/`. Run them in order.

```bash
# Connect to local Aurora (or RDS Proxy in dev)
psql -h localhost -U nestmoney_app -d nestmoney

# Run a migration
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f database/migrations/001_initial_schema.sql
```

### Migration Naming Convention
```
001_initial_schema.sql
002_add_push_tokens.sql
003_add_video_views.sql
```

Always create a new file — never edit an existing migration.

### Local Database
For local development without connecting to AWS, run Postgres in Docker:
```bash
docker run --name nestmoney-db \
  -e POSTGRES_USER=nestmoney_app \
  -e POSTGRES_PASSWORD=localpassword \
  -e POSTGRES_DB=nestmoney \
  -p 5432:5432 -d postgres:15
```

Update `DB_HOST=localhost` and `DB_PASSWORD=localpassword` in `.env.local`.

---

## 9. Testing

```bash
npm test
```

Tests live in `__tests__/` next to source files. Uses **Jest** + **React Native Testing Library**.

### What To Test Thoroughly
- `lambda/middleware/permissions.ts` — the entire permission system. Every role combination.
- `lib/ai/prompts.ts` — prompt building for all 9 languages
- Currency math — amounts in cents, formatting to display
- Savings goal contribution logic

### What To Mock
- Anthropic API responses
- HeyGen API responses
- Unit.co API responses
- Aurora DB queries (use `jest.mock`)

### Lambda Function Tests
```bash
cd lambda
npm test
```

Each Lambda function has a `__tests__/` folder with unit tests and example event fixtures.

---

## 10. Deploying to AWS

We use AWS SAM for infrastructure as code and deployment.

```bash
# First time — build and deploy everything
cd lambda
sam build
sam deploy --guided

# Subsequent deploys
sam build && sam deploy
```

### Environments
| Environment | Branch | API Gateway Stage |
|---|---|---|
| Development | `dev` | `/dev` |
| Staging | `staging` | `/staging` |
| Production | `main` | `/prod` |

### Secrets in Production
Never pass secrets as Lambda environment variables in production. Store in AWS Secrets Manager and retrieve in Lambda at cold start:

```ts
// lambda/layers/nodejs/secrets.ts
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({ region: process.env.AWS_REGION });

export const getSecret = async (secretName: string): Promise<string> => {
  const response = await client.send(new GetSecretValueCommand({ SecretId: secretName }));
  return response.SecretString!;
};
```

---

## 11. Building for the App Stores

```bash
# Login
eas login

# First time setup
eas build:configure

# Production build (both platforms)
eas build --platform all

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

### Pre-Submission Checklist
- [ ] All `EXPO_PUBLIC_` vars point to production API Gateway URL
- [ ] Privacy policy URL set in `app.json`
- [ ] HTTPS enforced on all API calls (API Gateway enforces this)
- [ ] Unit.co production compliance review complete
- [ ] Cognito production user pool configured
- [ ] Push notification credentials (APNs cert, FCM key) configured in Expo

---

## 12. Workflow & Conventions

### Branches
```
main        ← production
dev         ← integration, PRs merge here
feature/xxx
fix/xxx
```

### Commit Style
```
feat: add grandparent contributor invite flow
fix: correct role check in get-family Lambda
chore: update Noto Sans Gurmukhi font
i18n: add Mongolian translations
infra: add CloudFront distribution for videos
```

### Code Conventions
- **TypeScript strict mode** — no `any`
- **No hardcoded strings** — everything through i18n
- **No secrets in client code** — Lambda only
- **Amounts always in cents** — never floats for currency
- **All dates UTC** — convert to local time at display layer only
- **User ID always from JWT** — never from request body

### Currency Handling
```ts
// Store and calculate: always cents (integer)
const amount = 1250; // = $12.50

// Display only
const display = new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'USD'
}).format(amount / 100); // "$12.50"
```

### Adding a New Lambda Function
1. Create folder in `lambda/functions/`
2. Add handler, types, and `__tests__/`
3. Register in `lambda/template.yaml`
4. Add permission middleware call
5. Add test event in `lambda/events/`
6. Test locally with SAM before deploying

---

## 13. Common Issues

**SAM local start fails**
→ Make sure Docker is running. `docker ps` should show containers.

**Cognito JWT expired during local testing**
→ Re-run the `initiate-auth` CLI command to get a fresh token. Tokens expire in 1 hour.

**Unit webhook not firing locally**
→ Use ngrok. Unit can't reach localhost. See [Section 6](#6-running-lambda-functions-locally).

**Non-Latin fonts broken on Android**
→ Always test on a physical Android device. Check `i18n/fonts.ts` and confirm all Noto Sans files exist in `assets/fonts/`.

**Lambda can't connect to Aurora locally**
→ Check `DB_HOST` in `.env.local`. For local dev, run Postgres in Docker and point there instead of AWS.

**`EXPO_PUBLIC_` variable is undefined**
→ Restart Expo dev server after adding env variables. Metro doesn't hot-reload env changes.

**API Gateway returns 401**
→ JWT is missing, expired, or malformed. Check `lib/api.ts` is injecting the Cognito access token correctly in the Authorization header.

**CloudFront video URL returns 403**
→ Check the S3 bucket policy allows CloudFront origin access. Check the `cloudfront_url` stored in `education_videos` uses the correct distribution domain.

---

*If you hit an issue not covered here, fix it and add it to this doc before moving on.*
