# BYKE / Byke — End-to-End Development Plan

This plan describes how to implement the Byke platform using the confirmed stack:
- **Backend:** Spring Boot 3.x, PostgreSQL, Redis, RabbitMQ/Kafka, WebSockets (STOMP)
- **Mobile Apps:** React Native + NativeWind (User + Rider)
- **Admin Dashboard:** React 18 + Vite + Tailwind CSS (TypeScript)

---

## Phase 0 — Project Foundations
1. **Repository Structure**
   - `/backend` (Spring Boot Gradle project)
   - `/mobile` (React Native monorepo with apps: `user-app`, `rider-app` via Expo or CLI)
   - `/dashboard` (React + Vite web app)
   - Shared `/docs` for PRD, API contracts, workflows.
2. **DevOps Setup**
   - Git branching model (main, develop, feature/*).
   - GitHub Actions / GitLab CI skeleton (build + test for each sub-project).
   - Docker base images for backend & dashboard; Fastlane/EAS config for mobile.
3. **Environment Management**
   - `.env.example` per project, secret management (Doppler/Vault).
   - Local services via Docker Compose (Postgres, Redis, RabbitMQ).

---

## Phase 1 — Backend Core (Spring Boot)
1. **Domain & Schema Design** (`users`, `riders`, `documents`, `bookings`, `bids`, `payments`, `notifications`).
2. **Auth Service**
   - OTP Service integration (Twilio/MSG91) + rate limits.
   - JWT issuance, refresh handling, and RBAC policies.
3. **Rider Onboarding Module**
   - File upload to S3/GCS.
   - Admin review endpoints and state machine (Pending → Approved → Active/Suspended/Banned).
4. **Subscription & Billing**
   - Razorpay/Stripe webhooks, payment retries, grace-period enforcement.
5. **Booking Engine**
   - Service types (Ride/Errand/Parcel) with fare estimation.
   - Bidding workflow (broadcast, timers, acceptance, rebroadcast rules).
6. **Real-time Layer**
   - WebSocket channels for bids, live tracking, notifications.
   - Redis pub/sub + Streams for scalability.
7. **Testing & Documentation**
   - JUnit + Testcontainers for integration tests.
   - OpenAPI/Swagger specs published to `/docs/api`.

Deliverable: Stable backend API + WebSocket service ready for client integration.

---

## Phase 2 — User Mobile App (React Native + NativeWind)
1. **Project Bootstrapping**
   - React Native CLI/Expo bare workflow, TypeScript, ESLint/Prettier.
   - NativeWind configuration + design tokens shared with dashboard.
2. **Core Modules**
   - **Authentication:** OTP entry, resend timer, secure token storage (MMKV/SecureStore).
   - **Home & Booking Flow:** Map picker (react-native-maps, Google Places), Errand/Parcel forms, fare preview.
   - **Bidding Screen:** Socket.IO integration, bid cards, sorting, countdown visuals.
   - **Live Tracking:** Realtime map with rider path, ride status updates.
3. **Support Features**
   - Notification inbox, ratings UI, profile management, saved addresses.
4. **Quality**
   - Detox/E2E tests for booking flow, Storybook for UI components, performance budgets.

Deliverable: Production-ready user app packaged via Gradle (Android) and Xcode (iOS).

---

## Phase 3 — Rider Mobile App (React Native + NativeWind)
1. **Shared Foundation**
   - Reuse component library & state slices via monorepo packages.
2. **Key Features**
   - **Onboarding:** Document capture (camera integration), checklist completion, status tracking.
   - **Subscription Management:** Payment screen, renewal reminders, plan pause/resume.
   - **Booking Alerts & Bidding:** FCM background notifications, booking detail sheet, bid entry/edit with validation.
   - **Navigation & Task Flow:** Google Maps intent, trip phases (En route → Arrived → In-progress → Completed), parcel proof uploads.
   - **Earnings Dashboard:** Daily/weekly summaries, payout history.
3. **Operational Safeguards**
   - Cancellation reason capture, compliance prompts (helmet/selfie), location heartbeat watchdog.

Deliverable: Rider app submitted to stores, integrated with backend events.

---

## Phase 4 — Admin Dashboard (React + Tailwind)
1. **Project Setup**
   - Vite + React 18 + TypeScript, Tailwind with theme tokens matching NativeWind.
   - Authentication via admin JWT + refresh.
2. **Modules**
   - **Overview Panel:** KPIs, live map (Mapbox/Google), alerts.
   - **Rider Management:** Application review UI, document viewer, bulk actions.
   - **User Management:** Search, booking history, complaint tracking.
   - **Booking Console:** Filters, route replay via map polyline, manual overrides.
   - **Complaints Desk:** Ticket queue, chat integration.
   - **Financials:** Subscription metrics, payout reports.
   - **Platform Config:** Fare tables, bidding window, surge controls.
3. **UX Enhancements**
   - Data grid virtualization, role-based access, audit logs.

Deliverable: Responsive web dashboard deployed via static hosting + backend auth.

---

## Phase 5 — Cross-Cutting Concerns & Launch
1. **Observability**
   - Centralized logging (ELK), metrics (Prometheus + Grafana), alerting (PagerDuty).
2. **Security & Compliance**
   - Pen-test, OWASP checks, data retention and deletion workflows, encryption at rest (Postgres TDE) and S3 SSE.
3. **Automation**
   - CI pipelines for build/test/lint, CD for backend (Docker/K8s) and dashboard (Vercel/Netlify), mobile release workflows (Fastlane/EAS).
4. **Beta & Launch**
   - Staged rollout (internal, closed beta, open beta), monitoring, feedback loop, final polish.

---

## Phase 6 — Post-Launch Enhancements
- Scheduled bookings, loyalty programs, multi-language support, chatbot, auto-assignment AI, dark mode, corporate accounts, etc. (per PRD section 16).

---

## Responsibilities & Ownership Snapshot
| Component | Owner(s) | Key Tech |
|-----------|---------|----------|
| Backend APIs/WebSockets | Backend squad | Spring Boot, Postgres, Redis, RabbitMQ |
| User Mobile App | Mobile squad A | React Native, NativeWind, Maps SDK |
| Rider Mobile App | Mobile squad B | React Native, NativeWind, FCM |
| Admin Dashboard | Web squad | React 18, Vite, Tailwind |
| DevOps/Infra | Platform squad | Docker, K8s, CI/CD |

---

**Next Immediate Tasks**
1. Stand up repository structure and CI skeleton (Phase 0).
2. Finalize ERD & API contracts (Phase 1 kickoff).
3. Align squads on sprint plan and deliverable timelines.
