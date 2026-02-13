-- ENUMS
CREATE TYPE user_role AS ENUM ('parent', 'teacher', 'grandparent', 'caregiver', 'admin');
CREATE TYPE preferred_channel AS ENUM ('email', 'whatsapp');
CREATE TYPE location_type AS ENUM ('Caribbean', 'Diaspora');
CREATE TYPE child_age_band AS ENUM ('0-2', '3-5', '6-9', '10-12');
CREATE TYPE family_role AS ENUM ('parent', 'grandparent', 'guardian');
CREATE TYPE subscription_status AS ENUM ('active', 'trialing', 'canceled', 'past_due');
CREATE TYPE payment_provider AS ENUM ('stripe', 'paypal', 'manual');
CREATE TYPE content_type AS ENUM ('story', 'song', 'game', 'activity', 'resource_pdf');
CREATE TYPE dialect_type AS ENUM ('standard_english', 'local_dialect');
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE job_status AS ENUM ('queued', 'running', 'failed', 'completed', 'canceled');
CREATE TYPE job_type AS ENUM (
  'ai_outline', 'ai_page', 'ai_localization', 'ai_audio', 'ai_cover',
  'pdf_export', 'email_send', 'whatsapp_send', 'messenger_send',
  'webhook_process', 'coppa_retention_enforce', 'coppa_sla_check',
  'coppa_vendor_check', 'coppa_incident_workflow'
);
CREATE TYPE review_status AS ENUM ('draft', 'in_review', 'changes_requested', 'approved', 'published');
CREATE TYPE message_channel AS ENUM ('email', 'whatsapp', 'messenger');
CREATE TYPE message_category AS ENUM ('otp', 'transactional', 'marketing', 'share', 'support');
CREATE TYPE message_direction AS ENUM ('inbound', 'outbound');
CREATE TYPE message_status AS ENUM ('queued', 'sent', 'delivered', 'failed', 'opened', 'clicked');
CREATE TYPE contest_status AS ENUM ('draft', 'scheduled', 'live', 'paused', 'ended');
CREATE TYPE affiliate_status AS ENUM ('pending', 'active', 'suspended');
CREATE TYPE fraud_flag_type AS ENUM (
  'duplicate_ip', 'self_referral', 'burst_referrals', 'bot_like_behavior',
  'invalid_phone', 'email_bounce'
);
CREATE TYPE consent_method AS ENUM (
  'email_verification', 'sms_otp', 'whatsapp_otp', 'credit_card_verification',
  'signed_form_upload', 'video_verification', 'teacher_verification'
);
CREATE TYPE consent_scope_type AS ENUM ('basic_platform', 'ai_features', 'photo_sharing', 'third_party_disclosure');
CREATE TYPE data_request_type AS ENUM ('access_export', 'deletion', 'correction');
CREATE TYPE data_request_status AS ENUM ('new', 'acknowledged', 'in_progress', 'fulfilled', 'denied', 'overdue');
CREATE TYPE vendor_compliance_status AS ENUM ('unknown', 'pending_dpa', 'compliant', 'needs_review', 'non_compliant');
CREATE TYPE retention_action AS ENUM ('delete', 'anonymize', 'archive');
CREATE TYPE admin_action_type AS ENUM (
  'view_child_pii', 'export_child_data', 'delete_child_data', 'edit_child_profile',
  'edit_consent', 'approve_teacher', 'override_consent_block'
);

-- TABLES
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  role user_role DEFAULT 'parent',
  first_name TEXT,
  email TEXT UNIQUE,
  whatsapp_number TEXT UNIQUE,
  messenger_psid TEXT UNIQUE,
  origin_island TEXT,
  preferred_island_code TEXT,
  location_type location_type,
  country_city TEXT,
  consent_marketing BOOLEAN DEFAULT false,
  marketing_opt_in_whatsapp BOOLEAN DEFAULT false,
  preferred_channel preferred_channel DEFAULT 'email',
  last_seen_at TIMESTAMPTZ,
  is_coppa_designated_parent BOOLEAN DEFAULT false,
  age_verified_at TIMESTAMPTZ,
  coppa_training_completed BOOLEAN DEFAULT false
);

