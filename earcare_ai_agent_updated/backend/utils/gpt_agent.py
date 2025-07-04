import requests

OPENROUTER_API_KEY = "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"
OPENROUTER_MODEL = "deepseek/deepseek-chat"
OPENROUTER_API_KEY2="sk-fe7701e4c164459c965498e26e7e0a6b"
OPENROUTER_MODEL2 = "openai/gpt-4-vision-preview"

def get_gpt_response(user_input):
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost",  
        "X-Title": "Earcare Assistant",      
    }
    
    prompt = f"""
    You must respond to the following query in a clear and concise single sentence, with a maximum of 150 words. 
    Avoid unnecessary details and focus on delivering a direct, informative, and complete answer.

    Query: {user_input}
    """

    payload = {
        "model": OPENROUTER_MODEL,
        "messages": [
            {"role": "system", "content": "You are a pediatric ear piercing AI assistant."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.5,
        "max_tokens": 100,
        "top_p": 0.9
    }

    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()  # Raise an error for 4xx/5xx responses

    return response.json()["choices"][0]["message"]["content"]




def send_image_to_gpt(image_b64: str):
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost", 
        "X-Title": "Earcare Assistant",
    }

    payload = {
        "model": OPENROUTER_MODEL2,
        "messages": [
            {
                "role": "system",
                "content": "You are an expert pediatric AI assistant specializing in baby ear piercings. Given an image of a baby’s pierced ear, assess the stage of healing and mention if there’s redness, swelling, discharge, or signs of infection. Give a direct but medically sound response."
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Please analyze this image and describe the healing stage of the pierced ear."
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_b64}"
                        }
                    }
                ]
            }
        ]
    }

    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"]
