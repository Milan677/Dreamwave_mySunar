from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
# from utils.image_analysis import analyze_image
from utils.gpt_agent import get_gpt_response,send_image_to_gpt
from fuzzywuzzy import fuzz
from pydantic import BaseModel
import pandas as pd
import shutil
import csv
import os
from fastapi.responses import JSONResponse
from PIL import Image
import io
from io import BytesIO
import base64
import torch
from transformers import BlipProcessor, BlipForConditionalGeneration
import google.generativeai as genai


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)


qa_dict = {}

def load_questions():
    df = pd.read_csv("questions.csv")
    for _, row in df.iterrows():
        qa_dict[row['question'].lower()] = row['answer']

load_questions()

class QueryRequest(BaseModel):
    query: str

class AddQARequest(BaseModel):
    question: str
    answer: str

def find_fuzzy_answer(query: str, threshold=80):
    best_match = None
    best_score = 0
    for q in qa_dict:
        score = fuzz.partial_ratio(query.lower(), q)
        if score > best_score:
            best_score = score
            best_match = q
    if best_score >= threshold:
        return qa_dict[best_match]
    return None

def add_to_qa_csv(question: str, answer: str):
    # Append to questions.csv
    with open("questions.csv", "a", newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow([question, answer])
    # Update in-memory dictionary
    qa_dict[question.lower()] = answer

@app.post("/ask/")
async def ask_question(data: QueryRequest):
    query = data.query.strip()
   
    answer = find_fuzzy_answer(query)

    if answer:
        return {"source": "local", "match_score": "fuzzy", "answer": answer}
    else:
        ai_response = get_gpt_response(query)

        # Add query + AI answer to known Q&A CSV
        add_to_qa_csv(query, ai_response)

        return {"source": "deepseek", "answer": ai_response}

@app.post("/add-qa")
async def add_question_answer(data: AddQARequest):
    question = data.question.strip()
    answer = data.answer.strip()
    add_to_qa_csv(question, answer)
    return {"message": "Q&A pair added successfully."}




# Load model + processor
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

@app.post("/analyze-image/")
async def analyze_image(file: UploadFile = File(...)):
    try:
        # Read and open image
        image_data = await file.read()
        image = Image.open(BytesIO(image_data)).convert("RGB")

        # Prepare inputs for the model
        inputs = processor(image, return_tensors="pt")
        out = model.generate(**inputs, max_new_tokens=100)
        description = processor.decode(out[0], skip_special_tokens=True)

        # Add prompt for analyzing ear healing/redness
        prompt = f"Describe the healing condition of the pierced ear in this image. {description}"

        return JSONResponse(content={
            "filename": file.filename,
            "analysis": description
        })
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


# image analysis
@app.post("/analyze-ear-image/")
async def analyze_ear_image(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        image_b64 = base64.b64encode(image_bytes).decode("utf-8")

        analysis = send_image_to_gpt(image_b64)

        return JSONResponse(content={
            "filename": file.filename,
            "analysis": analysis
        })
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})   


# Configure Gemini API Key
genai.configure(api_key="AIzaSyAqe8-cssidHD7raLRJ2j2YHv_HF1-gEqk") 

# Load Gemini Vision model
model = genai.GenerativeModel("gemini-1.5-flash") 


@app.post("/analyze/")
async def analyze_image(file: UploadFile = File(...)):
    try:
        # Read the uploaded image file
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")

        # Medical-specific prompt
        # prompt = """
        # You are an expert pediatric AI assistant specializing in ear piercings.
        # Given an image of a  pierced ear, assess the stage of healing and mention if there’s redness,
        # swelling, discharge, or signs of infection. Give a direct but medically sound response.
        # Please analyze this image and describe the healing stage of the pierced ear.
        # """

        prompt = """
            You are an expert pediatric AI assistant specializing in ear piercings.

            Given an image of a pierced ear, assess the following:
            - The stage of healing (if determinable)
            - Presence of redness, swelling, or discharge
            - Any visible signs of irritation or infection

            Provide a clear, medically sound explanation that avoids using markdown symbols (like asterisks). Format the response using:
            - Short paragraphs for explanations
            - Bullet points for listing symptoms or observations
            - Avoid technical jargon where possible, so it's easy for parents or caretakers to understand

            Always indicate whether the ear appears to be healing normally or if it needs professional medical attention.
        """

        # Send image + prompt to Gemini
        response = model.generate_content([image, prompt])

        return JSONResponse(content={"result": response.text})

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


# @app.post("/chat/")
# async def chat(text: str = Form(...)):
#     reply = get_gpt_response(text)
#     return {"response": reply}

# @app.post("/upload/")
# async def upload_image(file: UploadFile = File(...)):
#     os.makedirs("temp", exist_ok=True)
#     file_path = f"temp/{file.filename}"
#     with open(file_path, "wb") as buffer:
#         shutil.copyfileobj(file.file, buffer)
#     result = analyze_image(file_path)
#     return {"diagnosis": result}