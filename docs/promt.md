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




lanjutan


Prompt Fase 0 (Verifikasi Scaffolding & Root Layout)
Plaintext
Act as a Senior Fullstack Engineer following AGENT_RULES.md and docs/DESIGN.md.

Task: Finalize Base Foundation & Root Layout
1. Verify Dependencies & UI Primitives:
   - Ensure all shadcn primitives exist in src/components/ui/ (button, input, dialog, dropdown-menu, table, badge, card, toast, use-toast, tabs, select, switch).
   - Verify vitest.config.ts is working.

2. Root Theme & Layout (src/app/layout.tsx & src/app/page.tsx):
   - Configure src/app/layout.tsx with Google Fonts: 'Playfair Display' (serif display) and 'Plus Jakarta Sans' (sans body). Include the Toaster provider.
   - Update src/app/globals.css with HSL color tokens from docs/DESIGN.md.
   - Implement src/app/page.tsx: Check active session; if authenticated, redirect to /dashboard; if not, redirect to /login.

Run 'npm run build' and ensure zero compile errors.
Prompt Fase 1 (Supabase SSR Auth, Middleware & Session Context)
Plaintext
Act as a Senior Fullstack Engineer following AGENT_RULES.md, docs/schema.md, and docs/api-spec.md.

Task: Implement Supabase SSR Auth & Route Protection
1. SSR Helpers in src/lib/supabase/:
   - client.ts: createBrowserClient.
   - server.ts: createServerClient with next/headers cookies() handling.
   - middleware.ts: getUser() session refresh helper.
   - src/middleware.ts: Protect '/dashboard/:path*', '/admin/:path*', and '/view/:path*'. Superadmin check on user.app_metadata.role === 'superadmin'.

2. Strict TypeScript Definitions:
   - src/types/database.types.ts: Complete types for all 23 database tables, enums (user_role_enum, event_side_enum, attendance_status_enum, payment_status_enum, cue_type_enum, gift_type_enum, action_type_enum), and JSONB structures.

3. Authentication UI & Handlers:
   - src/app/(auth)/layout.tsx: Elegant split layout with brand slogan and decorative background.
   - src/app/(auth)/login/page.tsx: Email/Password login + Google OAuth button with error alerts.
   - src/app/(auth)/register/page.tsx: Registration with instant auto-redirect.
   - src/app/(auth)/auth-callback/route.ts: Exchange OAuth code for session token.

Verify login and registration flows in the browser.
Prompt Fase 2 (Dynamic Superadmin Panel & Cloudflare R2 Engine)
Plaintext
Act as a Senior Fullstack Engineer following AGENT_RULES.md, docs/architecture.md, and docs/sdd.md.

Task: Build Dynamic Storage Engine & Admin Panel
1. Dynamic Config & S3Client Singleton:
   - src/lib/cloudflare-r2/dynamic-config.ts: In-memory cached S3Client reading credentials from PostgreSQL 'system_settings' table (fallback to safe mock if unconfigured). Cache invalidator function included.
   - src/lib/cloudflare-r2/presign-helper.ts: Presigned PUT URL generator (300s expiry).
   - src/lib/cloudflare-r2/cleanup-helper.ts: Direct R2 DeleteObjectCommand handler.

2. Superadmin API & UI:
   - src/app/api/admin/settings/route.ts (GET & PUT handlers for R2 credentials & file size limits).
   - src/app/api/storage/presign/route.ts & src/app/api/storage/delete/route.ts.
   - src/app/(admin)/layout.tsx & src/app/(admin)/admin/storage-config/page.tsx (Form to input R2 Account ID, Access Key, Secret Key, and Bucket Name).
   - src/app/(admin)/admin/rbac-templates/page.tsx (Global default role permissions editor).
   - src/components/shared/media-uploader/dropzone.tsx (Client-side WebP compression via browser-image-compression + direct R2 upload).

Verify superadmin can save credentials and dropzone compresses images before upload.
Prompt Fase 3 (Multi-Event Workspace, Top Bar Switcher & Dynamic RBAC)
Plaintext
Act as a Senior Fullstack Engineer following AGENT_RULES.md, docs/erd.md, and docs/DESIGN.md.

Task: Implement Multi-Event Workspace & Navigation
1. Core Actions & Audit Logger:
   - src/lib/audit/logger.ts: recordAuditLog(weddingId, actionType, moduleName, diff).
   - src/actions/wedding-actions.ts: Create wedding workspace (auto slug generation), invite collaborator, and update custom permissions.
   - src/actions/event-actions.ts: CRUD sub-events (Lamaran, Pengajian, Siraman, Midodareni, Akad, Resepsi) with event_side assignment.

2. Navigation & Layout Components:
   - src/components/shared/navigation/event-switcher.tsx: Dropdown selector in top header to switch active sub-event context.
   - src/components/shared/navigation/app-sidebar.tsx: Responsive desktop/mobile sidebar with KlikQRIS donation card.
   - src/components/shared/navigation/dashboard-header.tsx: Breadcrumbs, quick event switch, user avatar menu.
   - src/app/(dashboard)/layout.tsx: Shell layout with sidebar, header, and active wedding context provider.
   - src/app/(dashboard)/dashboard/page.tsx: Workspace selector + 'Buat Acara Baru' onboarding modal.

