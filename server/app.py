from flask import Flask, request, jsonify
import os
import requests
from flask_cors import CORS

app=Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return "Flask is running!"

@app.route('/analyze', methods=['POST'])
def analyze():
    data=request.get_json()
    text=data.get("text","")

    return jsonify({
        "TOXICITY":0.75,
        "SEVERE_TOXICITY":0.2,
        "INSULT":0.65,
        "PROFANITY":0.4
    })

PERsPECTIVE_API_KEY=os.getenv("PERSPECTIVE_API_KEY")

@app.route("/analyze", methods=["POST"])
def analyze_text():
    data=request.json
    text=data.json("text")
    payload={
        "comment":{"text",text},
        "languages":["en"],
        "requestedAttributes":{
            "TOXICITY":{},
            "SEVERE_TOXICITY":{},
            "INSULT":{},
            "THREAT":{}
        }
    }

    response=requests.post(
        f"https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key={PERsPECTIVE_API_KEY}",
        json=payload
    )

    return jsonify(response.json())

if __name__=="__main__" :
    app.run(debug=True)  