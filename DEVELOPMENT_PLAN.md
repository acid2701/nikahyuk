# Step-by-Step Master Development Plan (Phase 0 - Phase 10)

## Project: Wedding & Event Companion SaaS
**Execution Engine:** Antigravity Autonomous Agent  
**Testing Framework:** Vitest (Unit Testing Core Algorithms)  
**Reference Docs:** `prd.md`, `architecture.md`, `erd.md`, `schema.md`, `sdd.md`, `structure.md`, `api-spec.md`, `wireframe.md`, `skill.md`, `deployment-guide.md`, `DESIGN.md`

---

## Phase 0: Project Scaffolding, Design Tokens & Base Primitives

### Objective
Menginisialisasi repositori Next.js 14, mengonfigurasi Tailwind CSS sesuai `DESIGN.md`, memasang seluruh dependensi produksi & testing, serta men-generate seluruh komponen dasar `shadcn/ui`.

### Tasks & File Creation
1. **Dependencies Installation:**
   ```bash
   npm i @supabase/supabase-js @supabase/ssr @aws-sdk/client-s3 @aws-sdk/s3-request-presigner @tanstack/react-table dexie lucide-react react-hook-form @hookform/resolvers zod bcryptjs browser-image-compression @react-pdf/renderer archiver csv-stringify
   npm i -D vitest @vitejs/plugin-react jsdom @types/bcryptjs @types/archiver
Design Tokens & Theme Configuration:

src/app/globals.css: Terapkan variabel warna HSL (:root dan .dark) dari DESIGN.md.

tailwind.config.ts: Konfigurasi mapping warna, border radius (--radius), font families (Playfair Display, Plus Jakarta Sans).

Generate Complete shadcn/ui Components:

src/components/ui/button.tsx

src/components/ui/input.tsx

src/components/ui/dialog.tsx

src/components/ui/dropdown-menu.tsx

src/components/ui/table.tsx

src/components/ui/badge.tsx

src/components/ui/card.tsx

src/components/ui/toast.tsx & use-toast.ts

src/components/ui/tabs.tsx

src/components/ui/select.tsx

src/components/ui/switch.tsx

Testing Setup:

vitest.config.ts: Konfigurasi test environment jsdom dan path alias @/*.

Acceptance Criteria
npm run build berjalan tanpa error.

npm run test (Vitest) dapat dieksekusi.

Variabel CSS tema DESIGN.md aktif pada komponen Button dan Card.

Phase 1: Supabase SSR Setup, Database Invariants & Authentication Flow
Objective
Membangun klien Supabase SSR (Server, Client, Middleware), memverifikasi koneksi database dengan RLS, serta membuat alur login Google OAuth & Email/Password.

Tasks & File Creation
Supabase Helper Clients:

src/lib/supabase/client.ts: Browser client via createBrowserClient.

src/lib/supabase/server.ts: Server Actions / RSC client via createServerClient dengan cookie store handling.

src/lib/supabase/middleware.ts: Refresh session token & header injection.

src/middleware.ts: Proteksi rute ((dashboard), (admin), view/[token]).

TypeScript Database Types:

src/types/database.types.ts: Interface lengkap 23 tabel PostgreSQL dari schema.md.

Auth Pages & Handlers:

src/app/(auth)/login/page.tsx: Form login email + tombol Google One-Tap.

src/app/(auth)/register/page.tsx: Form registrasi calon pengantin.

src/app/(auth)/auth-callback/route.ts: Exchange auth code ke session token.

Acceptance Criteria
User dapat mendaftar dan login via email/password maupun Google.

Middleware berhasil me-redirect user yang belum login dari /dashboard/* ke /login.

RLS Supabase aktif dan mengisolasi data antar akun.

Phase 2: Dynamic Superadmin Infrastructure Panel & Cloudflare R2 Pipeline
Objective
Membangun panel superadmin untuk menyimpan kredensial Cloudflare R2 secara dinamis di PostgreSQL (system_settings) dan menyediakan pipeline upload direct S3 presigned URL.

Tasks & File Creation
Dynamic Config & Storage Engine:

src/lib/cloudflare-r2/dynamic-config.ts: In-memory cached S3 client instance dari sdd.md.

src/lib/cloudflare-r2/presign-helper.ts: Generator PUT Presigned URLs (expiry 300 detik).

src/lib/cloudflare-r2/cleanup-helper.ts: Handler DeleteObjectCommand untuk pembersihan fisik.

Superadmin Route Handlers:

src/app/api/admin/settings/route.ts: Endpoint PUT untuk update kredensial R2 & aturan storage.

src/app/api/storage/presign/route.ts: Endpoint validasi ukuran & MIME type + generator presigned URL.

src/app/api/storage/delete/route.ts: Endpoint penghapusan fisik file R2.

Superadmin UI Components:

src/app/(admin)/admin/storage-config/page.tsx: Form input kredensial R2 & storage limits.

src/app/(admin)/admin/rbac-templates/page.tsx: Editor template hak akses default global.

Media Uploader Shared Component:

src/components/shared/media-uploader/dropzone.tsx: Integrasi kompresi client-side .webp via browser-image-compression.

Acceptance Criteria
Superadmin dapat mengubah kredensial R2 di database tanpa me-restart server Next.js.

Komponen dropzone berhasil mengompresi gambar di browser dan mengunggah langsung ke bucket R2 via Presigned URL.

Penghapusan file memicu DeleteObjectCommand ke R2 secara instan.

Phase 3: Multi-Event Workspace, Top Header Event Switcher & Collaborative RBAC
Objective
Menyediakan pengelolaan sub-event tak terbatas (Lamaran, Pengajian, Akad, Resepsi Pria/Wanita), komponen universal <EventSwitcher/>, delegasi izin kolaborator, dan injeksi Starter Presets.

Tasks & File Creation
Workspace & Event Actions:

src/actions/wedding-actions.ts: Buat workspace, undang kolaborator, set permission overrides.

src/actions/event-actions.ts: CRUD sub-event (tanggal, jam, lokasi maps, side ownership).

UI Navigation Components:

src/components/shared/navigation/event-switcher.tsx: Dropdown universal switcher context acara.

src/components/shared/navigation/app-sidebar.tsx: Sidebar responsif dengan QRIS Tip Jar di footer.

src/components/shared/navigation/dashboard-header.tsx: Header breadcrumbs & profil.

Collaborators & RBAC UI:

src/app/(dashboard)/dashboard/[weddingId]/settings/collaborators/page.tsx

src/components/modules/settings/collaborator-permission-form.tsx: Switch toggle per modul.

Starter Presets Engine:

src/types/presets.types.ts: Master data preset Rundown, Budget, & WhatsApp Blast.

src/components/modules/rundown/rundown-preset-dialog.tsx: Dialog injeksi template bawaan.

Acceptance Criteria
Mengganti acara di <EventSwitcher/> mengubah parameter konteks data di seluruh layar secara instan.

Kolaborator dengan izin budget: false tidak dapat melihat data bujet pada UI maupun query database (RLS enforced).

Phase 4: Financial Core (Multiple Payment Milestones & Dynamic Due-Date Tracker)
Objective
Membangun modul manajemen bujet dengan pemisahan mutlak per pihak keluarga, multi-termin pembayaran (milestones), pelacak jatuh tempo dinamis, dan unit test logika bisnis.

Tasks & File Creation
Financial Domain Logic & Unit Tests:

src/lib/utils/due-date-evaluator.ts: Algoritma evaluatePaymentDueDate dari sdd.md.

tests/unit/due-date-evaluator.test.ts: Test suite Vitest untuk status Lunas, Overdue H+, Warning H-, dan Neutral.

Server Actions & Schemas:

src/types/budget.types.ts & Zod Schemas.

src/actions/budget-actions.ts: createBudgetItemWithMilestonesAction, payMilestoneAction.

Financial UI Components:

src/components/shared/badges/due-date-badge.tsx: Dynamic status badge dari DESIGN.md.

src/components/modules/budget/milestone-timeline.tsx: Visualisasi riwayat termin & bukti bayar R2.

src/components/modules/budget/budget-form-modal.tsx: Modal input pos bujet & multi-termin.

src/app/(dashboard)/dashboard/[weddingId]/budget/page.tsx: Master data table anggaran.

Acceptance Criteria
npm run test meloloskan seluruh skenario due-date-evaluator.test.ts.

Pengguna dapat menambah pos bujet dengan 3+ termin pembayaran berbeda dan mengunggah bukti transfer ke R2.

Pemisahan biaya Groom, Bride, dan Joint terisolasi rapi.

Phase 5: Vendor Directory & Instant Physical S3 Cleanup
Objective
Membangun direktori vendor pernikahan, penyimpanan kontrak/MoU di Cloudflare R2, dan generator tautan langsung WhatsApp yang ter-sanitasi.

Tasks & File Creation
WhatsApp Sanitizer Utility & Unit Tests:

src/lib/utils/wa-sanitizer.ts: Fungsi sanitizePhoneNumber & buildWhatsAppDirectLink.

tests/unit/wa-sanitizer.test.ts: Test suite format nomor 08..., 62..., +62..., dan tag variabel.

Vendor Server Actions:

src/actions/vendor-actions.ts: CRUD Vendor + Instant physical file deletion hook.

Vendor UI Components:

src/components/shared/whatsapp/phone-input.tsx: Input nomor HP dengan auto-prefix.

src/components/shared/whatsapp/wa-button.tsx: Tombol direct chat WhatsApp.

src/app/(dashboard)/dashboard/[weddingId]/vendors/page.tsx: Direktori vendor & card view.

Acceptance Criteria
Seluruh test di wa-sanitizer.test.ts lulus 100%.

Menghapus vendor/dokumen dari UI langsung memusnahkan file fisiknya di bucket Cloudflare R2.

Tombol WhatsApp langsung membuka aplikasi WA dengan nomor terformat 628....

Phase 6: Master Guest Pool, Seating Allocation & WhatsApp Blast Engine
Objective
Mengelola database tamu global, penugasan kursi/meja (seating chart), indikator overbooking, serta generator pesan blast WhatsApp dengan variabel dinamis.

Tasks & File Creation
Guest & Seating Actions:

src/actions/guest-actions.ts: Bulk import CSV, CRUD tamu master, assign sub-event.

src/actions/seating-actions.ts: Manajemen meja dan kalkulasi kapasitas kursi.

UI Modules:

src/app/(dashboard)/dashboard/[weddingId]/guests/page.tsx: Universal Data Table untuk daftar tamu.

src/components/modules/guests/csv-import-dialog.tsx: Parser CSV client-side.

src/components/shared/whatsapp/wa-blast-modal.tsx: Generator link WA dengan tag {nama_tamu}, {nomor_meja}, {lokasi_maps}.

src/app/(dashboard)/dashboard/[weddingId]/seating/page.tsx: Visual meja dengan status meter (<80%, 100%, Overbooked >100%).

Acceptance Criteria
Impor CSV 500+ tamu berhasil dalam <2 detik.

Alokasi tamu ke meja yang melebihi kapasitas memunculkan visual alert Overbooked (Merah).

Pesan WhatsApp Blast menghasilkan URL yang memuat variabel personal tamu secara akurat.

Phase 7: Live Collaborative Rundown, Audio Cues & 1-Click Shift Timeline Engine
Objective
Membangun rundown per menit, drawer aba-aba teknis (sound/mic/lighting cues), contingency plan, mesin hitung pergeseran waktu (Shift Timeline), dan ekspor PDF client-side.

Tasks & File Creation
Shift Timeline Algorithm & Unit Tests:

src/lib/utils/timeline-math.ts: Algoritma calculateTimelineShift dari sdd.md.

tests/unit/timeline-math.test.ts: Test suite penambahan menit (+15m, +30m, batas tengah malam).

Rundown Server Actions:

src/actions/rundown-actions.ts: CRUD rundown, reorder, dan eksekusi shift timeline.

Rundown UI & PDF Components:

src/components/modules/rundown/rundown-item-card.tsx: Card sesi dengan status selesai & cues.

src/components/modules/rundown/timeline-shift-modal.tsx: Dialog 1-klik geser waktu.

src/components/modules/rundown/audio-cues-drawer.tsx: Detail instruksi sound/mic/lighting.

src/components/shared/pdf/rundown-pdf-template.tsx: Generator PDF client-side @react-pdf/renderer.

src/app/(dashboard)/dashboard/[weddingId]/rundown/page.tsx: Workspace rundown interaktif.

Acceptance Criteria
Seluruh skenario di timeline-math.test.ts lulus tanpa kegagalan.

Menekan tombol Shift +15 menit menghitung ulang seluruh jam sesi berikutnya secara presisi.

Ekspor PDF dapat diunduh langsung dari browser tanpa membebani server.

Phase 8: Mobile Public Token View (/view/[token]), PIN Security & Realtime Check-in
Objective
Membangun tampilan mobile panitia lapangan dengan proteksi PIN 4–6 digit, server-side rate limiter, dan sinkronisasi real-time check-in & souvenir via WebSocket CDC (<250ms).

Tasks & File Creation
PIN Security & Rate Limiter:

src/lib/utils/rate-limiter.ts: In-memory IP tracking dari sdd.md.

tests/unit/rate-limiter.test.ts: Test suite blokir IP setelah 5 kesalahan selama 15 menit.

src/app/api/token/verify/route.ts: Endpoint verifikasi PIN & penerbit cookie sesi token.

Public Token Pages & Realtime Hooks:

src/hooks/use-realtime-checkin.ts: Supabase channel subscription pada event_guest_assignments.

src/hooks/use-realtime-rundown.ts: Supabase channel subscription pada rundowns.

src/app/view/[token]/layout.tsx: Layout mobile PWA & PIN gate blocker.

src/app/view/[token]/page.tsx: Dashboard ringkas panitia lapangan.

src/app/view/[token]/checkin/page.tsx: Meja registrasi live + tombol + Tamu Walk-in.

src/app/view/[token]/rundown/page.tsx: Live rundown mobile view dengan checklist toggle.

Acceptance Criteria
Membuka /view/[token] di 2 tab browser berbeda: mencentang check-in di tab 1 langsung memperbarui tab 2 secara real-time dalam <250ms.

Status klaim souvenir terkunci instan dan stok berkurang otomatis (anti double-claim).

Salah memasukkan PIN 5 kali memblokir akses IP selama 15 menit (HTTP 429).

Phase 9: Offline Resiliency (Dexie.js), Gift Log & Self-Service ZIP Exporter
Objective
Mengimplementasikan penyimpanan lokal IndexedDB (Dexie.js) untuk skenario gedung tanpa sinyal, log kado/angpao fisik, streaming ekspor ZIP, dan self-deletion akun GDPR.

Tasks & File Creation
Offline Store & Sync Engine:

src/lib/db/dexie-offline.ts: Skema IndexedDB dari sdd.md.

src/hooks/use-offline-sync.ts: Event listener online & batch mutation queue flusher.

Gifts Log Module:

src/app/(dashboard)/dashboard/[weddingId]/gifts/page.tsx: Pencatatan amplop & kado fisik pasca-acara.

Data Lifecycle Route Handlers:

src/app/api/user/export-archive/route.ts: Streamer ZIP (CSV tables + R2 documents) via archiver.

src/app/api/user/delete-account/route.ts: Penghapusan permanen seluruh data dan akun.

Audit Trail View:

src/app/(dashboard)/dashboard/[weddingId]/audit-logs/page.tsx: Tabel riwayat perubahan data.

Acceptance Criteria
Saat mode offline disimulasikan di DevTools, panitia tetap dapat melakukan check-in; data tersimpan di IndexedDB dan tersinkronisasi otomatis saat online (Last-Write-Wins).

Tombol Export Archive menghasilkan 1 file .zip yang berisi folder /csv/ dan folder /documents/ fisik.

Fitur Delete Account memusnahkan seluruh data tanpa sisa di PostgreSQL dan Cloudflare R2.

Phase 10: Server Deployment & Automation Setup (aaPanel, PM2, Cron & Backup)
Objective
Menyiapkan konfigurasi deployment ke server aaPanel, reverse proxy Nginx dengan WebSocket support, Let's Encrypt SSL, dan cron auto-backup terenkripsi AES-256 ke Cloudflare R2.

Tasks & File Creation
Server Configurations:

ecosystem.config.js: PM2 cluster mode configuration dari deployment-guide.md.

.env.example & .env.production: Minimalist environment variables.

Encrypted Backup Engine:

src/app/api/admin/backup/trigger/route.ts: Dump, gzip, AES-256 encrypt & upload to R2.

src/app/api/admin/backup/restore/route.ts: Helper verifikasi dekripsi snapshot.

src/app/(admin)/admin/backups/page.tsx: Riwayat file cadangan & tombol manual trigger.

Acceptance Criteria
Build produksi Next.js berjalan mulus dengan output standalone/PM2 cluster.

Trigger backup manual menghasilkan file backup-YYYYMMDD.sql.gz terenkripsi di bucket Cloudflare R2 dan tercatat di tabel system_backups.

Konfigurasi Nginx mendukung koneksi persisten WebSockets untuk Supabase Realtime.