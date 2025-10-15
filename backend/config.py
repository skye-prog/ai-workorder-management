"""
Configuration management for Asset Inspection System
"""
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Azure Storage
    STORAGE_CONNECTION_STRING = os.getenv("STORAGE_CONNECTION_STRING")
    
    # Azure SQL Database
    SQL_CONNECTION_STRING = os.getenv("SQL_CONNECTION_STRING")
    
    # Azure OpenAI
    AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
    AZURE_OPENAI_KEY = os.getenv("AZURE_OPENAI_KEY")
    AZURE_OPENAI_DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4.1")
    AZURE_OPENAI_API_VERSION = "2024-12-01-preview"
    
    # Azure Speech
    AZURE_SPEECH_KEY = os.getenv("AZURE_SPEECH_KEY")
    AZURE_SPEECH_REGION = os.getenv("AZURE_SPEECH_REGION")
    
    # Application
    APP_NAME = "Asset Inspection System"
    VERSION = "1.0.0"
    
    # CORS
    CORS_ORIGINS = ["*"]  # Update in production

settings = Settings()