CREATE TABLE interests_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE,
  label TEXT
);

CREATE TABLE user_interests (
  user_id UUID REFERENCES users(id),
  interest_id UUID REFERENCES interests_catalog(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, interest_id)
);

CREATE TABLE family_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID REFERENCES users(id),
  name TEXT DEFAULT 'Family',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE family_members (
  family_group_id UUID REFERENCES family_groups(id),
  user_id UUID REFERENCES users(id),
  role_in_family family_role DEFAULT 'parent',
  permissions JSONB DEFAULT '{"view_progress": true, "edit_child": false}',
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (family_group_id, user_id)
);

CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_group_id UUID REFERENCES family_groups(id),
  primary_user_id UUID REFERENCES users(id),
  name TEXT,
  age_band child_age_band,
  created_at TIMESTAMPTZ DEFAULT now(),
  age_verified BOOLEAN DEFAULT false,
  requires_parental_consent BOOLEAN DEFAULT true,
  consent_last_verified TIMESTAMPTZ
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  plan_id TEXT,
  status subscription_status DEFAULT 'trialing',
  provider payment_provider DEFAULT 'paypal',
  provider_customer_id TEXT,
  provider_subscription_id TEXT,
  current_period_end TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type content_type,
  slug TEXT UNIQUE,
  title TEXT,
  island_code TEXT,
  track_tags JSONB,
  has_dialect_toggle BOOLEAN DEFAULT false,
  review_status review_status DEFAULT 'draft',
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE content_localizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id UUID REFERENCES content_items(id),
  dialect_type dialect_type,
  language_code TEXT DEFAULT 'en',
  display_title TEXT,
  body_text TEXT,
  audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (content_item_id, dialect_type, language_code)
);

CREATE TABLE progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES children(id),
  content_item_id UUID REFERENCES content_items(id),
  completed_at TIMESTAMPTZ DEFAULT now(),
  score NUMERIC,
  UNIQUE (child_id, content_item_id)
);

CREATE TABLE ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  child_id UUID REFERENCES children(id),
  feature TEXT DEFAULT 'story_studio',
  used_at TIMESTAMPTZ DEFAULT now(),
  tokens_in INT,
  tokens_out INT,
  cost_estimate_usd NUMERIC,
  metadata JSONB
);

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type job_type,
  status job_status DEFAULT 'queued',
  priority INT DEFAULT 5,
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  run_after TIMESTAMPTZ DEFAULT now(),
  locked_at TIMESTAMPTZ,
  locked_by TEXT,
  payload JSONB,
  result JSONB,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE book_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  age_band child_age_band,
  island_code TEXT,
  dialect_mode dialect_type DEFAULT 'standard_english',
  goal TEXT,
  characters JSONB,
  outline JSONB,
  status review_status DEFAULT 'draft',
  owner_admin_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE book_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES book_projects(id),
  page_number INT,
  dialect_type dialect_type DEFAULT 'standard_english',
  prompt_used TEXT,
  generated_text TEXT,
  status review_status DEFAULT 'draft',
  audio_url TEXT,
  art_prompt TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (project_id, page_number, dialect_type)
);

CREATE TABLE educator_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) UNIQUE,
  school_name TEXT,
  teacher_count INT DEFAULT 1,
  student_count INT DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anon_session_id TEXT,
  user_id UUID REFERENCES users(id),
  event_name TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel message_channel,
  category message_category,
  name TEXT,
  subject TEXT,
  body TEXT,
  variables JSONB,
  provider_template_id TEXT,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  channel message_channel,
  category message_category,
  direction message_direction,
  status message_status DEFAULT 'queued',
  template_id UUID REFERENCES message_templates(id),
  to_address TEXT,
  from_address TEXT,
  subject TEXT,
  body TEXT,
  provider_message_id TEXT,
  cost_estimate_usd NUMERIC,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  sent_at TIMESTAMPTZ
);

CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  channel message_channel,
  category message_category,
  segment_sql TEXT,
  template_id UUID REFERENCES message_templates(id),
  scheduled_at TIMESTAMPTZ,
  status job_status DEFAULT 'queued',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) UNIQUE,
  status affiliate_status DEFAULT 'pending',
  code TEXT UNIQUE,
  commission_mode TEXT DEFAULT 'recurring',
  commission_rate NUMERIC DEFAULT 0.2,
  payout_method TEXT,
  payout_details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE contests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  status contest_status DEFAULT 'draft',
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  grand_prize JSONB,
  rules JSONB,
  share_message_whatsapp TEXT,
  share_message_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE fraud_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  context_type TEXT,
  context_id UUID,
  flag_type fraud_flag_type,
  severity INT DEFAULT 3,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved BOOLEAN DEFAULT false
);

CREATE TABLE parental_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES children(id),
  parent_user_id UUID REFERENCES users(id),
  scope consent_scope_type,
  method consent_method,
  verified BOOLEAN DEFAULT false,
  verification_evidence JSONB,
  consented_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  UNIQUE (child_id, scope)
);

CREATE TABLE parent_data_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_id UUID REFERENCES users(id),
  child_id UUID REFERENCES children(id),
  request_type data_request_type,
  status data_request_status DEFAULT 'new',
  acknowledged_at TIMESTAMPTZ,
  due_at TIMESTAMPTZ,
  fulfilled_at TIMESTAMPTZ,
  notes TEXT,
  export_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE vendor_compliance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_name TEXT UNIQUE,
  status vendor_compliance_status DEFAULT 'unknown',
  dpa_signed BOOLEAN DEFAULT false,
  dpa_signed_at TIMESTAMPTZ,
  dpa_expires_at TIMESTAMPTZ,
  data_categories JSONB,
  notes TEXT,
  last_reviewed_at TIMESTAMPTZ
);

CREATE TABLE data_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT UNIQUE,
  retention_days INT,
  action retention_action,
  where_clause_sql TEXT,
  dry_run BOOLEAN DEFAULT true,
  last_enforced_at TIMESTAMPTZ
);

CREATE TABLE admin_actions_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES users(id),
  action_type admin_action_type,
  child_id UUID REFERENCES children(id),
  parent_user_id UUID REFERENCES users(id),
  justification TEXT,
  context JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE coppa_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  severity INT DEFAULT 3,
  title TEXT,
  description TEXT,
  status TEXT DEFAULT 'open',
  affected_child_ids JSONB,
  ftc_notified BOOLEAN DEFAULT false,
  ftc_notification_draft TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE coppa_training_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_user_id UUID REFERENCES users(id),
  training_name TEXT,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  evidence_url TEXT
);

CREATE TABLE age_verification_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anon_session_id TEXT,
  user_id UUID REFERENCES users(id),
  declared_age_band child_age_band,
  result TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_origin_island ON users(origin_island);
CREATE INDEX idx_users_preferred_island_code ON users(preferred_island_code);
CREATE INDEX idx_users_last_seen_at ON users(last_seen_at);
CREATE INDEX idx_users_is_coppa_designated_parent ON users(is_coppa_designated_parent);

CREATE INDEX idx_children_primary_user_id ON children(primary_user_id);
CREATE INDEX idx_children_family_group_id ON children(family_group_id);
CREATE INDEX idx_children_age_band ON children(age_band);
CREATE INDEX idx_children_age_verified ON children(age_verified);
CREATE INDEX idx_children_requires_parental_consent ON children(requires_parental_consent);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX idx_subscriptions_current_period_end ON subscriptions(current_period_end);

CREATE INDEX idx_content_items_content_type ON content_items(content_type);
CREATE INDEX idx_content_items_island_code ON content_items(island_code);
CREATE INDEX idx_content_items_published ON content_items(published);
CREATE INDEX idx_content_items_review_status ON content_items(review_status);

CREATE INDEX idx_content_localizations_content_item_id ON content_localizations(content_item_id);
CREATE INDEX idx_content_localizations_dialect_type ON content_localizations(dialect_type);

CREATE INDEX idx_progress_child_id ON progress(child_id);
CREATE INDEX idx_progress_completed_at ON progress(completed_at);

