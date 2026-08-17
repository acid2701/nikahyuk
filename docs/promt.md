Prompt Fase 0: Scaffolding, Design Tokens & Base Primitives
Plaintext
Act as a Senior Fullstack Engineer following AGENT_RULES.md and docs/DESIGN.md.

Task: Execute Phase 0 from DEVELOPMENT_PLAN.md:
1. Install production and development dependencies:
   npm i @supabase/supabase-js @supabase/ssr @aws-sdk/client-s3 @aws-sdk/s3-request-presigner @tanstack/react-table dexie lucide-react react-hook-form @hookform/resolvers zod bcryptjs browser-image-compression @react-pdf/renderer archiver csv-stringify
   npm i -D vitest @vitejs/plugin-react jsdom @types/bcryptjs @types/archiver

2. Configure Theme & Tokens:
   - Update src/app/globals.css with HSL CSS variables (:root and .dark) strictly from docs/DESIGN.md (Warm Porcelain, Champagne Gold, Rose Bronze, semantic success/warning/destructive).
   - Update tailwind.config.ts with the exact color mapping, border-radius (--radius: 0.625rem), and font family configurations (Playfair Display and Plus Jakarta Sans).

3. Scaffold base shadcn/ui component primitives in src/components/ui/:
   - button.tsx, input.tsx, dialog.tsx, dropdown-menu.tsx, table.tsx, badge.tsx, card.tsx, toast.tsx, use-toast.ts, tabs.tsx, select.tsx, switch.tsx.

