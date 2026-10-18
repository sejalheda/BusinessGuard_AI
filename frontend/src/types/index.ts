export interface ReasoningCheck {
  check: string;
  evidence: string;
  confidence: 'High' | 'Medium' | 'Low';
  tool: string;
}

export interface RecoveryPlan {
  first_hour?: string[];
  first_24h?: string[];
  first_week?: string[];
  immediate_actions: string[];
  plan_24h: string[];
  evidence_checklist: string[];
  prevention_tips: string[];
}

export interface StructuredCard {
  risk_level: string;
  situation_analysis: string;
  recommended_actions: string[];
  prevention_tips: string[];
  reasoning?: ReasoningCheck[];
}

export interface CaseTurn {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  source?: string;
}

export interface CaseItem {
  id: string;
  incident_type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'resolved';
  title: string;
  description?: string;
  source: 'alexa' | 'web' | 'advisor' | 'emergency_button' | 'payment_checker';
  created_at: string;
  updated_at: string;
  answers?: Record<string, any>;
  turns: CaseTurn[];
  recovery_plan?: RecoveryPlan;
  completed_steps?: string[];
  reasoning?: ReasoningCheck[];
  metadata?: Record<string, any>;
}

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  source?: string;
  tools_used?: any[];
  structured_card?: StructuredCard;
  reasoning?: ReasoningCheck[];
}

export interface PaymentCheckResult {
  risk_level: 'High Risk' | 'Medium Risk' | 'Low Risk';
  risk_score: number;
  warning_signs: string[];
  bank_checklist: string[];
  disclaimer: string;
  suggested_incident_type: string;
  reasoning: ReasoningCheck[];
}

export interface AuditAnswers {
  registration: boolean;
  gst: boolean;
  mfa: boolean;
  invoices: boolean;
  vendor_contracts: boolean;
  trademark: boolean;
  backups: boolean;
  password_manager: boolean;
  staff_access: boolean;
  cyber_insurance: boolean;
  payment_verification: boolean;
  incident_plan: boolean;
}

export interface TopFix {
  title: string;
  impact_points: number;
  effort: string;
  category: string;
}

export interface AuditResult {
  overall_score: number;
  maturity_level: 'Starter' | 'Building' | 'Protected' | 'Resilient';
  category_scores: {
    legal: number;
    security: number;
    operations: number;
    brand: number;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  action_plan: string[];
  top_fixes: TopFix[];
  is_default?: boolean;
}

export interface McpTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}
