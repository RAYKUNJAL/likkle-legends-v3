-- MIGRATION SCRIPT: v3.1.0 (Idempotent Complete v2)
-- Run this in your Supabase SQL Editor.

-- 1. ENUMS (Safe creation)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('parent', 'teacher', 'grandparent', 'caregiver', 'admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'preferred_channel') THEN
        CREATE TYPE preferred_channel AS ENUM ('email', 'whatsapp');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'location_type') THEN
        CREATE TYPE location_type AS ENUM ('Caribbean', 'Diaspora');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'child_age_band') THEN
        CREATE TYPE child_age_band AS ENUM ('0-2', '3-5', '6-9', '10-12');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'family_role') THEN
        CREATE TYPE family_role AS ENUM ('parent', 'grandparent', 'guardian');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
        CREATE TYPE subscription_status AS ENUM ('active', 'trialing', 'canceled', 'past_due');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_provider') THEN
        CREATE TYPE payment_provider AS ENUM ('stripe', 'paypal', 'manual');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_type') THEN
        CREATE TYPE content_type AS ENUM ('story', 'song', 'game', 'activity', 'resource_pdf');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'dialect_type') THEN
        CREATE TYPE dialect_type AS ENUM ('standard_english', 'local_dialect');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_status') THEN
        CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_status') THEN
        CREATE TYPE job_status AS ENUM ('queued', 'running', 'failed', 'completed', 'canceled');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_type') THEN
        CREATE TYPE job_type AS ENUM (
          'ai_outline', 'ai_page', 'ai_localization', 'ai_audio', 'ai_cover',
          'pdf_export', 'email_send', 'whatsapp_send', 'messenger_send',
          'webhook_process', 'coppa_retention_enforce', 'coppa_sla_check',
          'coppa_vendor_check', 'coppa_incident_workflow'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'review_status') THEN
        CREATE TYPE review_status AS ENUM ('draft', 'in_review', 'changes_requested', 'approved', 'published');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_channel') THEN
        CREATE TYPE message_channel AS ENUM ('email', 'whatsapp', 'messenger');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_category') THEN
        CREATE TYPE message_category AS ENUM ('otp', 'transactional', 'marketing', 'share', 'support');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_direction') THEN
        CREATE TYPE message_direction AS ENUM ('inbound', 'outbound');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_status') THEN
        CREATE TYPE message_status AS ENUM ('queued', 'sent', 'delivered', 'failed', 'opened', 'clicked');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contest_status') THEN
        CREATE TYPE contest_status AS ENUM ('draft', 'scheduled', 'live', 'paused', 'ended');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'affiliate_status') THEN
        CREATE TYPE affiliate_status AS ENUM ('pending', 'active', 'suspended');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fraud_flag_type') THEN
        CREATE TYPE fraud_flag_type AS ENUM (
          'duplicate_ip', 'self_referral', 'burst_referrals', 'bot_like_behavior',
          'invalid_phone', 'email_bounce'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'consent_method') THEN
        CREATE TYPE consent_method AS ENUM (
          'email_verification', 'sms_otp', 'whatsapp_otp', 'credit_card_verification',
          'signed_form_upload', 'video_verification', 'teacher_verification'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'consent_scope_type') THEN
        CREATE TYPE consent_scope_type AS ENUM ('basic_platform', 'ai_features', 'photo_sharing', 'third_party_disclosure');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'data_request_type') THEN
        CREATE TYPE data_request_type AS ENUM ('access_export', 'deletion', 'correction');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'data_request_status') THEN
        CREATE TYPE data_request_status AS ENUM ('new', 'acknowledged', 'in_progress', 'fulfilled', 'denied', 'overdue');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vendor_compliance_status') THEN
        CREATE TYPE vendor_compliance_status AS ENUM ('unknown', 'pending_dpa', 'compliant', 'needs_review', 'non_compliant');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'retention_action') THEN
        CREATE TYPE retention_action AS ENUM ('delete', 'anonymize', 'archive');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_action_type') THEN
        CREATE TYPE admin_action_type AS ENUM (
          'view_child_pii', 'export_child_data', 'delete_child_data', 'edit_child_profile',
          'edit_consent', 'approve_teacher', 'override_consent_block'
        );
    END IF;
