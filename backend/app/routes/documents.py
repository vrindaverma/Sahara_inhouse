from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from app.services.ocr_service import OCRService
from app.services.graph_service import global_graph_service

router = APIRouter()
ocr_service = OCRService()

@router.post("/upload-and-link")
async def upload_document_and_link_graph(
    file: UploadFile = File(...),
    owner: str = Form(...),
    dependent: str = Form(...)
):
    try:
        file_bytes = await file.read()
        extracted_data = ocr_service.process_image_bytes(file_bytes)
        
        policy_label = extracted_data.get("policy_number") or f"Doc_{file.filename}"

        global_graph_service.add_dependency(
            owner=owner,
            responsibility=policy_label,
            dependent=dependent
        )

        spofs = global_graph_service.detect_single_points_of_failure()

        return {
            "status": "success",
            "ocr_result": extracted_data,
            "graph_link": {
                "owner": owner,
                "responsibility": policy_label,
                "dependent": dependent
            },
            "updated_spofs": spofs
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Pipeline processing failed: {str(e)}"
        )