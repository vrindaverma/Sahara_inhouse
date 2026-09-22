from pydantic import BaseModel
from typing import List, Optional

class ResponsibilityNode(BaseModel):
    id: str
    label: str
    owner: str
    dependent: str
    type: str  # e.g., "Bill", "Insurance", "Caregiving"

class EmergencyTriggerRequest(BaseModel):
    user_id: str
    trustee_ids: List[str]
    proof_document_id: Optional[str] = None

class EmergencyCapsuleRelease(BaseModel):
    user_id: str
    status: str
    released_items: List[dict]