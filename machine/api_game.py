# -*- coding: utf-8 -*-
"""
API de Recomendação de Games - Backend Flask
Integrado com MySQL Azure e sistema de avaliações
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
import json
from dotenv import load_dotenv
from google.cloud import pubsub_v1
from knn_game import SistemaRecomendacaoGames
from machine.pubsub_publish import publish_evaluation  # <-- Importa a função do pubsub_send.py

# ------------------------
# Load env (para GOOGLE key path caso exista)
# ------------------------
load_dotenv()

# Se o path da key estiver no .env, setamos a variável padrão do SDK
gcp_key = os.getenv("GCP_PUBSUB_KEY_PATH")
if gcp_key:
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = gcp_key

# ========================
# LOGGING
# ========================
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ========================
# FLASK + CORS
# ========================
app = Flask(__name__)
CORS(app)

# ========================
# SISTEMA DE RECOMENDAÇÃO
# ========================
sistema = SistemaRecomendacaoGames()

# ========================
# PUBSUB CONFIG
# ========================
# Use o tópico completo no .env: projects/<proj>/topics/<topic>
PUBSUB_TOPIC = os.getenv("GCP_PUBSUB_TOPIC_NAME")
publisher = pubsub_v1.PublisherClient()

# ================================================================
# ROTAS
# ================================================================

@app.route('/')
def home():
    return jsonify({
        "message": "🎮 API de Recomendação de Games - Online!",
        "version": "2.0",
        "status": "operacional",
        "total_jogos": len(sistema.games_df)
    })

# ------------------------------
@app.route('/jogos', methods=['GET'])
def get_jogos():
    limite = request.args.get('limite', default=50, type=int)
    pagina = request.args.get('pagina', default=1, type=int)

    jogos = sistema.get_todos_jogos()
    start = (pagina - 1) * limite
    end = start + limite

    return jsonify({
        "jogos": jogos[start:end],
        "pagina": pagina,
        "limite": limite,
        "total": len(jogos),
        "paginas_total": (len(jogos) + limite - 1) // limite
    })


# ------------------------------
@app.route('/jogos/<int:jogo_id>', methods=['GET'])
def get_jogo_id(jogo_id):
    jogo = sistema.get_jogo_por_id(jogo_id)
    if jogo:
        return jsonify(jogo)
    return jsonify({"error": "Jogo não encontrado"}), 404


# ------------------------------
@app.route('/jogos/busca/<string:nome>', methods=['GET'])
def get_jogo_nome(nome):
    jogos = sistema.get_jogo_por_nome(nome)
    return jsonify({
        "resultados": jogos,
        "total": len(jogos),
        "busca": nome
    })


# ------------------------------
@app.route('/jogos/categorias', methods=['GET'])
def get_jogos_por_categorias():
    categoria1 = request.args.get('cat1', '')
    categoria2 = request.args.get('cat2', '')
    categoria3 = request.args.get('cat3', '')
    categoria4 = request.args.get('cat4', '')

    categorias = [c for c in [categoria1, categoria2, categoria3, categoria4] if c]

    if len(categorias) == 0:
        return jsonify({"error": "Pelo menos uma categoria é necessária"}), 400

    limite = request.args.get('limite', default=10, type=int)
    jogos = sistema.get_jogos_por_categorias(categorias, limite)

    return jsonify({
        "categorias_buscadas": categorias,
        "jogos": jogos,
        "total": len(jogos),
        "limite": limite
    })


# ------------------------------
@app.route('/jogos/aleatorio', methods=['GET'])
def get_jogo_aleatorio():
    return jsonify(sistema.get_jogo_aleatorio())


# ------------------------------
@app.route('/jogos/<int:jogo_id>/recomendacoes', methods=['GET'])
def get_recomendacoes(jogo_id):
    limite = request.args.get('limite', default=5, type=int)
    rec = sistema.get_jogos_recomendados(jogo_id, limite)
    return jsonify({
        "jogo_base_id": jogo_id,
        "recomendacoes": rec,
        "total": len(rec)
    })


# ------------------------------
@app.route('/ranking/populares', methods=['GET'])
def get_ranking_populares():
    limite = request.args.get('limite', default=10, type=int)
    ranking = sistema.get_ranking_populares(limite)
    return jsonify({
        "ranking": "populares",
        "jogos": ranking,
        "total": len(ranking)
    })


# ------------------------------
@app.route('/ranking/melhores', methods=['GET'])
def get_ranking_melhores():
    limite = request.args.get('limite', default=10, type=int)
    min_avaliacoes = request.args.get('min_avaliacoes', default=5, type=int)
    ranking = sistema.get_ranking_melhor_avaliados(limite, min_avaliacoes)
    return jsonify({
        "ranking": "melhores",
        "jogos": ranking,
        "total": len(ranking),
        "min_avaliacoes": min_avaliacoes
    })


# ======================================================
# ROTAS PARA AVALIAÇÃO ENVIANDO PARA PUBSUB
# ======================================================

@app.route('/avaliacao/positiva', methods=['POST'])
def post_avaliacao_positiva():
    data = request.get_json()

    if not data or "jogo_id" not in data or "user_id" not in data:
        return jsonify({"error": "jogo_id e user_id são obrigatórios"}), 400

    user_id = data["user_id"]
    game_id = data["jogo_id"]

    message_id = publish_evaluation(user_id, game_id, "positive")
    if message_id:
        return jsonify({
            "message": "Avaliação POSITIVA enviada para processamento",
            "status": "enviado_pubsub",
            "message_id": message_id,
            "dados": {
                "user_id": int(user_id),
                "game_id": int(game_id),
                "evaluation": "positive"
            }
        })
    else:
        logger.exception("Falha ao publicar no Pub/Sub")
        return jsonify({"error": "Falha ao enviar avaliação para o Pub/Sub"}), 500


@app.route('/avaliacao/negativa', methods=['POST'])
def post_avaliacao_negativa():
    data = request.get_json()

    if not data or "jogo_id" not in data or "user_id" not in data:
        return jsonify({"error": "jogo_id e user_id são obrigatórios"}), 400

    user_id = data["user_id"]
    game_id = data["jogo_id"]

    message_id = publish_evaluation(user_id, game_id, "negative")
    if message_id:
        return jsonify({
            "message": "Avaliação NEGATIVA enviada para processamento",
            "status": "enviado_pubsub",
            "message_id": message_id,
            "dados": {
                "user_id": int(user_id),
                "game_id": int(game_id),
                "evaluation": "negative"
            }
        })
    else:
        logger.exception("Falha ao publicar no Pub/Sub")
        return jsonify({"error": "Falha ao enviar avaliação para o Pub/Sub"}), 500


# ======================================================
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "jogos_carregados": len(sistema.games_df),
        "modelo_treinado": sistema.model is not None
    })


@app.route('/status', methods=['GET'])
def get_status():
    total = len(sistema.games_df)
    total_avaliacoes = (
        sistema.games_df['positive'].fillna(0).sum()
        + sistema.games_df['negative'].fillna(0).sum()
    )

    return jsonify({
        "status": "operational",
        "jogos": total,
        "avaliacoes_totais": int(total_avaliacoes)
    })


# ======================================================
if __name__ == '__main__':
    host = os.getenv("FLASK_HOST", "0.0.0.0")
    port = int(os.getenv("FLASK_PORT", 4000))
    debug = os.getenv("FLASK_DEBUG", "False").lower() == "true"

    app.run(host=host, port=port, debug=debug)