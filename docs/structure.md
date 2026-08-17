# Project Directory Structure & Hierarchy Document

## Project: Wedding & Event Companion SaaS
**Version:** 2.1.0 (Dynamic Config & Multi-Tier RBAC Architecture)  
**Framework:** Next.js 14+ (App Router with TypeScript Strict Mode)  
**UI Engine:** Tailwind CSS + shadcn/ui (Radix UI Primitives)

---

## 1. Complete Project File Tree

```text
wedding-saas/
├── .env.example
├── .env.local
├── .eslintrc.json
├── .gitignore
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── ecosystem.config.js
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   └── 20260101000000_initial_schema.sql
│   └── seed.sql
├── public/
│   ├── icons/
│   │   ├── icon-192x192.png
│   │   └── icon-512x512.png
│   ├── images/
│   │   └── qris-static.png
│   ├── manifest.json
│   └── robots.txt
└── src/
    ├── middleware.ts
    ├── app/
    │   ├── layout.tsx
    │   ├── globals.css
    │   ├── not-found.tsx
    │   ├── error.tsx
    │   ├── loading.tsx
    │   ├── (auth)/
    │   │   ├── layout.tsx
    │   │   ├── login/
    │   │   │   └── page.tsx
    │   │   ├── register/
    │   │   │   └── page.tsx
    │   │   └── auth-callback/
    │   │       └── route.ts
    │   ├── (admin)/
    │   │   ├── admin/
    │   │   │   ├── layout.tsx
    │   │   │   ├── page.tsx
    │   │   │   ├── storage-config/
    │   │   │   │   └── page.tsx
    │   │   │   ├── rbac-templates/
    │   │   │   │   └── page.tsx
    │   │   │   ├── backups/
    │   │   │   │   └── page.tsx
    │   │   │   └── users/
    │   │   │       └── page.tsx
    │   ├── (dashboard)/
    │   │   ├── dashboard/
    │   │   │   ├── layout.tsx
    │   │   │   ├── page.tsx
    │   │   │   ├── [weddingId]/
    │   │   │   │   ├── layout.tsx
    │   │   │   │   ├── overview/
    │   │   │   │   │   └── page.tsx
    │   │   │   │   ├── events/
    │   │   │   │   │   └── page.tsx
    │   │   │   │   ├── budget/
    │   │   │   │   │   └── page.tsx
    │   │   │   │   ├── vendors/
    │   │   │   │   │   └── page.tsx
    │   │   │   │   ├── guests/
    │   │   │   │   │   └── page.tsx
    │   │   │   │   ├── seating/
    │   │   │   │   │   └── page.tsx
    │   │   │   │   ├── rundown/
    │   │   │   │   │   └── page.tsx
    │   │   │   │   ├── checkin/
    │   │   │   │   │   └── page.tsx
    │   │   │   │   ├── gifts/
    │   │   │   │   │   └── page.tsx
    │   │   │   │   ├── audit-logs/
    │   │   │   │   │   └── page.tsx
    │   │   │   │   └── settings/
    │   │   │   │       ├── collaborators/
    │   │   │   │       │   └── page.tsx
    │   │   │   │       ├── tokens/
    │   │   │   │       │   └── page.tsx
    │   │   │   │       └── export-delete/
    │   │   │   │           └── page.tsx
    │   ├── view/
    │   │   └── [token]/
    │   │       ├── layout.tsx
    │   │       ├── page.tsx
    │   │       ├── rundown/
    │   │       │   └── page.tsx
    │   │       └── checkin/
    │   │           └── page.tsx
    │   └── api/
    │       ├── storage/
    │       │   ├── presign/
    │       │   │   └── route.ts
    │       │   └── delete/
    │       │       └── route.ts
    │       ├── token/
    │       │   └── verify/
    │       │       └── route.ts
    │       ├── admin/
    │       │   ├── settings/
    │       │   │   └── route.ts
    │       │   ├── backup/
    │       │   │   ├── trigger/
    │       │   │   │   └── route.ts
    │       │   │   └── restore/
    │       │   │       └── route.ts
    │       │   └── rbac/
    │       │       └── route.ts
    │       └── user/
    │           ├── export-archive/
    │           │   └── route.ts
    │           └── delete-account/
    │               └── route.ts
    ├── components/
    │   ├── ui/
    │   │   ├── button.tsx
    │   │   ├── input.tsx
    │   │   ├── dialog.tsx
    │   │   ├── dropdown-menu.tsx
    │   │   ├── table.tsx
    │   │   ├── badge.tsx
    │   │   ├── card.tsx
    │   │   ├── toast.tsx
    │   │   ├── tabs.tsx
    │   │   ├── select.tsx
    │   │   └── switch.tsx
    │   ├── shared/
    │   │   ├── data-table/
    │   │   │   ├── data-table.tsx
    │   │   │   ├── data-table-pagination.tsx
    │   │   │   ├── data-table-toolbar.tsx
    │   │   │   └── data-table-column-header.tsx
    │   │   ├── media-uploader/
    │   │   │   ├── dropzone.tsx
    │   │   │   ├── file-preview.tsx
    │   │   │   └── upload-progress.tsx
    │   │   ├── whatsapp/
    │   │   │   ├── phone-input.tsx
    │   │   │   ├── wa-blast-modal.tsx
    │   │   │   └── wa-button.tsx
    │   │   ├── realtime/
    │   │   │   ├── live-checkin-toggle.tsx
    │   │   │   ├── live-status-pill.tsx
    │   │   │   └── live-presence-indicator.tsx
    │   │   ├── badges/
    │   │   │   ├── status-badge.tsx
    │   │   │   └── due-date-badge.tsx
    │   │   ├── navigation/
    │   │   │   ├── event-switcher.tsx
    │   │   │   ├── app-sidebar.tsx
    │   │   │   └── dashboard-header.tsx
    │   │   ├── guards/
    │   │   │   └── permission-gate.tsx
    │   │   ├── cards/
    │   │   │   ├── metric-card.tsx
    │   │   │   └── progress-counter.tsx
    │   │   ├── auth/
    │   │   │   └── pin-gate-modal.tsx
    │   │   ├── widgets/
    │   │   │   └── donation-widget.tsx
    │   │   └── pdf/
    │   │       ├── rundown-pdf-template.tsx
    │   │       ├── guest-list-pdf-template.tsx
    │   │       └── seating-table-pdf-template.tsx
    │   └── modules/
    │       ├── admin/
    │       │   ├── r2-credentials-form.tsx
    │       │   ├── storage-rules-form.tsx
    │       │   ├── rbac-template-editor.tsx
    │       │   └── backup-history-table.tsx
    │       ├── budget/
    │       │   ├── milestone-timeline.tsx
    │       │   ├── budget-form-modal.tsx
    │       │   ├── milestone-payment-modal.tsx
    │       │   └── budget-preset-dialog.tsx
    │       ├── rundown/
    │       │   ├── rundown-item-card.tsx
    │       │   ├── timeline-shift-modal.tsx
    │       │   ├── audio-cues-drawer.tsx
    │       │   ├── contingency-plan-badge.tsx
    │       │   └── rundown-preset-dialog.tsx
    │       ├── guests/
    │       │   ├── guest-form-modal.tsx
    │       │   ├── walkin-guest-modal.tsx
    │       │   └── csv-import-dialog.tsx
    │       ├── seating/
    │       │   ├── table-card.tsx
    │       │   └── seat-assign-modal.tsx
    │       └── settings/
    │           ├── collaborator-invite-modal.tsx
    │           ├── collaborator-permission-form.tsx
    │           └── token-generator-modal.tsx
    ├── actions/
    │   ├── wedding-actions.ts
    │   ├── event-actions.ts
    │   ├── budget-actions.ts
    │   ├── vendor-actions.ts
    │   ├── guest-actions.ts
    │   ├── seating-actions.ts
    │   ├── rundown-actions.ts
    │   ├── checkin-actions.ts
    │   ├── souvenir-actions.ts
    │   ├── token-actions.ts
    │   └── admin-actions.ts
    ├── hooks/
    │   ├── use-realtime-rundown.ts
    │   ├── use-realtime-checkin.ts
    │   ├── use-offline-sync.ts
    │   ├── use-permission.ts
    │   └── use-toast-feedback.ts
    ├── lib/
    │   ├── supabase/
    │   │   ├── client.ts
    │   │   ├── server.ts
    │   │   └── middleware.ts
    │   ├── cloudflare-r2/
    │   │   ├── dynamic-config.ts
    │   │   ├── presign-helper.ts
    │   │   └── cleanup-helper.ts
    │   ├── db/
    │   │   └── dexie-offline.ts
    │   ├── utils/
    │   │   ├── currency-formatter.ts
    │   │   ├── date-formatter.ts
    │   │   ├── wa-sanitizer.ts
    │   │   ├── timeline-math.ts
    │   │   ├── zip-builder.ts
    │   │   └── rate-limiter.ts
    │   └── audit/
    │       └── logger.ts
    └── types/
        ├── database.types.ts
        ├── permissions.types.ts
        ├── components.types.ts
        ├── storage.types.ts
        └── presets.types.ts
2. Server Action Responsibilities & Separation of ConcernsAction FileModul / Cakupan BisnisLog Audit Terpasangadmin-actions.tsUpdate kredensial R2, update aturan storage, modifikasi template RBAC global, trigger manual database backupYa (System Settings)wedding-actions.tsPembuatan workspace baru, invite kolaborator, update permission overrides per user, hapus workspaceYa (Workspace)event-actions.tsCRUD sub-event (Lamaran, Akad, Resepsi, etc.), update tanggal & lokasi, ganti side ownershipYa (Events)budget-actions.tsCRUD pos anggaran, tambah/bayar termin (milestones), upload bukti transfer, terapkan preset budgetYa (Budget)vendor-actions.tsTambah/edit vendor, upload MoU/kontrak, eksekusi pembersihan fisik berkas di Cloudflare R2Ya (Vendors)guest-actions.tsCRUD master tamu pool, assign ke sub-event, bulk import CSV, generate blast WA linksYa (Guests)seating-actions.tsTambah/edit meja, alokasi kursi tamu, validasi kapasitas mejaYa (Seating)rundown-actions.tsTambah susunan acara, urutkan ulang, eksekusi Shift Timeline, kelola technical cuesYa (Rundown)checkin-actions.tsToggle hadir tamu, toggle status souvenir, tambah cepat tamu walk-in mendadakYa (Checkin)token-actions.tsGenerate token sharing, atur PIN (bcrypt), update visibilitas granular modul, revoke tokenYa (Tokens)3. Database Seeders (supabase/seed.sql)File ini dieksekusi saat inisialisasi database untuk memuat aturan default Superadmin, master template RBAC, dan starter presets:SQL-- 1. Inisialisasi Konfigurasi Sistem Superadmin
INSERT INTO system_settings (key, value)
VALUES 
(
  'storage_rules', 
  '{
    "max_image_size_mb": 5,
    "max_pdf_size_mb": 15,
    "target_image_format": "webp",
    "image_quality_ratio": 0.8,
    "allowed_mime_types": [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf"
    ]
  }'::jsonb
),
(
  'backup_policy',
  '{
    "enabled": true,
    "cron_expression": "0 2 * * *",
    "retention_days": 30,
    "encryption_algo": "aes-256-cbc"
  }'::jsonb
);

-- 2. Master Global Role Templates (Superadmin Defaults)
INSERT INTO global_role_templates (role_name, default_permissions)
VALUES
(
  'wo',
  '{
    "budget": false,
    "vendor": true,
    "rundown": true,
    "guest": true,
    "seating": true,
    "checkin": true,
    "gift_log": false
  }'::jsonb
),
(
  'family_committee',
  '{
    "budget": false,
    "vendor": false,
    "rundown": true,
    "guest": true,
    "seating": false,
    "checkin": false,
    "gift_log": false
  }'::jsonb
),
(
  'desk_registrar',
  '{
    "budget": false,
    "vendor": false,
    "rundown": false,
    "guest": true,
    "seating": true,
    "checkin": true,
    "gift_log": false
  }'::jsonb
);