# -*- coding: utf-8 -*-
"""
Sistema de Recomendação de Games - Lógica KNN
Integrado com MySQL Azure e atualizações dinâmicas
"""

import pandas as pd
import numpy as np
import mysql.connector
from mysql.connector import Error
import os
from typing import List, Dict, Any, Optional
import logging
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SistemaRecomendacaoGames:
    def __init__(self):
        """
        Inicializa o sistema de recomendação conectado ao MySQL
        """
        self.games_df = None
        self.model = None
        self.similarity_matrix = None
        
        # Configurações do MySQL Azure
        self.db_config = {
            'host': os.getenv('AZURE_MYSQL_HOST', '13.68.75.61'),
            'database': os.getenv('AZURE_MYSQL_DATABASE', 'PI6DSM'),
            'user': os.getenv('AZURE_MYSQL_USER', 'claudio'),
            'password': os.getenv('AZURE_MYSQL_PASSWORD', 'FatecFranca123#'),
            'port': os.getenv('AZURE_MYSQL_PORT', '3306')
        }
        
        self._carregar_dados_mysql()
        self._preparar_modelo()
    
    def _conectar_mysql(self):
        """Conecta ao MySQL Azure com timeout curto"""
        try:
            connection = mysql.connector.connect(
                **self.db_config,
                connection_timeout=3  # Timeout de 3 segundos
            )
            return connection
        except Error as e:
            logger.error(f"❌ Erro ao conectar ao MySQL: {e}")
            return None
    
    def _carregar_dados_mysql(self):
        """Carrega os dados dos games do MySQL ou usa dados simulados"""
        logger.info("📁 Carregando base de dados do MySQL...")
        
        connection = self._conectar_mysql()
        if not connection:
            logger.warning("⚠️ MySQL não disponível, usando dados simulados")
            self._carregar_dados_simulados()
            return
        
        try:
            query = """
            SELECT 
                id, name, release_date, required_age, price, header_image,
                positive, negative, recommendations, genres, categories, description
            FROM games
            """
            
            self.games_df = pd.read_sql(query, connection)
            logger.info(f"✅ Base carregada do MySQL: {len(self.games_df)} jogos")
            
        except Error as e:
            logger.error(f"❌ Erro ao carregar dados: {e}")
            logger.warning("⚠️ Usando dados simulados")
            self._carregar_dados_simulados()
        finally:
            if connection.is_connected():
                connection.close()
    
    def _carregar_dados_simulados(self):
        """Carrega dados simulados para testes"""
        logger.info("📋 Carregando dados simulados de teste...")
        
        dados_simulados = {
            'id': range(1, 11),
            'name': [
                'The Witcher 3',
                'Elden Ring',
                'Cyberpunk 2077',
                'Baldur\'s Gate 3',
                'Starfield',
                'Minecraft',
                'Dark Souls III',
                'Horizon Zero Dawn',
                'Ghost of Tsushima',
                'Hades'
            ],
            'release_date': ['2015-05-19'] * 10,
            'required_age': [18, 16, 18, 12, 10, 3, 16, 13, 18, 12],
            'price': [39.99, 59.99, 59.99, 59.99, 69.99, 26.95, 39.99, 69.99, 59.99, 24.99],
            'header_image': [''] * 10,
            'positive': [100000, 95000, 80000, 92000, 88000, 500000, 75000, 120000, 110000, 98000],
            'negative': [5000, 4000, 15000, 3000, 7000, 2000, 3000, 8000, 5000, 2000],
            'recommendations': [500000] * 10,
            'genres': [
                'Action,RPG,Adventure',
                'Action,RPG,Adventure',
                'Action,RPG,Adventure',
                'RPG,Adventure',
                'RPG,Adventure',
                'Adventure,Indie,Simulation',
                'Action,RPG,Adventure',
                'Action,Adventure',
                'Action,Adventure',
                'Action,Indie,Adventure'
            ],
            'categories': [
                'Action,Adventure,Singleplayer',
                'Action,Adventure,Singleplayer',
                'Action,Adventure,Singleplayer',
                'Singleplayer,Multiplayer,Adventure',
                'Action,Adventure,Singleplayer',
                'Singleplayer,Multiplayer,Indie',
                'Action,Adventure,Singleplayer',
                'Action,Adventure,Singleplayer',
                'Action,Adventure,Singleplayer',
                'Action,Adventure,Indie'
            ],
            'description': [
                'RPG épico com personagens memoráveis',
                'Challenging action RPG',
                'Cyberpunk futurista',
                'Épico RPG em mundo mágico',
                'Exploração espacial',
                'Sandbox criativo',
                'Challenging dark fantasy',
                'Adventure em mundo pós-apocalíptico',
                'Samurai action',
                'Roguelike action'
            ]
        }
        
        self.games_df = pd.DataFrame(dados_simulados)
        logger.info(f"✅ Dados simulados carregados: {len(self.games_df)} jogos")
    
    def _converter_para_int(self, valor):
        """Converte valor para int de forma segura"""
        if pd.isna(valor) or valor is None:
            return 0
        try:
            return int(float(valor))  # Converte para float primeiro, depois int
        except (ValueError, TypeError):
            return 0
    
    def _calcular_nota_media(self, positive: int, negative: int) -> float:
        """
        Calcula a nota média baseada em avaliações positivas e negativas
        Converte para escala 1-5
        """
        total = positive + negative
        if total == 0:
            return 3.0  # Nota neutra se não há avaliações
        
        percentual_positivo = positive / total
        # Converter para escala 1-5 (1 = 0% positivo, 5 = 100% positivo)
        nota = 1 + (percentual_positivo * 4)
        return round(nota, 2)
    
    def _calcular_similaridade_conteudo(self):
        """
        Calcula matriz de similaridade entre jogos baseado em categorias e gêneros
        Usa TF-IDF para comparar conteúdo
        """
        # Combinar categorias e gêneros
        conteudo = self.games_df['categories'].fillna('') + ' ' + self.games_df['genres'].fillna('')
        
        # Calcular TF-IDF
        vectorizer = TfidfVectorizer(analyzer='char', ngram_range=(2, 2))
        tfidf_matrix = vectorizer.fit_transform(conteudo)
        
        # Calcular similaridade cosseno
        self.similarity_matrix = cosine_similarity(tfidf_matrix)
        logger.info("✅ Matriz de similaridade calculada com sucesso")
    
    def _preparar_modelo(self):
        """Prepara o modelo de recomendação baseado em similaridade de conteúdo"""
        logger.info("🤖 Preparando modelo de recomendação...")
        
        # Calcular métricas para exibição
        self.games_df['nota_media'] = self.games_df.apply(
            lambda x: self._calcular_nota_media(
                self._converter_para_int(x['positive']), 
                self._converter_para_int(x['negative'])
            ), 
            axis=1
        )
        self.games_df['total_avaliacoes'] = self.games_df.apply(
            lambda x: self._converter_para_int(x['positive']) + self._converter_para_int(x['negative']), 
            axis=1
        )
        
        # Calcular similaridade de conteúdo
        self._calcular_similaridade_conteudo()
        
        logger.info("✅ Modelo preparado com sucesso!")
        logger.info(f"📊 Total de jogos: {len(self.games_df)}")
    
    def _atualizar_avaliacoes_jogo(self, jogo_id: int, positiva: bool) -> bool:
        """
        Atualiza as contagens de positive/negative no MySQL
        """
        connection = self._conectar_mysql()
        if not connection:
            return False
        
        try:
            cursor = connection.cursor()
            
            if positiva:
                query = "UPDATE games SET positive = COALESCE(positive, 0) + 1 WHERE id = %s"
            else:
                query = "UPDATE games SET negative = COALESCE(negative, 0) + 1 WHERE id = %s"
            
            cursor.execute(query, (jogo_id,))
            connection.commit()
            
            logger.info(f"✅ Avaliação {'positiva' if positiva else 'negativa'} registrada para jogo {jogo_id}")
            return True
            
        except Error as e:
            logger.error(f"❌ Erro ao atualizar avaliações: {e}")
            return False
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
    
    def _recarregar_e_retreinar(self):
        """
        Recarrega dados do MySQL e retreina o modelo
        Chamado após atualizações nas avaliações
        """
        logger.info("🔄 Recarregando dados e retreinando modelo...")
        self._carregar_dados_mysql()
        self._preparar_modelo()
        logger.info("✅ Sistema atualizado com sucesso!")
    
    def _formatar_jogo(self, jogo_series) -> Dict[str, Any]:
        """Formata os dados de um jogo para resposta da API"""
        positive = self._converter_para_int(jogo_series.get('positive', 0))
        negative = self._converter_para_int(jogo_series.get('negative', 0))
        total_avaliacoes = positive + negative
        
        return {
            'id': self._converter_para_int(jogo_series.get('id', 0)),
            'name': jogo_series.get('name', ''),
            'release_date': str(jogo_series.get('release_date', '')),
            'required_age': self._converter_para_int(jogo_series.get('required_age', 0)),
            'price': float(jogo_series.get('price', 0)),
            'header_image': jogo_series.get('header_image', ''),
            'positive': positive,
            'negative': negative,
            'recommendations': self._converter_para_int(jogo_series.get('recommendations', 0)),
            'genres': jogo_series.get('genres', ''),
            'categories': jogo_series.get('categories', ''),
            'description': jogo_series.get('description', ''),
            'nota_media': self._calcular_nota_media(positive, negative),
            'total_avaliacoes': total_avaliacoes
        }
    
    # =========================================================================
    # FUNÇÕES PRINCIPAIS - API
    # =========================================================================
    
    def get_todos_jogos(self, limite: int = None) -> List[Dict[str, Any]]:
        """
        Retorna todos os jogos da base
        
        Args:
            limite: Número máximo de jogos a retornar
            
        Returns:
            Lista de dicionários com informações dos jogos
        """
        df = self.games_df
        if limite:
            df = df.head(limite)
        
        return [self._formatar_jogo(jogo) for _, jogo in df.iterrows()]
    
    def get_jogo_por_id(self, jogo_id: int) -> Optional[Dict[str, Any]]:
        """
        Retorna um jogo específico pelo ID
        
        Args:
            jogo_id: ID do jogo
            
        Returns:
            Dicionário com informações do jogo ou None se não encontrado
        """
        jogo = self.games_df[self.games_df['id'] == jogo_id]
        if not jogo.empty:
            return self._formatar_jogo(jogo.iloc[0])
        return None
    
    def get_jogo_por_nome(self, nome: str) -> List[Dict[str, Any]]:
        """
        Busca jogos por nome (busca parcial)
        
        Args:
            nome: Nome ou parte do nome do jogo
            
        Returns:
            Lista de jogos que correspondem à busca
        """
        jogos_encontrados = self.games_df[
            self.games_df['name'].str.contains(nome, case=False, na=False)
        ]
        return [self._formatar_jogo(jogo) for _, jogo in jogos_encontrados.iterrows()]
    
    def get_jogos_recomendados(self, jogo_id: int, limite: int = 5) -> List[Dict[str, Any]]:
        """
        Retorna jogos recomendados baseados em similaridade de conteúdo
        
        Args:
            jogo_id: ID do jogo base para recomendação
            limite: Número de recomendações a retornar
            
        Returns:
            Lista de jogos recomendados
        """
        # Encontrar índice do jogo
        indice_jogo = self.games_df[self.games_df['id'] == jogo_id].index
        
        if len(indice_jogo) == 0:
            return []
        
        idx = indice_jogo[0]
        
        # Obter scores de similaridade para este jogo
        sim_scores = list(enumerate(self.similarity_matrix[idx]))
        
        # Ordenar por similaridade (descrescente) e pegar top N+1 (excluindo o próprio jogo)
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)[1:limite+1]
        
        # Buscar índices dos jogos recomendados
        jogos_indices = [i[0] for i in sim_scores]
        
        # Retornar informações dos jogos
        jogos_recomendados = []
        for idx in jogos_indices:
            jogos_recomendados.append(self._formatar_jogo(self.games_df.iloc[idx]))
        
        return jogos_recomendados
    
    def get_jogo_aleatorio(self) -> Dict[str, Any]:
        """
        Retorna um jogo aleatório da base
        
        Returns:
            Dicionário com informações do jogo
        """
        jogo_aleatorio = self.games_df.sample(1).iloc[0]
        return self._formatar_jogo(jogo_aleatorio)
    
        # =========================================================================
    # NOVA FUNÇÃO - RECOMENDAÇÃO POR CATEGORIAS
    # =========================================================================
    
    def get_jogos_por_categorias(self, categorias: List[str], limite: int = 10) -> List[Dict[str, Any]]:
        """
        Retorna jogos que correspondem a 4 categorias informadas pelo usuário
        Ordena por nota média (melhores avaliados primeiro)
        
        Args:
            categorias: Lista de 4 categorias para filtrar
            limite: Número máximo de jogos a retornar
            
        Returns:
            Lista de jogos que correspondem às categorias
        """
        if len(categorias) != 4:
            logger.warning(f"⚠️ Esperadas 4 categorias, recebidas {len(categorias)}")
        
        # Filtrar jogos que contêm TODAS as categorias
        jogos_filtrados = self.games_df.copy()
        
        for categoria in categorias:
            if categoria.strip():  # Ignorar categorias vazias
                jogos_filtrados = jogos_filtrados[
                    jogos_filtrados['categories'].str.contains(categoria, case=False, na=False)
                ]
        
        # Ordenar por nota média (melhores primeiro) e pegar o limite
        if not jogos_filtrados.empty:
            jogos_ordenados = jogos_filtrados.sort_values('nota_media', ascending=False).head(limite)
            return [self._formatar_jogo(jogo) for _, jogo in jogos_ordenados.iterrows()]
        else:
            return []
    
    def post_avaliacao_jogo(self, jogo_id: int, positiva: bool) -> bool:
        """
        Registra uma avaliação de jogo e atualiza o modelo
        
        Args:
            jogo_id: ID do jogo avaliado
            positiva: True para avaliação positiva, False para negativa
            
        Returns:
            True se sucesso, False se erro
        """
        # 1. Atualizar no MySQL
        sucesso = self._atualizar_avaliacoes_jogo(jogo_id, positiva)
        
        if sucesso:
            # 2. Recarregar dados e retreinar modelo
            self._recarregar_e_retreinar()
            return True
        
        return False
    
    def get_ranking_populares(self, limite: int = 10) -> List[Dict[str, Any]]:
        """
        Retorna ranking dos jogos mais populares (mais avaliações)
        
        Args:
            limite: Número de jogos no ranking
            
        Returns:
            Lista ordenada de jogos mais populares
        """
        self.games_df['total_avaliacoes'] = self.games_df.apply(
            lambda x: self._converter_para_int(x['positive']) + self._converter_para_int(x['negative']), 
            axis=1
        )
        ranking = self.games_df.sort_values('total_avaliacoes', ascending=False).head(limite)
        return [self._formatar_jogo(jogo) for _, jogo in ranking.iterrows()]
    
    def get_ranking_melhor_avaliados(self, limite: int = 10, min_avaliacoes: int = 5) -> List[Dict[str, Any]]:
        """
        Retorna ranking dos jogos melhor avaliados
        
        Args:
            limite: Número de jogos no ranking
            min_avaliacoes: Mínimo de avaliações para considerar
            
        Returns:
            Lista ordenada de jogos melhor avaliados
        """
        self.games_df['total_avaliacoes'] = self.games_df.apply(
            lambda x: self._converter_para_int(x['positive']) + self._converter_para_int(x['negative']), 
            axis=1
        )
        jogos_filtrados = self.games_df[self.games_df['total_avaliacoes'] >= min_avaliacoes]
        
        # Calcular nota média para filtro
        jogos_filtrados['nota_media'] = jogos_filtrados.apply(
            lambda x: self._calcular_nota_media(
                self._converter_para_int(x['positive']), 
                self._converter_para_int(x['negative'])
            ), 
            axis=1
        )
        
        ranking = jogos_filtrados.sort_values('nota_media', ascending=False).head(limite)
        return [self._formatar_jogo(jogo) for _, jogo in ranking.iterrows()]

# Exemplo de uso independente
if __name__ == "__main__":
    sistema = SistemaRecomendacaoGames()
    
    print("🧪 Sistema de Recomendação - MySQL Integration")
    print("=" * 50)
    
    # Testar funções
    todos_jogos = sistema.get_todos_jogos(limite=3)
    print(f"📋 Primeiros 3 jogos: {len(todos_jogos)}")
    
    if todos_jogos:
        jogo_exemplo = todos_jogos[0]
        print(f"🎯 Exemplo: {jogo_exemplo['name']}")
        print(f"   👍 {jogo_exemplo['positive']} | 👎 {jogo_exemplo['negative']} | ⭐ {jogo_exemplo['nota_media']}")
        
        recomendacoes = sistema.get_jogos_recomendados(jogo_exemplo['id'], 3)
        print(f"🎲 Recomendações: {len(recomendacoes)} jogos")
