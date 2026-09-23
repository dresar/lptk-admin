-- =========================================================================
-- SISTEM PENDATAAN & VERIFIKASI PESERTA LOMBA LPTK KECAMATAN
-- Skema Database PostgreSQL Lengkap (Neon Serverless)
-- Versi: 3.0 Baseline
-- =========================================================================

-- Aktifkan ekstensi pgcrypto untuk gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -------------------------------------------------------------------------
-- 1. SCHEMA: auth
-- -------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS auth;

-- Roles
CREATE TABLE IF NOT EXISTS auth.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Permissions
CREATE TABLE IF NOT EXISTS auth.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) UNIQUE NOT NULL,
    group_name VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Role Permissions Pivot
CREATE TABLE IF NOT EXISTS auth.role_permissions (
    role_id UUID NOT NULL REFERENCES auth.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES auth.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Users
CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role_id UUID NOT NULL REFERENCES auth.roles(id),
    lptk_id UUID,
    active BOOLEAN DEFAULT true,
    must_change_password BOOLEAN DEFAULT false,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions (Database-backed stateful auth with SHA-256 hash)
CREATE TABLE IF NOT EXISTS auth.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) UNIQUE NOT NULL,
    user_agent TEXT,
    ip_address VARCHAR(45),
    expires_at TIMESTAMPTZ NOT NULL,
    last_active_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Login Attempts (Brute force defense)
CREATE TABLE IF NOT EXISTS auth.login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON auth.sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON auth.login_attempts(email, created_at);

-- -------------------------------------------------------------------------
-- 2. SCHEMA: public (Domain Bisnis LPTK)
-- -------------------------------------------------------------------------

-- Master Desa
CREATE TABLE IF NOT EXISTS public.villages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Master LPTK
CREATE TABLE IF NOT EXISTS public.lptks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    village_id UUID NOT NULL REFERENCES public.villages(id),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    leader_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    address TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Hubungkan auth.users.lptk_id ke public.lptks
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_users_lptk'
    ) THEN
        ALTER TABLE auth.users 
        ADD CONSTRAINT fk_users_lptk 
        FOREIGN KEY (lptk_id) REFERENCES public.lptks(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Event / Perlombaan
CREATE TABLE IF NOT EXISTS public.competitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    period_year INT NOT NULL,
    status_code VARCHAR(30) NOT NULL DEFAULT 'DRAFT', -- DRAFT, OPEN, CLOSED, COMPLETED
    registration_open_at TIMESTAMPTZ NOT NULL,
    registration_close_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Kategori Perlombaan
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    gender_code VARCHAR(20) NOT NULL DEFAULT 'ANY', -- MALE, FEMALE, ANY
    age_min INT NOT NULL DEFAULT 0,
    age_max INT NOT NULL DEFAULT 100,
    requirements TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Master Jenis Dokumen Persyaratan
CREATE TABLE IF NOT EXISTS public.document_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,      -- KTP, KK, PAS_FOTO, SURAT_MANDAT, IJAZAH
    name VARCHAR(150) NOT NULL,
    is_required BOOLEAN DEFAULT true,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Kebutuhan Dokumen per Kategori
CREATE TABLE IF NOT EXISTS public.category_document_requirements (
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    document_type_id UUID NOT NULL REFERENCES public.document_types(id) ON DELETE CASCADE,
    is_mandatory BOOLEAN DEFAULT true,
    PRIMARY KEY (category_id, document_type_id)
);

-- Peserta Lomba (Entitas Inti)
CREATE TABLE IF NOT EXISTS public.participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID NOT NULL REFERENCES public.competitions(id),
    lptk_id UUID NOT NULL REFERENCES public.lptks(id),
    name VARCHAR(150) NOT NULL,
    nik VARCHAR(16) NOT NULL,
    gender_code VARCHAR(20) NOT NULL,       -- MALE, FEMALE
    birth_place VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(30) NOT NULL,
    school_or_institution VARCHAR(150),
    father_name VARCHAR(150),
    mother_name VARCHAR(150),
    status_code VARCHAR(30) NOT NULL DEFAULT 'DRAFT', -- DRAFT, SUBMITTED, IN_REVIEW, VERIFIED, REVISION_REQUIRED, REJECTED
    rejection_note TEXT,
    created_by UUID REFERENCES auth.users(id),
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_competition_nik UNIQUE (competition_id, nik)
);

-- Relasi Peserta & Kategori Cabang Lomba
CREATE TABLE IF NOT EXISTS public.participant_categories (
    participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    PRIMARY KEY (participant_id, category_id)
);

-- Dokumen Privat Peserta
CREATE TABLE IF NOT EXISTS public.participant_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    document_type_id UUID NOT NULL REFERENCES public.document_types(id),
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    sha256_hash VARCHAR(64) NOT NULL,
    file_data BYTEA,
    status_code VARCHAR(30) DEFAULT 'VALID',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Riwayat Keputusan Verifikasi
CREATE TABLE IF NOT EXISTS public.verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    verifier_id UUID NOT NULL REFERENCES auth.users(id),
    decision VARCHAR(30) NOT NULL,         -- VERIFIED, REVISION_REQUIRED, REJECTED, IN_REVIEW
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Log Sistem
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action_code VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent TEXT,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pengaturan Sistem
CREATE TABLE IF NOT EXISTS public.system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeks Kinerja
CREATE INDEX IF NOT EXISTS idx_participants_status ON public.participants(status_code);
CREATE INDEX IF NOT EXISTS idx_participants_lptk ON public.participants(lptk_id);
CREATE INDEX IF NOT EXISTS idx_participants_comp ON public.participants(competition_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action_code);
CREATE INDEX IF NOT EXISTS idx_participant_documents_part ON public.participant_documents(participant_id);
