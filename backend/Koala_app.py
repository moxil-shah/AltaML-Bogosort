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
        text = data['content']

        inputs = tokenizer(text, return_tensors="pt")
        outputs = model(**inputs)
        probs = softmax(outputs.logits, dim=-1)
        labels = model.config.id2label
        response = [{label: prob.item()} for label, prob in zip(labels.values(), probs[0])]

        return jsonify(response)

    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)
