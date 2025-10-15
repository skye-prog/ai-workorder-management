"""
AI Analysis Service with Multi-Agent System using REAL Azure OpenAI
"""
from openai import AzureOpenAI
import json
import base64
from config import settings

class AIService:
    def __init__(self):
        self.client = AzureOpenAI(
            api_key=settings.AZURE_OPENAI_KEY,
            api_version=settings.AZURE_OPENAI_API_VERSION,
            azure_endpoint=settings.AZURE_OPENAI_ENDPOINT
        )
        self.deployment = settings.AZURE_OPENAI_DEPLOYMENT
    
    def analyze_photo(self, image_content: bytes, audit_status: str) -> str:
        """
        REAL Azure OpenAI Vision analysis of inspection photo
        Uses GPT-4 Vision to analyze the actual image content
        """
        try:
            # Convert image bytes to base64
            base64_image = base64.b64encode(image_content).decode('utf-8')
            
            prompt = f"""You are an expert industrial asset inspector analyzing an inspection photo.

The asset has been marked as: {audit_status}

Analyze this image and provide a brief technical assessment (2-3 sentences) focusing on:
- Visible condition of the equipment/asset
- Any notable defects, wear, corrosion, or damage you observe
- Safety concerns if visible
- Maintenance recommendations based on what you see

Be specific about what you observe in the image. Keep it professional and concise."""

            response = self.client.chat.completions.create(
                model=self.deployment,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert industrial equipment inspector with years of experience."
                    },
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}"
                                }
                            }
                        ]
                    }
                ],
                temperature=0.3,
                max_tokens=200
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            return f"Image analysis error: {str(e)}. Photo captured for manual review."
    
    def analyze_audit(self, raw_comments: str, audit_status: str, photo_count: int) -> dict:
        """
        Multi-Agent AI Analysis Pipeline using REAL Azure OpenAI
        """
        urgency_level = self._determine_urgency(raw_comments, audit_status)
        summary = self._create_summary(raw_comments, audit_status, photo_count)
        structured_output = self._generate_structured_output(raw_comments, audit_status, urgency_level)
        
        return {
            "urgency_level": urgency_level,
            "summary": summary,
            "structured_output": structured_output
        }
    
    def _determine_urgency(self, comments: str, status: str) -> str:
        """Agent 1: Determine urgency using REAL Azure OpenAI"""
        prompt = f"""You are an expert industrial asset inspector. Analyze this audit and determine urgency.

Audit Status: {status}
Inspector Comments: {comments}

Rules:
- "Critical" status = Critical urgency
- "Poor" status = High urgency
- "Fair" status = Medium urgency
- "Good" status = Low urgency
- Override if comments mention: unsafe, dangerous, immediate, hazard, risk, emergency

Return ONLY: Low, Medium, High, or Critical"""

        try:
            response = self.client.chat.completions.create(
                model=self.deployment,
                messages=[
                    {"role": "system", "content": "You are an asset inspection analyst."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2,
                max_tokens=10
            )
            urgency = response.choices[0].message.content.strip()
            valid_levels = ["Low", "Medium", "High", "Critical"]
            return urgency if urgency in valid_levels else self._fallback_urgency(status)
        except:
            return self._fallback_urgency(status)
    
    def _create_summary(self, comments: str, status: str, photo_count: int) -> str:
        """Agent 2: Create summary using REAL Azure OpenAI"""
        prompt = f"""Summarize this inspection in 2-3 professional sentences.

Status: {status}
Comments: {comments}
Photos: {photo_count}

Focus on: condition, key findings, recommendations."""

        try:
            response = self.client.chat.completions.create(
                model=self.deployment,
                messages=[
                    {"role": "system", "content": "You are a technical writer for inspection reports."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.4,
                max_tokens=200
            )
            return response.choices[0].message.content.strip()
        except:
            return f"Asset inspection completed with {status} status. {photo_count} photos documented."
    
    def _generate_structured_output(self, comments: str, status: str, urgency: str) -> dict:
        """Agent 3: Generate structured JSON using REAL Azure OpenAI with example"""
        
        example_input = """checked padmount transformer T-892 behind shopping center. all good. no issues. paint is fine, no rust, locks working properly. ground around it is stable. last serviced 6 months ago. cooling fins clean. no unusual sounds or smells. temperature normal. maybe inspect again in a year. everything looks great."""
        
        example_output = """{
  "executive_summary": "Padmount Transformer T-892 is in excellent condition with no issues identified. All components functioning properly, recent service maintenance completed, and no safety concerns present.",
  "condition_assessment": {
    "overall_status": "Good",
    "urgency_level": "Low",
    "safety_risk": "None"
  },
  "findings": [
    "Exterior paint in good condition",
    "No corrosion or rust detected",
    "Security locks functioning properly",
    "Ground stability confirmed",
    "Cooling fins clean and unobstructed",
    "No abnormal sounds detected",
    "Operating temperature within normal range"
  ],
  "issues_identified": [],
  "recommendations": [
    "Continue routine inspection schedule",
    "Next inspection in 12 months"
  ],
  "next_actions": {
    "create_workorder": false,
    "priority": "Routine",
    "maintenance_required": false
  },
  "safety_notes": "No safety concerns identified. Asset operating safely."
}"""

        prompt = f"""Convert inspection notes to JSON format.

EXAMPLE INPUT:
{example_input}

EXAMPLE OUTPUT:
{example_output}

NOW PROCESS:
Status: {status}
Urgency: {urgency}
Notes: {comments}

Return ONLY valid JSON with same structure. No markdown."""

        try:
            response = self.client.chat.completions.create(
                model=self.deployment,
                messages=[
                    {"role": "system", "content": "Return only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=800
            )
            
            content = response.choices[0].message.content.strip()
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
                content = content.strip()
            
            return json.loads(content)
            
        except:
            return {
                "executive_summary": f"Inspection: {status}. {comments[:100]}",
                "condition_assessment": {
                    "overall_status": status,
                    "urgency_level": urgency,
                    "safety_risk": "Pending" if urgency in ["High", "Critical"] else "None"
                },
                "findings": [f"Status: {status}"],
                "issues_identified": [] if status == "Good" else ["Review needed"],
                "recommendations": ["Standard maintenance"],
                "next_actions": {
                    "create_workorder": urgency in ["High", "Critical"],
                    "priority": urgency,
                    "maintenance_required": status in ["Poor", "Critical"]
                },
                "safety_notes": comments[:200] if comments else "Standard inspection."
            }
    
    def _fallback_urgency(self, status: str) -> str:
        urgency_map = {"Good": "Low", "Fair": "Medium", "Poor": "High", "Critical": "Critical"}
        return urgency_map.get(status, "Medium")

ai_service = AIService()