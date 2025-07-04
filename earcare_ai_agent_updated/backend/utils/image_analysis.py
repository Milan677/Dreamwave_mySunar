# from transformers import pipeline
# from PIL import Image

# classifier = pipeline("image-classification", model="nateraw/skin-condition-classifier")

# def analyze_image(image_path):
#     image = Image.open(image_path)
#     results = classifier(image)
#     top_result = results[0]
#     label = top_result['label']
#     confidence = round(top_result['score'] * 100, 2)
#     return f"{label} with {confidence}% confidence"