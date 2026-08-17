# Database Schema & Security Definition Document (DDL, Indexes, Triggers & RLS)

## Project: Wedding & Event Companion SaaS
**Version:** 2.1.0 (Dynamic Config & Multi-Tier RBAC Architecture)  
**Database Engine:** PostgreSQL 15+ (Supabase Managed PostgreSQL)  
**Extensions Required:** `uuid-ossp`, `pgcrypto`

---

## 1. Schema Extensions & Custom Enum Types

```sql
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom Enum Types
CREATE TYPE user_role_enum AS ENUM ('partner', 'wo', 'family_committee');
CREATE TYPE event_side_enum AS ENUM ('groom', 'bride', 'joint');
CREATE TYPE attendance_status_enum AS ENUM ('pending', 'attending', 'declined', 'checked_in');
CREATE TYPE payment_status_enum AS ENUM ('unpaid', 'paid');
CREATE TYPE cue_type_enum AS ENUM ('sound', 'lighting', 'multimedia', 'music');
CREATE TYPE gift_type_enum AS ENUM ('cash', 'item', 'voucher');
CREATE TYPE action_type_enum AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'SHIFT_TIMELINE');
2. Table Definitions (DDL)
SQL
-- ============================================================================
-- 1. SYSTEM INFRASTRUCTURE & RBAC TEMPLATES
-- ============================================================================

-- Dynamic Superadmin Settings (Encrypted Cloudflare R2 Credentials, Storage Rules, Backup Policies)
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Master Global Role Templates (Superadmin managed defaults)
CREATE TABLE global_role_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name TEXT UNIQUE NOT NULL,
    default_permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automated & Manual Database Backups History
CREATE TABLE system_backups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name TEXT NOT NULL,
    r2_file_key TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    encryption_algo TEXT NOT NULL DEFAULT 'aes-256-cbc',
    status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. CORE WORKSPACE & COLLABORATION
-- ============================================================================

-- Wedding Workspaces
CREATE TABLE weddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    groom_name TEXT NOT NULL,
    bride_name TEXT NOT NULL,
    wedding_slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collaborators & Granular Permission Overrides
CREATE TABLE wedding_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'family_committee',
    custom_permissions JSONB DEFAULT '{"budget": false, "vendor": true, "rundown": true, "guest": true, "gift_log": false}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (wedding_id, user_id)
);

-- Multi-Events (Lamaran, Siraman, Akad, Resepsi Pria, Resepsi Wanita, etc.)
CREATE TABLE wedding_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE NOT NULL,
    event_name TEXT NOT NULL,
    event_date DATE NOT NULL,
    time_start TIME,
    time_end TIME,
    event_side event_side_enum NOT NULL DEFAULT 'joint',
    location_name TEXT,
    location_maps_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. GUEST MANAGEMENT, SEATING & LIVE CHECK-IN
-- ============================================================================

-- Guest Categories (VIP, Sahabat, Teman Kantor, Keluarga Inti)
CREATE TABLE guest_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Master Guests Pool (Global per Wedding)
CREATE TABLE guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES guest_categories(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    sanitized_phone TEXT, -- Format: 628xxx
    default_pax INT DEFAULT 1 CHECK (default_pax > 0),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event Tables (Seating Chart Management)
CREATE TABLE event_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES wedding_events(id) ON DELETE CASCADE NOT NULL,
    table_number_or_name TEXT NOT NULL,
    max_seats INT NOT NULL DEFAULT 10 CHECK (max_seats > 0),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event Guest Assignments & Live Check-in
CREATE TABLE event_guest_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES wedding_events(id) ON DELETE CASCADE NOT NULL,
    guest_id UUID REFERENCES guests(id) ON DELETE CASCADE NOT NULL,
    table_id UUID REFERENCES event_tables(id) ON DELETE SET NULL,
    actual_pax INT DEFAULT 1 CHECK (actual_pax > 0),
    attendance_status attendance_status_enum NOT NULL DEFAULT 'pending',
    souvenir_received BOOLEAN NOT NULL DEFAULT FALSE,
    is_walk_in BOOLEAN NOT NULL DEFAULT FALSE,
    checkin_timestamp TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (event_id, guest_id)
);

-- ============================================================================
-- 4. VENDOR DIRECTORY & STORAGE MANAGEMENT
-- ============================================================================

-- Vendors Directory
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE NOT NULL,
    category TEXT NOT NULL,
    vendor_name TEXT NOT NULL,
    pic_name TEXT,
    sanitized_phone TEXT, -- Format: 628xxx
    contract_value NUMERIC(14, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendor Documents (MoU, Contracts, Invoices on Cloudflare R2)
CREATE TABLE vendor_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
    document_title TEXT NOT NULL,
    r2_file_key TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. DYNAMIC BUDGETING & PAYMENT MILESTONES
-- ============================================================================

-- Budget Categories
CREATE TABLE budget_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES wedding_events(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budget Items (Isolated per Event & Payer Side)
CREATE TABLE budget_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES wedding_events(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES budget_categories(id) ON DELETE SET NULL,
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    item_name TEXT NOT NULL,
    estimated_cost NUMERIC(14, 2) NOT NULL DEFAULT 0,
    target_payer event_side_enum NOT NULL DEFAULT 'joint',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Milestones (Multi-Termin & Dynamic Due Dates)
CREATE TABLE payment_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_item_id UUID REFERENCES budget_items(id) ON DELETE CASCADE NOT NULL,
    milestone_name TEXT NOT NULL,
    amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    due_date DATE,
    paid_date DATE,
    alert_days_before INT DEFAULT 7,
    payment_status payment_status_enum NOT NULL DEFAULT 'unpaid',
    paid_by event_side_enum DEFAULT 'joint',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Attachments (Transfer Proofs on Cloudflare R2)
CREATE TABLE payment_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    milestone_id UUID REFERENCES payment_milestones(id) ON DELETE CASCADE NOT NULL,
    r2_file_key TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 6. LIVE RUNDOWN & TECHNICAL CUES
-- ============================================================================

-- Rundowns with Contingency Plan & Ordering
CREATE TABLE rundowns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES wedding_events(id) ON DELETE CASCADE NOT NULL,
    time_start TIME NOT NULL,
    time_end TIME NOT NULL,
    activity_title TEXT NOT NULL,
    pic_name TEXT,
    location TEXT,
    contingency_plan TEXT,
    is_internal_only BOOLEAN NOT NULL DEFAULT FALSE,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Technical Cues (Sound, Lighting, Multimedia, Music, Mic)
CREATE TABLE rundown_cues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rundown_id UUID REFERENCES rundowns(id) ON DELETE CASCADE NOT NULL,
    cue_type cue_type_enum NOT NULL,
    instruction TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 7. INVENTORY, GIFTS & PHYSICAL LOGS
-- ============================================================================

-- Souvenirs Inventory
CREATE TABLE souvenirs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES wedding_events(id) ON DELETE CASCADE NOT NULL,
    souvenir_name TEXT NOT NULL,
    total_stock INT NOT NULL DEFAULT 0 CHECK (total_stock >= 0),
    distributed_count INT NOT NULL DEFAULT 0 CHECK (distributed_count >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gifts & Physical Angpao Log
CREATE TABLE gifts_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES wedding_events(id) ON DELETE CASCADE NOT NULL,
    guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
    gift_type gift_type_enum NOT NULL DEFAULT 'cash',
    cash_amount NUMERIC(14, 2) DEFAULT 0,
    item_description TEXT,
    received_by event_side_enum NOT NULL DEFAULT 'joint',
    received_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 8. PUBLIC SHARING TOKENS & AUDIT LOGS
-- ============================================================================

-- Shareable Public Tokens
CREATE TABLE shareable_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE NOT NULL,
    token_hash TEXT UNIQUE NOT NULL,
    pin_hash TEXT, -- Stored as bcrypt hash (optional)
    module_access JSONB NOT NULL DEFAULT '{"rundown": true, "checkin": false, "guest_list": true}'::jsonb,
    hide_internal_notes BOOLEAN NOT NULL DEFAULT TRUE,
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Trail Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_display_name TEXT NOT NULL,
    module_name TEXT NOT NULL,
    action_type action_type_enum NOT NULL,
    change_diff JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
3. High-Performance Indexing Strategy
SQL
-- Workspace & Collaborators Indexes
CREATE INDEX idx_weddings_created_by ON weddings(created_by);
CREATE INDEX idx_wedding_slug ON weddings(wedding_slug);
CREATE INDEX idx_collaborators_lookup ON wedding_collaborators(wedding_id, user_id);

-- Events & Guests Indexes
CREATE INDEX idx_wedding_events_wedding ON wedding_events(wedding_id);
CREATE INDEX idx_guests_wedding ON guests(wedding_id);
CREATE INDEX idx_guests_phone ON guests(sanitized_phone);
CREATE INDEX idx_event_guests_event ON event_guest_assignments(event_id);
CREATE INDEX idx_event_guests_status ON event_guest_assignments(event_id, attendance_status);
CREATE INDEX idx_event_tables_event ON event_tables(event_id);

-- Budget & Milestones Indexes
CREATE INDEX idx_budget_items_event ON budget_items(event_id);
CREATE INDEX idx_payment_milestones_item ON payment_milestones(budget_item_id);
CREATE INDEX idx_payment_milestones_due ON payment_milestones(due_date);
CREATE INDEX idx_payment_attachments_milestone ON payment_attachments(milestone_id);

-- Rundown & Public Tokens Indexes
CREATE INDEX idx_rundowns_event_sort ON rundowns(event_id, sort_order);
CREATE INDEX idx_rundown_cues_rundown ON rundown_cues(rundown_id);
CREATE INDEX idx_shareable_tokens_hash ON shareable_tokens(token_hash);
CREATE INDEX idx_audit_logs_timeline ON audit_logs(wedding_id, created_at DESC);
4. Triggers & Automated Functions
SQL
-- 1. Automated updated_at Column Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN     NEW.updated_at = NOW();     RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_weddings_updated BEFORE UPDATE ON weddings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_events_updated BEFORE UPDATE ON wedding_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_guests_updated BEFORE UPDATE ON guests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_budget_items_updated BEFORE UPDATE ON budget_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_milestones_updated BEFORE UPDATE ON payment_milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_rundowns_updated BEFORE UPDATE ON rundowns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_souvenirs_updated BEFORE UPDATE ON souvenirs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Realtime Souvenir Distributed Auto-Counter Trigger
CREATE OR REPLACE FUNCTION update_souvenir_distributed_count()
RETURNS TRIGGER AS $$ BEGIN     IF (NEW.souvenir_received = TRUE AND (OLD.souvenir_received IS NULL OR OLD.souvenir_received = FALSE)) THEN         UPDATE souvenirs          SET distributed_count = distributed_count + 1          WHERE event_id = NEW.event_id;     ELSIF (NEW.souvenir_received = FALSE AND OLD.souvenir_received = TRUE) THEN         UPDATE souvenirs          SET distributed_count = GREATEST(0, distributed_count - 1)          WHERE event_id = NEW.event_id;     END IF;     RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_souvenir_count_sync 
AFTER UPDATE OF souvenir_received ON event_guest_assignments 
FOR EACH ROW EXECUTE FUNCTION update_souvenir_distributed_count();
5. PostgreSQL Row Level Security (RLS) Policies
SQL
-- Enable RLS on All Tables
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_role_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_guest_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rundowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE rundown_cues ENABLE ROW LEVEL SECURITY;
ALTER TABLE souvenirs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE shareable_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check Workspace Membership
CREATE OR REPLACE FUNCTION is_wedding_member(p_wedding_id UUID)
RETURNS BOOLEAN AS $$ BEGIN     RETURN EXISTS (         SELECT 1 FROM weddings WHERE id = p_wedding_id AND created_by = auth.uid()         UNION         SELECT 1 FROM wedding_collaborators WHERE wedding_id = p_wedding_id AND user_id = auth.uid()     ); END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper Function: Check Superadmin Privilege
CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS BOOLEAN AS $$ BEGIN     RETURN (auth.jwt() ->> 'role') = 'superadmin'          OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'superadmin'; END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. System Settings & Infrastructure Policies (Superadmin Only)
CREATE POLICY "Superadmin full access to settings" ON system_settings
FOR ALL USING (is_superadmin());

CREATE POLICY "Superadmin full access to role templates" ON global_role_templates
FOR ALL USING (is_superadmin());

CREATE POLICY "Superadmin full access to backups" ON system_backups
FOR ALL USING (is_superadmin());

-- 2. Workspace & Event Policies
CREATE POLICY "Access own weddings" ON weddings
FOR ALL USING (created_by = auth.uid() OR is_wedding_member(id) OR is_superadmin());

CREATE POLICY "Access wedding collaborators" ON wedding_collaborators
FOR ALL USING (is_wedding_member(wedding_id) OR is_superadmin());

CREATE POLICY "Access wedding events" ON wedding_events
FOR ALL USING (is_wedding_member(wedding_id) OR is_superadmin());

-- 3. Guests & Seating Policies
CREATE POLICY "Access guest categories" ON guest_categories
FOR ALL USING (is_wedding_member(wedding_id) OR is_superadmin());

CREATE POLICY "Access master guests" ON guests
FOR ALL USING (is_wedding_member(wedding_id) OR is_superadmin());

CREATE POLICY "Access event tables" ON event_tables
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM wedding_events we 
        WHERE we.id = event_tables.event_id 
        AND (is_wedding_member(we.wedding_id) OR is_superadmin())
    )
);

CREATE POLICY "Access event guest assignments" ON event_guest_assignments
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM wedding_events we 
        WHERE we.id = event_guest_assignments.event_id 
        AND (is_wedding_member(we.wedding_id) OR is_superadmin())
    )
);

-- 4. Vendor Directory Policies
CREATE POLICY "Access vendors" ON vendors
FOR ALL USING (is_wedding_member(wedding_id) OR is_superadmin());

CREATE POLICY "Access vendor documents" ON vendor_documents
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM vendors v 
        WHERE v.id = vendor_documents.vendor_id 
        AND (is_wedding_member(v.wedding_id) OR is_superadmin())
    )
);

-- 5. Budget & Payment Milestones Policies (Granular Control)
CREATE POLICY "Access budget categories" ON budget_categories
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM wedding_events we 
        WHERE we.id = budget_categories.event_id 
        AND (is_wedding_member(we.wedding_id) OR is_superadmin())
    )
);

CREATE POLICY "Access budget items with permission" ON budget_items
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM wedding_events we
        JOIN weddings w ON w.id = we.wedding_id
        LEFT JOIN wedding_collaborators wc ON wc.wedding_id = w.id AND wc.user_id = auth.uid()
        WHERE we.id = budget_items.event_id
        AND (
            w.created_by = auth.uid() 
            OR (wc.custom_permissions->>'budget')::boolean = true
            OR is_superadmin()
        )
    )
);

CREATE POLICY "Access payment milestones with permission" ON payment_milestones
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM budget_items bi
        JOIN wedding_events we ON we.id = bi.event_id
        JOIN weddings w ON w.id = we.wedding_id
        LEFT JOIN wedding_collaborators wc ON wc.wedding_id = w.id AND wc.user_id = auth.uid()
        WHERE bi.id = payment_milestones.budget_item_id
        AND (
            w.created_by = auth.uid() 
            OR (wc.custom_permissions->>'budget')::boolean = true
            OR is_superadmin()
        )
    )
);

CREATE POLICY "Access payment attachments with permission" ON payment_attachments
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM payment_milestones pm
        JOIN budget_items bi ON bi.id = pm.budget_item_id
        JOIN wedding_events we ON we.id = bi.event_id
        JOIN weddings w ON w.id = we.wedding_id
        LEFT JOIN wedding_collaborators wc ON wc.wedding_id = w.id AND wc.user_id = auth.uid()
        WHERE pm.id = payment_attachments.milestone_id
        AND (
            w.created_by = auth.uid() 
            OR (wc.custom_permissions->>'budget')::boolean = true
            OR is_superadmin()
        )
    )
);

-- 6. Live Rundown & Technical Cues Policies
CREATE POLICY "Access rundowns" ON rundowns
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM wedding_events we 
        WHERE we.id = rundowns.event_id 
        AND (is_wedding_member(we.wedding_id) OR is_superadmin())
    )
);

CREATE POLICY "Access rundown cues" ON rundown_cues
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM rundowns r
        JOIN wedding_events we ON we.id = r.event_id
        WHERE r.id = rundown_cues.rundown_id 
        AND (is_wedding_member(we.wedding_id) OR is_superadmin())
    )
);

-- 7. Inventory & Gifts Policies
CREATE POLICY "Access souvenirs" ON souvenirs
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM wedding_events we 
        WHERE we.id = souvenirs.event_id 
        AND (is_wedding_member(we.wedding_id) OR is_superadmin())
    )
);

CREATE POLICY "Access gifts log" ON gifts_log
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM wedding_events we
        JOIN weddings w ON w.id = we.wedding_id
        LEFT JOIN wedding_collaborators wc ON wc.wedding_id = w.id AND wc.user_id = auth.uid()
        WHERE we.id = gifts_log.event_id
        AND (
            w.created_by = auth.uid() 
            OR (wc.custom_permissions->>'gift_log')::boolean = true
            OR is_superadmin()
        )
    )
);

-- 8. Shareable Tokens & Audit Logs Policies
CREATE POLICY "Access shareable tokens" ON shareable_tokens
FOR ALL USING (is_wedding_member(wedding_id) OR is_superadmin());

CREATE POLICY "Access audit logs" ON audit_logs
FOR ALL USING (is_wedding_member(wedding_id) OR is_superadmin());