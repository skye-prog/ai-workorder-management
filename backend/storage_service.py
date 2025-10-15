"""
Azure Blob Storage service
"""
from azure.storage.blob import BlobServiceClient, ContentSettings
import uuid
from config import settings

class StorageService:
    def __init__(self):
        self.blob_service_client = BlobServiceClient.from_connection_string(
            settings.STORAGE_CONNECTION_STRING
        )
    
    def upload_photo(self, file_content: bytes, file_extension: str, content_type: str) -> str:
        """Upload photo to Azure Blob Storage"""
        blob_name = f"{uuid.uuid4()}.{file_extension}"
        blob_client = self.blob_service_client.get_blob_client(
            container="inspection-photos",
            blob=blob_name
        )
        
        blob_client.upload_blob(
            file_content,
            content_settings=ContentSettings(content_type=content_type),
            overwrite=True
        )
        
        return blob_client.url
    
    def upload_voice(self, file_content: bytes) -> str:
        """Upload voice recording to Azure Blob Storage"""
        blob_name = f"{uuid.uuid4()}.wav"
        blob_client = self.blob_service_client.get_blob_client(
            container="voice-recordings",
            blob=blob_name
        )
        
        blob_client.upload_blob(file_content, overwrite=True)
        return blob_client.url
    
    def upload_report(self, pdf_content: bytes, filename: str) -> str:
        """Upload PDF report to Azure Blob Storage"""
        blob_client = self.blob_service_client.get_blob_client(
            container="audit-reports",
            blob=filename
        )
        
        blob_client.upload_blob(
            pdf_content,
            content_settings=ContentSettings(content_type='application/pdf'),
            overwrite=True
        )
        
        return blob_client.url

storage_service = StorageService()