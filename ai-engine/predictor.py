import json
import sys
import random
import os
from groq import Groq

# Register for free API Key at: console.groq.com
client = Groq(api_key="YOUR_GROQ_API_KEY_HERE")

def get_ai_analysis():
    assets = ["Property", "Tech", "Crypto", "PE"]
    results = {"predictions": {}}
    
    # 1. Predictive Logic (Simulation)
    for asset in assets:
        results["predictions"][asset] = {
            "predicted_yield": round(random.uniform(5, 35), 2),
            "signal": random.choice(["BUY", "HOLD", "SELL"])
        }
    
    # 2. LLM Insight (Groq) - Style: Gangster Hài Chill
    try:
        completion = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[{"role": "system", "content": "You are a professional but gangster-chill financial advisor. Give 1 line of advice for a high-net-worth portfolio. Be direct, witty, and short."}],
        )
        results["ai_advice"] = completion.choices[0].message.content
    except:
        results["ai_advice"] = "Market is wild, hold your bag tight or get rekt. Just buy the dip."

    return results

if __name__ == "__main__":
    print(json.dumps(get_ai_analysis()))