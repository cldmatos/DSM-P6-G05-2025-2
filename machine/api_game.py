# -*- coding: utf-8 -*-
"""
API de Recomendação de Games - Backend Flask
Integrado com MySQL Azure e sistema de avaliações
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
from knn_game import SistemaRecomendacaoGames

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Permitir requisições de diferentes origens

# Inicializar o sistema de recomendação
sistema = SistemaRecomendacaoGames()

# =============================================================================
# ROTAS DA API
# =============================================================================

@app.route('/')
def home():
    """Rota inicial da API"""
    return jsonify({
        "message": "🎮 API de Recomendação de Games - Online!",
        "version": "2.0",
        "status": "operacional",
        "total_jogos": len(sistema.games_df),
        "endpoints": {
            "GET /": "Informações da API (esta página)",
            "GET /jogos": "Lista todos os jogos com paginação",
            "GET /jogos/<id>": "Busca jogo por ID", 
            "GET /jogos/busca/<nome>": "Busca jogo por nome",
            "GET /jogos/categorias": "🎯 NOVO: Filtra por 4 categorias (cat1, cat2, cat3, cat4)",
            "GET /jogos/aleatorio": "Retorna jogo aleatório",
            "GET /jogos/<id>/recomendacoes": "Recomendações para um jogo",
            "GET /ranking/populares": "Jogos mais populares",
            "GET /ranking/melhores": "Jogos melhor avaliados",
            "POST /avaliacao/positiva": "Registra avaliação POSITIVA",
            "POST /avaliacao/negativa": "Registra avaliação NEGATIVA"
        }
    })

@app.route('/jogos', methods=['GET'])
def get_jogos():
    """Retorna todos os jogos com paginação"""
    limite = request.args.get('limite', default=50, type=int)
    pagina = request.args.get('pagina', default=1, type=int)
    
    jogos = sistema.get_todos_jogos()
    
    # Paginação simples
    start = (pagina - 1) * limite
    end = start + limite
    jogos_paginados = jogos[start:end]
    
    return jsonify({
        "jogos": jogos_paginados,
        "pagina": pagina,
        "limite": limite,
        "total": len(jogos),
        "paginas_total": (len(jogos) + limite - 1) // limite
    })

@app.route('/jogos/<int:jogo_id>', methods=['GET'])
def get_jogo_id(jogo_id):
    """Retorna um jogo específico pelo ID"""
    jogo = sistema.get_jogo_por_id(jogo_id)
    if jogo:
        return jsonify(jogo)
    else:
        return jsonify({"error": "Jogo não encontrado"}), 404

@app.route('/jogos/busca/<string:nome>', methods=['GET'])
def get_jogo_nome(nome):
    """Busca jogos por nome"""
    jogos = sistema.get_jogo_por_nome(nome)
    return jsonify({
        "resultados": jogos,
        "total": len(jogos),
        "busca": nome
    })

@app.route('/jogos/categorias', methods=['GET'])
def get_jogos_por_categorias():
    """Retorna jogos filtrados por 4 categorias específicas"""
    # Pegar categorias dos query parameters
    categoria1 = request.args.get('cat1', '')
    categoria2 = request.args.get('cat2', '') 
    categoria3 = request.args.get('cat3', '')
    categoria4 = request.args.get('cat4', '')
    
    categorias = [cat for cat in [categoria1, categoria2, categoria3, categoria4] if cat]
    
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

@app.route('/jogos/aleatorio', methods=['GET'])
def get_jogo_aleatorio():
    """Retorna um jogo aleatório"""
    jogo = sistema.get_jogo_aleatorio()
    return jsonify(jogo)

@app.route('/jogos/<int:jogo_id>/recomendacoes', methods=['GET'])
def get_recomendacoes(jogo_id):
    """Retorna jogos recomendados baseados em similaridade"""
    limite = request.args.get('limite', default=5, type=int)
    recomendacoes = sistema.get_jogos_recomendados(jogo_id, limite)
    
    return jsonify({
        "jogo_base_id": jogo_id,
        "recomendacoes": recomendacoes,
        "total": len(recomendacoes)
    })

@app.route('/ranking/populares', methods=['GET'])
def get_ranking_populares():
    """Retorna ranking dos jogos mais populares"""
    limite = request.args.get('limite', default=10, type=int)
    ranking = sistema.get_ranking_populares(limite)
    
    return jsonify({
        "ranking": "populares",
        "jogos": ranking,
        "total": len(ranking)
    })

@app.route('/ranking/melhores', methods=['GET'])
def get_ranking_melhores():
    """Retorna ranking dos jogos melhor avaliados"""
    limite = request.args.get('limite', default=10, type=int)
    min_avaliacoes = request.args.get('min_avaliacoes', default=5, type=int)
    ranking = sistema.get_ranking_melhor_avaliados(limite, min_avaliacoes)
    
    return jsonify({
        "ranking": "melhores",
        "jogos": ranking,
        "total": len(ranking),
        "min_avaliacoes": min_avaliacoes
    })

@app.route('/avaliacao/positiva', methods=['POST'])
def post_avaliacao_positiva():
    """Registra uma avaliação POSITIVA para um jogo"""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "Dados JSON necessários"}), 400
    
    jogo_id = data.get('jogo_id')
    
    if not jogo_id:
        return jsonify({"error": "jogo_id é obrigatório"}), 400
    
    sucesso = sistema.post_avaliacao_jogo(jogo_id, positiva=True)
    
    if sucesso:
        return jsonify({
            "message": "Avaliação POSITIVA registrada com sucesso",
            "jogo_id": jogo_id,
            "tipo": "positiva",
            "status": "sistema_atualizado"
        })
    else:
        return jsonify({"error": "Erro ao registrar avaliação"}), 500

@app.route('/avaliacao/negativa', methods=['POST'])
def post_avaliacao_negativa():
    """Registra uma avaliação NEGATIVA para um jogo"""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "Dados JSON necessários"}), 400
    
    jogo_id = data.get('jogo_id')
    
    if not jogo_id:
        return jsonify({"error": "jogo_id é obrigatório"}), 400
    
    sucesso = sistema.post_avaliacao_jogo(jogo_id, positiva=False)
    
    if sucesso:
        return jsonify({
            "message": "Avaliação NEGATIVA registrada com sucesso",
            "jogo_id": jogo_id,
            "tipo": "negativa",
            "status": "sistema_atualizado"
        })
    else:
        return jsonify({"error": "Erro ao registrar avaliação"}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check para monitoramento"""
    return jsonify({
        "status": "healthy",
        "service": "games-recommendation-api",
        "jogos_carregados": len(sistema.games_df),
        "modelo_treinado": sistema.model is not None,
        "versao": "2.0-mysql"
    })

