"""
REAL Azure Speech Service for Speech-to-Text
"""
import azure.cognitiveservices.speech as speechsdk
from config import settings
import tempfile
import os

class SpeechService:
    def __init__(self):
        self.speech_config = speechsdk.SpeechConfig(
            subscription=settings.AZURE_SPEECH_KEY,
            region=settings.AZURE_SPEECH_REGION
        )
        self.speech_config.speech_recognition_language = "en-US"
    
    def transcribe_audio(self, audio_content: bytes) -> str:
        """
        REAL Azure Speech-to-Text transcription
        Processes actual audio bytes and returns transcribed text
        """
        temp_audio_path = None
        try:
            # Save audio to temporary file (Azure SDK requires file path)
            with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_audio:
                temp_audio.write(audio_content)
                temp_audio_path = temp_audio.name
            
            # Create audio config from file
            audio_config = speechsdk.audio.AudioConfig(filename=temp_audio_path)
            
            # Create speech recognizer
            speech_recognizer = speechsdk.SpeechRecognizer(
                speech_config=self.speech_config,
                audio_config=audio_config
            )
            
            # Perform recognition
            result = speech_recognizer.recognize_once()
            
            # Process result
            if result.reason == speechsdk.ResultReason.RecognizedSpeech:
                return result.text
            elif result.reason == speechsdk.ResultReason.NoMatch:
                return "No speech recognized. Please ensure clear audio and try again."
            elif result.reason == speechsdk.ResultReason.Canceled:
                cancellation = result.cancellation_details
                if cancellation.reason == speechsdk.CancellationReason.Error:
                    return f"Speech recognition error: {cancellation.error_details}"
                return f"Recognition canceled: {cancellation.reason}"
            else:
                return "Unable to transcribe audio. Please try again."
                
        except Exception as e:
            return f"Transcription error: {str(e)}"
        finally:
            # Clean up temp file
            if temp_audio_path and os.path.exists(temp_audio_path):
                try:
                    os.unlink(temp_audio_path)
                except:
                    pass

speech_service = SpeechService()