CREATE INDEX idx_ai_usage_user_id ON ai_usage(user_id);
CREATE INDEX idx_ai_usage_child_id ON ai_usage(child_id);
CREATE INDEX idx_ai_usage_used_at ON ai_usage(used_at);
CREATE INDEX idx_ai_usage_feature ON ai_usage(feature);

CREATE INDEX idx_jobs_job_type ON jobs(job_type);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_run_after ON jobs(run_after);
CREATE INDEX idx_jobs_priority ON jobs(priority);

CREATE INDEX idx_book_projects_status ON book_projects(status);
CREATE INDEX idx_book_projects_island_code ON book_projects(island_code);
CREATE INDEX idx_book_projects_age_band ON book_projects(age_band);
CREATE INDEX idx_book_projects_owner_admin_id ON book_projects(owner_admin_id);

CREATE INDEX idx_book_pages_project_id ON book_pages(project_id);
CREATE INDEX idx_book_pages_status ON book_pages(status);
CREATE INDEX idx_book_pages_page_number ON book_pages(page_number);

CREATE INDEX idx_educator_accounts_verified ON educator_accounts(verified);

CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_anon_session_id ON events(anon_session_id);
CREATE INDEX idx_events_event_name ON events(event_name);
CREATE INDEX idx_events_created_at ON events(created_at);

CREATE INDEX idx_message_templates_channel ON message_templates(channel);
CREATE INDEX idx_message_templates_category ON message_templates(category);
CREATE INDEX idx_message_templates_approved ON message_templates(approved);

CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_channel ON messages(channel);
CREATE INDEX idx_messages_category ON messages(category);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_created_at ON messages(created_at);

CREATE INDEX idx_campaigns_channel ON campaigns(channel);
CREATE INDEX idx_campaigns_category ON campaigns(category);
CREATE INDEX idx_campaigns_scheduled_at ON campaigns(scheduled_at);
CREATE INDEX idx_campaigns_status ON campaigns(status);

CREATE INDEX idx_affiliates_status ON affiliates(status);

CREATE INDEX idx_contests_status ON contests(status);
CREATE INDEX idx_contests_start_at ON contests(start_at);
CREATE INDEX idx_contests_end_at ON contests(end_at);

CREATE INDEX idx_fraud_flags_flag_type ON fraud_flags(flag_type);
CREATE INDEX idx_fraud_flags_severity ON fraud_flags(severity);
CREATE INDEX idx_fraud_flags_resolved ON fraud_flags(resolved);
CREATE INDEX idx_fraud_flags_created_at ON fraud_flags(created_at);

CREATE INDEX idx_parental_consents_child_id ON parental_consents(child_id);
CREATE INDEX idx_parental_consents_parent_user_id ON parental_consents(parent_user_id);
CREATE INDEX idx_parental_consents_scope ON parental_consents(scope);
CREATE INDEX idx_parental_consents_verified ON parental_consents(verified);
CREATE INDEX idx_parental_consents_expires_at ON parental_consents(expires_at);

CREATE INDEX idx_parent_data_requests_status ON parent_data_requests(status);
CREATE INDEX idx_parent_data_requests_request_type ON parent_data_requests(request_type);
CREATE INDEX idx_parent_data_requests_due_at ON parent_data_requests(due_at);
CREATE INDEX idx_parent_data_requests_created_at ON parent_data_requests(created_at);

CREATE INDEX idx_vendor_compliance_status ON vendor_compliance(status);
CREATE INDEX idx_vendor_compliance_dpa_expires_at ON vendor_compliance(dpa_expires_at);

CREATE INDEX idx_admin_actions_audit_admin_user_id ON admin_actions_audit(admin_user_id);
CREATE INDEX idx_admin_actions_audit_action_type ON admin_actions_audit(action_type);
CREATE INDEX idx_admin_actions_audit_created_at ON admin_actions_audit(created_at);

CREATE INDEX idx_coppa_incidents_severity ON coppa_incidents(severity);
CREATE INDEX idx_coppa_incidents_status ON coppa_incidents(status);
CREATE INDEX idx_coppa_incidents_created_at ON coppa_incidents(created_at);

