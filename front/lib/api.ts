// Frontend API Client
// Configuração centralizada para comunicação com o backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Tipos de resposta
interface ApiResponse<T> {
  sucesso: boolean;
  dados?: T;
  erro?: string;
  mensagem?: string;
}

// Função auxiliar para fazer requisições
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.erro || 'Erro na requisição');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    return {
      sucesso: false,
      erro: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

// ============================================================================
// USUÁRIOS
// ============================================================================

export async function loginUser(email: string, senha: string) {
  return apiCall('/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  });
}

export async function registerUser(
  nome: string,
  email: string,
  senha: string,
  confirmarSenha: string,
  categorias: string[]
) {
  return apiCall('/users', {
    method: 'POST',
    body: JSON.stringify({
      nome,
      email,
      senha,
      confirmarSenha,
      categorias,
    }),
  });
}

export async function getCategories() {
  return apiCall('/users/categories');
}

export async function getAllUsers() {
  return apiCall('/users');
}

// ============================================================================
// JOGOS
// ============================================================================

export async function getAllGames(page = 1, limit = 50) {
  return apiCall(`/games?page=${page}&limit=${limit}`);
}

export async function getGameById(id: number) {
  return apiCall(`/games/${id}`);
}

export async function searchGames(query: string) {
  return apiCall(`/games/search?q=${encodeURIComponent(query)}`);
}

export async function getGamesByCategories(
  cat1: string,
  cat2: string,
  cat3: string,
  cat4: string,
  limit = 10
) {
  return apiCall(
    `/games/categories?cat1=${cat1}&cat2=${cat2}&cat3=${cat3}&cat4=${cat4}&limit=${limit}`
  );
}

export async function getRandomGame() {
  return apiCall('/games/aleatorio');
}

export async function rateGame(gameId: number, positiva: boolean) {
  return apiCall(`/games/${gameId}/rate`, {
    method: 'POST',
    body: JSON.stringify({ positiva }),
  });
}

// ============================================================================
// RECOMENDAÇÕES
// ============================================================================

export async function getUserRecommendations(userId: number, limit = 10) {
  return apiCall(`/recommendations/users/${userId}?limit=${limit}`);
}

export async function getPopularGames(limit = 10) {
  return apiCall(`/recommendations/ranking/popular?limit=${limit}`);
}

export async function getBestRatedGames(limit = 10, minRatings = 5) {
  return apiCall(
    `/recommendations/ranking/best?limit=${limit}&minRatings=${minRatings}`
  );
}

export async function getSimilarGames(gameId: number, limit = 5) {
  return apiCall(`/recommendations/games/${gameId}/similar?limit=${limit}`);
}

export async function getSystemHealth() {
  return apiCall('/recommendations/system/health');
}

export default {
  // Usuários
  loginUser,
  registerUser,
  getCategories,
  getAllUsers,
  // Jogos
  getAllGames,
  getGameById,
  searchGames,
  getGamesByCategories,
  getRandomGame,
  rateGame,
  // Recomendações
  getUserRecommendations,
  getPopularGames,
  getBestRatedGames,
  getSimilarGames,
  getSystemHealth,
};
