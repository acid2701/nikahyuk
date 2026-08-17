# Design System, UI/UX Guidelines & Visual Standards Document

## Project: Wedding & Event Companion SaaS
**Version:** 1.0.0  
**Design Paradigm:** Modern Minimalist Elegance & High-Density Operational Utility  
**Core Frameworks:** Tailwind CSS 3.4+, shadcn/ui (Radix UI Primitives), Lucide React  
**Accessibility Target:** WCAG 2.1 Level AA Compliance (High Contrast for Outdoor Daylight Use)

---

## 1. Design Philosophy & Visual Identity

Platform ini memadukan dua kebutuhan visual yang berbeda ke dalam satu bahasa desain yang harmonis:
1. **The Romantic & Celebratory Feel (Calon Pengantin):** Tampilan visual yang anggun, hangat, bersih (*clean*), dan menenangkan untuk mengurangi beban stres saat merencanakan pernikahan.
2. **The High-Speed Tactical Utility (Tim WO & Kru Lapangan):** Tampilan dengan kontras tajam, informasi padat (*high data density*), tipografi angka yang terbaca jelas, dan area sentuh (*touch target*) besar untuk operasional cepat di lapangan hari-H.

---

## 2. Color Palette & Semantic CSS Design Tokens

Sistem warna dibangun di atas fondasi warna netral hangat (*Warm Slate & Stone*) dengan aksen elegan *Champagne Gold* dan *Rose Bronze*. Seluruh token warna dikonfigurasi menggunakan variabel HSL agar kompatibel penuh dengan `shadcn/ui` dan Tailwind CSS.

### 2.1 CSS Custom Properties (`globals.css`)

