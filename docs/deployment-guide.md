# Server Deployment & Infrastructure Operation Guide

## Project: Wedding & Event Companion SaaS
**Version:** 2.1.0 (Dynamic Config & Multi-Tier RBAC Architecture)  
**Target Server:** Linux OS (Ubuntu 22.04 LTS / Debian 12) via aaPanel  
**Process Manager:** Node.js PM2 Cluster / Docker  
**Core Runtime:** Node.js v20+ LTS  
**External Services:** Supabase Cloud (PostgreSQL 15+) & Cloudflare R2

---

## 1. Minimalist Production Environment Configuration (`.env.production`)

Simpan file ini di direktori root aplikasi di server (`/www/wwwroot/wedding-saas/.env.production`). Variabel lingkungan ini **hanya** memuat konfigurasi bootstrap server dan koneksi awal Supabase. Seluruh kredensial Cloudflare R2, batas upload, dan jadwal backup dikonfigurasi melalui antarmuka Superadmin.

```env
# 1. CORE APPLICATION RUNTIME
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_URL=[https://yourweddingdomain.com](https://yourweddingdomain.com)
NEXT_PUBLIC_SITE_NAME="Wedding & Event Companion"

# 2. SUPABASE INFRASTRUCTURE (DATABASE, AUTH, REALTIME)
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 3. SECURITY, SESSIONS & BACKUP ENCRYPTION SECRETS
CRON_SECRET=3a8f9c1e-7b2d-4e9a-8f1c-6d9a2b4e6a8d
BACKUP_ENCRYPTION_SECRET=YourMaster32CharacterAESBackupKey!
TOKEN_SESSION_SECRET=YourSuperSecureJWTCookieSigningSecret32Char!
2. Server Preparation & Deployment via aaPanel
2.1 Persiapan Modul di aaPanel App Store
Buka dashboard aaPanel > Masuk ke menu App Store.

Pasang modul-modul berikut:

Nginx (v1.24 atau versi stabil terbaru).

Node.js Version Manager (pilih dan pasang Node.js v20.x LTS).

PM2 Manager (untuk manajemen process daemon & auto-restart).

2.2 Clone Repository, Install & Build
Buka terminal server aaPanel dan jalankan perintah berikut:

Bash
# Masuk ke direktori web root aaPanel
cd /www/wwwroot/

# Clone repositori proyek Anda
git clone [https://github.com/your-repo/wedding-saas.git](https://github.com/your-repo/wedding-saas.git) wedding-saas
cd wedding-saas

# Salin konfigurasi environment produksi
cp .env.example .env.production

# Install dependencies secara bersih
npm install --frozen-lockfile

# Inisialisasi migrasi skema database ke Supabase
# (Jalankan file supabase/migrations/20260101000000_initial_schema.sql & supabase/seed.sql di SQL Editor Supabase)

# Build bundle Next.js untuk produksi
npm run build
2.3 Konfigurasi PM2 Cluster Mode (ecosystem.config.js)
Pastikan file ecosystem.config.js di root project memiliki konfigurasi berikut:

JavaScript
module.exports = {
  apps: [
    {
      name: 'wedding-companion-saas',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: '/www/wwwroot/wedding-saas',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
Jalankan service:

Bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
3. Konfigurasi Nginx Reverse Proxy & SSL di aaPanel
3.1 Setup Domain & SSL Let's Encrypt
Di panel aaPanel, buka menu Website > Add Site.

Masukkan nama domain (contoh: yourweddingdomain.com).

Buka tab SSL pada domain tersebut > Pilih Let's Encrypt > Centang domain > Klik Apply (Pastikan auto-renewal aktif).

3.2 Setup Reverse Proxy dengan WebSocket Support
Buka tab Reverse Proxy pada website > Add Reverse Proxy:

Proxy Name: nextjs_proxy

Target URL: http://127.0.0.1:3000

Sent Domain: $host

Buka tab Configuration File Nginx pada website tersebut, lalu sesuaikan blok lokasi proxy utama agar mendukung WebSockets dan streaming data:

Nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name yourweddingdomain.com;
    
    # SSL Paths Managed by aaPanel
    ssl_certificate /www/server/panel/vhost/cert/[yourweddingdomain.com/fullchain.pem](https://yourweddingdomain.com/fullchain.pem);
    ssl_certificate_key /www/server/panel/vhost/cert/[yourweddingdomain.com/privkey.pem](https://yourweddingdomain.com/privkey.pem);
    ssl_protocols TLSv1.2 TLSv1.3;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass [http://127.0.0.1:3000](http://127.0.0.1:3000);
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Buffer & Timeout settings for streaming exports
        proxy_buffering off;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
4. Cloudflare R2 Bucket Setup & CORS Configuration
Untuk mengizinkan browser klien melakukan direct upload WebP dan PDF melalui Presigned URLs, lakukan konfigurasi berikut di dashboard Cloudflare:

Buka Cloudflare Dashboard > R2 Object Storage > Buat Bucket baru (misal: wedding-saas-production).

Masuk ke bucket tersebut > Tab Settings > Bagian CORS Policy > Klik Add CORS Policy.

Masukkan konfigurasi JSON berikut:

JSON
[
  {
    "AllowedOrigins": [
      "[https://yourweddingdomain.com](https://yourweddingdomain.com)"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag"
    ],
    "MaxAgeSeconds": 3600
  }
]
Buat API Token R2 via R2 > Manage R2 API Tokens dengan izin Object Read & Write, lalu catat:

Account ID

Access Key ID

Secret Access Key

5. Initial Superadmin Setup (First-Time Initialization)
Setelah web aplikasi menyala untuk pertama kali:

Registrasikan akun pertama melalui halaman /register.

Buka Supabase Dashboard > SQL Editor, lalu berikan hak superadmin ke akun tersebut:

SQL
UPDATE auth.users 
SET raw_app_meta_data = raw_app_meta_data || '{"role": "superadmin"}'::jsonb 
WHERE email = 'admin@yourweddingdomain.com';
Login ke /admin > Buka menu Storage R2 Configuration.

Masukkan Account ID, Access Key ID, Secret Access Key, Bucket Name, dan Public CDN Domain yang didapatkan dari Cloudflare R2, lalu klik Simpan & Invalidate Cache.

Sistem kini sepenuhnya siap digunakan oleh pengguna tanpa perlu menyentuh file server lagi.

6. Automated Encrypted Database Backup via aaPanel Cron
Untuk menjalankan auto-backup setiap jam 02:00 WIB dan menyimpannya secara terenkripsi (.sql.gz) ke Cloudflare R2:

Buka menu Cron di dashboard aaPanel.

Tambahkan tugas baru:

Type of Task: Shell Script

Task Name: Auto Backup Wedding SaaS to Cloudflare R2

Period: Daily pada pukul 02:00

Script Content:

Bash
#!/bin/bash
curl -X POST [https://yourweddingdomain.com/api/admin/backup/trigger](https://yourweddingdomain.com/api/admin/backup/trigger) \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer 3a8f9c1e-7b2d-4e9a-8f1c-6d9a2b4e6a8d" \
     -d '{"backup_type": "scheduled"}'
7. Disaster Recovery & Manual Restore Procedure
Jika terjadi kegagalan data atau kebutuhan migrasi server:

Unduh berkas cadangan terenkripsi terbaru (.sql.gz) dari Cloudflare R2 melalui menu Superadmin atau dashboard Cloudflare.

Jalankan perintah dekripsi dan restorasi di terminal server:

Bash
# 1. Dekripsi file backup menggunakan Master Encryption Secret
openssl enc -d -aes-256-cbc -in backup-2026-08-17-0200.sql.gz -out restored_db.sql.gz -k "YourMaster32CharacterAESBackupKey!"

# 2. Ekstrak file gzip
gunzip restored_db.sql.gz

# 3. Pulihkan skema dan data ke PostgreSQL Supabase
psql "postgresql://postgres:[YOUR_DB_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:5432/postgres" < restored_db.sql