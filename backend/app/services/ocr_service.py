import io
import re

import pytesseract
from PIL import Image


# ----------------------------------------------------------
# Tesseract configuration
# ----------------------------------------------------------
# Change this path if Tesseract is installed somewhere else.
pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)


class OCRService:

    def process_image_bytes(self, image_bytes: bytes) -> dict:
        """
        Process uploaded image bytes using Tesseract OCR.

        Returns:
            {
                "raw_text": "...",
                "policy_number": "POL-998877"
            }
        """

        # --------------------------------------------------
        # 1. Validate bytes
        # --------------------------------------------------
        if not image_bytes:
            raise ValueError(
                "Image data is empty."
            )

        # --------------------------------------------------
        # 2. Open image
        # --------------------------------------------------
        try:
            image = Image.open(
                io.BytesIO(image_bytes)
            )

            # Force complete image decoding
            image.load()

        except Exception as e:
            raise ValueError(
                f"Unable to open image: {str(e)}"
            )

        # --------------------------------------------------
        # 3. Convert image to RGB
        # --------------------------------------------------
        if image.mode != "RGB":
            image = image.convert("RGB")

        # --------------------------------------------------
        # 4. OCR
        # --------------------------------------------------
        try:
            text = pytesseract.image_to_string(
                image
            )

        except Exception as e:
            raise RuntimeError(
                f"Tesseract OCR failed: {str(e)}"
            )

        # --------------------------------------------------
        # 5. Clean OCR text
        # --------------------------------------------------
        text = text.strip()

        # --------------------------------------------------
        # 6. Extract policy number
        # --------------------------------------------------
        policy_number = None

        policy_patterns = [
            r"POL[-\s]?\d+",
            r"POLICY[-\s#:]*\d+",
            r"POLICY\s+NUMBER[-\s:]*([A-Z0-9-]+)"
        ]

        for pattern in policy_patterns:

            match = re.search(
                pattern,
                text,
                re.IGNORECASE
            )

            if match:
                policy_number = (
                    match.group(0)
                    .upper()
                    .replace(" ", "")
                )

                break

        # --------------------------------------------------
        # 7. Return OCR result
        # --------------------------------------------------
        return {
            "raw_text": text,
            "policy_number": policy_number
        }