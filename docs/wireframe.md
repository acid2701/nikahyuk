# UI/UX Wireframe & Visual Blueprint Document

## Project: Wedding & Event Companion SaaS
**Version:** 2.1.0 (Dynamic Config & Multi-Tier RBAC Architecture)  
**Design System:** Modern Minimalist (Tailwind CSS 3.4+ & shadcn/ui)  
**Target Viewports:** Desktop (1280px+), Tablet (768px - 1024px), Mobile/PWA (360px - 430px)

---

## 1. Global Viewport Matrix & Device Behaviors

| Viewport Category | Resolution Range | Target Persona & Primary Context | Navigation & Layout Paradigm |
| :--- | :--- | :--- | :--- |
| **Desktop / Laptop** | $\ge 1280\text{px}$ | Calon Pengantin (Setup Awal, Master Budget, Seating Map) | Dual Sidebar + Breadcrumbs + Multi-Column Data Grids |
| **Tablet** | $768\text{px} - 1024\text{px}$ | Wedding Organizer / Koordinator Lapangan | Collapsible Sidebar + Compact Data Table + Modal Drawers |
| **Mobile / PWA** | $360\text{px} - 430\text{px}$ | Panitia Registrasi Meja & Tim Rundown Hari-H | Single Column Stack + Sticky Bottom Navigation + Touch Cards |

---

## 2. Layout 1: Couple Dashboard (`/dashboard/[weddingId]/*`)