END $$;

-- 2. TABLES (Safe Creation with Column Audits)
-- Note: TABLE IF NOT EXISTS doesn't handle missing columns in existing tables.
-- We must manually ensure columns exist for crucial tables.

CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY REFERENCES auth.users(id));
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE users ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'parent';
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS messenger_psid TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS origin_island TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_island_code TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS location_type location_type;
ALTER TABLE users ADD COLUMN IF NOT EXISTS country_city TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_marketing BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS marketing_opt_in_whatsapp BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_channel preferred_channel DEFAULT 'email';
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_coppa_designated_parent BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS age_verified_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS coppa_training_completed BOOLEAN DEFAULT false;

CREATE TABLE IF NOT EXISTS ai_usage (id UUID PRIMARY KEY DEFAULT gen_random_uuid());
ALTER TABLE ai_usage ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);
ALTER TABLE ai_usage ADD COLUMN IF NOT EXISTS child_id UUID; -- REFERENCES handled in full schema
ALTER TABLE ai_usage ADD COLUMN IF NOT EXISTS feature TEXT DEFAULT 'story_studio';
ALTER TABLE ai_usage ADD COLUMN IF NOT EXISTS used_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE ai_usage ADD COLUMN IF NOT EXISTS tokens_in INT;
ALTER TABLE ai_usage ADD COLUMN IF NOT EXISTS tokens_out INT;
ALTER TABLE ai_usage ADD COLUMN IF NOT EXISTS cost_estimate_usd NUMERIC;
ALTER TABLE ai_usage ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Create all other tables (Simplified for now, focusing on view dependencies)
CREATE TABLE IF NOT EXISTS subscriptions (id UUID PRIMARY KEY DEFAULT gen_random_uuid());
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan_id TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS status subscription_status DEFAULT 'trialing';
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS provider payment_provider DEFAULT 'paypal';
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS provider_customer_id TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS provider_subscription_id TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

CREATE TABLE IF NOT EXISTS jobs (id UUID PRIMARY KEY DEFAULT gen_random_uuid());
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_type job_type;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS status job_status DEFAULT 'queued';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS priority INT DEFAULT 5;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS attempts INT DEFAULT 0;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS max_attempts INT DEFAULT 3;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS run_after TIMESTAMPTZ DEFAULT now();
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS locked_by TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS payload JSONB;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS result JSONB;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS error TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Ensure all tables needed by views exist
CREATE TABLE IF NOT EXISTS events (id UUID PRIMARY KEY DEFAULT gen_random_uuid());
ALTER TABLE events ADD COLUMN IF NOT EXISTS anon_session_id TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_name TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE events ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

CREATE TABLE IF NOT EXISTS affiliates (id UUID PRIMARY KEY DEFAULT gen_random_uuid());
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) UNIQUE;
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS code TEXT UNIQUE;
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS status affiliate_status DEFAULT 'pending';

CREATE TABLE IF NOT EXISTS contests (id UUID PRIMARY KEY DEFAULT gen_random_uuid());
ALTER TABLE contests ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE contests ADD COLUMN IF NOT EXISTS status contest_status DEFAULT 'draft';

CREATE TABLE IF NOT EXISTS children (id UUID PRIMARY KEY DEFAULT gen_random_uuid());
ALTER TABLE children ADD COLUMN IF NOT EXISTS family_group_id UUID;
ALTER TABLE children ADD COLUMN IF NOT EXISTS primary_user_id UUID REFERENCES users(id);
ALTER TABLE children ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE children ADD COLUMN IF NOT EXISTS age_band child_age_band;
ALTER TABLE children ADD COLUMN IF NOT EXISTS requires_parental_consent BOOLEAN DEFAULT true;

CREATE TABLE IF NOT EXISTS parental_consents (id UUID PRIMARY KEY DEFAULT gen_random_uuid());
ALTER TABLE parental_consents ADD COLUMN IF NOT EXISTS child_id UUID REFERENCES children(id);
ALTER TABLE parental_consents ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
ALTER TABLE parental_consents ADD COLUMN IF NOT EXISTS scope consent_scope_type;
ALTER TABLE parental_consents ADD COLUMN IF NOT EXISTS consented_at TIMESTAMPTZ DEFAULT now();

