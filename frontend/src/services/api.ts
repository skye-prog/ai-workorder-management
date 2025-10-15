/**
 * API Service Layer
 * Handles all backend API communications
 */

import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class ApiService {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests if available
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });
  }

  setToken(token: string) {
    this.token = token;
  }

  // Authentication
  async login(username: string, password: string) {
    const response = await this.client.post('/api/auth/login', {
      username,
      password,
    });
    this.setToken(response.data.token);
    return response.data;
  }

  // Scheduled Inspections
  async getScheduledInspections(employeeId: number) {
    const response = await this.client.get(
      `/api/inspections/scheduled/${employeeId}`
    );
    return response.data;
  }

  // Asset Details
  async getAssetDetail(assetId: number) {
    const response = await this.client.get(`/api/assets/${assetId}`);
    return response.data;
  }

  async getAssetHistory(assetId: number) {
    const response = await this.client.get(`/api/assets/${assetId}/history`);
    return response.data;
  }

  // File Uploads
  async uploadPhoto(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post('/api/upload/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async uploadVoice(blob: Blob) {
    const formData = new FormData();
    formData.append('file', blob, 'recording.wav');

    const response = await this.client.post('/api/upload/voice', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Audit Submission
  async submitAudit(auditData: {
    asset_id: number;
    inspector_id: number;
    audit_status: string;
    raw_comments: string;
    voice_file_url?: string;
    photo_urls: string[];
  }) {
    const response = await this.client.post('/api/audits/submit', auditData);
    return response.data;
  }

  // Reports
  async generateReport(filters: {
    start_date: string;
    end_date: string;
    urgency_level?: string;
    workflow_status?: string;
  }) {
    const response = await this.client.post('/api/reports/generate', filters);
    return response.data;
  }

  // Health Check
  async healthCheck() {
    const response = await this.client.get('/health');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;