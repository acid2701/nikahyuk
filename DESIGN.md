# DESIGN.md — NikahYuk Hybrid Design System Specification

Single source of truth styling dan visual token platform **NikahYuk Companion SaaS**.

---

## 1. Core Architecture: 3 Isolated Design Personas

Platform dibagi menjadi 3 persona visual yang terisolasi ketat di level Next.js App Router layout:

| Persona | Target Audience | Route Scope | Design System Reference | Karakter Visual |
|---|---|---|---|---|
| **Public & Guest** | Pasangan Pengantin & Tamu Undangan | `/`, `/view/[token]/*`, `/login`, `/register` | **Oura** | Warm editorial, serif accents, luxury calm, rounded cards |
| **Control Plane** | Superadmin & Platform Engineers | `/(admin)/*` | **Linear** | Ultra-precise, dense tables, font-mono for technical keys, crisp status pills |
| **Workspace** | Pengantin & Wedding Organizers | `/(dashboard)/*`, `/(vendor)/*` | **Notion** | Modular cards, soft borders, clean action toolbars, zero visual clutter |

---

## 2. Color Palette & Semantic Tokens

Wajib menggunakan Tailwind CSS semantic variables (`globals.css`):
- `bg-background`: Surface utama halaman
- `bg-card`: Surface kontainer/kartu
- `text-foreground`: Teks utama kontras tinggi
- `text-muted-foreground`: Teks sekunder, label pembantu, timestamp
- `border-border`: Garis pemisah 1px (gunakan `border-border/60` untuk subtle borders)
- `bg-primary` & `text-primary-foreground`: Tombol aksi primer

### Mode Behavior:
- **Light Mode:** Warm paper neutral (Oura feel) di landing & guest, clean crisp white di admin & dashboard.
- **Dark Mode:** Deep obsidian/slate neutral (Linear feel) dengan kontras teks tajam dan border 1px halus.

---

## 3. Persona Specific Rules

### A. Persona 1: Public & Guest (Oura Inspired)
- **Typography:** 
  - Headings: `font-serif tracking-tight font-bold` (merangkul nuansa pernikahan yang sakral dan hangat).
  - Body: `font-sans text-sm text-muted-foreground`.
- **Surfaces & Cards:** `rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xs p-6 shadow-xs`.
- **Buttons & Pills:** `rounded-full` atau `rounded-xl`, touch target luas (`h-10 px-5`).

### B. Persona 2: Control Plane / Superadmin (Linear Inspired)
- **Typography:** 
  - Standard text: `font-sans text-xs sm:text-sm`.
  - Keys, UUID, Hash, Timestamp, IP, Numbers: Wajib `font-mono text-xs`.
- **Tables:** 
  - Row padding padat: `py-2.5 px-3`.
  - Header: `bg-muted/50 font-mono text-xs uppercase tracking-wider text-muted-foreground`.
  - Wajib dibungkus `<div className="overflow-x-auto">`.
- **Status Badges:** 
  - Format pill dengan 1px border (`rounded-full px-2.5 py-0.5 text-[11px] font-medium font-mono inline-flex items-center gap-1.5`).
  - Active: emerald indicator dot.
  - Suspended/Failed: rose indicator dot.
  - Pending/Processing: amber indicator dot.

### C. Persona 3: Wedding Workspace (Notion Inspired)
- **Typography:** Clean sans-serif hierarki teratur.
- **Cards & Lists:** 
  - Kartu modular `border border-border/60 bg-card hover:border-border transition-colors`.
  - Padding nyaman `p-4 sm:p-5`.
- **Toolbar & Filters:** Filter tabs sejajar (`all`, `pria`, `wanita`, `bersama`) dengan tombol aksi primer di sebelah kanan.
- **Pagination:** Reusable `DataTablePagination` dengan continuous index `(page - 1) * pageSize + index + 1`.

---

## 4. Safety & Technical Directives
1. **Zero New External CSS Frameworks:** Semua gaya diekspresikan via Tailwind CSS native.
2. **Never Break Layout Isolation:** Style Oura tidak boleh bocor ke tabel admin; style dense Linear tidak boleh merusak keterbacaan undangan tamu.
3. **Accessibility & Responsive:** Minimum touch target `36px` (`h-9`), horizontal overflow container pada semua tabel, kontras teks WCAG AA compliant di kedua tema.
