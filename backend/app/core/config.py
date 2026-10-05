from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
GEMINI_API_KEY_1 = os.getenv("GEMINI_API_KEY_1")
