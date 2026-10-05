from pypdf import PdfReader
from fastapi import HTTPException

#MAX_PAGES = 2


async def extract_pdf_text(file) -> str:
    reader = PdfReader(file.file)

    #if len(reader.pages) > MAX_PAGES:
        #raise HTTPException(
            #status_code=400, detail=f"PDF exceeds {MAX_PAGES} pages limit"
        #)

    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""

    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from PDF")

    return text