### 2.1 Desktop Budget & Milestone Management Layout
```text
+-------------------------------------------------------------------------------------------------------------------------+
|  [VowsCompanion Logo]   [ Event Switcher: Akad & Resepsi Pria v ]         [ + Sub-Event ]       (User Profile) (Logout)  |
+---------------------+---------------------------------------------------------------------------------------------------+
|  SIDEBAR            |  BREADCRUMB: Dashboard > Akad Nikah > Budget & Milestones                                         |
|  -----------------  +---------------------------------------------------------------------------------------------------+
|  [>] Ringkasan      |  [ METRIC: Plafon Bujet ]    [ METRIC: Realisasi Bayar ]    [ METRIC: Sisa Termin ]    [ + Pos Baru ]   |
|  [>] Rundown Acara  |  Rp 150.000.000             Rp 95.000.000 (63.3%)         Rp 55.000.000 (3 Termin)                     |
|  [*] Budget & Termin|  -------------------------------------------------------------------------------------------------|
|  [>] Master Tamu    |  [ Search Pos / Vendor... ]  [ Filter Kategori v ]  [ Filter Status v ]      [ Export PDF ] [ + Pos ]   |
|  [>] Seating Chart  |  +---------------------------------------------------------------------------------------------+  |
|  [>] Hub Vendor     |  | Pos Pengeluaran     | Kategori | Estimasi Biaya | Terbayar    | Jatuh Tempo | Status  | Aksi   |  |
|  [>] Meja Registrasi|  |---------------------+----------+----------------+-------------+-------------+---------+--------|  |
|  [>] Souvenir & Gift|  | Gedung & Katering   | Venue    | 80.000.000     | 50.000.000  | H-7 [Kuning]| DP 2    | [Term] |  |
|  [>] Audit Trail    |  | MUA & Busana Akad   | Attire   | 15.000.000     | 15.000.000  | - [Hijau]   | LUNAS   | [Lihat]|  |
|  [>] Pengaturan     |  | Dokumentasi Media   | Media    | 12.000.000     | 4.000.000   | H-3 [Kuning]| DP 1    | [Bayar]|  |
|  -----------------  |  +---------------------------------------------------------------------------------------------+  |
|  [ DUKUNG KAMI <3 ] |                                                                                                   |
|  [ QRIS Static Img ]|                                                                                                   |
|  "Donasi Sukarela"  |                                                                                                   |
+---------------------+---------------------------------------------------------------------------------------------------+
3. Layout 2: Public Mobile View (/view/[token]/*) - Field Crew & Registrars
3.1 Mobile Lock Screen (PIN Security Verification)
Plaintext
+-----------------------------------+
|          [ Wedding Rings ]        |
|                                   |
|       Pernikahan Dimas & Sarah    |
|      Akses Panitia & Koordinator  |
|                                   |
|    Masukkan PIN Akses (6 Digit)   |
|                                   |
|    [ * ] [ * ] [ * ] [ - ] [ - ] [ - ]    |
|                                   |
|   +-----------+-----------+-----------+
|   |     1     |     2     |     3     |
|   +-----------+-----------+-----------+
|   |     4     |     5     |     6     |
|   +-----------+-----------+-----------+
|   |     7     |     8     |     9     |
|   +-----------+-----------+-----------+
|   |   Hapus   |     0     |   Buka    |
|   +-----------+-----------+-----------+
|                                   |
|   (!) Sisa percobaan: 4 kali      |
+-----------------------------------+
3.2 Mobile Live Rundown & 1-Click Shift Timeline View
Plaintext
+-----------------------------------+
| = Akad Nikah (Live Mode)      (i) |
+-----------------------------------+
| Sesi Berjalan: 3 / 6 Selesai (50%)|
| Jam Sekarang : 09:42 WIB          |
|                                   |
| [!] Terlambat 12 Menit            |
| [ + Geser Waktu 15 Menit (Shift) ]|
+-----------------------------------+
| [V] 08:00 - 08:30 (Selesai)       |
|     Kedatangan Keluarga Pria      |
|     PIC: Pakde Joko               |
| --------------------------------- |
| [V] 08:30 - 09:15 (Selesai)       |
|     Prosesi Seserahan & Sambutan  |
|     PIC: MC Dimas                 |
| --------------------------------- |
| [>] 09:15 - 10:00 (SEDANG JALAN)  |
|     Akad Nikah & Ijab Kabul       |
|     PIC: Penghulu KUA & Saksi     |
|     * Cue: Mic 1 MC, Mic 2 Saksi  |
|     * Plan B: Cadangan Mic Kabel  |
|     [ Selesaikan Sesi Ini (V) ]   |
| --------------------------------- |
| [ ] 10:00 - 10:45 (Mendatang)     |
|     Sungkeman & Sesi Foto Inti    |
|     PIC: Tim Fotografer           |
| --------------------------------- |
| [ Bottom Nav: (Rundown) | (Meja) ]|
+-----------------------------------+
3.3 Mobile Desk Check-in & Souvenir Claim (Meja Penerima Tamu)
Plaintext
+-----------------------------------+
| Resepsi Pernikahan - Check-in     |
| [ Cari Nama Tamu / No Meja...   ] |
| [ + Tamu Walk-in (Mendadak) ]     |
+-----------------------------------+
| Kuota Souvenir: 342 / 500 Tersisa |
+-----------------------------------+
| Budi Santoso (VIP - Meja 02)      |
| Pax: 2 Orang | Kategori: Direksi  |
| Kehadiran: [ HADIR (09:45 WIB) ]  |
| Souvenir : [V] Sudah Diambil      |
| --------------------------------- |
| dr. Ratna Wulandari (Meja 08)     |
| Pax: 1 Orang | Kategori: Teman FK |
| Kehadiran: [ Check-In Sekarang ]  |
| Souvenir : [ ] Belum Diambil      |
| --------------------------------- |
| Hendra Wijaya (Meja 05)           |
| Pax: 2 Orang | Kategori: Teman SMA|
| Kehadiran: [ Check-In Sekarang ]  |
| Souvenir : [ ] Belum Diambil      |
+-----------------------------------+
4. Layout 3: Superadmin Control Panel (/admin/*)
Plaintext
+-----------------------------------------------------------------------------------------------------+
|  SUPERADMIN PORTAL                     [ Storage R2 ]  [ Role RBAC ]  [ Backups ]  [ Users ]  (Admin)|
+-----------------------------------------------------------------------------------------------------+
|  KONFIGURASI DINAMIS STORAGE CLOUDFLARE R2 (Tersimpan di Database `system_settings`)               |
|  -------------------------------------------------------------------------------------------------  |
|  Account ID         : [ a9d76e48bc309f984210a761e2f1d931                                      ]    |
|  Access Key ID      : [ e1f98bc430d8924b11f0a                                                 ]    |
|  Secret Access Key  : [ ****************************************************                  ]    |
|  Bucket Name        : [ wedding-saas-production                                               ]    |
|  Public CDN Domain  : [ [https://assets.yourweddingdomain.com](https://assets.yourweddingdomain.com)                                  ]    |
|  Batas Max Gambar   : [  5  ] MB   (Auto-compress to WebP Client-side)                             |
|  Batas Max Dokumen  : [ 15  ] MB   (Auto Stream Check)                                             |
|  [ Simpan Konfigurasi R2 & Invalidate Cache ]                                                       |
|                                                                                                     |
|  PENCADANGAN DATABASE TERENKRIPSI (Supabase -> Cloudflare R2 `.sql.gz`)                             |
|  -------------------------------------------------------------------------------------------------  |
|  Status Jadwal Harian : [ AKTIF ] Jam 02:00 WIB (AES-256-CBC)                                       |
|  [ Trigger Backup Sekarang (Manual) ]                                                               |
|                                                                                                     |
|  Riwayat File Backup Terakhir:                                                                      |
|  - backup-2026-08-17-0200.sql.gz (4.8 MB) - Sukses - [ Unduh ] [ Restore ]                          |
|  - backup-2026-08-16-0200.sql.gz (4.6 MB) - Sukses - [ Unduh ] [ Restore ]                          |
+-----------------------------------------------------------------------------------------------------+
5. Visual State Machine & Dynamic UI Indicators
5.1 Dynamic Due-Date Badge State Flow
Plaintext
[ Payment Milestone Item ]
            |
            +---> Status == 'paid'       -------------> [ GREEN BADGE: Lunas ]
            |
            +---> Status == 'unpaid'
                     |
                     +---> Due Date < Hari-ini --------> [ RED BADGE: Terlewat H+X ]
                     |
                     +---> Due Date <= Alert Days -----> [ YELLOW BADGE: Jatuh Tempo H-X ]
                     |
                     +---> Due Date > Alert Days ------> [ GRAY BADGE: Mendatang ]
5.2 Seating Allocation & Overbooking Meter
Plaintext
Meja 04 (Round Table - Kapasitas 10 Kursi)
Terisi: 8 / 10 Kursi   [========--] (80% - Hijau Normal)

Meja 05 (Round Table - Kapasitas 10 Kursi)
Terisi: 10 / 10 Kursi  [==========] (100% - Kuning Penuh)

Meja 06 (Round Table - Kapasitas 10 Kursi)
Terisi: 11 / 10 Kursi  [!!!!!!!!!!] (OVERBOOKED 110% - Merah Berkedip)