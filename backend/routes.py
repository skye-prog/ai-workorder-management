"""
API Routes
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import uuid
import json

from models import *
from database import db
from storage_service import storage_service
from ai_service import ai_service
from speech_service import speech_service
from report_service import report_service

router = APIRouter()

@router.post("/api/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """Employee login - Hardcoded for MVP"""
    if request.username.strip() == "john.doe" and request.password.strip()== "rfs!@tezg187kFz":
        results = db.execute_query(
            "SELECT employee_id, username, full_name, role FROM employees WHERE username = ?",
            (request.username,)
        )
        
        if results:
            row = results[0]
            return LoginResponse(
                employee_id=row[0],
                username=row[1],
                full_name=row[2],
                role=row[3],
                token="mock_jwt_token_" + str(uuid.uuid4())
            )
    
    raise HTTPException(status_code=401, detail="Invalid credentials")

@router.get("/api/inspections/scheduled/{employee_id}", response_model=List[ScheduledInspection])
async def get_scheduled_inspections(employee_id: int):
    """Get scheduled inspections"""
    results = db.execute_query("""
        SELECT si.schedule_id, si.asset_id, a.asset_name, a.asset_type, 
               a.location, si.scheduled_date, a.last_inspection_date
        FROM scheduled_inspections si
        JOIN assets a ON si.asset_id = a.asset_id
        WHERE si.assigned_to = ? AND si.status = 'Pending'
        ORDER BY si.scheduled_date
    """, (employee_id,))
    
    inspections = []
    for row in results:
        inspections.append(ScheduledInspection(
            schedule_id=row[0],
            asset_id=row[1],
            asset_name=row[2],
            asset_type=row[3],
            location=row[4],
            scheduled_date=row[5],
            last_inspection_date=row[6]
        ))
    
    return inspections

@router.get("/api/assets/{asset_id}", response_model=AssetDetail)
async def get_asset_detail(asset_id: int):
    """Get asset details"""
    results = db.execute_query("""
        SELECT asset_id, asset_name, asset_type, location, 
               installation_date, last_inspection_date, status
        FROM assets
        WHERE asset_id = ?
    """, (asset_id,))
    
    if not results:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    row = results[0]
    return AssetDetail(
        asset_id=row[0],
        asset_name=row[1],
        asset_type=row[2],
        location=row[3],
        installation_date=str(row[4]) if row[4] else None,
        last_inspection_date=row[5],
        status=row[6]
    )

@router.get("/api/assets/{asset_id}/history", response_model=List[AuditHistory])
async def get_asset_history(asset_id: int):
    """Get audit history"""
    results = db.execute_query("""
        SELECT audit_id, inspection_date, audit_status, 
               urgency_level, ai_summary
        FROM audits
        WHERE asset_id = ? AND workflow_status = 'Closed'
        ORDER BY inspection_date DESC
    """, (asset_id,))
    
    history = []
    for row in results:
        history.append(AuditHistory(
            audit_id=row[0],
            inspection_date=row[1],
            audit_status=row[2],
            urgency_level=row[3],
            summary=row[4] or "No summary"
        ))
    
    return history

@router.post("/api/upload/photo", response_model=PhotoUploadResponse)
async def upload_photo(file: UploadFile = File(...)):
    """Upload photo with REAL Azure OpenAI Vision analysis"""
    try:
        file_extension = file.filename.split('.')[-1]
        content = await file.read()
        
        # Upload to Azure Blob Storage
        photo_url = storage_service.upload_photo(content, file_extension, file.content_type)
        
        # REAL AI analysis using Azure OpenAI Vision
        ai_notes = ai_service.analyze_photo(content, "Good")
        
        return PhotoUploadResponse(url=photo_url, ai_notes=ai_notes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.post("/api/upload/voice", response_model=VoiceUploadResponse)
async def upload_voice(file: UploadFile = File(...)):
    """Upload voice with REAL Azure Speech-to-Text"""
    try:
        content = await file.read()
        
        # Upload to Azure Blob Storage
        voice_url = storage_service.upload_voice(content)
        
        # REAL transcription using Azure Speech Service
        transcription = speech_service.transcribe_audio(content)
        
        return VoiceUploadResponse(url=voice_url, transcription=transcription)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice upload failed: {str(e)}")

@router.post("/api/audits/submit", response_model=AuditSubmissionResponse)
async def submit_audit(audit: AuditSubmission):
    """Submit audit with REAL AI analysis"""
    try:
        # REAL AI Analysis using Azure OpenAI
        ai_result = ai_service.analyze_audit(
            audit.raw_comments,
            audit.audit_status,
            len(audit.photo_urls)
        )
        
        # Insert audit record
        audit_id = db.execute_insert_with_identity("""
            INSERT INTO audits (
                asset_id, inspector_id, audit_status, raw_comments,
                voice_file_url, ai_summary, ai_structured_output,
                urgency_level, workflow_status, closed_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Closed', GETDATE())
        """, (
            audit.asset_id,
            audit.inspector_id,
            audit.audit_status,
            audit.raw_comments,
            audit.voice_file_url,
            ai_result["summary"],
            json.dumps(ai_result["structured_output"]),
            ai_result["urgency_level"]
        ))
        
        # Insert photo records
        for photo_url in audit.photo_urls:
            db.execute_update(
                "INSERT INTO audit_photos (audit_id, photo_url) VALUES (?, ?)",
                (audit_id, photo_url)
            )
        
        # Update asset last inspection date
        db.execute_update(
            "UPDATE assets SET last_inspection_date = GETDATE() WHERE asset_id = ?",
            (audit.asset_id,)
        )
        
        return AuditSubmissionResponse(
            audit_id=audit_id,
            status="success",
            ai_analysis=AIAnalysisResult(
                urgency_level=ai_result["urgency_level"],
                summary=ai_result["summary"],
                structured_output=ai_result["structured_output"]
            )
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audit submission failed: {str(e)}")

@router.post("/api/reports/generate", response_model=ReportResponse)
async def generate_report(filters: ReportFilter):
    """Generate PDF report"""
    try:
        query = """
            SELECT au.audit_id, a.asset_name, a.asset_type, a.location,
                   au.inspection_date, au.audit_status, au.urgency_level,
                   au.ai_summary, e.full_name, au.ai_structured_output
            FROM audits au
            JOIN assets a ON au.asset_id = a.asset_id
            JOIN employees e ON au.inspector_id = e.employee_id
            WHERE au.inspection_date BETWEEN ? AND ?
        """
        params = [filters.start_date, filters.end_date]
        
        if filters.urgency_level and filters.urgency_level != "all":
            query += " AND au.urgency_level = ?"
            params.append(filters.urgency_level)
        
        if filters.workflow_status and filters.workflow_status != "all":
            query += " AND au.workflow_status = ?"
            params.append(filters.workflow_status)
        
        query += " ORDER BY au.inspection_date DESC"
        
        audits = db.execute_query(query, tuple(params))
        
        # Generate PDF report
        report_url = report_service.generate_pdf_report(audits, filters)
        
        return ReportResponse(
            report_url=report_url,
            total_audits=len(audits)
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")