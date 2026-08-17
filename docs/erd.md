# Entity Relationship Diagram (ERD) Document

## Project: Wedding & Event Companion SaaS
**Version:** 2.1.0 (Dynamic Config & Multi-Tier RBAC Architecture)  
**Database Engine:** PostgreSQL 15+ (Supabase)  
**Key Standard:** 100% UUID-based Primary Keys & Foreign Keys (`gen_random_uuid()`)

---

## 1. Visual Entity Relationship Model (Mermaid Diagram)

```mermaid
erDiagram
    %% SYSTEM INFRASTRUCTURE & RBAC TEMPLATES
    SYSTEM_SETTINGS ||--o{ SYSTEM_BACKUPS : "configures"
    GLOBAL_ROLE_TEMPLATES ||--o{ WEDDING_COLLABORATORS : "seeds_defaults"

    %% AUTH & WORKSPACE HIERARCHY
    AUTH_USERS ||--o{ WEDDINGS : "owns"
    WEDDINGS ||--o{ WEDDING_COLLABORATORS : "delegates_to"
    AUTH_USERS ||--o{ WEDDING_COLLABORATORS : "assigned_user"
    WEDDINGS ||--o{ WEDDING_EVENTS : "consists_of"
    WEDDINGS ||--o{ SHAREABLE_TOKENS : "issues"
    WEDDINGS ||--o{ AUDIT_LOGS : "tracks"

    %% MASTER GUEST POOL & EVENT SEATING
    WEDDINGS ||--o{ GUEST_CATEGORIES : "organizes"
    WEDDINGS ||--o{ GUESTS : "pools"
    GUEST_CATEGORIES ||--o{ GUESTS : "groups"
    WEDDING_EVENTS ||--o{ EVENT_TABLES : "arranges"
    WEDDING_EVENTS ||--o{ EVENT_GUEST_ASSIGNMENTS : "invites"
    GUESTS ||--o{ EVENT_GUEST_ASSIGNMENTS : "assigned_guest"
    EVENT_TABLES ||--o{ EVENT_GUEST_ASSIGNMENTS : "assigned_seat"

    %% DYNAMIC BUDGETING & PAYMENT MILESTONES
    WEDDING_EVENTS ||--o{ BUDGET_CATEGORIES : "classifies"
    BUDGET_CATEGORIES ||--o{ BUDGET_ITEMS : "contains"
    BUDGET_ITEMS ||--o{ PAYMENT_MILESTONES : "splits_into"
    PAYMENT_MILESTONES ||--o{ PAYMENT_ATTACHMENTS : "proves"

    %% VENDOR DIRECTORY & STORAGE LIFECYCLE
    WEDDINGS ||--o{ VENDORS : "contracts"
    VENDORS ||--o{ VENDOR_DOCUMENTS : "stores_files"
    BUDGET_ITEMS }o--|| VENDORS : "incurs_cost"

    %% LIVE RUNDOWN & TECHNICAL CUES
    WEDDING_EVENTS ||--o{ RUNDOWNS : "schedules"
    RUNDOWNS ||--o{ RUNDOWN_CUES : "contains_cues"

    %% INVENTORY, GIFTS & PHYSICAL ANGPAO
    WEDDING_EVENTS ||--o{ SOUVENIRS : "manages"
    WEDDING_EVENTS ||--o{ GIFTS_LOG : "records"
    GUESTS ||--o{ GIFTS_LOG : "giver"

    %% ENTITY DEFINITIONS & FIELDS
    SYSTEM_SETTINGS {
        uuid id PK
        string key UK "r2_credentials | storage_rules | backup_policy"
        jsonb value "Encrypted credentials and dynamic rules"
        timestamptz updated_at
    }

    GLOBAL_ROLE_TEMPLATES {
        uuid id PK
        string role_name UK "wo | family_committee | guest_registrar"
        jsonb default_permissions "Base permissions template"
        timestamptz updated_at
    }

    SYSTEM_BACKUPS {
        uuid id PK
        string file_name
        string r2_file_key
        bigint file_size_bytes
        string encryption_algo "aes-256-cbc"
        string status "success | failed"
        timestamptz created_at
    }

    WEDDINGS {
        uuid id PK
        uuid created_by FK "auth.users.id"
        string groom_name
        string bride_name
        string wedding_slug UK
        timestamptz created_at
        timestamptz updated_at
    }

    WEDDING_COLLABORATORS {
        uuid id PK
        uuid wedding_id FK
        uuid user_id FK "auth.users.id"
        string role "partner | wo | family_committee"
        jsonb custom_permissions "Granular overrides by Owner"
        timestamptz created_at
    }

    WEDDING_EVENTS {
        uuid id PK
        uuid wedding_id FK
        string event_name "Lamaran | Akad | Resepsi | etc"
        date event_date
        time time_start
        time time_end
        string event_side "groom | bride | joint"
        string location_name
        text location_maps_url
        timestamptz created_at
        timestamptz updated_at
    }

    GUEST_CATEGORIES {
        uuid id PK
        uuid wedding_id FK
        string name "VIP | Keluarga Inti | Sahabat | Alumni"
        timestamptz created_at
    }

    GUESTS {
        uuid id PK
        uuid wedding_id FK
        uuid category_id FK
        string full_name
        string sanitized_phone "628xxx"
        int default_pax
        text notes
        timestamptz created_at
        timestamptz updated_at
    }

    EVENT_TABLES {
        uuid id PK
        uuid event_id FK
        string table_number_or_name
        int max_seats
        text notes
        timestamptz created_at
    }

    EVENT_GUEST_ASSIGNMENTS {
        uuid id PK
        uuid event_id FK
        uuid guest_id FK
        uuid table_id FK
        int actual_pax
        string attendance_status "pending | attending | declined | checked_in"
        boolean souvenir_received
        boolean is_walk_in
        timestamptz checkin_timestamp
        timestamptz created_at
        timestamptz updated_at
    }

    VENDORS {
        uuid id PK
        uuid wedding_id FK
        string category "Catering | MUA | Decor | Photo | etc"
        string vendor_name
        string pic_name
        string sanitized_phone "628xxx"
        numeric contract_value
        timestamptz created_at
        timestamptz updated_at
    }

    VENDOR_DOCUMENTS {
        uuid id PK
        uuid vendor_id FK
        string document_title
        string r2_file_key
        bigint file_size_bytes
        string mime_type
        timestamptz uploaded_at
    }

    BUDGET_CATEGORIES {
        uuid id PK
        uuid event_id FK
        string name "Venue & Catering | Attire | Decor | Media"
        timestamptz created_at
    }

    BUDGET_ITEMS {
        uuid id PK
        uuid event_id FK
        uuid category_id FK
        uuid vendor_id FK
        string item_name
        numeric estimated_cost
        string target_payer "groom | bride | joint"
        text notes
        timestamptz created_at
        timestamptz updated_at
    }

    PAYMENT_MILESTONES {
        uuid id PK
        uuid budget_item_id FK
        string milestone_name "DP 1 | DP 2 | Pelunasan"
        numeric amount
        date due_date
        date paid_date
        int alert_days_before "e.g. 30, 7, 3"
        string payment_status "unpaid | paid"
        string paid_by "groom | bride | joint"
        timestamptz created_at
        timestamptz updated_at
    }

    PAYMENT_ATTACHMENTS {
        uuid id PK
        uuid milestone_id FK
        string r2_file_key
        string file_name
        bigint file_size_bytes
        string mime_type
        timestamptz uploaded_at
    }

    RUNDOWNS {
        uuid id PK
        uuid event_id FK
        time time_start
        time time_end
        string activity_title
        string pic_name
        string location
        text contingency_plan "Plan B if delay/weather issue"
        boolean is_internal_only
        boolean is_completed
        int sort_order
        timestamptz created_at
        timestamptz updated_at
    }

    RUNDOWN_CUES {
        uuid id PK
        uuid rundown_id FK
        string cue_type "sound | lighting | multimedia | music"
        text instruction
        timestamptz created_at
    }

    SOUVENIRS {
        uuid id PK
        uuid event_id FK
        string souvenir_name
        int total_stock
        int distributed_count
        text notes
        timestamptz created_at
        timestamptz updated_at
    }

    GIFTS_LOG {
        uuid id PK
        uuid event_id FK
        uuid guest_id FK
        string gift_type "cash | item | voucher"
        numeric cash_amount
        string item_description
        string received_by "groom | bride | joint"
        timestamptz received_at
    }

    SHAREABLE_TOKENS {
        uuid id PK
        uuid wedding_id FK
        string token_hash UK
        string pin_hash "bcrypt 4-6 digits (optional)"
        jsonb module_access
        boolean hide_internal_notes
        timestamptz expires_at
        boolean is_active
        timestamptz created_at
    }

    AUDIT_LOGS {
        uuid id PK
        uuid wedding_id FK
        uuid user_id FK "auth.users.id"
        string user_display_name
        string module_name
        string action_type "CREATE | UPDATE | DELETE | SHIFT_TIMELINE"
        jsonb change_diff
        timestamptz created_at
    }
2. Relational Cardinality & Integrity Rules2.1 Multi-Event Isolation & Side OwnershipSatu workspace pernikahan (weddings) memiliki $1..N$ sub-event (wedding_events).Setiap wedding_events memiliki penanda penanggung jawab (event_side bertipe groom, bride, joint) yang mengisolasi daftar pos bujet (budget_items) dan alokasi meja (event_tables).2.2 Global Pool & Event Assignment (N:M Junction Table)Data master tamu dikumpulkan di pool global tingkat workspace (guests).Relasi banyak-ke-banyak antara tamu dan sub-event dijembatani oleh event_guest_assignments.Kolom is_walk_in (boolean) menandai tamu yang terdaftar mendadak pada hari-H saat meja registrasi dibuka.2.3 Multiple Payment Milestones & Dynamic Due DatesSatu item bujet (budget_items) memiliki $1..N$ termin pembayaran (payment_milestones).Setiap milestone memiliki kolom dinamis alert_days_before (integer) untuk kalkulasi pengingat jatuh tempo H-X hari secara adaptif.Setiap bukti transfer disimpan di payment_attachments yang mereferensikan key file fisik di Cloudflare R2.2.4 Referential Integrity & Cascading OperationsON DELETE CASCADE: Diterapkan pada seluruh relasi anak di PostgreSQL (misal: jika wedding_events dihapus, seluruh rundown, bujet, dan penugasan tamu terkait otomatis terhapus bersih).Storage Deletion Hook: Khusus untuk payment_attachments dan vendor_documents, penghapusan baris data di database memicu eksekusi DeleteObjectCommand langsung ke bucket Cloudflare R2 untuk mencegah berkas sampah (orphaned storage).