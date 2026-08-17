# System Architecture Document (SDD - Architecture)

## Project: Wedding & Event Companion SaaS
**Version:** 2.1.0 (Dynamic Config & Multi-Tier RBAC Architecture)  
**Target Server:** aaPanel on Linux (Ubuntu 22.04 LTS / Debian 12)  
**Core Runtime:** Node.js v20+ LTS (Next.js 14+ App Router via PM2 Cluster / Docker)  
**BaaS Infrastructure:** Supabase (Managed PostgreSQL 15+, GoTrue Auth, Realtime CDC)  
**Storage Layer:** Cloudflare R2 (S3-Compatible Dynamic Bucket)

---

## 1. High-Level Architecture Topology

Sistem mengadopsi pola **Modular Hybrid Monolith with Dynamic Edge BaaS**. Next.js menangani perenderan UI (Server Components & SSR), Route Handlers, dan Server Actions, sementara Supabase dan Cloudflare R2 menangani persistensi data, autentikasi, serta penyimpanan berkas secara terdistribusi.

```text
+---------------------------------------------------------------------------------------------------+
|                                          CLIENT LAYER                                             |
|  +---------------------------+  +-------------------------------+  +---------------------------+  |
|  | Superadmin Portal         |  | Bride & Groom Dashboard       |  | Public Token View (PWA)   |  |
|  | (Dynamic R2, RBAC, Backup)|  | (Budget, Vendors, Rundown)    |  | (Desk Check-in, Crew Live)|  |
|  +---------------------------+  +-------------------------------+  +---------------------------+  |
+-------------------------------------------------|-------------------------------------------------+
                                                  | HTTPS (443) / WSS (WebSockets)
+-------------------------------------------------v-------------------------------------------------+
|                                 EDGE & REVERSE PROXY LAYER (aaPanel)                              |
|  +---------------------------------------------------------------------------------------------+  |
|  | Nginx 1.24+ (Reverse Proxy, SSL Termination, HTTP/2, WebSocket Upgrade Proxy, Gzip/Brotli) |  |
|  | Rate Limiter Shield (IP-based Protection for Token PIN Verification)                        |  |
|  +---------------------------------------------------------------------------------------------+  |
+-------------------------------------------------|-------------------------------------------------+
                                                  | Localhost Proxy (Port 3000)
+-------------------------------------------------v-------------------------------------------------+
|                                APPLICATION RUNTIME LAYER (Next.js 14+)                            |
|  +---------------------------------------------------------------------------------------------+  |
|  | - Next.js Middleware (Supabase JWT Session & Rate Limit Filter)                            |  |
|  | - React Server Components (RSC) for Fast Initial Paint (<1.2s LCP)                         |  |
|  | - Server Actions with PostgreSQL Row Level Security (RLS) & Audit Logging                   |  |
|  | - Route Handlers: Dynamic Storage Presign, ZIP Exporter Stream, Backup Recovery            |  |
|  | - Dynamic System Config Provider (In-Memory Cached R2 Credentials from PostgreSQL)         |  |
|  +---------------------------------------------------------------------------------------------+  |
+--------------------------------+--------------------------------+---------------------------------+
                                 |                                |
        SQL Connections /        |                                | AWS S3 SDK v3 Direct Calls /
        Supabase Realtime (WSS)  |                                | Presigned PUT URLs
                                 |                                |
+--------------------------------v---------------+  +-------------v---------------------------------+
|             SUPABASE BaaS PLATFORM             |  |               CLOUDFLARE R2                   |
|  +------------------------------------------+  |  |  +-----------------------------------------+  |
|  | PostgreSQL 15+ (100% UUID-based Schema)  |  |  |  | Dynamic Bucket Storage (Config via DB)  |  |
|  | - Row Level Security (Multi-Tenant RLS)  |  |  |  | - Vendor Contracts & Invoices           |  |
|  | - Audit Trail Mutex Triggers             |  |  |  | - Payment Transfer Receipts             |  |
|  | GoTrue Auth (Google OAuth & Email/Pass)  |  |  |  | - Encrypted DB Dumps (/backups/*.sql.gz)|  |
|  | Realtime Engine (Postgres CDC WebSockets)|  |  |  | - Direct Browser WebP/PDF Uploads        |  |
|  +------------------------------------------+  |  |  +-----------------------------------------+  |
+------------------------------------------------+  +-----------------------------------------------+
2. Dynamic Configuration & Minimal .env ArchitectureUntuk memastikan kemudahan pemeliharaan dan menghindari restart/rebuild server saat mengganti kredensial, variabel lingkungan dipisahkan secara tegas:2.1 Minimalist Static .env (Hard Infrastructure Bootstrap)Hanya menyimpan variabel dasar yang diperlukan agar Next.js dan Supabase dapat melakukan koneksi awal:DATABASE_URL / NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEYSUPABASE_SERVICE_ROLE_KEYSESSION_SECRET / CRON_SECRET2.2 Dynamic Database Settings (system_settings Table)Kredensial pihak ketiga dan kebijakan operasional disimpan di PostgreSQL dalam bentuk JSONB terenkripsi dan di-cache di memori Next.js (dengan TTL 60 detik atau revalidasi manual saat disimpan):Cloudflare R2 Credentials: account_id, access_key_id, secret_access_key, bucket_name, public_cdn_domain.Storage Rules: Batas ukuran gambar/PDF (MB), whitelist MIME types, rasio kompresi WebP client-side.Auto-Backup Policies: Cron schedule, status aktif, algoritma enkripsi (aes-256-cbc), retensi cadangan.Master RBAC Templates: Standar izin default global untuk role wo, family_committee, dan public_token.Plaintext[Superadmin UI] ---> (Update R2 Secret Key) ---> [PostgreSQL: system_settings]
                                                          |
                                           [Trigger Next.js Cache Revalidation]
                                                          |
                                                          v
                                     [Next.js Server: S3 Client Dynamically Re-instantiated]
3. Security, Multi-Tenant Data Isolation & RBAC Engine3.1 Multi-Tenant Data Isolation (Row Level Security)Semua entitas data bisnis wajib memiliki kolom relasi wedding_id UUID. Kernel PostgreSQL memvalidasi setiap query melalui kebijakan RLS:User terautentikasi dievaluasi terhadap weddings.created_by (Owner).Jika bukan Owner, dievaluasi terhadap wedding_collaborators berdasarkan user_id dan wedding_id.Khusus modul sensitif (Budget & Milestones), RLS memeriksa field custom_permissions->>'budget' milik kolaborator terkait.3.2 Dynamic Multi-Tier RBAC ArchitecturePlaintext                          +------------------------------------+
                          |       SUPERADMIN CONTROL           |
                          | (Global Role Template Definitions) |
                          +-----------------+------------------+
                                            |
                                            | Sets Default Permissions
                                            v
                          +------------------------------------+
                          |        OWNER (BRIDE & GROOM)       |
                          |  - Invites Collaborators           |
                          |  - Custom Permission Overrides     |
                          |    {"budget": false, "guest": true}|
                          +-----------------+------------------+
                                            |
                                            | Evaluated at Runtime
                                            v
+-----------------------------------------------------------------------------------------------+
|                                      ACCESS EVALUATION                                        |
|  1. Is Superadmin?       ---> Bypass RLS (Read-Only Troubleshooting Mode)                     |
|  2. Is Wedding Owner?    ---> Full CRUD Access                                                |
|  3. Is Collaborator?     ---> Custom Permission JSONB Matrix Check                            |
|  4. Is Public Token?     ---> Check `shareable_tokens.module_access` & PIN Session Cookie     |
+-----------------------------------------------------------------------------------------------+
3.3 Public Token & PIN Security ShieldStateless Encrypted Cookie: Setelah PIN 4–6 digit diverifikasi di /api/token/verify, server menetapkan cookie token_session_<hash> yang dienkripsi dengan masa berlaku sesi 24 jam.Server-Side Rate Limiter: Middleware Next.js melacak kegagalan verifikasi PIN berdasarkan IP klien. Jika terjadi $\ge 5$ kegagalan dalam rentang waktu 15 menit, request dari IP tersebut langsung diblokir (HTTP 429 Too Many Requests).4. Media Processing & Cloudflare R2 Storage Pipeline4.1 Client-Side Optimization & Direct Presigned PUT FlowUntuk menjaga performa CPU dan bandwidth server aaPanel, proses kompresi gambar dan upload dokumen dilakukan sepenuhnya di browser klien:Plaintext[Client Browser]
      |
      | 1. User selects image (e.g. invoice.jpg, 4.5 MB)
      v
[Client-side Compressor Engine]
      | - browser-image-compression converts to .webp (e.g. 380 KB)
      | - Validates size against dynamic limit from system_settings
      v
[Request Presigned URL] ---> POST /api/storage/presign (Sends MIME, size, file_name)
                                        |
                                        | Next.js generates S3 Presigned URL (AWS SDK v3)
                                        | Expiry: 300 seconds
                                        v
[Direct HTTP PUT] ---------> [Cloudflare R2 Bucket]
                                        |
                                        v (200 OK)
[Postgres Metadata Save] <-- [Server Action: insertPaymentAttachment(r2_key, size, mime)]
4.2 Instant Physical File Deletion PipelineKetika pengguna menghapus dokumen vendor atau bukti transfer dari UI:Server Action mengeksekusi penghapusan metadata baris di PostgreSQL (payment_attachments / vendor_documents).Server Action langsung memanggil perintah DeleteObjectCommand ke Cloudflare R2 menggunakan S3 Client terkonfigurasi secara serentak (mencegah penumpukan berkas sampah / orphaned files).5. Real-Time Synchronization & Offline Resiliency (PWA)5.1 Realtime Communication Matrix (Supabase Realtime CDC)Realtime Topic ChannelTarget TableTarget Kolom / FilterTarget Penerima & Aksirealtime:rundown:{event_id}rundownsis_completed, sort_order, time_startLive Rundown Viewers (HP Panitia & Laptop WO)realtime:checkin:{event_id}event_guest_assignmentsattendance_status, souvenir_receivedMeja Registrasi (Sinkronisasi status hadir & souvenir instan)realtime:timeline-shift:{event_id}rundownstime_start, time_endSeluruh kru lapangan (Jadwal tergeser otomatis)5.2 Offline Architecture (Dexie.js / IndexedDB)Plaintext                     +---------------------------------------+
                     |         Frontend Component Layer      |
                     +-------------------+-------------------+
                                         |
                                         v
                     +---------------------------------------+
                     |     Offline Engine (Dexie.js DB)      |
                     |  - Table: local_rundowns              |
                     |  - Table: local_guest_assignments     |
                     |  - Table: mutation_sync_queue         |
                     +-------------------+-------------------+
                                         |
                       +-----------------+-----------------+
                       |                                   |
                [Device ONLINE]                     [Device OFFLINE]
                       |                                   |
             Direct Sync with Supabase           Store mutation with local
             PostgreSQL via Server Actions       timestamp into syncQueue
                       ^                                   |
                       |                                   |
                       +------ [Network Reconnected] <-----+
                               (Flush Queue via Last-Write-Wins)
6. Automated Backup, Encryption & Disaster Recovery ArchitecturePlaintext[aaPanel Cron / Superadmin Manual Trigger]
                    |
                    v
    POST /api/admin/backup/trigger (Bearer CRON_SECRET)
                    |
                    | 1. Stream pg_dump from Supabase PostgreSQL
                    v
         [In-Memory Stream Pipe]
                    |
                    | 2. Gzip Compression (zlib stream)
                    | 3. AES-256-CBC Encryption via Master Backup Key
                    v
      [Encrypted Stream: backup-YYYYMMDD-HHmmss.sql.gz]
                    |
                    | 4. Upload to Cloudflare R2 (/backups/...)
                    v
           [Cloudflare R2 Bucket]
                    |
                    | 5. Insert Log to PostgreSQL `system_backups`
                    v
    [Superadmin Backup History Dashboard]
6.1 Disaster Recovery & Restoration FlowSuperadmin memilih snapshot cadangan pada UI atau mengunduh langsung dari Cloudflare R2.File didekripsi menggunakan openssl/AES-256 dan di-unzip.PostgreSQL memulihkan skema dan data melalui utilitas standard psql.7. Performance & Export Architecture7.1 Client-Side PDF Generation EngineDokumen PDF untuk Rundown Acara, Lembar Check-in Meja, dan Seating Cards dirender langsung di browser pengguna menggunakan @react-pdf/renderer tanpa membebani CPU atau RAM server aaPanel.7.2 Self-Service ZIP Archive Streaming ExporterPlaintext[User Client] ---> GET /api/user/export-archive?wedding_id=UUID
                            |
            +---------------+---------------+
            |                               |
    1. Fetch Table Rows (CSV)       2. Fetch S3 Documents (R2)
       - guests.csv                    - Invoices / Proofs
       - budget.csv                    - Vendor Contracts
       - rundown.csv
            |                               |
            +---------------+---------------+
                            |
                            v
       [Node.js Archiver Stream Pipe (zip format)]
                            |
                            v
       [Stream Direct HTTP Response to User Browser]