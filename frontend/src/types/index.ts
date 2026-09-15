export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'manager' | 'operator' | 'auditor' | 'viewer';
  avatar_url?: string;
  tenant_id?: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface Workflow {
  id: string;
  name: string;
  slug: string;
  description?: string;
  workflow_type: 'dunning' | 'recruitment' | 'support' | 'sentinel' | 'custom';
  status: 'active' | 'paused' | 'draft' | 'archived';
  cron_expression?: string;
  total_runs: number;
  success_runs: number;
  failed_runs: number;
  last_run_at?: string;
  created_at: string;
}

export interface WorkflowStep {
  id: string;
  step_number: number;
  name: string;
  step_type: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  input_data: Record<string, any>;
  output_data: Record<string, any>;
  duration_ms: number;
  created_at: string;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  trigger_type: string;
  status: 'running' | 'completed' | 'failed' | 'human_approval_pending' | 'escalated';
  input_payload: Record<string, any>;
  output_payload: Record<string, any>;
  error_message?: string;
  started_at: string;
  completed_at?: string;
  execution_time_ms: number;
  steps: WorkflowStep[];
}

export interface AIDecision {
  id: string;
  domain: string;
  entity_id?: string;
  model_provider: string;
  model_name: string;
  input_data: Record<string, any>;
  ai_response: Record<string, any>;
  prompt_used?: string;
  reasoning_summary?: string;
  confidence_score: number;
  verification_passed: boolean;
  verification_details: {
    checks?: Array<{ rule: string; passed: boolean }>;
    violations?: string[];
    passed?: boolean;
  };
  status: 'auto_approved' | 'pending_review' | 'approved_by_human' | 'rejected_by_human' | 'escalated';
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  token_usage?: Record<string, any>;
  latency_ms: number;
  created_at: string;
}

export interface Escalation {
  id: string;
  title: string;
  description?: string;
  source: string;
  entity_id?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'acknowledged' | 'in_progress' | 'resolved' | 'closed';
  escalation_tier: number;
  sla_deadline?: string;
  is_breached: boolean;
  assigned_to?: string;
  assigned_email?: string;
  jira_issue_key?: string;
  slack_channel?: string;
  resolution_summary?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actor_type: string;
  actor_id: string;
  actor_email?: string;
  entity_type: string;
  entity_id?: string;
  ip_address?: string;
  before_state?: Record<string, any>;
  after_state?: Record<string, any>;
  payload: Record<string, any>;
  timestamp: string;
}

export interface DashboardKPIs {
  active_workflows: number;
  total_workflows: number;
  total_ai_decisions: number;
  auto_approved_decisions: number;
  human_reviewed_decisions: number;
  pending_decisions: number;
  autonomous_execution_rate: number;
  average_ai_confidence: number;
  open_escalations: number;
  critical_escalations: number;
  total_receivables_value: number;
  recovered_cash_value: number;
  sla_compliance_rate: number;
  system_status: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  currency: string;
  status: string;
  issue_date: string;
  due_date: string;
  days_overdue: number;
  dunning_stage: number;
  last_reminder_sent_at?: string;
  recovered_amount: number;
  payment_terms: string;
}

export interface SupportTicket {
  id: string;
  ticket_number: string;
  customer_name: string;
  customer_email: string;
  subject: string;
  body: string;
  category: string;
  sentiment: string;
  priority: string;
  status: string;
  sla_deadline: string;
  is_sla_breached: boolean;
  ai_suggested_reply?: string;
  ai_confidence: number;
  assigned_agent?: string;
  created_at: string;
}

export interface CandidateApplication {
  id: string;
  candidate_name: string;
  candidate_email: string;
  job_title: string;
  years_experience: number;
  skills: string[];
  resume_text: string;
  overall_score: number;
  skills_match_score: number;
  risk_level: string;
  recommendation: string;
  ai_analysis_summary?: string;
  status: string;
  created_at: string;
}
