# 🔵 HobbyJobb – Hobbyverksamhet Plattform
### DA219B · Fullstack Webbapplikation · Grupp 18

[![Live demo](https://img.shields.io/badge/Live_demo-hobbyjobb.vercel.app-2563eb?style=for-the-badge&logo=vercel&logoColor=white)](https://hobbyjobb.vercel.app)
[![API](https://img.shields.io/badge/API-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://hobbyjobb-api.onrender.com/api)

[![Backend CI](https://github.com/omar1u7777/hobbyjobb/actions/workflows/ci-backend.yml/badge.svg)](https://github.com/omar1u7777/hobbyjobb/actions/workflows/ci-backend.yml)
[![Frontend CI](https://github.com/omar1u7777/hobbyjobb/actions/workflows/ci-frontend.yml/badge.svg)](https://github.com/omar1u7777/hobbyjobb/actions/workflows/ci-frontend.yml)

![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Stripe](https://img.shields.io/badge/Stripe-Connect-635BFF?logo=stripe&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-75%2B%20tester-C21325?logo=jest&logoColor=white)

> **HobbyJobb** är en webbaserad plattform för lokala småjobb och hobbyverksamhet i Sverige.  
> Privatpersoner kan erbjuda eller hitta tjänster som gräsklippning, flytt, hundpromenad m.m.  
> Plattformen är **juridiskt begränsad till hobbyverksamhet**, hjälper användare att hålla sig inom lagens gränser  
> och tjänar pengar via **8% provision på varje genomfört uppdrag** via Stripe Connect.

---

## 🛠️ Min roll i projektet

Jag var projektledare och hade huvudansvar för backend, betalningar och driftsättning. Det jag lade mest tid på var betalningssystemet, där pengarna hålls i escrow tills beställaren markerar jobbet som klart och först då betalas ut.

**Det här byggde jag:**

- **Betalningar med Stripe Connect** – hela flödet från checkout och escrow till utbetalning, med 8% plattformsavgift. Överföringarna är idempotenta och statusbytena sker i en databastransaktion, så en betalning inte kan dubbelköras eller fastna i ett halvt tillstånd när Stripe skickar om ett webhook-anrop.
- **Inloggning och säkerhet** – JWT, rate limiting, säkerhetsheaders (helmet) och webhooks som signaturverifieras i produktion.
- **Hobbygränsen** – stoppar en utbetalning som skulle ta utföraren över 30 000 kr på ett kalenderår, plattformens juridiska skyddsräcke.
- **Drift och CI** – GitHub Actions för testerna, backend och Postgres på Render, frontend på Vercel.
- **Tester** – 75+ backend-tester (Jest + Supertest) på framför allt betalnings- och auth-flödet.

Det mesta av betalningslogiken ligger i [`paymentController.js`](backend/src/controllers/paymentController.js). [PR #61](https://github.com/omar1u7777/hobbyjobb/pull/61) är ett exempel på hur jag resonerar kring buggar och kantfall.

---

## 📋 Innehållsförteckning

1. [Om projektet](#om-projektet)
2. [Intäktsmodell](#intäktsmodell)
3. [Hobbyverksamhet – Juridisk ram](#hobbyverksamhet--juridisk-ram)
4. [Teknikstack](#teknikstack)
5. [Teammedlemmar & Arbetsfördelning](#teammedlemmar--arbetsfördelning)
6. [Projektstruktur](#projektstruktur)
7. [Databas & Datamodell](#databas--datamodell)
8. [API-dokumentation](#api-dokumentation)
9. [Kom igång](#kom-igång)
10. [Miljövariabler](#miljövariabler)
11. [Git-arbetsflöde](#git-arbetsflöde)
12. [Implementerade funktioner](#implementerade-funktioner)
13. [Tekniska beslut](#tekniska-beslut)
14. [Kurs & Team](#kurs--team)

---

## Om projektet

HobbyJobb är en **fullstack webbapplikation** byggd med React (frontend) och Node.js/Express (backend) med PostgreSQL som databas.

Plattformen låter privatpersoner:
- **Annonsera** hobbybaserade tjänster och småjobb
- **Söka och ansöka** på jobb nära sin plats
- **Kommunicera** via inbyggd chatt
- **Hålla koll** på att intjänad summa håller sig inom hobbyverksamhetsgränsen

**Betalningar** hanteras via **Stripe Connect** — beställaren betalar via plattformen, pengarna hålls i escrow tills uppdraget bekräftas klart, sedan delas de automatiskt: **92% till utföraren, 8% till HobbyJobb**.

**Live sedan april 2026:**
- **Frontend:** [https://hobbyjobb.vercel.app](https://hobbyjobb.vercel.app)
- **Backend API:** [https://hobbyjobb-api.onrender.com/api](https://hobbyjobb-api.onrender.com/api)

---

## Intäktsmodell

> HobbyJobb tjänar pengar på tre sätt — alla lagliga, transparenta och skalbara.

### Lager 1 — Provision via Stripe Connect (kärnan)

Varje genomfört uppdrag triggar en automatisk betalningsdelning:

```
Beställare betalar 600 kr
  → 552 kr (92%) frigörs till utföraren
  →  48 kr  (8%) går till HobbyJobb
```

**Tekniskt flöde:**
1. Beställaren accepterar en ansökan och betalar via Stripe
2. Pengarna hålls i **escrow** (Stripe håller dem säkert)
3. Utföraren slutför → beställaren klickar "Bekräfta klart"
4. Stripe Connect frigör automatiskt: 92% → utförare, 8% → HobbyJobb
 
> Stripe Connect = godkänd infrastruktur för marknadsplatser, hanterar allt lagligt.

### Lager 2 — Boost-annonsering (direkt intäkt)

Utförare kan lyfta upp sitt jobb till toppen av listan:

| Boost-paket | Pris | Effekt |
|---|---|---|
| Standard Boost | 29 kr | 48h topplacering |
| Super Boost | 59 kr | 7 dagars topplacering |

Betalas direkt vid publicering — ingen escrow behövs.

### Lager 3 — Premium-konto (framtida fas)

```
49 kr/mån → Fullständig skattelogg, exportera CSV till Skatteverket,
            prioriterad visning i sökresultat
```

### Intäktspotential

| Scenario | Uppdrag/mån | Snittbelopp | Intäkt/mån |
|---|---|---|---|
| Liten (MVP) | 100 | 600 kr | 4 800 kr |
| Medel (år 1) | 500 | 600 kr | 24 000 kr |
| Stor (år 2) | 2 000 | 600 kr | 96 000 kr |

---

## Hobbyverksamhet – Juridisk ram

Plattformen är **enbart** avsedd för hobbyverksamhet enligt Skatteverkets regler. Det är varje användares eget ansvar att följa dessa regler.

### Vad är hobbyverksamhet?

Hobbyverksamhet är inkomstbringande aktivitet som **inte** bedrivs i vinstsyfte och **inte** är din huvudsyssla. Typiska exempel:
- Klippa gräs hos grannen
- Hjälpa till med flyttning
- Hundpromenad / kattpassning
- Enklare hantverksarbeten (montering, målning)
- Ärenden och leveranser

### Gränser som plattformen bevakar

| Regel | Gräns | Plattformens åtgärd |
|---|---|---|
| **Plattformens trygghetsgräns** | 30 000 kr/år | Varning vid 25 000 kr, spärr vid 30 000 kr |
| **F-skatt ej tillåtet** | Gäller per definition | Verifieras vid registrering |
| **Löpande karaktär** | Max oregelbunden verksamhet | Systemet flaggar om en användare lägger > 20 jobb/mån |

### Plattformens ansvarsskydd

1. **Inkomstmätare** visas tydligt på varje användares dashboard
2. **Varningsbanner** visas automatiskt när 80% av gränsen nås
3. **Annonsering inaktiveras** automatiskt vid gränsen
4. **Informationssida** med länk till Skatteverket finns alltid synlig
5. **Ansvarsfriskrivning** måste accepteras vid registrering

### Vad HobbyJobb INTE är
- ❌ En arbetsförmedling
- ❌ En plattform för yrkesmässig verksamhet
- ❌ Ett alternativ till F-skattsedel / egenföretagande
- ❌ Ansvarig för skattehantering (det är användarens ansvar)

### Plattformsansvar vs Användaransvar

> HobbyJobb agerar som en teknisk förmedlare (marknadsplats) och hanterar inga pengar direkt — all betalningshantering sker via Stripe Connect.

| Ansvarsområde | HobbyJobb (Plattformen) | Beställaren | Utföraren |
|---|---|---|---|
| **Betalningsförmedling** | ✅ Via Stripe Connect (escrow) | – | – |
| **Plattformsavgift 8%** | ✅ Dras automatiskt | – | – |
| **Inkomstspärr (30 000 kr/år)** | ✅ Compliance by Design | – | – |
| **Arbetsgivaravgifter** | ❌ Vi är inte arbetsgivare | ⚠️ Vid >10 000 kr/år till samma person | – |
| **Kontrolluppgift (KU10)** | ❌ Ej plattformens ansvar | ⚠️ Vid >1 000 kr/år till samma person | – |
| **Deklaration av hobbyinkomst** | ❌ Ej plattformens ansvar | – | ⚠️ Bilaga T2 i inkomstdeklarationen |
| **Egenavgifter på överskott** | ❌ Ej plattformens ansvar | – | ⚠️ Betalas av utföraren |
| **DAC7-rapportering** | ⚠️ Gällande krav (sedan 2023, första rapport 2024) | – | – |

---

## Teknikstack

### Frontend
| Teknik | Version | Syfte |
|---|---|---|
| React | 18.x | UI-ramverk |
| React Router | 6.x | Sidnavigering |
| Axios | 1.x | HTTP-anrop till API |
| Global CSS | – | Styling via CSS-variabler och komponentklasser |
| Chart.js | 4.x | Statistik & diagram (admin) |

### Backend
| Teknik | Version | Syfte |
|---|---|---|
| Node.js | 20.x | Körmiljö |
| Express | 4.x | Webbramverk / API |
| PostgreSQL | 16.x | Relationsdatabas |
| Sequelize | 6.x | ORM / Databasmodeller |
| JWT | – | Autentisering |
| bcrypt | – | Lösenordshashning |
| **Stripe Connect** | **latest** | **Betalningar, escrow, provision** |
| dotenv | – | Miljövariabler |
| cors | – | Cross-origin requests |
| helmet | – | HTTP-säkerhetsrubriker |
| express-rate-limit | – | Rate limiting |

### DevOps & Verktyg
| Verktyg | Syfte |
|---|---|
| GitHub | Versionshantering |
| GitHub Actions | CI/CD pipeline |
| Render | Cloud-deployment (backend) |
| Vercel | Cloud-deployment (frontend) |
| Render PostgreSQL | Hosted PostgreSQL |
| Postman | API-testning |
| ESLint 9 Flat Config | Kodkvalitet & tillgänglighet (a11y) |

---

## Teammedlemmar & Arbetsfördelning

> 5 studenter · Var och en ansvarar för sina egna Git-commits.

### 👤 Omar Ahmad Alhaek – Projektledare & Backend Lead
**Fokusområde:** Systemarkitektur, Express-server, Auth, Stripe Connect, Deployment

**Ansvar:**
- Sätta upp Express-servern och grundstrukturen
- Implementera JWT-autentisering (login/signup)
- Skydda routes (middleware: `requireAuth`, `requireAdmin`)
- Sätta upp PostgreSQL-databas och Sequelize-modeller
- Sätta upp Stripe Connect (platform account, webhooks, escrow-flöde)
- Checkout- och betalningsbekräftelsesidor (frontend för Stripe-flödet)
- Konfigurera deployment (Render backend + Render PostgreSQL) + GitHub Actions CI/CD

**Filer att äga:**
```
backend/server.js
backend/src/middleware/
backend/src/models/User.js
backend/src/models/index.js
backend/config/
backend/config/stripe.js
backend/src/routes/payments.js
backend/src/routes/connect.js
backend/src/controllers/paymentController.js
backend/src/controllers/connectController.js
backend/src/models/Payment.js
.github/workflows/
frontend/src/pages/CheckoutPage.jsx
frontend/src/pages/PaymentSuccessPage.jsx
frontend/src/services/paymentService.js
frontend/src/services/connectService.js
frontend/src/components/profile/ConnectStatus.jsx
```

---

### 👤 Mhd Amin Munla – Backend API & Databas
**Fokusområde:** REST API endpoints, databasschema, relationer

**Ansvar:**
- Designa och implementera databasschema (alla tabeller)
- Skriva Sequelize-migrations
- Implementera CRUD för jobb (jobs), kategorier, ansökningar
- Implementera hobbyverksamhetsgränsen (inkomstberäkning)
- Sökning och filtrering av jobb (avstånd, kategori, pris)
- Seed-data för testning

**Filer att äga:**
```
backend/src/controllers/jobController.js
backend/src/controllers/applicationController.js
backend/src/controllers/reviewController.js
backend/src/routes/jobs.js
backend/src/routes/applications.js
backend/src/routes/reviews.js
backend/src/models/Job.js
backend/src/models/Category.js
backend/src/models/Application.js
backend/src/models/Review.js
backend/migrations/
backend/seeders/
```

---

### 👤 Edvin Kaltak – Frontend Lead & Design
**Fokusområde:** React-struktur, routing, gemensamma komponenter, design

**Ansvar:**
- Sätta upp React-projektet med React Router
- Implementera den blå designen (från landningssidan)
- Bygga gemensamma komponenter: Navbar, Footer, Button, Card, Modal
- Landningssidan (hero, kategorier, hur det fungerar)
- Responsiv design (mobil, tablet, desktop)
- CSS-variabler och designsystem

**Filer att äga:**
```
frontend/src/components/common/
frontend/src/pages/HomePage.jsx
frontend/src/pages/LandingPage.jsx
frontend/src/styles/
frontend/src/App.jsx
frontend/src/main.jsx
frontend/src/context/NotificationContext.jsx
```

---

### 👤 Suha Subasi – Frontend Features & Användarflöde
**Fokusområde:** Auth-sidor, jobblista, jobbinlägg, profil

**Ansvar:**
- Login- och registreringssidor (med hobbyinfo-modal vid signup)
- Jobblista med filter (kategori, avstånd, pris, hobbyfilter)
- Jobbdetaljsida med ansökningsknapp
- "Lägg upp jobb"-formulär med inkomstvalidering
- Profilsida med inkomstmätare
- "Mina jobb"-sida (aktiva, slutförda, publicerade)

**Filer att äga:**
```
frontend/src/pages/LoginPage.jsx
frontend/src/pages/RegisterPage.jsx
frontend/src/pages/JobListPage.jsx
frontend/src/pages/JobDetailPage.jsx
frontend/src/pages/PostJobPage.jsx
frontend/src/pages/ProfilePage.jsx
frontend/src/pages/MyJobsPage.jsx
frontend/src/pages/EditJobPage.jsx
frontend/src/pages/NotFoundPage.jsx
frontend/src/services/applicationService.js
frontend/src/services/reviewService.js
frontend/src/components/jobs/
```

---

### 👤 Qusai Kokas – Admin Dashboard, Statistik & Chatt
**Fokusområde:** Adminpanel, diagram, Meddelanden API, Chatt-UI, informationssidor

**Ansvar:**
- Admin dashboard med statistik (Chart.js)
- CRUD för kategorier (admin)
- Användarlista med hobbystatusfiltrering
- Systemövervakning (flaggade konton nära gräns)
- Meddelanden API (messages route + controller)
- Chatt-gränssnitt (ChatWindow, MessageBubble, ChatInput, ChatPage)
- Hobbyverksamhet-informationssida och Om oss / About-sida

**Filer att äga:**
```
frontend/src/pages/AdminDashboardPage.jsx
frontend/src/pages/AboutPage.jsx
frontend/src/pages/HobbyInfoPage.jsx
frontend/src/pages/ChatPage.jsx
frontend/src/components/admin/
frontend/src/components/charts/
frontend/src/components/charts/AdminStatsCharts.jsx
frontend/src/services/adminService.js
frontend/src/services/messageService.js
frontend/src/components/chat/
backend/src/controllers/adminController.js
backend/src/routes/admin.js
backend/src/controllers/messageController.js
backend/src/routes/messages.js
```

---

## Projektstruktur

### Komplett filträd

```
hobbyjobb/
│
├── README.md                          ← Du läser den
├── .gitignore
├── .github/
│   └── workflows/
│       ├── ci-backend.yml             ← Kör backend-tester på varje push
│       ├── ci-frontend.yml            ← Kör frontend-tester på varje push
│       └── lint.yml                   ← Kör ESLint på frontend vid PR/push
│
├── frontend/                          ← React webbapp
│   ├── .env.example
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vercel.json
│   ├── vite.config.js
│   ├── vitest.config.js
│   │
│   ├── public/
│   │   └── favicon.svg
│   │
│   └── src/
│       ├── App.jsx                    ← Router setup
│       ├── main.jsx                   ← Entry point
│       ├── setupTests.js              ← Vitest setup
│       │
│       ├── styles/
│       │   ├── components.css         ← Gemensamma klasser
│       │   ├── global.css             ← CSS-variabler, reset
│       │   └── variables.css          ← --blue, --green, --ink etc
│       │
│       ├── pages/
│       │   ├── AboutPage.jsx          ← Om oss / Team
│       │   ├── AdminDashboardPage.jsx ← Admin (skyddad route)
│       │   ├── BoostJobPage.jsx       ← Betala för Boost-annonsering
│       │   ├── BoostJobPage.test.jsx
│       │   ├── ChatPage.jsx           ← Chatt
│       │   ├── CheckoutPage.jsx       ← Stripe betalning
│       │   ├── CheckoutPage.test.jsx
│       │   ├── EditJobPage.jsx        ← Redigera jobb
│       │   ├── HobbyInfoPage.jsx      ← Info om hobbyverksamhet
│       │   ├── HomePage.jsx           ← Hem (inloggad)
│       │   ├── JobDetailPage.jsx      ← Enskilt jobb
│       │   ├── JobListPage.jsx        ← Alla jobb + filter
│       │   ├── LandingPage.jsx        ← Startsida (ej inloggad)
│       │   ├── LoginPage.jsx          ← Logga in
│       │   ├── MyJobsPage.jsx         ← Mina jobb
│       │   ├── NotFoundPage.jsx       ← 404-sida
│       │   ├── PaymentSuccessPage.jsx ← Bekräftelse efter betalning
│       │   ├── PaymentSuccessPage.test.jsx
│       │   ├── PostJobPage.jsx        ← Lägg upp jobb
│       │   ├── ProfilePage.jsx        ← Profil + inkomstmätare
│       │   └── RegisterPage.jsx       ← Skapa konto + hobby-info
│       │
│       ├── components/
│       │   ├── admin/
│       │   │   ├── CategoryManager.jsx
│       │   │   ├── FlaggedAccounts.jsx
│       │   │   ├── JobTable.jsx
│       │   │   └── UserTable.jsx
│       │   │
│       │   ├── charts/
│       │   │   ├── AdminStatsCharts.jsx
│       │   │   ├── CategoryPieChart.jsx
│       │   │   ├── IncomeBarChart.jsx
│       │   │   └── JobsOverTimeChart.jsx
│       │   │
│       │   ├── chat/
│       │   │   ├── ChatInput.jsx
│       │   │   ├── ChatWindow.jsx
│       │   │   └── MessageBubble.jsx
│       │   │
│       │   ├── common/
│       │   │   ├── Alert.jsx
│       │   │   ├── Badge.jsx
│       │   │   ├── Button.jsx
│       │   │   ├── Footer.jsx
│       │   │   ├── HobbyLimitBanner.jsx  ← Varning vid gräns
│       │   │   ├── Input.jsx
│       │   │   ├── Modal.jsx
│       │   │   ├── Navbar.jsx
│       │   │   └── Spinner.jsx
│       │   │
│       │   ├── jobs/
│       │   │   ├── CategoryBadge.jsx
│       │   │   ├── HobbyIncomeWarning.jsx
│       │   │   ├── JobCard.jsx
│       │   │   ├── JobFilter.jsx
│       │   │   ├── JobForm.jsx
│       │   │   ├── JobList.jsx
│       │   │   └── ReviewForm.jsx        ← Stjärnbetyg + kommentar
│       │   │
│       │   └── profile/
│       │       ├── ConnectStatus.jsx     ← Stripe onboarding status
│       │       ├── IncomeTracker.jsx     ← Inkomstmätare
│       │       ├── ReviewList.jsx
│       │       └── UserStats.jsx
│       │
│       ├── context/
│       │   ├── AuthContext.jsx          ← Global auth-state
│       │   └── NotificationContext.jsx
│       │
│       ├── hooks/
│       │   ├── useAuth.js
│       │   ├── useHobbyLimit.js         ← Kollar inkomstgräns
│       │   └── useJobs.js
│       │
│       ├── services/
│       │   ├── adminService.js          ← Admin API-anrop
│       │   ├── api.js                   ← Axios-instans
│       │   ├── applicationService.js    ← Ansökningar API-anrop
│       │   ├── authService.js
│       │   ├── connectService.js        ← Stripe Connect onboarding
│       │   ├── jobService.js
│       │   ├── messageService.js        ← Chatt API-anrop
│       │   ├── paymentService.js        ← Stripe checkout, bekräfta klart
│       │   ├── paymentService.test.js
│       │   ├── reviewService.js         ← Recensioner API-anrop
│       │   └── userService.js
│       │
│       └── utils/
│           ├── formatters.js            ← Datum, valuta, avstånd
│           ├── hobbyLimits.js           ← Gränsberäkningar
│           └── validators.js
│
│
└── backend/                           ← Node.js / Express API
    ├── .env.example
    ├── .sequelizerc
    ├── jest.config.js                 ← Konfiguration för backend-tester
    ├── package.json
    ├── package-lock.json
    ├── postman_collection_s1.json     ← Postman tester
    ├── server.js                      ← Startpunkt
    ├── TEST-DOKUMENTATION-S1-OMAR-ALHAEK.md
    │
    ├── config/
    │   ├── constants.js               ← HOBBY_INCOME_LIMIT, STRIPE_FEE etc
    │   ├── database.js                ← Sequelize-konfiguration
    │   └── stripe.js                  ← Stripe Connect-konfiguration
    │
    ├── src/
    │   ├── controllers/
    │   │   ├── adminController.js
    │   │   ├── applicationController.js
    │   │   ├── authController.js
    │   │   ├── categoryController.js
    │   │   ├── connectController.js     ← Hanterar Stripe onboarding
    │   │   ├── jobController.js
    │   │   ├── messageController.js
    │   │   ├── paymentController.js
    │   │   ├── reviewController.js      ← Hanterar recensioner
    │   │   └── userController.js
    │   │
    │   ├── middleware/
    │   │   ├── errorHandler.js
    │   │   ├── hobbyLimitCheck.js     ← Kontrollerar inkomstgräns
    │   │   ├── rateLimiter.js
    │   │   ├── requireAdmin.js        ← Admin-roll
    │   │   └── requireAuth.js         ← JWT-verifiering
    │   │
    │   ├── models/
    │   │   ├── Application.js
    │   │   ├── Category.js
    │   │   ├── index.js               ← Sequelize setup & relationer
    │   │   ├── Job.js
    │   │   ├── Message.js
    │   │   ├── Payment.js             ← Transaktioner, escrow-status
    │   │   ├── Review.js
    │   │   └── User.js
    │   │
    │   ├── routes/
    │   │   ├── admin.js               ← /api/admin/* (skyddad)
    │   │   ├── applications.js        ← /api/applications/*
    │   │   ├── auth.js                ← /api/auth/*
    │   │   ├── categories.js          ← /api/categories/*
    │   │   ├── connect.js             ← /api/connect/* (Onboarding)
    │   │   ├── jobs.js                ← /api/jobs/*
    │   │   ├── messages.js            ← /api/messages/*
    │   │   ├── payments.js            ← /api/payments/* (Stripe Connect)
    │   │   ├── reviews.js             ← /api/reviews/*
    │   │   └── users.js               ← /api/users/*
    │   │
    │   └── utils/
    │       ├── geocode.js             ← Platsbaserad sökning
    │       └── hobbyCalculator.js     ← Inkomstberäkning
    │
    ├── migrations/
    │   ├── 001-create-users.js
    │   ├── 002-create-categories.js
    │   ├── 003-create-jobs.js
    │   ├── 004-create-applications.js
    │   ├── 005-create-messages.js
    │   ├── 006-create-reviews.js
    │   ├── 007-create-payments.js
    │   ├── 008-reviews-unique-and-backfill-verified.js
    │   ├── 009-add-price-type-to-jobs.js
    │   ├── 010-unique-stripe-payment-id.js
    │   ├── 011-lowercase-user-emails.js
    │   └── 012-add-stripe-connect-to-users.js
    │
    ├── seeders/
    │   ├── 001-categories.js
    │   └── 002-demo-data.js
    │
    └── __tests__/                     ← Jest integrationstester
        ├── auth.test.js
        ├── config.test.js
        ├── middleware.test.js
        ├── payment.test.js
        ├── user-model-hooks.test.js
        └── helpers/
            └── createApp.js
```

---

## Databas & Datamodell

### Tabeller och relationer

```
┌─────────────────────┐         ┌─────────────────┐         ┌──────────────────┐
│        Users        │         │      Jobs       │         │   Applications   │
├─────────────────────┤         ├─────────────────┤         ├──────────────────┤
│ id (PK)             │──┐      │ id (PK)         │──┐      │ id (PK)          │
│ name                │  │ 1:N  │ title           │  │ 1:N  │ job_id (FK)      │
│ email               │  └────▶ │ description     │  └────▶ │ applicant_id(FK) │
│ password            │         │ price           │         │ proposed_price   │
│ location            │         │ price_type      │         │ status           │
│ lat                 │         │ category_id(FK) │         │ message          │
│ lng                 │         │ poster_id (FK)  │         └──────────────────┘
│ bio                 │         │ location        │
│ avatar              │         │ lat / lng       │         ┌──────────────────┐
│ is_admin            │◀──────▶│ status          │         │    Messages      │
│ is_verified         │         │ hobby_type      │         ├──────────────────┤
│ stripe_account_id   │         │ is_hobby_valid  │         │ id (PK)          │
│ stripe_account_status│        │ is_boosted      │         │ sender_id (FK)   │
│ hobby_total_year    │         │ boost_expires_at│         │ receiver_id (FK) │
│ hobby_job_count     │         │ expires_at      │         │ job_id (FK)      │
│ hobby_limit_reached │         │ created_at      │         │ content          │
│ hobby_warned        │        └─────────────────┘         │ is_read          │
│ created_at          │               │                       │ created_at       │
└─────────────────────┘        ┌──────┘                       └──────────────────┘
                       ▼
                ┌─────────────┐
                │  Categories │
                ├─────────────┤
                │ id (PK)     │         ┌──────────────────┐
                │ name        │         │     Reviews      │
                │ icon        │         ├──────────────────┤
                │ description │         │ id (PK)          │
                │ max_price   │         │ job_id (FK)      │
                └─────────────┘         │ reviewer_id (FK) │
                                        │ reviewee_id (FK) │
                                        │ rating (1-5)     │
                                        │ comment          │
                                        └──────────────────┘

┌──────────────────────────────────────────────────┐
│                    Payments                       │
├──────────────────────────────────────────────────┤
│ id (PK)                                          │
│ job_id (FK)          ← Vilket uppdrag             │
│ payer_id (FK)        ← Beställaren                │
│ payee_id (FK)        ← Utföraren                  │
│ amount_total         ← Hela beloppet (kr)         │
│ amount_platform      ← 8% till HobbyJobb          │
│ amount_payee         ← 92% till utföraren         │
│ stripe_payment_id    ← Stripe PaymentIntent ID    │
│ stripe_transfer_id   ← Stripe Transfer ID        │
│ status               ← pending/held/released/failed│
│ confirmed_at         ← När beställaren klickade klart│
│ created_at                                       │
└──────────────────────────────────────────────────┘
```

### Relationer (från `models/index.js`)

| Parent | Relation | Child | Foreign Key |
|--------|----------|-------|-------------|
| **User** | 1 → N | Job | `poster_id` |
| **User** | 1 → N | Application | `applicant_id` |
| **User** | 1 → N | Message | `sender_id` |
| **User** | 1 → N | Message | `receiver_id` |
| **User** | 1 → N | Review | `reviewer_id` |
| **User** | 1 → N | Review | `reviewee_id` |
| **User** | 1 → N | Payment | `payer_id` |
| **User** | 1 → N | Payment | `payee_id` |
| **Category** | 1 → N | Job | `category_id` |
| **Job** | 1 → N | Application | `job_id` |
| **Job** | 1 → N | Message | `job_id` |
| **Job** | 1 → N | Review | `job_id` |
| **Job** | 1 → N | Payment | `job_id` |

### Hobbyrelaterade fält i Users

```js
// backend/src/models/User.js (utdrag)
hobby_total_year:    DECIMAL   // Totalt intjänat innevarande år (kr)
hobby_job_count:     INTEGER   // Antal jobb innevarande månad
hobby_limit_reached: BOOLEAN   // Spärrad vid gränsen
hobby_warned:        BOOLEAN   // Varning skickad
```

### Hobbyrelaterade fält i Jobs

```js
// backend/src/models/Job.js (utdrag)
price:          DECIMAL   // Pris i SEK
is_hobby_valid: BOOLEAN   // Kontrolleras vid publicering
hobby_type:     STRING    // t.ex. "engångsjobb" / "återkommande"
```

---

## API-dokumentation

**Produktions-URL:** `https://hobbyjobb-api.onrender.com/api`  
*Lokal utveckling: `http://localhost:5000/api`*

### Autentisering

```
POST   /auth/register       Skapa nytt konto
POST   /auth/login          Logga in → returnerar JWT
POST   /auth/logout         Logga ut (stateless — klienten raderar token)
GET    /auth/me             Hämta inloggad användare
PUT    /auth/password       Byt lösenord          [Auth required]
```

### Jobb

```
GET    /jobs                Lista jobb (filter: kategori, avstånd, pris, hobby)
POST   /jobs                Skapa nytt jobb          [Auth required]
GET    /jobs/:id            Hämta ett specifikt jobb (inkluderar accepted_applicant vid in_progress/completed)
PUT    /jobs/:id            Uppdatera jobb           [Auth + ägare]
DELETE /jobs/:id            Ta bort jobb             [Auth + ägare]
GET    /jobs/my             Mina publicerade jobb    [Auth required]
```

**Query-parametrar för GET /jobs:**
```
?category=   Kategori-ID
?lat=        Latitud (för avstånd)
?lng=        Longitud
?radius=     Avstånd i km (default: 20)
?minPrice=   Minimum pris
?maxPrice=   Max pris (hobby-filter: automatiskt max 30000/år)
?sort=       newest | price_asc | price_desc | distance
?page=       Sida (pagination)
?limit=      Per sida (default: 20)
```

### Ansökningar

```
POST   /applications            Ansök på ett jobb    [Auth required]
GET    /applications/received   Mottagna ansökningar [Auth required]
GET    /applications/sent       Skickade ansökningar [Auth required]
PUT    /applications/:id        Acceptera/avvisa     [Auth + jobägare]
```

### Användare

```
GET    /users/:id              Publik profil
PUT    /users/:id              Uppdatera profil     [Auth + ägare]
GET    /users/:id/reviews      Recensioner för användare
GET    /users/me/income        Min inkomstöversikt  [Auth required]
```

### Kategorier

```
GET    /categories             Lista alla kategorier
```

### Meddelanden

```
GET    /messages/conversations    Lista alla konversationer    [Auth required]
GET    /messages/unread-count     Antal olästa meddelanden     [Auth required]
GET    /messages/:jobId           Chatthistorik för ett jobb   [Auth required]
POST   /messages                  Skicka meddelande            [Auth required]
PATCH  /messages/:jobId/read      Markera konversation som läst [Auth required]
```

### Recensioner

```
POST   /reviews                   Lämna recension efter släppt escrow  [Auth required]
GET    /reviews/job/:jobId        Recensioner för ett specifikt jobb
GET    /users/:id/reviews         Recensioner för en användare
```

### Betalningar (Stripe Connect)

```
POST   /payments/checkout          Skapa Stripe PaymentIntent          [Auth + beställare]
POST   /payments/confirm           Fallback: bekräfta betalning client-side [Auth + beställare]
POST   /payments/release/:jobId    Frigör escrow → betala ut till utförare [Auth + beställare]
GET    /payments/history           Betalningshistorik för användare    [Auth required]
POST   /payments/boost             Köp Boost-annonsering               [Auth + ägare]
POST   /payments/boost/confirm     Aktivera boost efter betalning      [Auth + ägare]
POST   /payments/webhook           Stripe webhook (intern)             [Stripe signatur]
```

### Stripe Connect Onboarding

```
POST   /connect/onboard            Skapa Onboarding-länk för utförare  [Auth required]
GET    /connect/status             Hämta Stripe Connect konto-status   [Auth required]
POST   /connect/refresh            Ny länk vid avbruten onboarding     [Auth required]
```

> **Flöde:**  
> `POST /payments/checkout` → Stripe håller escrow → webhook sätter status `held` → `POST /payments/release/:jobId` → 92% till utförare (uppdaterar `hobby_total_year`), 8% plattformsavgift

### Admin (kräver admin-roll)

```
GET    /admin/stats               Plattformsstatistik
GET    /admin/users               Alla användare med hobbystatistik
PUT    /admin/users/:id           Aktivera/deaktivera konto
GET    /admin/flagged-accounts    Konton nära/över hobbygränsen (25k/30k kr)
PATCH  /admin/flagged-accounts/:id Moderera flaggade konton (clear/resolve/warn/lock)
GET    /admin/jobs                Alla jobb (inkl. borttagna)
DELETE /admin/jobs/:id            Ta bort jobb som admin
GET    /admin/charts              Diagramdata: jobb/tid, intäkter/tid, kategorifördelning
GET    /admin/categories          Lista kategorier (inkl. jobs_count)
POST   /admin/categories          Skapa ny kategori
PUT    /admin/categories/:id      Uppdatera kategori
DELETE /admin/categories/:id      Ta bort kategori (blockeras om den används)
```

---

## Kom igång

### Förkrav

```bash
node --version    # v20+
npm --version     # v10+
psql --version    # PostgreSQL 16+
```

### 1. Klona repot

```bash
git clone https://github.com/omar1u7777/hobbyjobb.git
cd hobbyjobb
```

### 2. Sätt upp Backend

```bash
cd backend
npm install
cp .env.example .env
# Fyll i .env med dina värden (se Miljövariabler nedan)

# Skapa databasen
createdb hobbyjobb_dev

# Kör migrationer
npx sequelize-cli db:migrate

# Lägg in testdata
npx sequelize-cli db:seed:all

# Starta servern
npm run dev
# http://localhost:5000
```

### 3. Sätt upp Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Sätt VITE_API_URL=http://localhost:5000/api

# Starta
npm run dev
# http://localhost:5173
```

### 4. Sätt upp Stripe Connect

```bash
# Skapa ett Stripe-konto på https://dashboard.stripe.com
# Aktivera Connect under Settings → Connect
# Kopiera dina API-nycklar till backend/.env

# Starta Stripe webhook-lyssnaren lokalt (kräver Stripe CLI)
stripe listen --forward-to localhost:5000/api/payments/webhook
# Kopiera whsec_... och lägg i STRIPE_WEBHOOK_SECRET i .env
```

### 5. Testa API:et

Importera `backend/postman_collection_s1.json` i Postman för att testa alla endpoints.

---

## Miljövariabler

### Backend `.env`

```env
# Server
PORT=5000
NODE_ENV=development

# Databas
DATABASE_URL=postgresql://user:password@localhost:5432/hobbyjobb_dev

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Hobbyverksamhet gränser
HOBBY_ANNUAL_LIMIT=30000
HOBBY_WARNING_THRESHOLD=25000
HOBBY_MONTHLY_JOB_LIMIT=20

# Stripe Connect
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PLATFORM_FEE_PERCENT=8

# CORS
ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=HobbyJobb
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## Git-arbetsflöde

### Branch-strategi

```
main           ← Stabil, produktionsklar kod (skyddad)
develop        ← Integration av features
│
├── feature/s1-auth-setup
├── feature/s2-jobs-api
├── feature/s3-frontend-structure
├── feature/s4-job-pages
└── feature/s5-admin-dashboard
```

### Commit-konvention

```
feat(auth): add JWT login endpoint
feat(jobs): implement hobby income limit check
fix(ui): correct mobile navbar overflow
docs(readme): add API documentation
style(jobcard): improve responsive layout
refactor(admin): split controller into smaller functions
test(auth): add register endpoint tests
```

### Flöde

```bash
# 1. Hämta senaste från develop
git checkout develop
git pull origin develop

# 2. Skapa din feature-branch
git checkout -b feature/s3-landing-page

# 3. Jobba och commita löpande
git add .
git commit -m "feat(landing): add hero section with job cards"

# 4. Push och skapa Pull Request mot develop
git push origin feature/s3-landing-page
# Skapa PR på GitHub och be någon i teamet granska
```

---

## Implementerade funktioner

Markera `[ ]` → `[x]` när uppgiften är klar och pushad till `develop`.

---

## 🏁 FAS 0 — Projektfundament
> Måste vara klart INNAN någon börjar koda features.  
> **Ansvarig: Omar Ahmad Alhaek + hela teamet**

- [x] Projektstruktur dokumenterad i README (frontend + backend filträd)
- [x] Databasschema designat och dokumenterat (ER-diagram + alla tabeller)
- [x] API-dokumentation skriven (alla endpoints, metoder, auth-krav)
- [x] HTML-wireframes skapade (landing, login, listings, job-detail, post-job, profile)
- [x] **GitHub-repo skapat** med `main` + `develop` branch — **Omar Ahmad Alhaek**
- [x] **Roller tilldelade** på GitHub (alla 5 studenter inbjudna som Collaborators) — **Omar Ahmad Alhaek**
- [x] **Branch-skydd aktiverat** på `main` (kräver PR + review) — **Omar Ahmad Alhaek**
- [x] `.gitignore` skapad (node_modules, .env, dist) — **Omar Ahmad Alhaek**
- [x] `backend/.env.example` skapad (alla nycklar som tomma strängar) — **Omar Ahmad Alhaek**
- [x] `frontend/.env.example` skapad — **Edvin Kaltak** ✅

---

## 🔧 FAS 1 — Backend: Server & Databas
> Alla backend-uppgifter. Omar Ahmad Alhaek och Mhd Amin Munla jobbar parallellt här.  
> Frontend är 🔒 blockad på att Omar Ahmad Alhaek är klar med auth innan Suha Subasi kan koppla ihop.

### 1A — Express-server & Grundstruktur (Omar Ahmad Alhaek)
- [x] `backend/` mapp skapad med `npm init` — **Omar Ahmad Alhaek**
- [x] Alla npm-paket installerade (express, sequelize, pg, bcrypt, jsonwebtoken, cors, helmet, dotenv, express-rate-limit, stripe) — **Omar Ahmad Alhaek**
- [x] `backend/server.js` — Express-app med cors, helmet, json-parser, routes — **Omar Ahmad Alhaek**
- [x] `backend/config/database.js` — Sequelize anslutning till PostgreSQL — **Omar Ahmad Alhaek**
- [x] `backend/config/constants.js` — HOBBY_ANNUAL_LIMIT=30000, STRIPE_FEE=0.08 etc. — **Omar Ahmad Alhaek**
- [x] PostgreSQL-databas skapad på Render — **Omar Ahmad Alhaek**

### 1B — Sequelize-modeller & Migrations (Mhd Amin Munla)
> 🔒 Kräver att 1A (database.js) är klar
- [x] `backend/src/models/index.js` — Sequelize setup, alla associationer — **Omar Ahmad Alhaek + Mhd Amin Munla** ✅
- [x] `backend/src/models/User.js` + migration `001-create-users.js` — **Omar Ahmad Alhaek**
- [x] `backend/src/models/Category.js` + migration `002-create-categories.js` — **Mhd Amin Munla** ✅
- [x] `backend/src/models/Job.js` + migration `003-create-jobs.js` — **Mhd Amin Munla** ✅
- [x] `backend/src/models/Application.js` + migration `004-create-applications.js` — **Mhd Amin Munla** ✅
- [x] `backend/src/models/Message.js` + migration `005-create-messages.js` — **Mhd Amin Munla** ✅
- [x] `backend/src/models/Review.js` + migration `006-create-reviews.js` — **Mhd Amin Munla** ✅
- [x] `backend/src/models/Payment.js` + migration `007-create-payments.js` — **Omar Ahmad Alhaek** ✅
- [x] Migration `008-reviews-unique-and-backfill-verified.js` — unik-constraint (reviewer_id + job_id) + backfill av `is_verified` — **Omar Ahmad Alhaek**
- [x] Migration `009-add-price-type-to-jobs.js` — ENUM `fixed/hourly/negotiable` på `jobs.price_type` — **Omar Ahmad Alhaek**
- [x] Alla migrationer körda framgångsrikt (`npx sequelize-cli db:migrate`) — **Omar Ahmad Alhaek** ✅
- [x] Seed-data: `001-categories.js` (11 kategorier) — **Mhd Amin Munla** ✅
- [x] Seed-data: `002-demo-data.js` (5 testanvändare, 20 testjobb) — **Mhd Amin Munla** ✅

### 1C — Auth API (Omar Ahmad Alhaek)
> 🔒 Kräver att User-modellen (1B) är klar
- [x] `backend/src/middleware/errorHandler.js` — Global felhantering — **Omar Ahmad Alhaek**
- [x] `backend/src/middleware/rateLimiter.js` — Max 100 req/15min — **Omar Ahmad Alhaek**
- [x] `backend/src/middleware/requireAuth.js` — JWT-verifiering — **Omar Ahmad Alhaek**
- [x] `backend/src/middleware/requireAdmin.js` — Admin-rollkontroll — **Omar Ahmad Alhaek**
- [x] `backend/src/middleware/hobbyLimitCheck.js` — Hjälpmiddleware för 30 000 kr-gränsen (ej inkopplad i någon route; den skarpa kontrollen sker inline vid `/payments/release`) — **Mhd Amin Munla** ✅
- [x] `POST /api/auth/register` — ✅ Testad & fungerar — **Omar Ahmad Alhaek**
- [x] `POST /api/auth/login` — ✅ Testad & fungerar — **Omar Ahmad Alhaek**
- [x] `POST /api/auth/logout` — ✅ Testad & fungerar — **Omar Ahmad Alhaek**
- [x] `GET /api/auth/me` — ✅ Testad & fungerar — **Omar Ahmad Alhaek**
- [x] `PUT /api/auth/password` — Byt lösenord (kräver auth) — **Omar Ahmad Alhaek** ✅

### 1D — Jobs & Kategorier API (Mhd Amin Munla)
> 🔒 Kräver att Job-modellen och requireAuth (1C) är klara
- [x] `GET /api/categories` — Lista alla kategorier — **Mhd Amin Munla** ✅
- [x] `GET /api/jobs` — Lista jobb med filter (kategori, lat/lng/radius, pris, sort, pagination) — **Mhd Amin Munla** ✅
- [x] `POST /api/jobs` — Skapa jobb (kräver auth; månadsgräns 20 jobb/postare; hobbygränsen valideras inline vid `/payments/release` där utföraren (payee) kontrolleras) — **Mhd Amin Munla** ✅
- [x] `GET /api/jobs/:id` — Hämta ett jobb — **Mhd Amin Munla** ✅
- [x] `PUT /api/jobs/:id` — Uppdatera jobb (kräver auth + ägare) — **Mhd Amin Munla** ✅
- [x] `DELETE /api/jobs/:id` — Ta bort jobb (kräver auth + ägare) — **Mhd Amin Munla** ✅
- [x] `GET /api/jobs/my` — Mina jobb (kräver auth) — **Mhd Amin Munla** ✅
- [x] Hobbyinkomstgräns i `hobbyCalculator.js` — summerar användarens intjänade kr innevarande år — **Mhd Amin Munla** ✅

### 1E — Ansökningar, Användare & Meddelanden API (Mhd Amin Munla)
> 🔒 Kräver att 1C och 1D är klara
- [x] `POST /api/applications` — Ansök på jobb — **Mhd Amin Munla** ✅
- [x] `GET /api/applications/received` — Mottagna ansökningar — **Mhd Amin Munla** ✅
- [x] `GET /api/applications/sent` — Skickade ansökningar — **Mhd Amin Munla** ✅
- [x] `PUT /api/applications/:id` — Acceptera / avvisa ansökan — **Mhd Amin Munla** ✅
- [x] `GET /api/users/:id` — Publik profil — **Mhd Amin Munla** ✅
- [x] `PUT /api/users/:id` — Uppdatera profil (kräver auth + ägare) — **Mhd Amin Munla** ✅
- [x] `GET /api/users/me/income` — Inkomstöversikt (kräver auth) — **Mhd Amin Munla** ✅
- [x] `GET /api/users/:id/reviews` — Recensioner för användare — **Omar Ahmad Alhaek** ✅
- [x] `GET /api/messages/:jobId` — Chatthistorik — **Mhd Amin Munla** ✅
- [x] `POST /api/messages` — Skicka meddelande — **Mhd Amin Munla** ✅
- [x] `GET /api/messages/unread-count` — Antal olästa meddelanden — **Edvin Kaltak** ✅ (via NotificationContext)

### 1F — Backend Testing (Omar Ahmad Alhaek)
> 🔒 Kräver att 1C (Auth API) och FAS 4 (Payments) är klara
- [x] Jest + Supertest installerat som devDependencies — **Omar Ahmad Alhaek** ✅
- [x] `backend/jest.config.js` — Jest-konfiguration (node environment, 10s timeout) — **Omar Ahmad Alhaek** ✅
- [x] `backend/__tests__/helpers/createApp.js` — Test helper för Express app — **Omar Ahmad Alhaek** ✅
- [x] `backend/__tests__/auth.test.js` — 22 tester för auth routes (register, login, getMe, changePassword, email-normalisering) — **Omar Ahmad Alhaek** ✅
- [x] `backend/__tests__/middleware.test.js` — 12 tester för middleware (requireAuth, requireAdmin, errorHandler) — **Omar Ahmad Alhaek** ✅
- [x] `backend/__tests__/payment.test.js` — 21 tester för payment controller (checkout, confirm, release, webhook, hobby limits, amount från DB) — **Omar Ahmad Alhaek** ✅
- [x] `backend/__tests__/config.test.js` — 12 tester för config (stripe.js, database.js SSL logic) — **Omar Ahmad Alhaek** ✅
- [x] `backend/__tests__/user-model-hooks.test.js` — 8 tester för email-normalisering (lowercase, trim, null/undefined-säkerhet) — **Omar Ahmad Alhaek** ✅
- [x] Alla 75 backend-tester passerar (`npm test`) — **Omar Ahmad Alhaek** ✅
- [x] Frontend-tester (Vitest): 22 tester (CheckoutPage, PaymentSuccessPage, BoostJobPage, paymentService) — **Omar Ahmad Alhaek** ✅

---

## 🎨 FAS 2 — Frontend: Grundstruktur & Design
> Edvin Kaltak sätter upp React-projektet och designsystemet.  
> Suha Subasi är 🔒 blockad tills React Router och gemensamma komponenter är klara.

### 2A — React-projekt & Routing (Edvin Kaltak)
- [x] `npm create vite@latest frontend -- --template react` — **Edvin Kaltak** 
- [x] React Router installerat (`npm install react-router-dom`) — **Edvin Kaltak** 
- [x] Alla npm-paket installerade (axios, react-router-dom) — **Edvin Kaltak** 
- [x] `frontend/src/App.jsx` — React Router setup med alla routes — **Edvin Kaltak** 
- [x] `frontend/src/main.jsx` — Entry point med providers — **Edvin Kaltak** 
- [x] `frontend/src/styles/variables.css` — CSS design tokens — **Edvin Kaltak** 
- [x] `frontend/src/styles/global.css` — Reset, body-font, box-sizing — **Edvin Kaltak** 
- [x] `frontend/src/styles/components.css` — Gemensamma klasser (btn, card, badge etc.) — **Edvin Kaltak** 

### 2B — Gemensamma Komponenter (Edvin Kaltak)
> 🔒 Kräver att 2A är klar
- [x] `Navbar.jsx` — Logo, navigeringslänkar, login/register-knappar, responsiv (hamburger vid 900px) — **Edvin Kaltak** 
- [x] `Footer.jsx` — 4-kolumns footer, mörk bakgrund — **Edvin Kaltak** 
- [x] `Button.jsx` — Primary / secondary / ghost variants — **Edvin Kaltak** 
- [x] `Input.jsx` — Text, number, select med label och felmeddelande — **Edvin Kaltak** 
- [x] `Modal.jsx` — Överläggskomponent med backdrop — **Edvin Kaltak** 
- [x] `Badge.jsx` — Kategori-badges med färg — **Edvin Kaltak** 
- [x] `Spinner.jsx` — Laddningsindikator — **Edvin Kaltak** 
- [x] `Alert.jsx` — Success / error / warning-meddelanden — **Edvin Kaltak** 
- [x] `HobbyLimitBanner.jsx` — Gul varningsbanner (visas när > 80% av 30 000 kr nåtts) — **Edvin Kaltak** 

### 2C — Auth Context & Services (Edvin Kaltak + Suha Subasi)
> 🔒 Kräver att backend auth API (1C) är klart och 2A är klar
- [x] `frontend/src/context/AuthContext.jsx` — Global auth-state (user, token, login, logout) — **Edvin Kaltak** 
- [x] `frontend/src/services/api.js` — Axios-instans med baseURL + JWT Authorization header — **Edvin Kaltak** 
- [x] `frontend/src/services/authService.js` — register(), login(), logout(), getMe() — **Edvin Kaltak** 
- [x] `frontend/src/hooks/useAuth.js` — Hook för att använda AuthContext — **Edvin Kaltak** 
- [x] Skyddad route-komponent (`PrivateRoute`) — omdirigerar till /login om ej inloggad — **Edvin Kaltak** 

### 2D — Landningssida i React (Edvin Kaltak)
> 🔒 Kräver att gemensamma komponenter (2B) är klara
- [x] `LandingPage.jsx` — Hero, 10-kategorisgrid, hur-det-fungerar (3 steg), inkomstmätare, FAQ-accordion, CTA — **Edvin Kaltak** 
  - Baseras direkt på `landing.html` wireframe

---

## 🖥️ FAS 3 — Frontend: Användarflöde (Suha Subasi)
> Suha Subasi implementerar alla sidor som kräver auth och jobblogik.  
> 🔒 Kräver att FAS 2 (React Router + gemensamma komponenter + AuthContext) är klar.

### 3A — Auth-sidor
- [x] `LoginPage.jsx` — Login-form med felhantering, länk till Register — **Suha Subasi** 
- [x] `RegisterPage.jsx` — Registreringsform + hobbyvillkor-checkbox (obligatorisk) + info-modal — **Suha Subasi** 
  - Baseras på `login.html` wireframe (register-tab)

### 3B — Jobbrelaterade sidor
> 🔒 Kräver att Jobs API (1D) och jobService är klara
- [x] `frontend/src/services/jobService.js` — getJobs(), getJob(), createJob(), updateJob(), deleteJob() — **Suha Subasi** 
- [x] `frontend/src/services/applicationService.js` — apply(), getReceived(), getSent(), updateStatus() — **Suha Subasi** 
- [x] `frontend/src/hooks/useJobs.js` — Hook med state, loading, error för jobblista — **Suha Subasi** 
- [x] `JobCard.jsx` — Jobbkort med titel, kategori, pris, plats — **Suha Subasi** 
- [x] `JobList.jsx` — Grid av JobCard-komponenter — **Suha Subasi** 
- [x] `JobFilter.jsx` — Sidebar med kategori, avstånd, prisintervall filter — **Suha Subasi** 
- [x] `JobListPage.jsx` — Sökbar jobblista med sidebar-filter och pagination — **Suha Subasi** 
  - Baseras på `listings.html` wireframe
- [x] `JobDetailPage.jsx` — Jobbdetalj med bokningskort, ansökningsform, `ReviewForm`-modal (stjärnbetyg + kommentar) — **Suha Subasi** 
  - Baseras på `job-detail.html` wireframe
- [x] `ReviewForm.jsx` + integration på `JobDetailPage` — Deltagare i slutfört jobb kan lämna recension till motparten — **Omar Ahmad Alhaek** 
- [x] `PostJobPage.jsx` — 4-stegs formulär för att skapa jobb, live-förhandsgranskning — **Suha Subasi** 
  - Baseras på `post-job.html` wireframe
- [x] `MyJobsPage.jsx` — Mina publicerade / pågående / slutförda jobb — **Suha Subasi** 

### 3C — Profilsida
> 🔒 Kräver att Users API (1E) och inkomstlogik är klara
- [x] `frontend/src/hooks/useHobbyLimit.js` — Hämtar och beräknar inkomstgräns för inloggad användare — **Suha Subasi** 
- [x] `frontend/src/utils/hobbyLimits.js` — calculateLimit(), isNearLimit(), isAtLimit() — **Suha Subasi** 
- [x] `IncomeTracker.jsx` — Progress-bar (kr intjänat / 30 000 kr), varningsnivåer — **Suha Subasi** 
- [x] `ProfilePage.jsx` — Mörk hero, flikar: Översikt / Jobbhistorik / Recensioner / Inställningar — **Suha Subasi** 
  - Baseras på `profile.html` wireframe

---
## 💳 FAS 4 — Betalningssystem (Stripe Connect)
> Kräver att Jobs API och Auth är klara (FAS 1C + 1D).  
> **Ansvarig: Omar Ahmad Alhaek (backend + frontend)**

- [x] Stripe-konto skapat på dashboard.stripe.com — **Omar Ahmad Alhaek** 
- [x] Connect aktiverat i Stripe Dashboard — **Omar Ahmad Alhaek**
- [x] `backend/config/stripe.js` — Stripe-klient med API-nyckel + fee-beräkning — **Omar Ahmad Alhaek** 
- [x] `POST /api/payments/checkout` — Skapar Stripe PaymentIntent med platform-fee (8%) — **Omar Ahmad Alhaek** ✅
  - **Säkerhetsfix:** `amount` hämtas från `job.price` i DB (inte från request body) — **Omar Ahmad Alhaek** ✅
- [x] `POST /api/payments/confirm` — Client-side confirm fallback (verifierar mot Stripe API) — **Omar Ahmad Alhaek** ✅
- [x] `POST /api/payments/release/:jobId` — Frigör escrow till utföraren (92%) + uppdaterar hobby_total_year — **Omar Ahmad Alhaek** ✅
  - **Säkerhetsfix:** `confirmed_at` sätts endast på escrow-release (inte vid betalning) — **Omar Ahmad Alhaek** ✅
  - **Säkerhetsfix:** Double-betalningsskydd med `Op.in: ['pending', 'held']` — **Omar Ahmad Alhaek** ✅
- [x] `POST /api/payments/webhook` — Hanterar Stripe-events (payment_intent.succeeded etc.) — **Omar Ahmad Alhaek** ✅
  - **Säkerhetsfix:** Signature-verifiering krävs i production (avvisar unsigned webhooks) — **Omar Ahmad Alhaek** ✅
- [x] `GET /api/payments/history` — Betalningshistorik för inloggad användare — **Omar Ahmad Alhaek** ✅
- [x] `POST /api/payments/boost` + `/boost/confirm` — Direkt betalning för Boost-annonsering (29 kr/48h eller 59 kr/7 dagar) — **Omar Ahmad Alhaek** ✅
- [x] `BoostJobPage.jsx` — Paketval + Stripe Elements för boost-betalning — **Omar Ahmad Alhaek** ✅
- [x] `MyJobsPage` — 🚀 "Boosta"-knapp per jobb — **Omar Ahmad Alhaek** ✅
- [x] `frontend/src/services/paymentService.js` — createCheckout(), confirmPayment(), releaseEscrow(), getHistory() — **Omar Ahmad Alhaek**
- [x] `frontend/src/services/connectService.js` — Stripe Connect onboarding — **Omar Ahmad Alhaek**
- [x] `frontend/src/components/profile/ConnectStatus.jsx` — Visar Stripe-kontostatus — **Omar Ahmad Alhaek** 
- [x] `CheckoutPage.jsx` — Stripe Elements betalningsflöde med sammanfattning — **Omar Ahmad Alhaek** ✅
  - **Fix:** Borttaget dubblett "kr" i prisvisning — **Omar Ahmad Alhaek** ✅
- [x] `PaymentSuccessPage.jsx` — Bekräftelsesida efter genomförd betalning — **Omar Ahmad Alhaek** ✅
  - **Fix:** Borttaget falskt påstående om email (ingen email-service) — **Omar Ahmad Alhaek** ✅
- [x] `JobDetailPage` — "Betala & starta jobbet" + "Markera klart & frigör betalning" knappar — **Omar Ahmad Alhaek** ✅

---

## 📊 FAS 5 — Admin Dashboard & Statistik (Qusai Kokas)
> 🔒 Kräver att auth middleware (1C) och Jobs API (1D) är klara.

- [x] `GET /api/admin/stats` — Totalt antal jobb, användare, intäkter, flaggade konton m.m. — **Qusai Kokas** 
- [x] `GET /api/admin/users` — Alla användare med hobbystatistik — **Qusai Kokas**
- [x] `PUT /api/admin/users/:id` — Aktivera/deaktivera konton — **Qusai Kokas**
- [x] `GET /api/admin/flagged-accounts` — Konton > hobby-warning-threshold med risknivåfilter — **Qusai Kokas** 
- [x] `GET /api/admin/jobs` — Alla jobb (inkl. borttagna) — **Qusai Kokas**
- [x] `DELETE /api/admin/jobs/:id` — Ta bort jobb som admin — **Qusai Kokas**
- [x] `GET/POST/PUT/DELETE /api/admin/categories` — CRUD för kategorier (case-insensitiv duplicate-check, blockerar delete vid aktiva jobb) — **Qusai Kokas** 
- [x] `frontend/src/services/adminService.js` — API-wrapper för stats, flagged-accounts, charts, moderation och category CRUD — **Qusai Kokas** 
- [x] `AdminDashboardPage.jsx` — Statistik-kort + alerts + tabeller (live-data från `/admin/stats` med mock-fallback) — **Qusai Kokas** 
- [x] `UserTable.jsx` — Sökbar tabell med hobbystatusfiltrering (mock-data) — **Qusai Kokas** 
- [x] `JobTable.jsx` — Jobbhanteringstabell med sök (mock-data) — **Qusai Kokas** 
- [x] `CategoryManager.jsx` — CRUD-gränssnitt för kategorier (live-CRUD mot `/admin/categories` med mock-fallback) — **Qusai Kokas** 
- [x] `FlaggedAccounts.jsx` — Lista flaggade konton med sök/filter (live-data från `/admin/flagged-accounts` med mock-fallback) — **Qusai Kokas** 
- [x] `JobsOverTimeChart.jsx` — Line chart: antal jobb per månad (Chart.js, live-data med mock-fallback) — **Qusai Kokas** 
- [x] `CategoryPieChart.jsx` — Pie chart: fördelning per kategori (Chart.js, live-data med mock-fallback) — **Qusai Kokas** 
- [x] `IncomeBarChart.jsx` — Bar chart: plattformens intäkter per månad (Chart.js, live-data med mock-fallback) — **Qusai Kokas** 

---

## 🌐 FAS 6 — Informationssidor & Chatt (Qusai Kokas + Edvin Kaltak)
> Kan påbörjas parallellt med FAS 4–5

- [x] `HobbyInfoPage.jsx` — Informationssida om hobbyverksamhet, Skatteverkets regler, FAQ — **Qusai Kokas** 
- [x] `AboutPage.jsx` — Om oss: teaminfo (namn, roll, foto), projektbeskrivning — **Qusai Kokas** 
- [x] `ChatPage.jsx` — Konversationslista + ChatWindow (live-data från `/messages/conversations` med mock-fallback) — **Qusai Kokas** ✅
- [x] `GET /api/messages/conversations` + `PATCH /api/messages/:jobId/read` — Bonus: konversationsgruppering & read-status — **Qusai Kokas** ✅
- [x] `frontend/src/services/messageService.js` — API-wrapper för konversationer, meddelanden, read-status — **Qusai Kokas** ✅
- [x] `ChatWindow.jsx` — Chattfönster med meddelandehistorik + auto-scroll — **Qusai Kokas** 
- [x] `MessageBubble.jsx` — Chattbubbla (avsändare / mottagare) — **Qusai Kokas** 
- [x] `ChatInput.jsx` — Textfält + skicka-knapp — **Qusai Kokas** 
- [x] `HomePage.jsx` — Autentiserad startsida med senaste jobb, inkomststatus, snabblänkar — **Edvin Kaltak** 
- [x] `frontend/src/context/NotificationContext.jsx` — Räknare för olästa meddelanden — **Edvin Kaltak**

---
## 🚀 FAS 7 — Deployment & CI/CD (Omar Ahmad Alhaek)
> 🔒 Kräver att hela appen fungerar lokalt (FAS 1–6 klara).  
> **Status: Deployad till produktion (april 2026).**

- [x] PostgreSQL-databas på Render (Frankfurt) — **Omar Ahmad Alhaek**
- [x] `DATABASE_URL` konfigurerad i Render — **Omar Ahmad Alhaek**
- [x] Migrationer körda mot produktionsdatabasen (`npm run start` kör `npx sequelize-cli db:migrate`) — **Omar Ahmad Alhaek**
- [x] Render Web Service skapad (backend, auto-deploy från `main`) — **Omar Ahmad Alhaek**
- [x] Alla miljövariabler inlagda i Render (`JWT_SECRET`, `STRIPE_*`, `ALLOWED_ORIGINS`, m.m.) — **Omar Ahmad Alhaek**
- [x] Vercel-projekt skapat och kopplat till GitHub (`frontend/`, auto-deploy från `main`) — **Omar Ahmad Alhaek**
- [x] `VITE_API_URL` satt till Render-backend-URL i Vercel — **Omar Ahmad Alhaek**
- [x] Stripe webhook-URL uppdaterad till produktions-URL i Stripe Dashboard — **Omar Ahmad Alhaek**
- [x] `.github/workflows/ci-backend.yml` — Kör `npm test` på push/PR mot `develop` och `main` — **Omar Ahmad Alhaek**
- [x] `.github/workflows/ci-frontend.yml` — Kör frontend-tester på push/PR mot `develop` och `main` — **Omar Ahmad Alhaek**
- [x] `.github/workflows/lint.yml` — Kör ESLint på frontend vid PR/push — **Omar Ahmad Alhaek**
- [x] Produktions-URL testad (alla sidor, login, jobb, betalning) — **Alla**

**Produktionsfixar i kodbasen (verifierbara):**
- `server.js`: `app.set('trust proxy', 2)` för Render proxy
- `server.js`: `helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } })` — CORS/Vercel-kompatibilitet
- `server.js`: `ALLOWED_ORIGINS`-driven CORS-whitelist
- `api.js`: Axios timeout 60s för Render Free-tier cold starts
- `vercel.json`: SPA rewrite så React Router fungerar vid direktladdning
- `payments.js`: Webhook avvisar osignerade anrop i `NODE_ENV=production`

---

## 📋 Sammanfattning — Implementationsordning

```
FAS 0  →  FAS 1A  →  FAS 1B  →  FAS 1C  →  FAS 2A  →  FAS 2B
                                     ↓              ↓
                              FAS 1D + 1E      FAS 2C + 2D
                                     ↓              ↓
                                  FAS 3A  ←————————┘
                                     ↓
                              FAS 3B + 3C
                                     ↓
                       FAS 4  (Betalning / Stripe Connect)
                                     ↓
                  FAS 5 + FAS 6  (Admin · Info & Chatt, parallellt)
                                     ↓
                       FAS 7  (Deployment & CI/CD)
```

---

## Tekniska beslut

| # | Beslut | Val | Alternativ | Motivering |
|---|--------|-----|------------|-----------|
| 1 | Databas | PostgreSQL | MongoDB, MySQL | Strikta relationer (Job→User→Payment) kräver JOIN. Hobbyinkomstberäkning per år är en SQL-aggregering — att göra det i applikationskod ökar felrisken i juridiskt känslig logik. |
| 2 | Backend | Node.js + Express | NestJS, Fastify | Behövde explicit kontroll på middleware-ordningen: `cors → helmet → rateLimiter → requireAuth → hobbyLimitCheck`. NestJS lägger till Angular-liknande abstraktion som ökar inlärningskurvan. |
| 3 | Auth | JWT | express-session + Redis | Render kan köra flera instanser parallellt. Sessioner kräver delad session-store. JWT är stateless och behöver ingen extra Redis-tjänst. |
| 4 | Frontend | React + Vite | Next.js, Vue | Next.js komplicerar integrationen med vår separata Express-backend. React + Vite ger ren separation; React Router 6 räcker för `PrivateRoute`-skydd. |

---

## Kurs & Team

**Kurs:** DA219B – Fullstack Utveckling · **Lärosäte:** Högskolan Kristianstad · **Termin:** VT 2026

| Namn | Fokus |
|------|-------|
| Omar Ahmad Alhaek | Backend Lead, Auth, Deployment |
| Mhd Amin Munla | API, Databas, Hobbylogik |
| Edvin Kaltak | Frontend Lead, Design, Komponenter |
| Suha Subasi | Frontend Features, Användarflöde |
| Qusai Kokas | Admin, Statistik, Chatt, Informationssidor |

HobbyJobb är en mötesplattform — användarna ansvarar själva för att hålla sig inom Skatteverkets gränser för hobbyverksamhet.

---

*Senast uppdaterad: Maj 2026 · Version 0.2.1 (ESLint 9 Flat Config, a11y-fixar, CI lint-workflow, mobilmeny, produktionsdeployment)*