4. Setup Testing:
   - Create vitest.config.ts with jsdom environment and @/* path alias resolution.

Do not use placeholder code. Run 'npm run build' and ensure zero TypeScript or syntax errors. Report when completed.

==========================================================================================

Prompt Fase 1: Supabase SSR Setup, Database Invariants & Auth Flow
Plaintext
Act as a Senior Fullstack Engineer following AGENT_RULES.md, docs/schema.md, and docs/api-spec.md.

Task: Execute Phase 1 from DEVELOPMENT_PLAN.md:
1. Create Supabase SSR client utilities:
   - src/lib/supabase/client.ts (Browser Client using createBrowserClient).
   - src/lib/supabase/server.ts (Server Actions & RSC Client using createServerClient with cookie handling).
   - src/lib/supabase/middleware.ts (Session refresher & header forwarding).
   - src/middleware.ts (Route guard matching (dashboard), (admin), and view/[token] routes).

2. Generate Database Interfaces:
   - src/types/database.types.ts (100% strict TypeScript types matching the 23 UUID tables, custom enums, and JSONB schemas from docs/schema.md).

3. Build Authentication Pages & Routes:
   - src/app/(auth)/layout.tsx & src/app/(auth)/login/page.tsx (Email/password form + Google One-Tap button).
   - src/app/(auth)/register/page.tsx (Couple registration form).
   - src/app/(auth)/auth-callback/route.ts (OAuth code exchange route handler).

Ensure zero 'any' types and test the middleware redirect flow. Run 'npx tsc --noEmit' to verify type correctness.

====================================================================================


Prompt Fase 2: Dynamic Superadmin Engine & Cloudflare R2 Pipeline
Plaintext
Act as a Senior Fullstack Engineer following AGENT_RULES.md, docs/architecture.md, and docs/sdd.md.

Task: Execute Phase 2 from DEVELOPMENT_PLAN.md:
1. Implement In-Memory Dynamic Config Provider:
   - src/lib/cloudflare-r2/dynamic-config.ts (Fetch and cache R2 credentials & storage rules from PostgreSQL 'system_settings' table, dynamic S3Client instantiation, cache invalidation helper).
   - src/lib/cloudflare-r2/presign-helper.ts (Generate PUT presigned URLs with 300s expiration).
   - src/lib/cloudflare-r2/cleanup-helper.ts (DeleteObjectCommand execution handler).

2. Build Storage Route Handlers:
   - src/app/api/admin/settings/route.ts (PUT handler for superadmin R2 credentials & storage rules).
   - src/app/api/storage/presign/route.ts (Validates MIME & file size against dynamic settings, returns S3 presigned PUT URL).
   - src/app/api/storage/delete/route.ts (Physical R2 deletion endpoint).

3. Create Superadmin UI & Media Uploader:
   - src/app/(admin)/admin/storage-config/page.tsx (Form for R2 credentials and storage limits).
   - src/app/(admin)/admin/rbac-templates/page.tsx (Global default role permissions editor).
   - src/components/shared/media-uploader/dropzone.tsx (Client-side WebP compressor using browser-image-compression + direct S3 PUT uploader).

Verify that R2 credentials are never read from process.env but strictly from database settings.

=========================================================================================

Prompt Fase 3: Multi-Event Workspace, Dynamic RBAC & Starter Presets
Plaintext
Act as a Senior Fullstack Engineer following AGENT_RULES.md, docs/erd.md, and docs/DESIGN.md.

Task: Execute Phase 3 from DEVELOPMENT_PLAN.md:
1. Create Workspace & Event Server Actions:
   - src/actions/wedding-actions.ts (Create workspace, invite collaborator, update granular permission overrides with audit logging).
   - src/actions/event-actions.ts (CRUD multi-events: Lamaran, Pengajian, Siraman, Midodareni, Akad, Resepsi Pria/Wanita with side ownership).

2. Build Universal Navigation & Layout Components:
   - src/components/shared/navigation/event-switcher.tsx (Top header dropdown to switch event context).
   - src/components/shared/navigation/app-sidebar.tsx (Sidebar navigation + KlikQRIS donation widget at the bottom).
   - src/components/shared/navigation/dashboard-header.tsx (Breadcrumbs and user profile menu).
   - src/app/(dashboard)/dashboard/layout.tsx & page.tsx.

3. Implement RBAC UI & Starter Presets:
   - src/app/(dashboard)/dashboard/[weddingId]/settings/collaborators/page.tsx.
   - src/components/modules/settings/collaborator-permission-form.tsx (Granular module switches: budget, vendor, rundown, guest, gift_log).
   - src/types/presets.types.ts & src/components/modules/rundown/rundown-preset-dialog.tsx (Inject customizable default templates).

Ensure state synchronization across switching events.

=============================================================================================


Prompt Fase 4: Financial Core (Multiple Milestones & Due-Date Tracker)
Plaintext
Act as a Senior Fullstack Engineer following AGENT_RULES.md, docs/sdd.md, and docs/DESIGN.md.

Task: Execute Phase 4 from DEVELOPMENT_PLAN.md:
1. Implement Financial Domain Logic & Unit Tests:
   - src/lib/utils/due-date-evaluator.ts (evaluatePaymentDueDate algorithm from sdd.md).
   - tests/unit/due-date-evaluator.test.ts (Vitest tests for PAID, OVERDUE, UPCOMING H-X, and NEUTRAL states). Run 'npm run test' to verify.

2. Build Budget Schemas & Server Actions:
   - src/types/budget.types.ts (Zod validation for BudgetItemInput and PaymentMilestoneInput).
   - src/actions/budget-actions.ts (createBudgetItemWithMilestonesAction, payMilestoneAction, uploadReceiptAction with audit logging).

3. Create Financial UI Components:
   - src/components/shared/badges/due-date-badge.tsx (Dynamic status badge using semantic colors).
   - src/components/modules/budget/milestone-timeline.tsx (Milestone history, payer tags: groom/bride/joint, receipt viewer).
   - src/components/modules/budget/budget-form-modal.tsx (Form with dynamic multiple milestone rows).
   - src/app/(dashboard)/dashboard/[weddingId]/budget/page.tsx (Universal data table with category filters and KPI cards).

Ensure strict budget isolation between Groom and Bride sides.

================================================================================


Prompt Fase 5: Vendor Directory & Instant Physical S3 Cleanup
Plaintext
Act as a Senior Fullstack Engineer following AGENT_RULES.md, docs/schema.md, and docs/sdd.md.

Task: Execute Phase 5 from DEVELOPMENT_PLAN.md:
1. Build WhatsApp Sanitizer Utility & Tests:
   - src/lib/utils/wa-sanitizer.ts (sanitizePhoneNumber and buildWhatsAppDirectLink).
   - tests/unit/wa-sanitizer.test.ts (Vitest tests for 08..., 62..., +62... numbers and variable tag replacements). Run 'npm run test'.

2. Create Vendor Server Actions:
   - src/actions/vendor-actions.ts (CRUD vendors, upload contracts to R2, delete vendor with simultaneous physical R2 file deletion hook via cleanup-helper).

3. Build Vendor UI Components:
   - src/components/shared/whatsapp/phone-input.tsx (Auto-sanitizing phone input).
   - src/components/shared/whatsapp/wa-button.tsx (1-click direct WhatsApp redirect button).
   - src/app/(dashboard)/dashboard/[weddingId]/vendors/page.tsx (Vendor cards, contract file lists, and expense linkages).

Verify that deleting a vendor contract physically deletes the corresponding object from Cloudflare R2.

=======================================================================

Prompt Fase 6: Master Guest Pool, Seating Allocation & WhatsApp Blast
Plaintext
Act as a Senior Fullstack Engineer following AGENT_RULES.md, docs/erd.md, and docs/wireframe.md.

Task: Execute Phase 6 from DEVELOPMENT_PLAN.md:
1. Build Guest & Seating Server Actions:
   - src/actions/guest-actions.ts (CRUD master guests, bulk CSV import parser, N:M sub-event assignment).
   - src/actions/seating-actions.ts (CRUD tables, seat assignment, table capacity meter calculation).

2. Create Guest & Seating Modules:
   - src/app/(dashboard)/dashboard/[weddingId]/guests/page.tsx (Universal data table with category badges and WhatsApp action buttons).
   - src/components/modules/guests/csv-import-dialog.tsx (Client-side CSV parsing and batch insert).
   - src/components/shared/whatsapp/wa-blast-modal.tsx (Message template builder with {nama_tamu}, {nomor_meja}, {lokasi_maps}).
   - src/app/(dashboard)/dashboard/[weddingId]/seating/page.tsx (Visual table cards with green <=80%, amber 100%, and red flashing >100% overbooking indicators).

Test bulk importing 500+ guests and verify capacity validation.

===========================================================================================

Prompt Fase 7: Live Rundown, Audio Cues & 1-Click Shift Timeline
Plaintext
Act as a Senior Fullstack Engineer following AGENT_RULES.md, docs/sdd.md, and docs/DESIGN.md.

Task: Execute Phase 7 from DEVELOPMENT_PLAN.md:
1. Implement Shift Timeline Engine & Tests:
   - src/lib/utils/timeline-math.ts (calculateTimelineShift algorithm handling minute shifts across midnight boundaries).
   - tests/unit/timeline-math.test.ts (Vitest tests for +15m, +30m, -10m adjustments). Run 'npm run test'.

2. Build Rundown Server Actions:
   - src/actions/rundown-actions.ts (CRUD rundown items, reorder sort_order, executeShiftTimelineAction with audit logs).

3. Create Rundown UI & Client PDF Export:
   - src/components/modules/rundown/rundown-item-card.tsx (Card with completion toggle, PIC, contingency plan badge).
   - src/components/modules/rundown/timeline-shift-modal.tsx (1-click time shift dialog).
   - src/components/modules/rundown/audio-cues-drawer.tsx (Technical sound/mic/lighting cue instructions).
   - src/components/shared/pdf/rundown-pdf-template.tsx (Client-side PDF rendering using @react-pdf/renderer).
   - src/app/(dashboard)/dashboard/[weddingId]/rundown/page.tsx.

Verify that shifting an item at order 3 recalculates all subsequent items without mutating earlier items.

============================================================================================

Prompt Fase 8: Mobile Public Token View, PIN Security & Realtime Check-in
Plaintext
Act as a Senior Fullstack Engineer following AGENT_RULES.md, docs/sdd.md, and docs/api-spec.md.

Task: Execute Phase 8 from DEVELOPMENT_PLAN.md:
1. Implement PIN Security & Server-Side Rate Limiter:
   - src/lib/utils/rate-limiter.ts (In-memory IP tracking, lockout after 5 failed attempts for 15 minutes).
   - tests/unit/rate-limiter.test.ts (Vitest tests for rate limit thresholds).
   - src/app/api/token/verify/route.ts (Bcrypt PIN verification, rate limiter check, token_session cookie setter).

2. Build Realtime Hooks & Public PWA Views:
   - src/hooks/use-realtime-checkin.ts (Supabase WebSocket channel subscription on 'event_guest_assignments').
   - src/hooks/use-realtime-rundown.ts (Supabase WebSocket channel subscription on 'rundowns').
   - src/app/view/[token]/layout.tsx (Mobile-first layout, PIN protection gate modal with 44px touch targets).
   - src/app/view/[token]/page.tsx (Field crew mobile dashboard).
   - src/app/view/[token]/checkin/page.tsx (Live search, toggle check-in, anti double-claim souvenir claim, emergency '+ Tamu Walk-in' modal).
   - src/app/view/[token]/rundown/page.tsx (Mobile live rundown checklist).

Verify real-time check-in synchronization between two separate browser windows in <250ms.

=============================================================================================


Prompt Fase 9: Offline Resiliency (Dexie.js), Gift Log & Self-Service ZIP Exporter
Plaintext
Act as a Senior Fullstack Engineer following AGENT_RULES.md, docs/sdd.md, and docs/api-spec.md.

Task: Execute Phase 9 from DEVELOPMENT_PLAN.md:
1. Implement Offline Caching & Sync Engine:
   - src/lib/db/dexie-offline.ts (Dexie.js IndexedDB schema for rundowns, checkins, and mutationQueue).
   - src/hooks/use-offline-sync.ts (Online event listener flushing mutation queue via Last-Write-Wins).

2. Build Gifts Log & Audit Trail Pages:
   - src/app/(dashboard)/dashboard/[weddingId]/gifts/page.tsx (Internal cash/item gift logger).
   - src/app/(dashboard)/dashboard/[weddingId]/audit-logs/page.tsx (Audit trail timeline table).

3. Create Data Lifecycle Route Handlers:
   - src/app/api/user/export-archive/route.ts (Streams a complete .zip archive containing /csv/ tables and /documents/ fetched from Cloudflare R2).
   - src/app/api/user/delete-account/route.ts (Permanent GDPR self-deletion for workspace and R2 storage).

Simulate offline mode in DevTools, perform a check-in, reconnect, and verify automated mutation flushing.

==========================================================================================


Prompt Fase 10: Server Deployment & Automation Setup (aaPanel, PM2 & Backup)
Plaintext
Act as a Senior Fullstack Engineer following AGENT_RULES.md and docs/deployment-guide.md.

Task: Execute Phase 10 from DEVELOPMENT_PLAN.md:
1. Create Production Server Configurations:
   - ecosystem.config.js (PM2 cluster mode configuration matching deployment-guide.md).
   - .env.example (Minimalist environment configuration).

2. Implement Automated Encrypted Backup Engine:
   - src/app/api/admin/backup/trigger/route.ts (Executes pg_dump stream, gzip compression, AES-256-CBC encryption via BACKUP_ENCRYPTION_SECRET, and uploads to R2 /backups/).
   - src/app/api/admin/backup/restore/route.ts (Restore verification helper).
   - src/app/(admin)/admin/backups/page.tsx (Backup history table and manual trigger button).

3. Final Quality Audit:
   - Run 'npm run test' (Ensure 100% test pass rate across all unit test suites).
   - Run 'npx tsc --noEmit' (Zero TypeScript errors).
   - Run 'npm run build' (Production bundle compiled cleanly).

Provide the final aaPanel Nginx WebSocket reverse proxy snippet and deployment checklist.
Jalankan prompt Fase 0 terlebih dahulu di Antigravity untuk mengawali scaffolding dan instalasi basis dependensi.