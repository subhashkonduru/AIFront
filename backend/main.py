from fastapi import FastAPI
import json
from pydantic import BaseModel
import httpx
from qdrant_client import QdrantClient, models
import uuid
import time
from fastapi import FastAPI, HTTPException
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
import os

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost:3000",  # React frontend default port
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv() # Load environment variables from .env file

NOVITA_API_KEY = 'sk_OoXT65p1Tk-HAM_he0LorltHpSGcILtcGtjcnyy87Jk'
NOVITA_BASE_URL = os.getenv("NOVITA_BASE_URL", "https://api.novita.ai/v3/openai")
NOVITA_CHAT_COMPLETIONS_PATH = os.getenv("NOVITA_CHAT_COMPLETIONS_PATH", "/chat/completions")

QDRANT_HOST = os.getenv("QDRANT_HOST", "localhost")
QDRANT_PORT = int(os.getenv("QDRANT_PORT", 6333))
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "optimized_code_snippets")
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
VECTOR_SIZE = embedding_model.get_sentence_embedding_dimension() # Get the actual dimension from the model

# Initialize Qdrant client
qdrant_client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)

# Ensure collection exists
try:
    qdrant_client.recreate_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=models.VectorParams(size=VECTOR_SIZE, distance=models.Distance.COSINE),
    )
except Exception as e:
    print(f"Could not recreate collection, it might already exist: {e}")

class CodeAnalyzeRequest(BaseModel):
    code: str

class OptimizedCodeSnippet(BaseModel):
    code: str
    explanation: str

@app.post("/store-snippet")
async def store_snippet(snippet: OptimizedCodeSnippet):
    try:
        # Generate embedding for the code snippet
        text_to_embed = f"Code: {snippet.code}\nExplanation: {snippet.explanation}"
        embedding = embedding_model.encode(text_to_embed).tolist()

        qdrant_client.upsert(
            collection_name=COLLECTION_NAME,
            points=[
                models.PointStruct(
                    id=str(uuid.uuid4()), # Generate a unique ID for the snippet
                    vector=embedding,
                    payload={
                        "code": snippet.code,
                        "explanation": snippet.explanation
                    }
                )
            ]
        )
        return {"message": "Snippet stored successfully"}
    except Exception as e:
        return {"error": f"Failed to store snippet: {e}"}

class SearchRequest(BaseModel):
    query: str
    limit: int = 5

@app.post("/search-snippets")
async def search_snippets(request: SearchRequest):
    try:
        query_embedding = embedding_model.encode(request.query).tolist()
        search_result = qdrant_client.search(
            collection_name=COLLECTION_NAME,
            query_vector=query_embedding,
            limit=request.limit
        )
        results = []
        for hit in search_result:
            results.append({
                "code": hit.payload["code"],
                "explanation": hit.payload["explanation"],
                "score": hit.score
            })
        return results
    except Exception as e:
        return {"error": f"Failed to search snippets: {e}"}

@app.get("/")
async def root():
    return {"message": "AI Code Optimizer Backend"}

@app.post("/analyze-code")
async def analyze_code(request: CodeAnalyzeRequest):
    if not request.code.strip():
        return {"analysis": "It seems like you haven't provided the code yet. Please paste the code you'd like me to analyze, and I'll do my best to:\n\n1. Explain how the code works\n2. Identify potential bugs or areas for improvement\n3. Suggest optimizations to make the code more efficient, readable, or maintainable\n\nPlease paste the code, and I'll get started!", "execution_time": 0.0}

    headers = {
        "Authorization": f"Bearer {NOVITA_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "meta-llama/llama-3.1-8b-instruct", # Using a model known to be available on Novita.ai
        "messages": [
            {"role": "system", "content": "You are a helpful assistant that analyzes code and provides suggestions for optimization, explanation, identifying bugs, and security vulnerabilities. Focus on common security issues like injection flaws, broken authentication, sensitive data exposure, XML External Entities (XXE), broken access control, security misconfigurations, cross-site scripting (XSS), insecure deserialization, and insufficient logging & monitoring. Additionally, analyze the code for adherence to general compliance principles such as data privacy (GDPR), security controls (SOC2), and information security management (ISO27001), looking for aspects like proper data handling, access controls, logging, and secure coding practices. Your response MUST be a JSON object with the following keys: 'analysis' (string), 'optimized_code' (string), and 'explanation' (string)."},
            {"role": "user", "content": f"Analyze the following code for optimization, explanation, potential bugs, and security vulnerabilities:\n\n```python\n{request.code}\n```"}
        ],
        "max_tokens": 200,
        "temperature": 0.2
    }

    async with httpx.AsyncClient() as client:
        try:
            start_time = time.time()
            response = await client.post(f"{NOVITA_BASE_URL}{NOVITA_CHAT_COMPLETIONS_PATH}", headers=headers, json=payload)
            # Log the full response for debugging before raising for status
            print(f"Novita.ai Raw Response Status: {response.status_code}")
            print(f"Novita.ai Raw Response Headers: {response.headers}")
            print(f"Novita.ai Raw Response Body: {response.text}")

            response.raise_for_status()
            analysis_result = response.json()
            # Log the parsed JSON response
            print(f"Novita.ai API Response (Parsed): {analysis_result}")

            # Assuming the analysis result is directly in the 'content' of the first choice's message
            # Adjust this based on the actual structure of Novita.ai's chat completion response
            if analysis_result and analysis_result.get("choices"):
                message_content = analysis_result["choices"][0]["message"]["content"]
                try:
                    # Attempt to parse the message_content as JSON
                    parsed_content = json.loads(message_content)
                    # Ensure the parsed content has the expected keys
                    if all(key in parsed_content for key in ["analysis", "optimized_code", "explanation"]):
                        end_time = time.time()
                        execution_time = end_time - start_time
                        return {
                            "analysis": parsed_content["analysis"],
                            "optimized_code": parsed_content["optimized_code"],
                            "explanation": parsed_content["explanation"],
                            "execution_time": execution_time
                        }
                    else:
                        raise HTTPException(status_code=500, detail="API response JSON is missing required keys.")
                except json.JSONDecodeError:
                    # If message_content is not valid JSON, return it as plain analysis
                    end_time = time.time()
                    execution_time = end_time - start_time
                    return {"analysis": message_content, "execution_time": execution_time}
            else:
                raise HTTPException(status_code=500, detail="Unexpected API response format")
        except httpx.HTTPStatusError as e:
            print(f"HTTP Status Error: {e.response.status_code}")
            print(f"Response Text: {e.response.text}")
            print(f"Response Headers: {e.response.headers}")
            raise HTTPException(status_code=e.response.status_code, detail=f"HTTP error occurred: {e.response.status_code} - {e.response.text}")
        except httpx.RequestError as e:
            print(f"Request Error: {e}")
            raise HTTPException(status_code=500, detail=f"An error occurred while requesting URL('{e.request.url}'): {e}")