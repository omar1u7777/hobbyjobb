# Project Proposal – DA219B VT26
### Grupp 18 · Högskolan Kristianstad

---

## Title: HobbyJobb – A Platform for Local Hobby-Based Gig Work in Sweden

---

## Overview

HobbyJobb is a full-stack web application designed to connect individuals in Sweden who want to earn extra money through small, informal tasks — such as lawn mowing, moving assistance, dog walking, and errands — with people who need help with those tasks.

The platform is built specifically around Sweden's legal framework for **hobbyverksamhet** (hobby-based income), ensuring users stay within Skatteverket's (the Swedish Tax Agency's) annual income threshold of 30,000 SEK. Unlike general freelance marketplaces, HobbyJobb actively monitors each user's annual earnings and automatically warns or restricts posting when they approach the legal limit — making it not just a job board, but a compliance-aware platform.

Payments are handled through **Stripe Connect**, which enables an automated escrow system: the buyer's payment is held securely until the task is confirmed complete, at which point 92% is released to the worker and 8% is retained by HobbyJobb as a platform fee.

---

## Objectives

1. **Build a functional fullstack marketplace** where users can post, search, apply for, and complete local hobby-based jobs.
2. **Implement secure user authentication** using JWT (JSON Web Tokens), allowing users to register, log in, and access personalized features such as income tracking and job management.
3. **Enforce legal compliance** by integrating Skatteverket's hobbyverksamhet rules directly into the platform logic — including automatic income warnings and posting restrictions.
4. **Integrate a live payment system** using Stripe Connect, supporting escrow-based transactions and automatic platform fee deduction.
5. **Deploy a production-ready application** with a React frontend (Vercel), a Node.js/Express backend (Render), and a hosted PostgreSQL database (Supabase).
6. **Deliver a responsive design** accessible on mobile, tablet, and desktop devices.

---

## Methodology

### Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18, React Router 6, Axios | UI, routing, API communication |
| Styling | CSS Modules, CSS Variables | Responsive, component-scoped styling |
| Backend | Node.js 20, Express 4 | REST API server |
| Database | PostgreSQL 16, Sequelize ORM | Data storage and relationships |
| Authentication | JWT, bcrypt | Secure login and session management |
| Payments | Stripe Connect | Escrow, automatic fee splitting (92/8%) |
| DevOps | GitHub Actions, Render, Vercel, Supabase | CI/CD, deployment, hosted DB |

### Development Approach

The project follows a **feature-branch Git workflow** with a protected `main` branch and a shared `develop` branch. Each team member owns a dedicated feature branch and is responsible for regular, meaningful commits throughout the project.

Work is divided across five roles:

| Student | Responsibility |
|---|---|
| Student 1 | Backend architecture, JWT auth, Stripe Connect setup, deployment |
| Student 2 | REST API endpoints, database schema, hobby income logic |
| Student 3 | React project setup, shared components, landing page, responsive design |
| Student 4 | Auth pages, job listing, job detail, profile, income tracker UI |
| Student 5 | Admin dashboard, statistics (Chart.js), hobby info page, About page |

The team will use **Postman** for API testing, **ESLint + Prettier** for code quality, and **GitHub Actions** for automated CI/CD on every push.

---

## Expected Outcomes

By the end of the project, HobbyJobb will deliver:

- A **fully deployed web application** accessible via public URLs (Vercel frontend + Render backend).
- A **secure authentication system** with protected routes for logged-in users and a separate admin role.
- A **job marketplace** where users can post jobs, apply to jobs, accept applicants, and confirm task completion.
- An **income tracking dashboard** per user that displays earnings for the current year and warns when approaching the 30,000 SEK legal threshold.
- A **live payment flow** via Stripe Connect: buyer pays → funds held in escrow → task confirmed → automatic 92/8% split.
- A **Boost advertising feature** allowing users to promote their listings (29 SEK / 59 SEK) as a secondary revenue stream.
- An **admin panel** with platform statistics, flagged accounts, and category management.
- A **fully responsive design** that works flawlessly on desktop, tablet, and mobile.

The platform directly addresses a real problem: many people in Sweden informally pay neighbours or acquaintances for small tasks, with no structured way to find help, agree on price, or handle payment — and no awareness of their tax obligations. HobbyJobb solves all three.

**Revenue model:** The platform earns 8% per completed transaction plus optional Boost fees — a scalable model that requires no upfront cost from users.

---

## Conclusion

HobbyJobb is a technically ambitious, legally grounded, and commercially relevant full-stack application. It demonstrates the full spectrum of modern web development: user authentication, relational database design, REST API development, third-party payment integration, CI/CD deployment, and responsive UI design.
.

**Team HobbyJobb — Grupp 18**  
DA219B · Fullstack utveckling · VT26 · Högskolan Kristianstad
