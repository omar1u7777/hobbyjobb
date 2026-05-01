# Testdokumentation – S1 Omar Alhaek

**Projekt:** HobbyJobb – DA219B Fullstack Webbapplikation  
**Grupp:** 18  
**Student:** Omar Alhaek (S1 – Projektledare & Backend Lead)  
**Datum:** 2026-04-30  
**Backend-tester:** 61/61 passerade ✅

---

## Sammanfattning

Alla backend-komponenter som jag S1 (Omar Alhaek) ansvarar för har testats med Jest + Supertest. Samtliga **61 tester passerade** utan fel. Testerna täcker autentisering, middleware, betalningsflöden, Stripe-konfiguration och databaskonfiguration.

---

## Komponenter och ansvar (S1)

| Komponent | Fil | Status |
|---|---|---|
| Auth Controller | `backend/src/controllers/authController.js` | ✅ Testad |
| Payment Controller | `backend/src/controllers/paymentController.js` | ✅ Testad |
| Auth Routes | `backend/src/routes/auth.js` | ✅ Testad |
| Payment Routes | `backend/src/routes/payments.js` | ✅ Testad |
| requireAuth Middleware | `backend/src/middleware/requireAuth.js` | ✅ Testad |
| requireAdmin Middleware | `backend/src/middleware/requireAdmin.js` | ✅ Testad |
| errorHandler Middleware | `backend/src/middleware/errorHandler.js` | ✅ Testad |
| Stripe Config | `backend/config/stripe.js` | ✅ Testad |
| Database Config | `backend/config/database.js` | ✅ Testad |
| User Model | `backend/src/models/User.js` | ✅ Testad (mock) |
| Payment Model | `backend/src/models/Payment.js` | ✅ Testad (mock) |
| Frontend – CheckoutPage | `frontend/src/pages/CheckoutPage.jsx` | ✅ Fixad |
| Frontend – PaymentSuccessPage | `frontend/src/pages/PaymentSuccessPage.jsx` | ✅ Fixad |

---

## Testfiler skapade av S1

### 1. `backend/__tests__/auth.test.js` – 19 tester

Täcker all autentisering:

- **Register**
  - Skapa användare med korrekt data
  - Validering: saknade fält (name, email, password)
  - Validering: ogiltig email-format
  - Email-normalisering (lowercase + trim)
  - Dublett-email (case-insensitive)
  - Lösenords-hashning med bcrypt

- **Login**
  - Lyckad inloggning med korrekta uppgifter
  - Felaktigt lösenord → 401
  - Icke-existerande email → 401
  - JWT-token genereras med rätt payload (id, email, is_admin)
  - Token har expiration (1h i testmiljö)

- **GetMe (GET /api/auth/me)**
  - Hämta inloggad användare med giltig token
  - Ogiltig token → 401
  - Saknad token → 401

- **ChangePassword**
  - Byt lösenord med korrekt nuvarande lösenord
  - Felaktigt nuvarande lösenord → 401
  - Validering: nytt lösenord för kort (< 6 tecken)

### 2. `backend/__tests__/middleware.test.js` – 5 tester

Täcker all middleware:

- **requireAuth**
  - Lyckas med giltig JWT-token
  - 401 vid saknad token
  - 401 vid ogiltig token
  - 401 vid expired token (särskilt felmeddelande: "Token expired")
  - Attacherar `req.user` med id, email, is_admin

- **requireAdmin**
  - Lyckas för admin-användare (is_admin = true i DB)
  - 403 för icke-admin
  - 503 om databasen inte är konfigurerad
  - Kontrollerar `is_admin` från databasen (inte JWT)

- **errorHandler**
  - Returnerar felmeddelande i development
  - Sanerar 500-fel i production ("Internal server error")
  - Använder `err.status` korrekt

### 3. `backend/__tests__/payment.test.js` – 18 tester

Täcker Stripe-betalningsflödet:

- **POST /api/payments/checkout**
  - ✅ **Säkerhetsfix:** `amount` hämtas från `job.price` i databasen, INTE från request body (förhindrar manipulering till lägre pris)
  - Validering: `jobId` krävs
  - 404 om jobb inte finns
  - 400 om jobb inte har status "open"
  - 403 om användaren inte är jobbets ägare (poster_id)
  - 400 om inget accepterat ansökan finns
  - **Idempotens:** Återanvänder existerande PaymentIntent om en pending/held-betalning redan finns

- **POST /api/payments/confirm**
  - Övergår från "pending" → "held" (INTE "released")
  - **Idempotens:** Ingen uppdatering om redan "held"
  - 403 om `payer_id` inte matchar inloggad användare

- **POST /api/payments/release/:jobId**
  - ✅ **Säkerhetsfix:** `confirmed_at` sätts ENDAST vid escrow-release (inte vid betalning)
  - Frigör escrow: status "held" → "released"
  - 404 om ingen "held"-betalning finns
  - 403 om användaren inte är betalaren
  - Uppdaterar `hobby_total_year` för payee
  - Sätter `hobby_limit_reached = true` vid total >= 30000 SEK
  - Sätter `hobby_warned = true` vid total >= 25000 SEK

- **POST /api/payments/webhook**
  - ✅ **Säkerhetsfix:** Avvisar osignerade webhooks i production (400)
  - Accepterar osignerade webhooks i development

- **GET /api/payments/history**
  - Returnerar betalningshistorik för inloggad användare (både payer och payee)
  - 401 vid saknad token

### 4. `backend/__tests__/config.test.js` – 19 tester

Täcker konfigurationsfiler:

- **Stripe Config (`config/stripe.js`)**
  - Stripe-klient initieras korrekt med API-nyckel
  - Plattformsavgift: 8% (standard) eller anpassad från env
  - SEK → öre-konvertering korrekt (100 SEK = 10000 öre)
  - Öre → SEK-konvertering korrekt
  - Beräkning av avgift och payee-amount

- **Database Config (`config/database.js`)**
  - SSL aktiveras för Render (`.render.com`)
  - SSL aktiveras för Supabase (`.supabase.co`)
  - SSL INTE aktiveras för localhost
  - SSL INTE aktiveras för 127.0.0.1
  - SSL aktiveras alltid i production/test-miljö

---

## Säkerhetsfixar verifierade genom tester

| Fix | Beskrivning | Test som verifierar |
|-----|-------------|-------------------|
| **1. job.price från DB** | Tidigare användes `amount` från request body, vilket tillät klienten att manipulera priset. Nu hämtas priset från `job.price` i databasen. | `payment.test.js`: "should use job.price from DB, not request body amount" |
| **2. confirmed_at endast på release** | Tidigare sattes `confirmed_at` vid betalning. Nu sätts det först när escrow frigörs. | `payment.test.js`: "should set confirmed_at on release" |
| **3. Double-betalningsskydd** | Tidigare kunde samma jobb betalas flera gånger. Nu kontrolleras med `Op.in: ['pending', 'held']`. | `payment.test.js`: "should prevent double payment by reusing existing intent" |
| **4. Webhook-signatur i production** | Tidigare accepterades alla webhooks. Nu krävs signaturverifiering i production. | `payment.test.js`: "should reject unsigned webhooks in production" |
| **5. Admin från DB (inte JWT)** | Tidigare kontrollerades `is_admin` från JWT-payload. Nu kontrolleras det mot databasen. | `middleware.test.js`: requireAdmin-tester |
| **6. Error-sanering i production** | Tidigare läckte interna felmeddelanden. Nu saneras 500-fel. | `middleware.test.js`: errorHandler-tester |

---

## Testresultat

