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
