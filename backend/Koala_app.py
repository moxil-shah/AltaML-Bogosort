from flask import Flask, request, jsonify
from torch.nn.functional import softmax
from transformers import AutoModelForSequenceClassification, AutoTokenizer

app = Flask(__name__)

model = AutoModelForSequenceClassification.from_pretrained("./moderation_model/")
tokenizer = AutoTokenizer.from_pretrained("./moderation_model/")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        texts = data['texts']

        inputs = tokenizer(texts, return_tensors="pt", padding=True, truncation=True, max_length=512)
        outputs = model(**inputs)
        probs = softmax(outputs.logits, dim=-1)
        labels = model.config.id2label

        responses = []

        for i, text_probs in enumerate(probs):
            response = {label: prob.item() for label, prob in zip(labels.values(), text_probs)}
            responses.append({f"Text {i + 1}": response})

        return jsonify(responses)

    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)