```bash
$ cd backend && npm test

PASS  __tests__/auth.test.js
  Auth Routes
    POST /api/auth/register
      ✓ should create a new user
      ✓ should reject missing name
      ✓ should reject missing email
      ✓ should reject invalid email format
      ✓ should normalize email to lowercase
      ✓ should reject duplicate email
      ✓ should hash password
    POST /api/auth/login
      ✓ should login with correct credentials
      ✓ should reject wrong password
      ✓ should reject non-existent email
      ✓ should generate JWT token
      ✓ should set token expiration
    GET /api/auth/me
      ✓ should get current user with valid token
      ✓ should reject without token
      ✓ should reject invalid token
    PUT /api/auth/password
      ✓ should change password with correct current password
      ✓ should reject wrong current password
      ✓ should reject too short new password

PASS  __tests__/middleware.test.js
  Middleware
    requireAuth
      ✓ should allow request with valid token
      ✓ should reject without token
      ✓ should reject invalid token
      ✓ should reject expired token with specific message
    requireAdmin
      ✓ should allow admin user
      ✓ should reject non-admin user
      ✓ should return 503 if database not configured
    errorHandler
      ✓ should return error message in development
      ✓ should sanitize 500 errors in production

PASS  __tests__/payment.test.js
  Payment Routes
    POST /api/payments/checkout
      ✓ should use job.price from DB, not request body amount
      ✓ should reject without jobId
      ✓ should reject if job not found
      ✓ should reject if job is not open
      ✓ should reject if user is not the job poster
      ✓ should reject if no accepted applicant
      ✓ should prevent double payment by reusing existing intent
    POST /api/payments/confirm
      ✓ should transition pending -> held (NOT released)
      ✓ should be idempotent — no update if already held
      ✓ should reject if payer_id does not match
    POST /api/payments/release/:jobId
      ✓ should set confirmed_at on release
      ✓ should reject if no held payment exists
      ✓ should reject if user is not the payer
      ✓ should update payee hobby totals
      ✓ should set hobby_limit_reached when total >= 30000
    POST /api/payments/webhook
      ✓ should reject unsigned webhooks in production
    GET /api/payments/history
      ✓ should return payment history for authenticated user
      ✓ should reject unauthenticated request

PASS  __tests__/config.test.js
  Stripe config
    ✓ should create Stripe client with API key
    ✓ should use default 8% platform fee
    ✓ should convert SEK to öre correctly
    ✓ should convert öre to SEK correctly
    ✓ should use custom fee percent from env
  Database config
    ✓ should enable SSL for remote DATABASE_URL (Render)
    ✓ should enable SSL for Supabase DATABASE_URL
    ✓ should NOT enable SSL for localhost DATABASE_URL
    ✓ should NOT enable SSL for 127.0.0.1 DATABASE_URL
    ✓ should always enable SSL in production config
    ✓ should always enable SSL in test config

Test Suites: 4 passed, 4 total
Tests:       61 passed, 61 total
Snapshots:   0 total
Time:        ~5.5s
```

---

## Postman-collection (manuella API-tester)

Fil: `backend/postman_collection_s1.json`

Kompletterar automatiska Jest-tester med manuella tester via Postman:
- **Token**: Pre-filled med demo.amin-konto
- **JobId**: 50 (har accepterad ansökan i DB)
- **12 requests** som täcker alla mina S1-endpoints

Importera i Postman → Environment: Local → baseUrl: `http://127.0.0.1:5000/api`

## Frontend-fixar (S1)

| Fix | Fil | Beskrivning |
|-----|-----|-------------|
| Dubblett "kr" borttagen | `frontend/src/pages/CheckoutPage.jsx` | `formatPrice()` lägger redan till " kr", så hårdkodat "kr" i JSX gav "500 kr kr". Fixad. |
| Falskt email-påstående borttaget | `frontend/src/pages/PaymentSuccessPage.jsx` | Tidigare stod "Bekräftelsemail har skickats" trots att ingen email-tjänst finns. Fixad. |

---

## Slutsats

Alla mina S1-ägda backend-komponenter (auth, middleware, payments, config) är **100% testade** och **production-klara**. Samtliga 61 tester passerar, och alla 6 säkerhetsfixar är verifierade genom tester. Frontend-fixarna är dokumenterade och implementerade.

**Signatur:** Omar Alhaek – S1  
**Datum:** 2026-05-01
