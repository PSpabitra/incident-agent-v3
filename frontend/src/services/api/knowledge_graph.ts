/**
 * Knowledge Graph API client.
 *
 * Talks to `/api/v1/kg/*` endpoints.
 */
import { apiClient } from './client';
import type { ApiResponse } from '@/types';

// ============================================================================
// Types
// ============================================================================
export type NodeType = 'symptom' | 'cause' | 'resolution';
export type EdgeType = 'caused_by' | 'resolved_by' | 'similar_to' | 'related_to';

export interface KGNode {
  id: string;
  nodeType: NodeType;
  label: string;
  description?: string | null;
  category?: string | null;
  steps?: Array<{ order: number; title: string; detail?: string; source?: string }> | null;
  keywords: string[];
  occurrenceCount: number;
  successCount: number;
  failureCount: number;
  confidence: number;
  sourceIncidentId?: string | null;
  createdBy?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KGEdge {
  id: string;
  srcNodeId: string;
  dstNodeId: string;
  edgeType: EdgeType;
  weight: number;
  evidenceCount: number;
  createdAt: string;
  dstLabel?: string;
  dstType?: string;
  srcLabel?: string;
  srcType?: string;
}

export interface KGNodeDetail {
  node: KGNode;
  outgoingEdges: KGEdge[];
  incomingEdges: KGEdge[];
  relatedIncidents: Array<{
    id: string;
    incident_id: string;
    role: string;
    subject?: string;
    priority?: string;
    status?: string;
    incident_created?: string;
    was_successful?: boolean | null;
    created_at: string;
  }>;
}

export interface KGStats {
  symptoms: number;
  causes: number;
  resolutions: number;
  totalNodes: number;
  totalEdges: number;
  successfulApplications: number;
}

export interface MistralAnalysis {
  id: string;
  incidentId: string;
  model: string;
  rootCause?: string | null;
  suggestedSteps: string[];
  resolutionSummary?: string | null;
  confidence: number;
  tokensIn: number;
  tokensOut: number;
  latencyMs: number;
  source: string;
  wasApplied: boolean;
  error?: string | null;
  createdAt: string;
}

export interface EmailLog {
  id: string;
  toAddress: string;
  subject: string;
  template?: string | null;
  relatedId?: string | null;
  status: 'pending' | 'sent' | 'failed' | 'skipped';
  error?: string | null;
  retryCount: number;
  sentAt?: string | null;
  createdAt: string;
}

export interface KGMatch {
  symptom: KGNode;
  cause: KGNode;
  resolution: KGNode;
  match_overlap: number;
  match_ratio: number;
  score?: number;
}

export interface TeachStep {
  order: number;
  title: string;
  detail?: string;
  command?: string;
}

export interface TeachTripletRequest {
  symptomLabel: string;
  symptomDescription?: string;
  causeLabel: string;
  resolutionLabel: string;
  resolutionSteps?: TeachStep[];
  category?: string;
  keywords?: string[];
  initialConfidence?: number;
}

export interface TeachTripletResult {
  symptom_id: string;
  symptom_created: boolean;
  cause_id: string;
  cause_created: boolean;
  resolution_id: string;
  resolution_created: boolean;
}

// ============================================================================
// Client
// ============================================================================
export const KnowledgeGraphApi = {
  async stats(): Promise<KGStats> {
    const { data } = await apiClient.get<ApiResponse<KGStats>>('/kg/stats');
    return data.data;
  },

  async listNodes(params: { nodeType?: NodeType; category?: string; limit?: number } = {}): Promise<KGNode[]> {
    const { data } = await apiClient.get<ApiResponse<KGNode[]>>('/kg/nodes', {
      params: {
        node_type: params.nodeType,
        category: params.category,
        limit: params.limit ?? 200,
      },
    });
    return data.data;
  },

  async getNode(id: string): Promise<KGNodeDetail> {
    const { data } = await apiClient.get<ApiResponse<KGNodeDetail>>(`/kg/nodes/${id}`);
    return data.data;
  },

  async deleteNode(id: string): Promise<void> {
    await apiClient.delete(`/kg/nodes/${id}`);
  },

  async match(body: { subject: string; description: string; category?: string }): Promise<KGMatch | null> {
    const { data } = await apiClient.post<ApiResponse<KGMatch | null>>('/kg/match', body);
    return data.data;
  },

  async teach(req: TeachTripletRequest): Promise<TeachTripletResult> {
    // Admin-only — POSTs a symptom/cause/resolution triplet for direct
    // ingestion into the graph. Reuses existing nodes when an equivalent
    // already exists, so repeat teaching strengthens rather than duplicates.
    const { data } = await apiClient.post<ApiResponse<TeachTripletResult>>('/kg/teach', {
      symptom_label: req.symptomLabel,
      symptom_description: req.symptomDescription,
      cause_label: req.causeLabel,
      resolution_label: req.resolutionLabel,
      resolution_steps: req.resolutionSteps,
      category: req.category,
      keywords: req.keywords,
      initial_confidence: req.initialConfidence ?? 0.7,
    });
    return data.data;
  },

  async listAnalyses(incidentId: string): Promise<MistralAnalysis[]> {
    const { data } = await apiClient.get<ApiResponse<MistralAnalysis[]>>(
      `/kg/incidents/${incidentId}/analyses`,
    );
    return data.data;
  },

  async listEmails(limit = 50): Promise<EmailLog[]> {
    const { data } = await apiClient.get<ApiResponse<EmailLog[]>>('/kg/emails', {
      params: { limit },
    });
    return data.data;
  },
};
