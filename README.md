# NikahYuk — Modern Wedding Planning & Event Management Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/acid2701/nikahyuk/actions/workflows/ci.yml/badge.svg)](https://github.com/acid2701/nikahyuk/actions/workflows/ci.yml)
[![Tests: Vitest](https://img.shields.io/badge/Tests-21%20Passed-brightgreen.svg)](https://vitest.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-14_App_Router-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?logo=postgresql)](https://www.postgresql.org/)

**NikahYuk** is an open-source, full-stack wedding planning, event coordination, and budgeting ERP platform built for couples, planners, and families. Designed with bespoke architectural design tokens (Airbnb, Oura Ring, and Linear aesthetics), it provides an all-in-one workspace for timeline orchestration, guest seating, multi-category budgeting, and visual moodboards.

Live Instance: [https://nikahyu.my.id](https://nikahyu.my.id)

---

## Key Modules & Features

### 1. Rundown & Itinerary Timeline
- **Connected Timeline Engine**: Interactive chronological breakdown for ceremony, reception, and photo sessions.
- **PIC & Vendor Tagging**: Real-time assignment of responsibilities for coordinators and family members.
- **Conflict Prevention**: Automatic milestone collision detection to keep the wedding day strictly on schedule.

### 2. Guest List & Seating Arrangement
- **RSVP Tracking**: Categorized guest statuses (Confirmed, Pending, Declined, VIP, Family).
- **Table & Seating Matrix**: Visual allocation of tables and seating assignments with capacity limits.
- **Direct WhatsApp Messaging**: Automated, personalized invitation link dispatching.

### 3. Financial Ledger & Budget Tracker
- **Waterfall Budgeting**: Granular allocation across Venue, Catering, Wardrobe, Photography, and Decor.
- **Down Payment (DP) & Settlement**: Payment schedule reminders, receipt attachments, and remaining balance calculations.
- **Gift & Angpao Ledger**: Digital logging of physical and cashless gifts received.

### 4. Vendor Hub & Service Coordination
- **Contract & Portfolio Tracker**: Storage of vendor agreements, contact points, and deliverable deadlines.
- **Moodboard & Color Palette**: Visual design workspace powered by Cloudflare R2 object storage with client-side image cropping.

### 5. Multi-Tenant Architecture & Privacy
- **Role-Based Access Control (RBAC)**: Fine-grained permissions between Couples, Wedding Planners, and Collaborators.
- **Automated Backup & Telemetry**: Encrypted automated database backups to S3/R2 object storage.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router, Server Actions, Route Handlers) |
| **Language** | TypeScript (Strict Mode) |
| **Database & ORM** | PostgreSQL with Prisma ORM |
| **Styling & UI** | Tailwind CSS, Lucide Icons, Framer Motion transitions |
| **Storage Engine** | Cloudflare R2 / AWS S3 Compatible Storage |
| **Authentication** | Standalone JWT Session Management with Bcrypt hashing |

---

## Getting Started

### Prerequisites
- Node.js 18.17+ or 20+
- PostgreSQL 14+ database instance

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/acid2701/nikahyuk.git
   cd nikahyuk
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env.local` and configure your database and authentication secrets:
   ```bash
   cp .env.example .env.local
   ```

4. **Initialize Database Schema:**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an issue for bug fixes, feature requests, or UI/UX improvements.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