CREATE TABLE IF NOT EXISTS parent_data_requests (id UUID PRIMARY KEY DEFAULT gen_random_uuid());
ALTER TABLE parent_data_requests ADD COLUMN IF NOT EXISTS status data_request_status DEFAULT 'new';
ALTER TABLE parent_data_requests ADD COLUMN IF NOT EXISTS due_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS vendor_compliance (id UUID PRIMARY KEY DEFAULT gen_random_uuid());
ALTER TABLE vendor_compliance ADD COLUMN IF NOT EXISTS vendor_name TEXT UNIQUE;
ALTER TABLE vendor_compliance ADD COLUMN IF NOT EXISTS status vendor_compliance_status DEFAULT 'unknown';
ALTER TABLE vendor_compliance ADD COLUMN IF NOT EXISTS dpa_signed BOOLEAN DEFAULT false;
ALTER TABLE vendor_compliance ADD COLUMN IF NOT EXISTS dpa_expires_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS data_retention_policies (id UUID PRIMARY KEY DEFAULT gen_random_uuid());
ALTER TABLE data_retention_policies ADD COLUMN IF NOT EXISTS table_name TEXT UNIQUE;
ALTER TABLE data_retention_policies ADD COLUMN IF NOT EXISTS retention_days INT;
ALTER TABLE data_retention_policies ADD COLUMN IF NOT EXISTS action retention_action;
ALTER TABLE data_retention_policies ADD COLUMN IF NOT EXISTS last_enforced_at TIMESTAMPTZ;
ALTER TABLE data_retention_policies ADD COLUMN IF NOT EXISTS dry_run BOOLEAN DEFAULT true;

CREATE TABLE IF NOT EXISTS admin_actions_audit (id UUID PRIMARY KEY DEFAULT gen_random_uuid());
ALTER TABLE admin_actions_audit ADD COLUMN IF NOT EXISTS admin_user_id UUID REFERENCES users(id);
ALTER TABLE admin_actions_audit ADD COLUMN IF NOT EXISTS action_type admin_action_type;
ALTER TABLE admin_actions_audit ADD COLUMN IF NOT EXISTS child_id UUID REFERENCES children(id);
ALTER TABLE admin_actions_audit ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

CREATE TABLE IF NOT EXISTS coppa_incidents (id UUID PRIMARY KEY DEFAULT gen_random_uuid());
ALTER TABLE coppa_incidents ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open';
ALTER TABLE coppa_incidents ADD COLUMN IF NOT EXISTS severity INT DEFAULT 3;

CREATE TABLE IF NOT EXISTS age_verification_attempts (id UUID PRIMARY KEY DEFAULT gen_random_uuid());
ALTER TABLE age_verification_attempts ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- 3. VIEWS (Refreshing)
DROP VIEW IF EXISTS v_admin_kpis_today CASCADE;
CREATE VIEW v_admin_kpis_today AS
SELECT
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM events WHERE created_at > now() - interval '24 hours') as events_24h,
  (SELECT SUM(cost_estimate_usd) FROM ai_usage WHERE used_at > now() - interval '24 hours') as ai_cost_24h,
  (SELECT COUNT(*) FROM subscriptions WHERE status = 'active') as active_subscriptions,
  (SELECT COUNT(*) FROM jobs WHERE status = 'failed') as failed_jobs;

DROP VIEW IF EXISTS v_admin_ai_usage_30d CASCADE;
CREATE VIEW v_admin_ai_usage_30d AS
SELECT
  feature,
  date_trunc('day', used_at) as day,
  COUNT(*) as usage_count,
  SUM(cost_estimate_usd) as total_cost
FROM ai_usage
WHERE used_at > now() - interval '30 days'
GROUP BY feature, day;

DROP VIEW IF EXISTS v_admin_lead_sources_7d CASCADE;
CREATE VIEW v_admin_lead_sources_7d AS
SELECT
  metadata->>'source' as source,
  COUNT(*) as lead_count
FROM events
WHERE event_name = 'lead_captured' AND created_at > now() - interval '7 days'
GROUP BY source;

DROP VIEW IF EXISTS v_admin_subscriptions_breakdown CASCADE;
CREATE VIEW v_admin_subscriptions_breakdown AS
SELECT
  plan_id,
  status,
  COUNT(*) as count
