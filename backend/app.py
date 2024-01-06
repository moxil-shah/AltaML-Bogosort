from flask import Flask, request, jsonify
from detoxify import Detoxify

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    if request.method == 'POST':
        content = request.json.get('content', '')
        results = Detoxify('unbiased').predict([content])
        return jsonify({'results': results})

if __name__ == '__main__':
    app.run(debug=True)