from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import pytesseract
import io
import re

app = FastAPI()

# Allow requests from mobile dev environment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # use ["http://localhost:19006"] for specific
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def extract_currency(text: str):
    currency_regex = r"(\$|Rs\.?|LKR\.?)"
    matches = re.findall(currency_regex, text, flags=re.IGNORECASE)
    return matches[-1] if matches else None

def extract_total(text: str):
    # Filter out 'subtotal' and 'cash' related amounts from the text
    text = re.sub(r"(subtotal|cash)[\s:]*[\d\.,]+", "", text, flags=re.IGNORECASE)
    
    # Find all currency amounts in the text
    currency_regex = r"(?:\$|Rs\.?|LKR\.?)\s*(\d+(?:\.\d{1,2})?)"
    currency_matches = re.findall(currency_regex, text, flags=re.IGNORECASE)
    
    if currency_matches:
        # Return the maximum valid amount found (ignoring subtotal and cash)
        return max([float(amount) for amount in currency_matches])

    # Look for specific total-related phrases and their corresponding amounts
    total_regex = r"(?:total|grand total|amount due|balance|amount)\s*[:\-]?\s*(\d+(?:\.\d{1,2})?)"
    total_matches = re.findall(total_regex, text, flags=re.IGNORECASE)
    
    if total_matches:
        return float(total_matches[-1])

    # If no specific total, return the largest valid number in the text
    numbers = re.findall(r"\d+(?:\.\d{1,2})?", text)
    valid_numbers = [float(num) for num in numbers if float(num) > 1.0]
    
    return valid_numbers[-1] if valid_numbers else 0

@app.post("/ocr")
async def ocr(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))

    text = pytesseract.image_to_string(image)
    print("Extracted Text:\n", text)

    total = extract_total(text)
    currency = extract_currency(text)

    return {
        "total": total,
        "currency": currency
    }