FROM subscriptions
GROUP BY plan_id, status;

DROP VIEW IF EXISTS v_admin_jobs_queue CASCADE;
CREATE VIEW v_admin_jobs_queue AS
SELECT
  job_type,
  status,
  COUNT(*) as count
FROM jobs
GROUP BY job_type, status;

DROP VIEW IF EXISTS v_admin_contest_live_status CASCADE;
CREATE VIEW v_admin_contest_live_status AS
SELECT
  id,
  name,
  status,
  (SELECT COUNT(*) FROM events WHERE event_name = 'contest_entry' AND metadata->>'contest_id' = contests.id::text) as entries
FROM contests;

DROP VIEW IF EXISTS v_admin_affiliate_performance CASCADE;
CREATE VIEW v_admin_affiliate_performance AS
SELECT
  a.id,
  u.first_name,
  a.code,
  COUNT(s.id) as referrals,
  SUM(CASE WHEN s.status = 'active' THEN 1 ELSE 0 END) as active_referrals
FROM affiliates a
JOIN users u ON a.user_id = u.id
LEFT JOIN subscriptions s ON s.metadata->>'affiliate_code' = a.code 
GROUP BY a.id, u.first_name, a.code;

DROP VIEW IF EXISTS v_coppa_consent_coverage CASCADE;
CREATE VIEW v_coppa_consent_coverage AS
SELECT
  age_band,
  COUNT(*) as total_children,
  SUM(CASE WHEN requires_parental_consent = false OR EXISTS (SELECT 1 FROM parental_consents pc WHERE pc.child_id = children.id AND pc.verified = true) THEN 1 ELSE 0 END) as consented_children
FROM children
GROUP BY age_band;

DROP VIEW IF EXISTS v_coppa_pending_requests CASCADE;
CREATE VIEW v_coppa_pending_requests AS
SELECT
  *
FROM parent_data_requests
WHERE status IN ('new', 'acknowledged', 'in_progress')
ORDER BY due_at ASC;

DROP VIEW IF EXISTS v_coppa_vendor_health CASCADE;
CREATE VIEW v_coppa_vendor_health AS
SELECT
  vendor_name,
  status,
  dpa_signed,
  dpa_expires_at,
  CASE WHEN dpa_expires_at < now() + interval '30 days' THEN 'warning' ELSE 'healthy' END as health_status
FROM vendor_compliance;

DROP VIEW IF EXISTS v_coppa_retention_enforcement CASCADE;
CREATE VIEW v_coppa_retention_enforcement AS
SELECT
  table_name,
  retention_days,
  action,
  last_enforced_at,
  dry_run
FROM data_retention_policies;

DROP VIEW IF EXISTS v_coppa_admin_access_log CASCADE;
CREATE VIEW v_coppa_admin_access_log AS
SELECT
  a.*,
  u.first_name as admin_name,
  c.name as child_name
FROM admin_actions_audit a
JOIN users u ON a.admin_user_id = u.id
LEFT JOIN children c ON a.child_id = c.id;

DROP VIEW IF EXISTS v_coppa_incident_dashboard CASCADE;
CREATE VIEW v_coppa_incident_dashboard AS
SELECT
  status,
  severity,
  COUNT(*) as count
FROM coppa_incidents
GROUP BY status, severity;

DROP VIEW IF EXISTS v_coppa_metrics_today CASCADE;
CREATE VIEW v_coppa_metrics_today AS
SELECT
  (SELECT COUNT(*) FROM parent_data_requests WHERE status = 'new') as new_requests,
  (SELECT COUNT(*) FROM parental_consents WHERE consented_at > now() - interval '24 hours') as consents_24h,
  (SELECT COUNT(*) FROM admin_actions_audit WHERE created_at > now() - interval '24 hours') as admin_access_24h,
  (SELECT COUNT(*) FROM age_verification_attempts WHERE created_at > now() - interval '24 hours') as age_verifications_24h;

-- 4. RPCS
CREATE OR REPLACE FUNCTION rpc_merge_anon_events(p_anon_session_id TEXT, p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE events
  SET user_id = p_user_id
  WHERE anon_session_id = p_anon_session_id AND user_id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- (RPC definitions remain the same as previous)