CREATE INDEX idx_coppa_training_records_staff_user_id ON coppa_training_records(staff_user_id);
CREATE INDEX idx_coppa_training_records_completed_at ON coppa_training_records(completed_at);
CREATE INDEX idx_coppa_training_records_expires_at ON coppa_training_records(expires_at);

CREATE INDEX idx_age_verification_attempts_user_id ON age_verification_attempts(user_id);
CREATE INDEX idx_age_verification_attempts_anon_session_id ON age_verification_attempts(anon_session_id);
CREATE INDEX idx_age_verification_attempts_created_at ON age_verification_attempts(created_at);

-- SEED DATA
INSERT INTO interests_catalog (slug, label) VALUES
('stories', 'Stories'),
('music', 'Music'),
('games', 'Games'),
('stem', 'STEM'),
('heritage', 'Heritage'),
('printables', 'Printables');

INSERT INTO vendor_compliance (vendor_name, status, dpa_signed) VALUES
('Google Gemini/Vertex', 'pending_dpa', false),
('ElevenLabs', 'pending_dpa', false),
('Stripe', 'pending_dpa', false),
('Resend', 'pending_dpa', false),
('Meta (WhatsApp/Messenger)', 'pending_dpa', false),
('Supabase', 'pending_dpa', false);

INSERT INTO data_retention_policies (table_name, retention_days, action, dry_run) VALUES
('events', 180, 'anonymize', true),
('messages', 365, 'archive', true),
('age_verification_attempts', 365, 'delete', true),
('ai_usage', 365, 'anonymize', true);

-- VIEWS
CREATE VIEW v_admin_kpis_today AS
SELECT
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM events WHERE created_at > now() - interval '24 hours') as events_24h,
  (SELECT SUM(cost_estimate_usd) FROM ai_usage WHERE used_at > now() - interval '24 hours') as ai_cost_24h,
  (SELECT COUNT(*) FROM subscriptions WHERE status = 'active') as active_subscriptions,
  (SELECT COUNT(*) FROM jobs WHERE status = 'failed') as failed_jobs;

CREATE VIEW v_admin_ai_usage_30d AS
SELECT
  feature,
  date_trunc('day', used_at) as day,
  COUNT(*) as usage_count,
  SUM(cost_estimate_usd) as total_cost
FROM ai_usage
WHERE used_at > now() - interval '30 days'
GROUP BY feature, day;

CREATE VIEW v_admin_lead_sources_7d AS
SELECT
  metadata->>'source' as source,
  COUNT(*) as lead_count
FROM events
WHERE event_name = 'lead_captured' AND created_at > now() - interval '7 days'
GROUP BY source;

CREATE VIEW v_admin_subscriptions_breakdown AS
SELECT
  plan_id,
  status,
  COUNT(*) as count
FROM subscriptions
GROUP BY plan_id, status;

CREATE VIEW v_admin_jobs_queue AS
SELECT
  job_type,
  status,
  COUNT(*) as count
FROM jobs
GROUP BY job_type, status;

CREATE VIEW v_admin_contest_live_status AS
SELECT
  id,
  name,
  status,
  (SELECT COUNT(*) FROM events WHERE event_name = 'contest_entry' AND metadata->>'contest_id' = contests.id::text) as entries
FROM contests;

CREATE VIEW v_admin_affiliate_performance AS
SELECT
  a.id,
  u.first_name,
  a.code,
  COUNT(s.id) as referrals,
  SUM(CASE WHEN s.status = 'active' THEN 1 ELSE 0 END) as active_referrals
FROM affiliates a
JOIN users u ON a.user_id = u.id
LEFT JOIN subscriptions s ON s.metadata->>'affiliate_code' = a.code -- Assuming affiliate code is in metadata
GROUP BY a.id, u.first_name, a.code;

CREATE VIEW v_coppa_consent_coverage AS
SELECT
  age_band,
  COUNT(*) as total_children,
  SUM(CASE WHEN requires_parental_consent = false OR EXISTS (SELECT 1 FROM parental_consents pc WHERE pc.child_id = children.id AND pc.verified = true) THEN 1 ELSE 0 END) as consented_children