@app.route('/status', methods=['GET'])
def get_status():
    """Status detalhado do sistema"""
    total_jogos = len(sistema.games_df)
    total_avaliacoes = sistema.games_df['positive'].fillna(0).sum() + sistema.games_df['negative'].fillna(0).sum()
    
    return jsonify({
        "status": "operational",
        "database": {
            "jogos_carregados": total_jogos,
            "total_avaliacoes": int(total_avaliacoes),
            "jogos_com_avaliacoes": len(sistema.games_df[(sistema.games_df['positive'] > 0) | (sistema.games_df['negative'] > 0)])
        },
        "modelo": {
            "treinado": sistema.model is not None,
            "tipo": "KNN-Basic",
            "similaridade": "cosine"
        },
        "sistema": {
            "atualizacoes_automaticas": True,
            "recomendacoes_dinamicas": True
        }
    })

# =============================================================================
# CONFIGURAÇÃO DO SERVER
# =============================================================================

if __name__ == '__main__':
    # Configurações para Azure VM
    host = os.getenv('FLASK_HOST', '0.0.0.0')  # IMPORTANTE: 0.0.0.0 para aceitar conexões externas
    port = int(os.getenv('FLASK_PORT', 4000))   # Porta padrão do Flask
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    logger.info(f"🚀 Iniciando servidor Flask...")
    logger.info(f"📍 Host: {host}")
    logger.info(f"🔌 Porta: {port}")
    logger.info(f"🐛 Debug: {debug}")
    logger.info(f"📊 Total de jogos carregados: {len(sistema.games_df)}")
    logger.info(f"🎯 Sistema pronto para receber conexões!")
    
    app.run(host=host, port=port, debug=debug)
