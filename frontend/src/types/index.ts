/**
 * TypeScript type definitions
 */

export interface User {
  employee_id: number;
  username: string;
  full_name: string;
  role: string;
}

export interface Asset {
  asset_id: number;
  asset_name: string;
  asset_type: string;
  location: string;
  last_inspection_date: string;
  status: string;
  installation_date?: string;
}

export interface ScheduledInspection {
  schedule_id: number;
  asset_id: number;
  scheduled_date: string;
  asset_name: string;
  asset_type: string;
  location: string;
  last_inspection_date?: string;
}

export interface AuditPhoto {
  file: File;
  preview: string;
  url?: string;
  ai_notes?: string;
}

export interface AuditHistory {
  audit_id: number;
  inspection_date: string;
  audit_status: string;
  urgency_level: string;
  summary: string;
}

export type AuditStatus = 'Good' | 'Fair' | 'Poor' | 'Critical';
export type ViewType = 'login' | 'dashboard' | 'asset-detail' | 'inspection' | 'reports';