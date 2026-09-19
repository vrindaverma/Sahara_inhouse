import pytesseract
from PIL import Image
import io
import re

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

class OCRService:
    def process_image_bytes(self, image_bytes: bytes) -> dict:
        image = Image.open(io.BytesIO(image_bytes))
        text = pytesseract.image_to_string(image)
        
        # Simple regex extraction for policy numbers
        policy_match = re.search(r'POL-\d+', text)
        policy_number = policy_match.group(0) if policy_match else None
        
        return {
            "raw_text": text,
            "policy_number": policy_number
        }