# API Specifications & Realtime Contracts Document

## Project: Wedding & Event Companion SaaS
**Version:** 2.1.0 (Dynamic Config & Multi-Tier RBAC Architecture)  
**Base Protocol:** REST (Next.js 14+ Route Handlers) + WebSocket CDC (Supabase Realtime)  
**Security Standard:** JWT Bearer (Supabase Auth), Encrypted Session Cookies, Server-side Rate Limiting

---

## 1. Authentication & Security Middleware Contract

Semua endpoint private divalidasi oleh `src/middleware.ts`:
* **User Endpoint:** Memeriksa JWT Supabase Auth pada secure HTTP-only cookies.
* **Superadmin Endpoint:** Memvalidasi claim `app_metadata.role === 'superadmin'`.
* **Public Token Endpoint (`/api/token/*`):** Dilindungi oleh Server-Side In-Memory Rate Limiter (IP-based, maksimal 5 percobaan gagal per 15 menit).

---

## 2. Superadmin Infrastructure & Dynamic Config APIs

### 2.1 Update Dynamic Cloudflare R2 Credentials
Menyimpan atau memperbarui kredensial Cloudflare R2 secara dinamis di database tanpa perlu me-restart server.

* **Endpoint:** `PUT /api/admin/settings`
* **Auth:** Superadmin Only
* **Request Headers:** `Content-Type: application/json`
* **Request Body:**
```json
{
  "setting_key": "r2_credentials",
  "setting_value": {
    "accountId": "a9d76e48bc309f984210a761e2f1d931",
    "accessKeyId": "e1f98bc430d8924b11f0a",
    "secretAccessKey": "78201bfd9284102948bcda819203918239012390481",
    "bucketName": "wedding-saas-production",
    "publicCdnDomain": "[https://assets.yourweddingdomain.com](https://assets.yourweddingdomain.com)"
  }
}
Success Response (200 OK):

JSON
{
  "success": true,
  "message": "Konfigurasi Cloudflare R2 berhasil diperbarui dan cache telah di-invalidasi."
}
Error Response (400 / 403):

JSON
{
  "success": false,
  "error": "Akses ditolak: Hanya superadmin yang memiliki wewenang mengubah kredensial R2."
}
2.2 Update Storage Rules & Client Compression Policy
Mengubah batas maksimal ukuran upload dan whitelist format file.

Endpoint: PUT /api/admin/settings

Auth: Superadmin Only

Request Body:

JSON
{
  "setting_key": "storage_rules",
  "setting_value": {
    "maxImageSizeMb": 5,
    "maxPdfSizeMb": 15,
    "targetImageFormat": "webp",
    "imageQualityRatio": 0.8,
    "allowedMimeTypes": [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf"
    ]
  }
}
Success Response (200 OK):

JSON
{
  "success": true,
  "message": "Aturan storage dan kompresi berhasil diperbarui."
}
2.3 Trigger Encrypted Database Backup
Mengeksekusi pg_dump stream, mengompresi, mengenkripsi dengan AES-256-CBC, lalu menyimpannya ke folder /backups/ di Cloudflare R2.

Endpoint: POST /api/admin/backup/trigger

Auth: Superadmin JWT atau Authorization: Bearer <CRON_SECRET>

Request Body:

JSON
{
  "backup_type": "manual" // "manual" | "scheduled"
}
Success Response (200 OK):

JSON
{
  "success": true,
  "data": {
    "backup_id": "c7a8e2b9-1f4a-4c28-98e6-e91b2c4e6a8d",
    "file_name": "backup-2026-08-17-133000.sql.gz",
    "r2_file_key": "backups/backup-2026-08-17-133000.sql.gz",
    "file_size_bytes": 4829104,
    "encryption_algo": "aes-256-cbc",
    "status": "success",
    "created_at": "2026-08-17T13:30:00.000Z"
  }
}
3. Storage Direct Upload & Instant Cleanup APIs (Cloudflare R2)
3.1 Generate Presigned PUT URL
Memvalidasi request terhadap aturan storage_rules yang aktif, lalu menghasilkan URL presigned S3 (masa berlaku 5 menit).

Endpoint: POST /api/storage/presign

Auth: User / Collaborator

Request Body:

JSON
{
  "wedding_id": "8e3b1c4e-5a2d-4f9b-8e1c-7a9d2f4b6e8a",
  "folder": "invoices", // "invoices" | "contracts" | "proofs"
  "file_name": "dp1-katering-berkah.webp",
  "file_size_bytes": 482910,
  "mime_type": "image/webp"
}
Success Response (200 OK):

JSON
{
  "success": true,
  "data": {
    "upload_url": "[https://a9d76e48bc309f984210a761e2f1d931.r2.cloudflarestorage.com/wedding-saas-production/invoices/8e3b1c4e/d3b07384.webp?X-Amz-Signature=](https://a9d76e48bc309f984210a761e2f1d931.r2.cloudflarestorage.com/wedding-saas-production/invoices/8e3b1c4e/d3b07384.webp?X-Amz-Signature=)...",
    "r2_file_key": "invoices/8e3b1c4e/d3b07384.webp",
    "expires_in_seconds": 300
  }
}
Error Response (400 Bad Request):

JSON
{
  "success": false,
  "error": "Ukuran file (6.2 MB) melebihi batas maksimal yang diizinkan (5 MB)."
}
3.2 Instant Physical File Deletion
Menghapus file fisik di Cloudflare R2 secara instan saat entitas lampiran dihapus di UI.

Endpoint: POST /api/storage/delete

Auth: Owner / Authorized Collaborator

Request Body:

JSON
{
  "wedding_id": "8e3b1c4e-5a2d-4f9b-8e1c-7a9d2f4b6e8a",
  "r2_file_key": "invoices/8e3b1c4e/d3b07384.webp"
}
Success Response (200 OK):

JSON
{
  "success": true,
  "message": "File fisik berhasil dihapus dari Cloudflare R2."
}
4. Public Token Verification & Security APIs
4.1 Verify Public Token PIN
Memvalidasi PIN 4–6 digit untuk akses tautan panitia publik /view/[token] dengan pelindung anti brute-force.

Endpoint: POST /api/token/verify

Auth: Public (Rate-limited)

Request Body:

JSON
{
  "token_hash": "e9b2c4a8f1d7463098e6a1b2c4e6a8d7",
  "pin": "123456"
}
Success Response (200 OK):

Response Header: Set-Cookie: token_session_e9b2c4a8f1...=<signed_jwt>; Path=/view; HttpOnly; SameSite=Strict; Secure; Max-Age=86400

JSON
{
  "success": true,
  "message": "PIN valid. Akses diberikan.",
  "module_access": {
    "rundown": true,
    "checkin": true,
    "guest_list": true,
    "hide_internal_notes": true
  }
}
Error Response (429 Too Many Requests):

JSON
{
  "success": false,
  "error": "Terlalu banyak percobaan PIN yang salah. Akses dari IP Anda diblokir sementara selama 15 menit.",
  "retry_after_seconds": 900
}
5. Account Lifecycle & Data Export APIs
5.1 Self-Service Full ZIP Archive Exporter
Mengompilasi seluruh tabel database user ke dalam file-file CSV, mengunduh seluruh file fisik dari Cloudflare R2, dan men-stream-nya langsung ke browser dalam format .zip.

Endpoint: GET /api/user/export-archive

Auth: Owner Only

Query Params: ?wedding_id=8e3b1c4e-5a2d-4f9b-8e1c-7a9d2f4b6e8a

Response Headers:

Content-Type: application/zip

Content-Disposition: attachment; filename="wedding-archive-8e3b1c4e.zip"

Payload Content:

/csv/guests.csv

/csv/budget.csv

/csv/milestones.csv

/csv/rundown.csv

/csv/vendors.csv

/csv/gifts.csv

/documents/invoices/*

/documents/contracts/*

5.2 Permanent Account Self-Deletion
Menghapus seluruh rekaman workspace, collaborators, relasi multi-event, berkas Cloudflare R2, dan kredensial auth pengguna secara permanen.

Endpoint: DELETE /api/user/delete-account

Auth: Owner Only

Request Body:

JSON
{
  "wedding_id": "8e3b1c4e-5a2d-4f9b-8e1c-7a9d2f4b6e8a",
  "confirmation_phrase": "HAPUS PERMANEN"
}
Success Response (200 OK):

JSON
{
  "success": true,
  "message": "Seluruh data pernikahan dan akun berhasil dimusnahkan secara permanen."
}
6. Supabase Realtime Channels & WebSocket Payloads
6.1 Live Rundown Channel (realtime:rundown:{event_id})
Topic: postgres_changes

Event: UPDATE

Target Table: rundowns

Payload Structure:

JSON
{
  "schema": "public",
  "table": "rundowns",
  "commit_timestamp": "2026-08-17T13:30:15.120Z",
  "eventType": "UPDATE",
  "new": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "event_id": "8e3b1c4e-5a2d-4f9b-8e1c-7a9d2f4b6e8a",
    "time_start": "09:30:00",
    "time_end": "10:15:00",
    "activity_title": "Ijab Kabul & Doa Bersama",
    "pic_name": "Penghulu KUA & MC Dimas",
    "is_completed": true,
    "sort_order": 3
  },
  "old": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "is_completed": false
  }
}
6.2 Realtime Check-in & Souvenir Channel (realtime:checkin:{event_id})
Topic: postgres_changes

Event: UPDATE

Target Table: event_guest_assignments

Payload Structure:

JSON
{
  "schema": "public",
  "table": "event_guest_assignments",
  "commit_timestamp": "2026-08-17T13:30:22.450Z",
  "eventType": "UPDATE",
  "new": {
    "id": "2b9a7c1e-8d4f-4e3a-b1c2-9e8a7b6c5d4e",
    "event_id": "8e3b1c4e-5a2d-4f9b-8e1c-7a9d2f4b6e8a",
    "guest_id": "1c3e5a7b-9d2f-4b6e-8a0c-2b4d6f8a0c2e",
    "table_id": "4f8a0c2e-2b4d-4e3a-b1c2-1c3e5a7b9d2f",
    "actual_pax": 2,
    "attendance_status": "checked_in",
    "souvenir_received": true,
    "checkin_timestamp": "2026-08-17T13:30:22.000Z"
  },
  "old": {
    "id": "2b9a7c1e-8d4f-4e3a-b1c2-9e8a7b6c5d4e",
    "attendance_status": "pending",
    "souvenir_received": false
  }
}