3. Collaborators & Starter Presets:
   - src/app/(dashboard)/dashboard/[weddingId]/settings/collaborators/page.tsx (Granular permission switch toggles).
   - src/types/presets.types.ts & src/components/modules/rundown/rundown-preset-dialog.tsx (Inject customizable default rundown/budget templates).

Ensure switching sub-events in the header updates the active state globally.
Prompt Fase 4 (Financial Hub, Multi-Milestone Installments & Due-Date Tracker)
Plaintext
Act as a Senior Fullstack Engineer following AGENT_RULES.md, docs/sdd.md, and docs/DESIGN.md.

Task: Build Complete Budgeting & Milestones Module
1. Domain Logic & Unit Tests:
   - src/lib/utils/due-date-evaluator.ts: evaluatePaymentDueDate(status, dueDate, alertDaysBefore) logic from sdd.md.
   - tests/unit/due-date-evaluator.test.ts: Vitest tests for PAID, OVERDUE (H+X), WARNING (H-X), and NEUTRAL states. Run 'npm run test'.

2. Server Actions:
   - src/types/budget.types.ts: Zod schemas for budget items and multiple payment milestones.
   - src/actions/budget-actions.ts: createBudgetItemWithMilestonesAction, payMilestoneAction, and updateBudgetItemAction with revalidatePath.

3. Budgeting UI:
   - src/components/shared/badges/due-date-badge.tsx: Semantic status badge from DESIGN.md.
   - src/components/modules/budget/milestone-timeline.tsx: Installment progress, payer side indicator (Groom/Bride/Joint), receipt upload modal.
   - src/components/modules/budget/budget-form-modal.tsx: Dynamic installment adder form.
   - src/app/(dashboard)/dashboard/[weddingId]/budget/page.tsx: KPI cards (Total Budget, Paid, Remaining, Overdue), side filter tabs, and budget item list.

Verify that Groom and Bride expenses calculate separately and total up accurately.
Prompt Fase 5 (Vendor Directory, Direct WhatsApp & S3 Physical Cleanup)
Plaintext
Act as a Senior Fullstack Engineer following AGENT_RULES.md, docs/schema.md, and docs/sdd.md.

Task: Build Vendor Directory & Contract Hub
1. WhatsApp Sanitizer & Unit Tests:
   - src/lib/utils/wa-sanitizer.ts: sanitizePhoneNumber('08...' -> '628...') and buildWhatsAppDirectLink.
   - tests/unit/wa-sanitizer.test.ts: Vitest unit tests for phone formatting and URL encoding. Run 'npm run test'.

2. Vendor Server Actions:
   - src/actions/vendor-actions.ts: CRUD vendors, attach contracts via Presigned URL, and delete vendor with direct physical file deletion on Cloudflare R2.

3. Vendor UI Components:
   - src/components/shared/whatsapp/phone-input.tsx: Phone input with automatic Indonesian prefix.
   - src/components/shared/whatsapp/wa-button.tsx: 1-click WhatsApp redirect button.
   - src/app/(dashboard)/dashboard/[weddingId]/vendors/page.tsx: Vendor cards categorized by service, contract attachments viewer, and budget linkage.

Test adding a vendor with contract upload and verify physical R2 deletion on delete.
Prompt Fase 6 (Master Guest Pool, Seating Allocation & WhatsApp Blast Engine)
Plaintext
Act as a Senior Fullstack Engineer following AGENT_RULES.md, docs/erd.md, and docs/wireframe.md.

Task: Build Guest Management, Seating Chart & WhatsApp Blast
1. Guest & Seating Server Actions:
   - src/actions/guest-actions.ts: Master guest CRUD, client-side CSV bulk parser, and sub-event assignment.
   - src/actions/seating-actions.ts: Table management, seat assignments, and seat capacity meter.

2. Guest & Seating UI:
   - src/app/(dashboard)/dashboard/[weddingId]/guests/page.tsx: TanStack Table guest pool with category badges, RSVP status, and single-click WA invite button.
   - src/components/modules/guests/csv-import-dialog.tsx: Fast CSV parser handling 500+ guests.
   - src/components/shared/whatsapp/wa-blast-modal.tsx: Template message builder replacing {nama_tamu}, {nomor_meja}, {lokasi_maps}.
   - src/app/(dashboard)/dashboard/[weddingId]/seating/page.tsx: Visual seating layout cards with capacity meter (Green <=80%, Amber 100%, Red Pulsing >100% Overbooked).

Verify bulk CSV import and table overbooking visual indicator.
Prompt Fase 7 (Live Rundown, Technical Cues & 1-Click Shift Timeline)
Plaintext
Act as a Senior Fullstack Engineer following AGENT_RULES.md, docs/sdd.md, and docs/DESIGN.md.

