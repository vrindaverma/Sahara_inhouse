from fastapi import APIRouter, HTTPException, status
from app.models import ResponsibilityNode
from app.services.graph_service import global_graph_service

router = APIRouter()

@router.post("/add-dependency", status_code=status.HTTP_201_CREATED)
def add_dependency(node: ResponsibilityNode):
    try:
        global_graph_service.add_dependency(
            owner=node.owner,
            responsibility=node.label,
            dependent=node.dependent
        )
        return {
            "status": "success",
            "message": f"Dependency linked: {node.owner} -> {node.label} -> {node.dependent}"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to add dependency: {str(e)}"
        )

@router.get("/visualization")
def get_graph():
    return global_graph_service.export_graph_json()

@router.get("/analyze-risk")
def analyze_risk():
    try:
        spofs = global_graph_service.detect_single_points_of_failure()
        return {
            "status": "success",
            "single_points_of_failure": spofs,
            "spof_count": len(spofs)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Risk analysis failed: {str(e)}"
        )