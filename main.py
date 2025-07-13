from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

DATA_FILE = os.path.join(os.path.dirname(__file__), 'produtos.json')

def load_produtos():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_produtos(produtos):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(produtos, f, ensure_ascii=False, indent=2)

@app.route('/produtos', methods=['GET'])
def listar_produtos():
    produtos = load_produtos()
    return jsonify(produtos)

@app.route('/produtos', methods=['POST'])
def cadastrar_produto():
    produto = request.json
    produtos = load_produtos()
    produtos.append(produto)
    save_produtos(produtos)
    return jsonify({'status': 'ok', 'produto': produto}), 201

if __name__ == '__main__':
    app.run(debug=True, port=5000)