FROM children
GROUP BY age_band;

CREATE VIEW v_coppa_pending_requests AS
SELECT
  *
FROM parent_data_requests
WHERE status IN ('new', 'acknowledged', 'in_progress')
ORDER BY due_at ASC;

CREATE VIEW v_coppa_vendor_health AS
SELECT
  vendor_name,
  status,
  dpa_signed,
  dpa_expires_at,
  CASE WHEN dpa_expires_at < now() + interval '30 days' THEN 'warning' ELSE 'healthy' END as health_status
FROM vendor_compliance;

CREATE VIEW v_coppa_retention_enforcement AS
SELECT
  table_name,
  retention_days,
  action,
  last_enforced_at,
  dry_run
FROM data_retention_policies;

CREATE VIEW v_coppa_admin_access_log AS
SELECT
  a.*,
  u.first_name as admin_name,
  c.name as child_name
FROM admin_actions_audit a
JOIN users u ON a.admin_user_id = u.id
LEFT JOIN children c ON a.child_id = c.id;

CREATE VIEW v_coppa_incident_dashboard AS
SELECT
  status,
  severity,
  COUNT(*) as count
FROM coppa_incidents
GROUP BY status, severity;

CREATE VIEW v_coppa_metrics_today AS
SELECT
  (SELECT COUNT(*) FROM parent_data_requests WHERE status = 'new') as new_requests,
  (SELECT COUNT(*) FROM parental_consents WHERE consented_at > now() - interval '24 hours') as consents_24h,
  (SELECT COUNT(*) FROM admin_actions_audit WHERE created_at > now() - interval '24 hours') as admin_access_24h,
  (SELECT COUNT(*) FROM age_verification_attempts WHERE created_at > now() - interval '24 hours') as age_verifications_24h;

-- RPCS
CREATE OR REPLACE FUNCTION rpc_merge_anon_events(p_anon_session_id TEXT, p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE events
  SET user_id = p_user_id
  WHERE anon_session_id = p_anon_session_id AND user_id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION rpc_check_ai_limit(p_user_id UUID, p_feature TEXT)
RETURNS JSONB AS $$
DECLARE
  v_plan_id TEXT;
  v_limit INT;
  v_usage INT;
BEGIN
  SELECT plan_id INTO v_plan_id FROM subscriptions WHERE user_id = p_user_id AND status = 'active' LIMIT 1;
  
  -- Simple logic for demo, would be more complex in production
  IF v_plan_id = 'plan_free_forever' THEN v_limit := 2;
  ELSIF v_plan_id = 'plan_digital_legends' THEN v_limit := 20;
  ELSIF v_plan_id = 'plan_mail_intro' THEN v_limit := 20;
  ELSIF v_plan_id = 'plan_legends_plus' THEN v_limit := 50;
  ELSIF v_plan_id = 'plan_family_legacy' THEN v_limit := 100;
  ELSE v_limit := 0;
  END IF;

  SELECT COUNT(*) INTO v_usage FROM ai_usage 
  WHERE user_id = p_user_id AND feature = p_feature AND used_at > date_trunc('month', now());

  RETURN jsonb_build_object('limit', v_limit, 'used', v_usage, 'remaining', GREATEST(0, v_limit - v_usage));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION rpc_verify_parental_consent(p_child_id UUID, p_scope consent_scope_type)
RETURNS TABLE (allowed BOOLEAN, reason TEXT) AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM parental_consents 
    WHERE child_id = p_child_id AND scope = p_scope AND verified = true AND (expires_at IS NULL OR expires_at > now()) AND revoked_at IS NULL
  ) THEN
    RETURN QUERY SELECT true, 'Consent verified';
  ELSE
    RETURN QUERY SELECT false, 'Consent missing or expired';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION rpc_audit_admin_access(
  p_admin_user_id UUID,
  p_action_type admin_action_type,
  p_child_id UUID,
  p_justification TEXT,
  p_context JSONB
)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO admin_actions_audit (admin_user_id, action_type, child_id, justification, context)
  VALUES (p_admin_user_id, p_action_type, p_child_id, p_justification, p_context);
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
