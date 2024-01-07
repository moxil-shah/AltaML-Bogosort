# from flask import Flask, request, jsonify
# from flask_cors import CORS
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from torch.nn.functional import softmax
from transformers import AutoModelForSequenceClassification, AutoTokenizer
import requests
import json
import asyncio
import aiohttp

# app = Flask(__name__)
# CORS(app, supports_credentials= True, allow_headers=['Content-Type', 'Accept'])
app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = AutoModelForSequenceClassification.from_pretrained(
    "./moderation_model/")
tokenizer = AutoTokenizer.from_pretrained("./moderation_model/")


class Item(BaseModel):
    content: list


async def hate_speech(texts):
    print("Starting hate speech prediction")
    inputs = tokenizer(texts, return_tensors="pt",
                       padding=True, truncation=True, max_length=512)
    outputs = model(**inputs)
    probs = softmax(outputs.logits, dim=-1)
    labels = model.config.id2label

    responses = []

    for i, text_probs in enumerate(probs):
        response = {label: prob.item()
                    for label, prob in zip(labels.values(), text_probs)}
        responses.append({f"Text {i + 1}": response})
    print("Hate speech prediction completed")
    return responses


async def integrity_check(texts):
    print("Starting integrity check prediction")
    url = "https://gpt-content-detector.p.rapidapi.com/"
    headers = {
        "X-RapidAPI-Key": "8eac8447f3msh6cd12e96b201777p1485c4jsn81de8b8aedca",
        "X-RapidAPI-Host": "gpt-content-detector.p.rapidapi.com"
    }
    querystring = {"text": texts}

    async with aiohttp.ClientSession() as session:
        async with session.get(url, headers=headers, params=querystring) as resp:
            if resp.headers['Content-Type'] == 'application/json':
                response = await resp.json()
            else:
                print(resp.headers['Content-Type'],  ';bgbgbh')
                response_txt = await resp.text()
                response = json.loads(response_txt)
    print("Integrity check prediction completed")
    return response
    # return response


@app.post('/predict')
async def predict(item: Item):
    try:
        texts = item.content

        print("Starting prediction", texts)

        responses = await hate_speech(texts)
        # response = await integrity_check(texts)
        # responses.append(response)

        print("Prediction completed", responses)

        return responses

    except Exception as e:
        return {'error': str(e)}
