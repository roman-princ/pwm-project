# Erasmus Events — Las Palmas

A web app for discovering and organising events for Erasmus students at ULPGC (Universidad de Las Palmas de Gran Canaria). Visitors browse and filter the upcoming catalog; registered users sign in to access the same content with personalised navigation; admins manage the catalog (create, edit, delete events, including image uploads).

This is a coursework project for the **PWM (Web Programming)** module, built incrementally across three sprints. The deliverable for Sprint 3 — the current state of the repo — is an **Angular 20** SPA backed by **Firebase** (Authentication + Cloud Firestore).

---

## Table of contents

- [Sprint progression](#sprint-progression)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Firebase implementation](#firebase-implementation)
  - [Authentication](#authentication)
  - [Firestore data model](#firestore-data-model)
  - [Images without Firebase Storage](#images-without-firebase-storage)
  - [Security rules](#security-rules)
- [Project layout](#project-layout)
- [Getting started](#getting-started)
- [Seeding sample data](#seeding-sample-data)
- [Bootstrapping the first admin](#bootstrapping-the-first-admin)
- [Available scripts](#available-scripts)
- [Deployment](#deployment)
- [Authors](#authors)

---

## Sprint progression

| Sprint | Goal | Where it lives |
|---|---|---|
| **1** | Static HTML/CSS mockup of the website. Plain markup, components handcoded, no JavaScript logic. | `src/` (legacy) |
| **2** | Vanilla JS, dynamic content from a `db.json` (json-server-style), client-side routing, form validation, role-based UI, responsive layout. | `src/` (legacy) |
| **3** | Full Angular migration. Firebase as the backend (Auth + Firestore). Reactive forms with Angular validators. Admin role-based routing. Image uploads stored in Firestore as base64 (Firebase Storage skipped — paid tier). | `sprint3-angular/` (current) |

The `src/` folder is kept for reference but is **not** the deliverable.

---

## Tech stack

- **Angular 20** (standalone components, reactive forms, router)
- **TypeScript 5.9**
- **Firebase 12** (Auth, Cloud Firestore)
- **@angular/fire 20** — Angular bindings for Firebase
- **RxJS 7.8**
- **Flexbox** for the responsive grid (no Bootstrap)
- **ESLint** + **Prettier** + **Karma/Jasmine** for tooling
- **Yarn 1** as the package manager
- **Node ≥22.13** required (the toolchain uses modern ESM / fetch)

---

## Architecture

```
                ┌────────────────────────────────────────┐
                │            Angular 20 SPA              │
                │  ┌──────────────────────────────────┐  │
                │  │     Components (standalone)      │  │
                │  │   home / all-events / about      │  │
                │  │   login / registration           │  │
                │  │   admin-home / create-event …    │  │
                │  └─────────────┬────────────────────┘  │
                │  ┌─────────────┴────────────────────┐  │
                │  │  Services                         │ │
                │  │  • DataService  (events / pages)  │ │
                │  │  • AuthService  (sessions, roles) │ │
                │  └─────────────┬────────────────────┘  │
                │                │ @angular/fire          │
                └────────────────┼───────────────────────┘
                                 ▼
                ┌────────────────────────────────────────┐
                │              Firebase                  │
                │  ┌────────────┐    ┌────────────────┐  │
                │  │    Auth    │    │   Firestore    │  │
                │  │ email+pwd  │    │  events/users  │  │
                │  └────────────┘    │ usernames/admins│  │
                │                    │   metadata     │  │
                │                    └────────────────┘  │
                └────────────────────────────────────────┘
```

- **Static dictionary content** (page copy, category labels) is kept in [`public/data/db.json`](sprint3-angular/public/data/db.json) and fetched once via `HttpClient`.
- **Dynamic content** (events, users, role data) lives in Firestore and is read/written through `@angular/fire` from the two services.
- **Routing & guards**: routes are declared in [`app.routes.ts`](sprint3-angular/src/app/app.routes.ts); the `adminGuard` ([`core/guards/admin.guard.ts`](sprint3-angular/src/app/core/guards/admin.guard.ts)) protects `/admin-home`, `/create-event` and `/edit-event/:id`.
- **State**: `AuthService` exposes a `currentUser$` `BehaviorSubject` driven by `authState()`. The header reads it for "Login" vs "Logout" and to show the "Admin" link when `role === 'admin'`.

---

## Firebase implementation

### Provider wiring

[`src/app/app.config.ts`](sprint3-angular/src/app/app.config.ts) wires all three providers at app boot:

```ts
provideFirebaseApp(() => initializeApp(environment.firebase)),
provideAuth(() => getAuth()),
provideFirestore(() => getFirestore()),
```

`environment.firebase` is generated at build time from `.env` by [`scripts/generate-env.mjs`](sprint3-angular/scripts/generate-env.mjs), so secrets are not committed.

### Authentication

`AuthService` ([`core/services/auth.service.ts`](sprint3-angular/src/app/core/services/auth.service.ts)):

- **Register** — `createUserWithEmailAndPassword`, then writes a `users/{uid}` profile doc and a `usernames/{username}` lookup mapping. Username uniqueness is checked against `usernames/` before creating the auth account.
- **Login** — accepts either an e-mail or a username. Username path: `getDoc('usernames/{trimmed}')` resolves to the e-mail, then `signInWithEmailAndPassword` runs.
- **Session state** — `authState(this.auth)` is subscribed once in the constructor and updates a `BehaviorSubject<User | null>`.
- **Roles** — when the auth state resolves a Firebase user, `getOrCreateProfile()` reads the matching Firestore profile (or creates a fallback one with `role: 'user'`).
- **Auto-incrementing IDs** — both `users.id` and `events.id` are derived from a Firestore transaction on a `metadata/{counter}` doc, monotonic.

### Firestore data model

| Collection | Doc id | Purpose |
|---|---|---|
| `users/{uid}` | Firebase Auth uid | Per-user profile: `id`, `firstName`, `surname`, `email`, `organization`, `username`, `role` |
| `usernames/{username}` | Lowercase username | Public mapping `{ uid, email }` for username-based login + availability check |
| `admins/{email}` | Lowercase e-mail | Whitelist of accounts permitted to register as `role: 'admin'` |
| `events/{id}` | Numeric event id (string) | Event document: title, category, description, date/time, location, organizer, registrationUrl, **image** (base64 data URL or null), createdBy |
| `metadata/users_counter` | Singleton | Last-issued user id |
| `metadata/events_counter` | Singleton | Last-issued event id |

The `EventItem` shape is enforced both in TypeScript ([`shared/models/models.ts`](sprint3-angular/src/app/shared/models/models.ts)) and in the security rules.

### Images without Firebase Storage

Storage is a paid tier on Firebase, so the project sidesteps it:

1. The create/edit-event form has `<input type="file" accept="image/*">`.
2. `DataService.fileToBase64()` ([`data.service.ts:59`](sprint3-angular/src/app/core/services/data.service.ts#L59-L72)) wraps `FileReader.readAsDataURL` in a Promise.
3. The resulting `data:image/...;base64,...` URL is written into the event's `image` field alongside the rest of the document.
4. The card and detail views render it via `[style.background-image]="'url(' + (event.image || placeholder) + ')'"`.

Trade-off: Firestore docs are capped at 1 MiB. Images are encoded base64 (≈33 % overhead), so a single event must stay under ~700 KiB of source image. Acceptable for this use case.

### Security rules

Defined in [`firestore.rules`](firestore.rules), the philosophy is **default deny**:

- `users/{uid}` — `get` and `list` restricted to self or admin. Create requires the right shape **and** that the requested role is `'user'` (or `'admin'` only if the e-mail exists in `admins/{email}`).
- `usernames/{username}` — public read (so unauthenticated login can resolve username → e-mail). Create-once: the doc's `uid` must equal `request.auth.uid`. Updates are forbidden.
- `admins/{email}` — public read (used by the rule above). Only existing admins can write.
- `events/{id}` — public read. Create/update/delete admin-only, with field-shape, length, and URL-pattern validation that mirrors the form.
- `metadata/{users_counter, events_counter}` — read/write gated by signed-in / admin respectively, with a strict `value == previous + 1` check that prevents tampering.
- A trailing `match /{document=**}` denies everything else.

`isAdmin()` is computed inside the rule by reading `users/{request.auth.uid}.role`. An `exists()` guard avoids errors for users without a profile yet.

---

## Project layout

```
pwm-project/
├── README.md                          ← you are here
├── firebase.json                      ← Firebase project config
├── firestore.rules                    ← Firestore security rules (deployed)
├── firestore.indexes.json             ← Firestore indexes (currently none)
├── database.rules.json                ← Realtime DB rules (unused by app)
├── storage.rules                      ← Storage rules (Storage not used)
├── 42.7_sprint1_*.pdf                 ← Sprint 1 spec documents
│
├── src/                               ← LEGACY vanilla JS (sprints 1 & 2)
│   └── components / pages / scripts / data / styles
│
└── sprint3-angular/                   ← CURRENT deliverable
    ├── angular.json
    ├── package.json
    ├── eslint.config.js
    ├── tsconfig*.json
    ├── public/
    │   ├── assets/                    ← logos, icons, placeholder
    │   └── data/db.json               ← static page text + categories
    ├── scripts/
    │   ├── generate-env.mjs           ← .env → environment.generated.ts
    │   └── seed-events.mjs            ← REST-based event seeder
    └── src/
        ├── environments/
        ├── main.ts
        ├── styles.css
        └── app/
            ├── app.config.ts
            ├── app.routes.ts
            ├── app.component.{ts,html,css}
            ├── core/
            │   ├── guards/admin.guard.ts
            │   └── services/{auth,data}.service.ts
            ├── shared/
            │   ├── models/models.ts
            │   └── components/
            │       ├── header / footer
            │       ├── back-button
            │       └── event-card
            └── features/
                ├── home, about, all-events
                ├── event-detail
                ├── login, registration
                ├── admin-home
                └── create-event, edit-event
```

---

## Getting started

### Prerequisites

- **Node ≥22.13** (use `nvm use 22` or similar)
- **Yarn 1.22+**
- A Firebase project with **Authentication (Email/Password)** and **Cloud Firestore** enabled

### 1. Configure environment

Create `sprint3-angular/.env` (untracked) with your project's Web App config:

```bash
FIREBASE_API_KEY=…
FIREBASE_AUTH_DOMAIN=…
FIREBASE_PROJECT_ID=…
FIREBASE_DATABASE_URL=…
FIREBASE_STORAGE_BUCKET=…
FIREBASE_MESSAGING_SENDER_ID=…
FIREBASE_APP_ID=…

# Used by the AuthService to mark accounts as admin on registration.
# Must also be present as a doc in admins/{email} for the rule to allow it.
ADMIN_EMAILS=admin@example.com

# Used by the seed script.
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=…
```

### 2. Install + run

```bash
cd sprint3-angular
yarn install
yarn dev          # runs generate:env then ng serve
```

The app boots at `http://localhost:4200/`.

### 3. Deploy security rules

```bash
firebase deploy --only firestore:rules
```

---

## Seeding sample data

[`scripts/seed-events.mjs`](sprint3-angular/scripts/seed-events.mjs) populates Firestore with eight demo events covering every category. It uses **Firebase REST APIs** (Identity Toolkit + Firestore REST) instead of the JS SDK to avoid a Node-side dual-instance problem with `@firebase/component`.

```bash
yarn seed:events
```

The script:
1. Signs in via Identity Toolkit using `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` to get an ID token.
2. Reads `users/{uid}` to retrieve the admin's numeric profile id.
3. Generates a tiny SVG (base64-encoded) for each event's `image` field.
4. PATCHes each event document into `events/{id}`.

---

## Bootstrapping the first admin

The security rules only allow `role: 'admin'` on user create if the e-mail is whitelisted:

```
exists(/databases/$(database)/documents/admins/$(email))
```

So the first time you set up the project:

1. Open the Firebase Console → Firestore.
2. Create collection `admins`, then a document with id = your lowercase admin e-mail (e.g. `admin@example.com`). Field content doesn't matter — the rule only checks existence.
3. Register through the app's `/registration` page using that e-mail. The `AuthService` will set `role: 'admin'` (because the e-mail is in `environment.adminEmails`), and the rule will accept it (because the whitelist doc exists).
4. From there, admins can manage other admins by adding `admins/{email}` docs and updating user `role` fields directly.

---

## Available scripts

Inside `sprint3-angular/`:

| Script | What it does |
|---|---|
| `yarn dev` | `generate:env` + `ng serve` (live reload) |
| `yarn build` | Production build to `dist/sprint3-angular-app/` |
| `yarn watch` | `ng build --watch --configuration development` |
| `yarn test` | `ng test` (Karma + Jasmine) |
| `yarn lint` | ESLint with the Angular plugin |
| `yarn generate:env` | Reads `.env` and writes `environment.generated.ts` |
| `yarn seed:events` | Populates Firestore with the demo catalog |

---

## Deployment

`firebase.json` configures Firebase Hosting to serve the production build:

```bash
cd sprint3-angular && yarn build
cd .. && firebase deploy --only hosting,firestore:rules
```

The hosting target points at `sprint3-angular/dist/sprint3-angular-app`, and SPA rewrites are configured so deep links resolve to `index.html`.

---

## Authors

PWM coursework — Universidad de Las Palmas de Gran Canaria.

- Roman Princ
- Tomáš Ekert
- Bilguun Ariunbuyan
