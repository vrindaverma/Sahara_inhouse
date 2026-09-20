from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import JSONResponse

import hashlib


router = APIRouter()


@router.post("/upload-and-link")
async def upload_document_and_link_graph(
    file: UploadFile = File(...),
    owner: str = Form(...),
    dependent: str = Form(...)
):
    # Read raw uploaded bytes
    data = await file.read()

    # Basic information
    size = len(data)
    first_bytes = data[:32]
    hex_bytes = data[:32].hex()

    # PNG signature check
    is_png = data.startswith(b"\x89PNG\r\n\x1a\n")

    # JPEG signature check
    is_jpeg = (
        data.startswith(b"\xff\xd8\xff")
    )

    # WEBP signature check
    is_webp = (
        len(data) >= 12
        and data[:4] == b"RIFF"
        and data[8:12] == b"WEBP"
    )

    return JSONResponse(
        content={
            "filename": file.filename,
            "content_type": file.content_type,

            "size": size,

            "first_bytes_repr": repr(first_bytes),

            "first_bytes_hex": hex_bytes,

            "is_png": is_png,
            "is_jpeg": is_jpeg,
            "is_webp": is_webp,

            "sha256": hashlib.sha256(data).hexdigest(),

            "owner": owner,
            "dependent": dependent
        }
    )