```css
@layer base {
  :root {
    /* Base Backgrounds & Surfaces (Warm Porcelain / Alabaster) */
    --background: 30 20% 99%;
    --foreground: 224 25% 12%;
    --card: 0 0% 100%;
    --card-foreground: 224 25% 12%;
    --popover: 0 0% 100%;
    --popover-foreground: 224 25% 12%;

    /* Brand Primary Accent (Warm Champagne Gold) */
    --primary: 38 65% 42%;
    --primary-foreground: 0 0% 100%;

    /* Brand Secondary Accent (Soft Rose Blush) */
    --secondary: 15 35% 94%;
    --secondary-foreground: 15 45% 24%;

    /* Muted & Subdued Elements */
    --muted: 30 15% 94%;
    --muted-foreground: 220 10% 46%;

    /* Interactive Accent (Subtle Warm Glow) */
    --accent: 38 40% 92%;
    --accent-foreground: 38 70% 25%;

    /* Operational & Status Indicators */
    --success: 152 58% 38%;
    --success-foreground: 0 0% 100%;
    
    --warning: 38 92% 50%;
    --warning-foreground: 38 90% 15%;
    
    --destructive: 0 72% 51%;
    --destructive-foreground: 0 0% 100%;

    /* Structural Borders & Controls */
    --border: 30 15% 88%;
    --input: 30 15% 88%;
    --ring: 38 65% 42%;

    /* Component Geometry */
    --radius: 0.625rem; /* 10px */
  }

  .dark {
    /* Dark Surface (Deep Charcoal Warm Slate) */
    --background: 224 25% 9%;
    --foreground: 30 15% 96%;
    --card: 224 25% 12%;
    --card-foreground: 30 15% 96%;
    --popover: 224 25% 12%;
    --popover-foreground: 30 15% 96%;

    /* Brand Primary Accent in Dark Mode */
    --primary: 38 75% 55%;
    --primary-foreground: 224 30% 10%;

    /* Secondary Accent Dark */
    --secondary: 15 20% 18%;
    --secondary-foreground: 15 30% 90%;

    /* Muted Dark */
    --muted: 224 20% 18%;
    --muted-foreground: 220 15% 65%;

    /* Interactive Accent Dark */
    --accent: 38 30% 20%;
    --accent-foreground: 38 80% 75%;

    /* Status Indicators (High Vibrancy for Dark Backgrounds) */
    --success: 152 65% 45%;
    --success-foreground: 0 0% 100%;
    
    --warning: 38 95% 55%;
    --warning-foreground: 38 95% 12%;
    
    --destructive: 0 75% 60%;
    --destructive-foreground: 0 0% 100%;

    --border: 224 20% 20%;
    --input: 224 20% 20%;
    --ring: 38 75% 55%;
  }
}
2.2 Semantic Color Usage Rules
Nama Token	Tailwind Class	Konteks Penggunaan Standar
Primary	bg-primary text-primary-foreground	Tombol CTA utama, tab aktif, bar progress utama, highlight nama pengantin.
Secondary	bg-secondary text-secondary-foreground	Tombol aksi sekunder, filter pill non-aktif, badge kategori netral.
Success	bg-emerald-600 text-white dark:bg-emerald-500	Status pembayaran Lunas, kehadiran checked-in, souvenir sudah diambil.
Warning	bg-amber-500 text-amber-950 dark:bg-amber-400	Peringatan jatuh tempo mendekati batas (H-X), meja terisi penuh (100%).
Destructive	bg-rose-600 text-white dark:bg-rose-500	Status terlewat jatuh tempo (Overdue), meja overbooked (>100%), aksi hapus data.
Muted	bg-muted text-muted-foreground	Background header tabel, border pemisah, teks deskripsi pendukung.
3. Typography Hierarchy & Font Pairing
Sistem tipografi mengombinasikan dua keluarga huruf untuk memisahkan nuansa selebrasi dan keterbacaan data numerik.

3.1 Font Families
Display Font (Serif): Playfair Display atau Cormorant Garamond (Google Fonts).

Kegunaan: Header utama aplikasi, nama pasangan pengantin (Sarah & Dimas Wedding), cover PDF ekspor, halaman pembuka token publik.

Sans-Serif Font (Data & UI): Plus Jakarta Sans atau Inter.

Kegunaan: Seluruh komponen data table, tabel rundown, angka nominal bujet (IDR), form input, badge status, tombol, dan instruksi teknis (cues).

3.2 Type Scale & Hierarchy Table
Tingkat Hierarki	Ukuran Font / Line Height	Font Weight	Font Family	Penggunaan di Antarmuka
Hero Title	32px (2rem) / 1.2	SemiBold (600)	Display (Serif)	Nama Acara Utama / Judul PDF Cover
Section Heading (H1)	24px (1.5rem) / 1.3	SemiBold (600)	Sans-Serif	Judul Halaman Dashboard (Rundown, Bujet)
Card Heading (H2)	18px (1.125rem) / 1.4	Medium (500)	Sans-Serif	Header Widget / Judul Meja / Nama Vendor
Body Standard	14px (0.875rem) / 1.5	Regular (400)	Sans-Serif	Isi tabel data, catatan pos bujet, teks form
Body Medium / Bold	14px (0.875rem) / 1.5	SemiBold (600)	Sans-Serif	Nama tamu di tabel, nominal biaya, PIC
Micro Caption / Tags	12px (0.75rem) / 1.4	Medium (500)	Sans-Serif	Badge status, due-date alert, timestamp audit
Large Numbers (KPI)	28px (1.75rem) / 1.1	Bold (700)	Sans-Serif	Total pengeluaran bujet, sisa stok souvenir
4. Layout Spacing, Elevation & Component Geometry
4.1 Spacing Scale
space-1 (4px): Jarak antar elemen ikon dan teks label.

space-2 (8px): Padding internal badge dan tombol ikon kecil.

space-4 (16px): Padding default tabel, form input, dan card item mobile.

space-6 (24px): Jarak antar kartu metrik dan section form.

space-8 (32px): Jarak vertikal antar blok section utama di desktop.

4.2 Border Radius System
rounded-sm (4px): Checkbox, tooltip kecil.

rounded-md (8px): Input field, dropdown menu, badge tag status.

rounded-lg (10px - default --radius): Card metrik, container tabel, modal dialog.

rounded-full: Avatar inisial user, status indicator dot, tombol aksi bulat.

4.3 Shadow & Elevation
Card Surface: shadow-sm border border-border/70 bg-card (Tampilan flat bersih dengan garis batas halus).

Dropdown & Popover: shadow-md border border-border bg-popover.

Modal Dialog & Drawer: shadow-xl border border-border/80 backdrop-blur-sm bg-background/95.

5. Component Visual Specifications
5.1 Dynamic Status Badges (Payment & Timeline)
Plaintext
[ LUNAS ]           -> bg-emerald-50 text-emerald-700 border-emerald-200 (Dark: bg-emerald-950/50 text-emerald-400)
[ H-7 JATUH TEMPO ] -> bg-amber-50 text-amber-700 border-amber-200 (Dark: bg-amber-950/50 text-amber-400)
[ TERLEWAT 3 HARI ] -> bg-rose-50 text-rose-700 border-rose-200 (Dark: bg-rose-950/50 text-rose-400)
[ ONGOING ]         -> bg-primary/10 text-primary border-primary/30 animate-pulse
5.2 Seating Capacity Progress Bars
Normal (≤80%): Bar berwarna bg-emerald-500 dengan latar bg-muted.

Penuh (81%−100%): Bar berwarna bg-amber-500.

Overbooked (>100%): Bar berwarna bg-rose-500 dengan badge peringatan merah.

5.3 Touch Target & Mobile Ergonomics Standards
Khusus untuk tampilan mobile panitia lapangan (/view/[token]):

Minimum Touch Area: Seluruh tombol check-in, tombol checklist rundown, dan keypad PIN memiliki dimensi interaktif minimal 44px×44px untuk mencegah kesalahan ketuk (misclick) saat mobilitas tinggi.

Sticky Action Bars: Tombol filter meja dan pencarian nama tamu terkunci di bagian atas layar (sticky top), sedangkan navigasi modul terkunci di bagian bawah (sticky bottom).

6. Microcopy, Vocabulary & Tone of Voice (Indonesian Cultural Context)
Sistem menggunakan gaya bahasa yang lugas, sopan, terstruktur, dan kontekstual terhadap tradisi pernikahan di Indonesia.

6.1 Standardized Glossary & Terminology
Istilah Baku Sistem	Istilah yang Dihindari	Konteks & Definisi
Pihak Pria / Pihak Wanita	Suami / Istri (fase pra-nikah)	Penanggung jawab acara/biaya dari masing-masing keluarga.
Sub-Event	Acara / Sesi	Bagian dari rangkaian pernikahan (Lamaran, Siraman, Akad, Resepsi).
Pos Pengeluaran	Item / Biaya	Satu kategori pengeluaran spesifik (misal: Katering Resepsi).
Termin Pembayaran	Cicilan / Angsuran	Tahapan pembayaran vendor (Booking Fee, DP 1, Pelunasan).
Jatuh Tempo (Due Date)	Deadline	Batas akhir tanggal pelunasan termin vendor.
Aba-aba Teknis (Cues)	Catatan Suara / Lampu	Instruksi khusus kru Sound, Lighting, Band, dan MC pada rundown.
Tamu Walk-in	Tamu Liar / Tamu Susulan	Tamu yang hadir mendadak di meja registrasi tanpa terdaftar di pool.
Souvenir Diambil	Souvenir Lunas	Status penyerahan fisik cinderamata kepada tamu di meja registrasi.
Log Tanda Kasih / Angpao	Catatan Uang Masuk	Pencatatan amplop atau kado fisik pasca-acara selesai.
6.2 Feedback & Empty State Messages
Empty Table State: "Belum ada data untuk kategori ini. Klik tombol '+ Tambah' di atas untuk memulai."

Form Validation Error: "Mohon periksa kembali, nominal pembayaran harus lebih besar dari Rp 0."

Delete Confirmation: "Apakah Anda yakin ingin menghapus data ini? File fisik terkait di Cloudflare R2 akan dimusnahkan secara permanen."

PIN Lockout Message: "PIN salah 5 kali. Akses dari perangkat ini terkunci sementara selama 15 menit demi keamanan data."