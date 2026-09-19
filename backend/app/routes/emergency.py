from fastapi import APIRouter, HTTPException
from app.models import EmergencyTriggerRequest, EmergencyCapsuleRelease

router = APIRouter()

MOCK_CAPSULE_DB = {
    "user_101": {
        "trustees_required": 2,
        "trusted_members": ["trustee_a", "trustee_b"],
        "items": [
            {"title": "Health Insurance Policy", "policy_num": "POL-99218", "key": "DEC-KEY-101"},
            {"title": "House Rent Auto-Debit", "due_day": "5th", "action": "Transfer ownership to Trustee A"}
        ]
    }
}

@router.post("/trigger", response_model=EmergencyCapsuleRelease)
def trigger_emergency_workflow(payload: EmergencyTriggerRequest):
    capsule = MOCK_CAPSULE_DB.get(payload.user_id)
    if not capsule:
        raise HTTPException(status_code=404, detail="User capsule not found")
    
    if len(payload.trustee_ids) < capsule["trustees_required"]:
        return {
            "user_id": payload.user_id,
            "status": "PENDING_VERIFICATION",
            "released_items": []
        }
    
    return {
        "user_id": payload.user_id,
        "status": "RELEASED",
        "released_items": capsule["items"]
    }