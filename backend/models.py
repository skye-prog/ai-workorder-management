"""
Pydantic models for request/response validation
"""
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    employee_id: int
    username: str
    full_name: str
    role: str
    token: str

class ScheduledInspection(BaseModel):
    schedule_id: int
    asset_id: int
    asset_name: str
    asset_type: str
    location: str
    scheduled_date: datetime
    last_inspection_date: Optional[datetime] = None

class AssetDetail(BaseModel):
    asset_id: int
    asset_name: str
    asset_type: str
    location: str
    installation_date: Optional[str] = None
    last_inspection_date: Optional[datetime] = None
    status: str

class AuditHistory(BaseModel):
    audit_id: int
    inspection_date: datetime
    audit_status: str
    urgency_level: str
    summary: str

class AuditSubmission(BaseModel):
    asset_id: int
    inspector_id: int
    audit_status: str
    raw_comments: str
    voice_file_url: Optional[str] = None
    photo_urls: List[str]

class AIAnalysisResult(BaseModel):
    urgency_level: str
    summary: str
    structured_output: dict

class PhotoUploadResponse(BaseModel):
    url: str
    ai_notes: str

class VoiceUploadResponse(BaseModel):
    url: str
    transcription: str

class AuditSubmissionResponse(BaseModel):
    audit_id: int
    status: str
    ai_analysis: AIAnalysisResult

class ReportFilter(BaseModel):
    start_date: str
    end_date: str
    urgency_level: Optional[str] = None
    workflow_status: Optional[str] = None

class ReportResponse(BaseModel):
    report_url: str
    total_audits: int