import { CaseItem, ChatMessage, AuditAnswers, AuditResult, McpTool } from '../types';

const BASE_URL = ''; // Proxied via vite to http://127.0.0.1:8000

export async function fetchCases(filters?: {
  search?: string;
  status?: string;
  severity?: string;
  source?: string;
  incident_type?: string;
}): Promise<{ cases: CaseItem[]; total: number }> {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.severity) params.append('severity', filters.severity);
  if (filters?.source) params.append('source', filters.source);
  if (filters?.incident_type) params.append('incident_type', filters.incident_type);

  const url = `/api/cases${params.toString() ? '?' + params.toString() : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch cases');
  return res.json();
}

export async function fetchCase(caseId: string): Promise<CaseItem> {
  const res = await fetch(`/api/cases/${caseId.toUpperCase()}`);
  if (!res.ok) throw new Error(`Case ${caseId} not found`);
  return res.json();
}

export async function createCase(payload: {
  incident_type: string;
  details: string;
  source?: string;
  answers?: Record<string, any>;
}): Promise<{ case_id: string; title: string; severity: string }> {
  const res = await fetch('/api/cases', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create case');
  return res.json();
}

export async function updateCase(caseId: string, patch: Partial<CaseItem>): Promise<CaseItem> {
  const res = await fetch(`/api/cases/${caseId.toUpperCase()}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error('Failed to update case');
  return res.json();
}

export async function sendChatMessage(payload: {
  messages: Array<{ role: string; content: string }>;
  case_id?: string;
}): Promise<{
  answer: string;
  severity: string;
  case_id?: string;
  tools_used: any[];
  provider: string;
  is_fallback: boolean;
  structured_card?: any;
}> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Chat request failed');
  return res.json();
}

export async function alexaInteract(payload: {
  transcript: string;
  case_id?: string;
  turn_index: number;
  previous_answers?: Record<string, any>;
}): Promise<{
  spoken_response: string;
  display_text: string;
  case_id?: string;
  is_complete: boolean;
  next_question?: string;
  immediate_actions: string[];
  turn_index: number;
  tools_used: any[];
}> {
  const res = await fetch('/api/alexa/interact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Alexa interaction failed');
  return res.json();
}

export async function submitAudit(answers: AuditAnswers): Promise<AuditResult> {
  const res = await fetch('/api/audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(answers),
  });
  if (!res.ok) throw new Error('Audit submission failed');
  return res.json();
}

export async function fetchLatestAudit(): Promise<AuditResult> {
  const res = await fetch('/api/audit/latest');
  if (!res.ok) throw new Error('Failed to fetch latest audit');
  return res.json();
}

export async function triggerEmergency(payload: {
  emergency_type: string;
  details?: string;
}): Promise<{
  case_id: string;
  severity: string;
  emergency_type: string;
  immediate_actions: string[];
  plan_24h: string[];
  evidence_checklist: string[];
  prevention_tips: string[];
}> {
  const res = await fetch('/api/emergency', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Emergency request failed');
  return res.json();
}

export async function fetchMcpTools(): Promise<{ tools: McpTool[] }> {
  const res = await fetch('/api/mcp/tools');
  if (!res.ok) throw new Error('Failed to fetch MCP tools');
  return res.json();
}

export async function executeMcpTool(name: string, args: Record<string, any>): Promise<any> {
  const res = await fetch('/api/mcp/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, arguments: args }),
  });
  if (!res.ok) throw new Error('Tool execution failed');
  return res.json();
}
