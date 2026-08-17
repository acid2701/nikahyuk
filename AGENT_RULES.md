
# Antigravity AI Agent Guardrails & Operational Directives

## Project: Wedding & Event Companion SaaS
**Role:** Autonomous Senior Fullstack Engineer (Next.js 14 App Router, TypeScript, Supabase, Tailwind, shadcn/ui)  
**Execution Context:** Direct file creation, modification, and CLI execution.

---

## 1. Absolute Directives & Guardrails (DO NOT BREAK)

1. **Strict Architecture Conformity:**
   * Jangan pernah mengubah skema tabel, nama kolom, atau enum yang telah didefinisikan di `schema.md` dan `erd.md`. Semua primary key dan foreign key wajib berformat UUID (`gen_random_uuid()`).
   * Jangan pernah menyimpan kredensial Cloudflare R2 (`ACCOUNT_ID`, `ACCESS_KEY`, `SECRET_KEY`, `BUCKET_NAME`) di dalam `.env`. Semua kredensial R2 harus dibaca secara dinamis dari database via `src/lib/cloudflare-r2/dynamic-config.ts` sesuai rancangan di `architecture.md` dan `sdd.md`.
2. **Strict File Routing & Server Components:**
   * Semua halaman di `src/app/` adalah Server Components (RSC) secara default.
   * Gunakan directive `'use client'` hanya pada *leaf components* yang membutuhkan browser API (Dexie.js, IndexedDB), event handler DOM, atau hook React/WebSocket Realtime.
3. **No Placeholders or Truncated Code:**
   * Jangan pernah menulis kode dengan komentar pemalas seperti `// TODO: implement later`, `// ... rest of the code`, atau `// add fields here`.
   * Seluruh kode yang dibuat harus utuh (*production-ready*), tervalidasi tipe (*strict TypeScript*), dan memiliki error handling eksplisit.
4. **Audit Trail Mutex:**
   * Setiap Server Action yang melakukan mutasi data (CREATE, UPDATE, DELETE, SHIFT_TIMELINE) wajib memanggil helper `recordAuditLog()` dari `src/lib/audit/logger.ts`.
5. **Direct S3 Presigned Protocol:**
   * Pengunggahan berkas media (bukti transfer, kontrak vendor) tidak boleh melewati payload body server Next.js. Selalu gunakan flow Presigned PUT URL ke Cloudflare R2 dengan kompresi `.webp` di sisi browser klien.
6. **Physical S3 Cleanup Hook:**
   * Penghapusan metadata file vendor/invoice di database wajib diiringi pemanggilan `DeleteObjectCommand` langsung ke Cloudflare R2.

---

## 2. Design & UI/UX Standards (Follow `DESIGN.md`)

* **Color Tokens:** Gunakan token CSS HSL (`bg-primary`, `text-primary-foreground`, `bg-card`, `border-border`, dll.). Jangan gunakan *arbitrary hex colors* sembarangan.
* **Component Primitives:** Gunakan komponen `shadcn/ui` yang diletakkan di `@/components/ui/*`.
* **Mobile Field Ergonomics:** Khusus untuk tampilan `/view/[token]/*`, pastikan touch target minimal **$44\text{px} \times 44\text{px}$** dan gunakan sticky top bar untuk pencarian dan sticky bottom bar untuk navigasi.
* **Indonesian Microcopy:** Ikuti glosarium resmi dari `DESIGN.md` (Akad, Resepsi, Lamaran, Pihak Pria, Pihak Wanita, Tamu Walk-in, Cues, Log Tanda Kasih).

---

## 3. Autonomous Execution Workflow for Antigravity

Saat Anda diminta mengerjakan suatu fase dari `DEVELOPMENT_PLAN.md`:
1. **Read & Check:** Baca referensi dokumen spesifik yang tertera pada fase tersebut.
2. **Execute In Order:** Buat atau modifikasi file sesuai urutan direktori.
3. **Run Typecheck & Tests:** Jalankan `npx tsc --noEmit` dan `npm run test` (Vitest) untuk memvalidasi bahwa tidak ada error tipe data atau logika yang rusak.
4. **Report Completion:** Laporkan file yang telah dibuat beserta status kelulusan acceptance criteria fase tersebut.