Task: Build Live Rundown & Shift Timeline Engine
1. Shift Timeline Math & Unit Tests:
   - src/lib/utils/timeline-math.ts: calculateTimelineShift(items, startIndex, deltaMinutes) handling minute math across midnight.
   - tests/unit/timeline-math.test.ts: Vitest unit tests for +15m, +30m, -10m adjustments. Run 'npm run test'.

2. Rundown Server Actions:
   - src/actions/rundown-actions.ts: CRUD rundown items, reorder sort_order, and executeShiftTimelineAction with audit logging.

3. Rundown UI & Client PDF Export:
   - src/components/modules/rundown/rundown-item-card.tsx: Session card with completion checklist, PIC, and contingency badge.
   - src/components/modules/rundown/timeline-shift-modal.tsx: 1-click timeline shift dialog.
   - src/components/modules/rundown/audio-cues-drawer.tsx: Technical audio/lighting/mic cues drawer.
   - src/components/shared/pdf/rundown-pdf-template.tsx: Client-side PDF export using @react-pdf/renderer.
   - src/app/(dashboard)/dashboard/[weddingId]/rundown/page.tsx: Interactive rundown workspace.

Verify that shifting an item recalculates subsequent items without affecting previous items.
Prompt Fase 8 (Mobile Public Token View, PIN Security & Realtime Check-in Desk)
Plaintext
Act as a Senior Fullstack Engineer following AGENT_RULES.md, docs/sdd.md, and docs/api-spec.md.

Task: Build Public Field Crew Mobile PWA & Realtime Check-in
1. PIN Security & Rate Limiter:
   - src/lib/utils/rate-limiter.ts: In-memory IP tracking (lockout after 5 failed attempts for 15 minutes).
   - tests/unit/rate-limiter.test.ts: Vitest tests for rate limit thresholds. Run 'npm run test'.
   - src/app/api/token/verify/route.ts: Verify bcrypt PIN and issue signed token_session cookie.

2. Realtime Subscriptions & Mobile UI:
   - src/hooks/use-realtime-checkin.ts: Supabase WebSocket subscription on 'event_guest_assignments'.
   - src/hooks/use-realtime-rundown.ts: Supabase WebSocket subscription on 'rundowns'.
   - src/app/view/[token]/layout.tsx: Mobile PWA layout with PIN lockscreen gate (min 44px touch targets).
   - src/app/view/[token]/page.tsx: Mobile field crew hub.
   - src/app/view/[token]/checkin/page.tsx: Realtime check-in desk, anti double-claim souvenir tracker, and '+ Tamu Walk-in' modal.
   - src/app/view/[token]/rundown/page.tsx: Mobile live rundown checklist.

Verify check-in updates synchronize across two separate browser windows in under 250ms.
Prompt Fase 9 (Offline Resiliency Dexie.js, Gift Logs & Self-Service ZIP Exporter)
Plaintext
Act as a Senior Fullstack Engineer following AGENT_RULES.md, docs/sdd.md, and docs/api-spec.md.

Task: Build Offline Resiliency, Gifts Log & Data Lifecycle
1. Offline IndexedDB & Sync Engine:
   - src/lib/db/dexie-offline.ts: Dexie.js schema for offline checkins and mutationQueue.
   - src/hooks/use-offline-sync.ts: Online event listener flushing mutation queue via Last-Write-Wins.

2. Gifts Log & Audit Trail:
   - src/app/(dashboard)/dashboard/[weddingId]/gifts/page.tsx: Cash & physical gift logger with Groom/Bride side attribution.
   - src/app/(dashboard)/dashboard/[weddingId]/audit-logs/page.tsx: Audit history timeline.

3. Data Lifecycle Route Handlers:
   - src/app/api/user/export-archive/route.ts: Stream a complete .zip archive containing /csv/ tables and /documents/ fetched from Cloudflare R2 using archiver.
   - src/app/api/user/delete-account/route.ts: GDPR permanent deletion of all wedding data and physical R2 files.

Simulate offline mode in DevTools, toggle check-in, reconnect, and verify auto-sync to Supabase.
Prompt Fase 10 (Production Build Verification & Server Deployment Setup)
Plaintext
Act as a Senior Fullstack Engineer following AGENT_RULES.md and docs/deployment-guide.md.

Task: Final Quality Audit & Production Deployment Setup
1. Production Server Configs:
   - ecosystem.config.js: PM2 cluster mode configuration matching deployment-guide.md.
   - .env.example: Complete reference environment configuration.

2. Automated Encrypted Backup:
   - src/app/api/admin/backup/trigger/route.ts: Database dump stream, gzip compression, AES-256-CBC encryption via BACKUP_ENCRYPTION_SECRET, and upload to R2 /backups/.
   - src/app/(admin)/admin/backups/page.tsx: Backup history table with manual trigger button.

3. Final Verification:
   - Run 'npm run test' (Ensure 100% pass rate).
   - Run 'npx tsc --noEmit' (Zero TypeScript errors).
   - Run 'npm run build' (Clean production build).