import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse, LoginCredentials, RegisterData, User, ApiError } from '../types';

// Configuração da API - Ajuste conforme seu ambiente
const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:3000/api' // Android emulator
  : 'https://seu-backend-prod.com/api'; // Produção

// Para iOS: 'http://localhost:3000/api'
// Para Device local: 'http://192.168.x.x:3000/api' (substitua pelo IP da sua máquina)

const TOKEN_KEY = '@GameList:token';
const USER_KEY = '@GameList:user';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para adicionar token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para tratar erros
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          await this.clearAuth();
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      return {
        message: (error.response.data as any)?.message || 'Erro ao processar requisição',
        statusCode: error.response.status,
        code: (error.response.data as any)?.code,
      };
    } else if (error.request) {
      return {
        message: 'Erro de conexão. Verifique sua internet.',
        code: 'NETWORK_ERROR',
      };
    }
    return {
      message: error.message || 'Erro desconhecido',
      code: 'UNKNOWN_ERROR',
    };
  }

  // ========================================================================
  // AUTENTICAÇÃO
  // ========================================================================

  async login(email: string, senha: string): Promise<any> {
    const response = await this.api.post('/users/login', { email, senha });
    if (response.data.dados) {
      await this.saveAuth(response.data.dados);
    }
    return response.data;
  }

  async register(data: {
    nome: string;
    email: string;
    senha: string;
    confirmarSenha: string;
    categorias: string[];
  }): Promise<any> {
    const response = await this.api.post('/users', data);
    if (response.data.dados) {
      await this.saveAuth(response.data.dados);
    }
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/users/logout');
    } finally {
      await this.clearAuth();
    }
  }

  async getProfile(): Promise<User> {
    const response = await this.api.get('/users/profile');
    return response.data.dados;
  }

  async getCategories(): Promise<any> {
    const response = await this.api.get('/users/categories');
    return response.data;
  }

  // ========================================================================
  // JOGOS
  // ========================================================================

  async getAllGames(page = 1, limit = 50) {
    const response = await this.api.get(`/games?page=${page}&limit=${limit}`);
    return response.data;
  }

  async getGameById(id: number) {
    const response = await this.api.get(`/games/${id}`);
    return response.data;
  }

  async searchGames(query: string) {
    const response = await this.api.get(`/games/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  async getGamesByCategories(cat1: string, cat2: string, cat3: string, cat4: string) {
    const response = await this.api.get(
      `/games/categories?cat1=${cat1}&cat2=${cat2}&cat3=${cat3}&cat4=${cat4}`
    );
    return response.data;
  }

  async getRandomGame() {
    const response = await this.api.get('/games/aleatorio');
    return response.data;
  }

  async rateGame(gameId: number, positiva: boolean) {
    const response = await this.api.post(`/games/${gameId}/rate`, { positiva });
    return response.data;
  }

  // ========================================================================
  // RECOMENDAÇÕES
  // ========================================================================

  async getRecommendedGames(userId: number, limit = 10) {
    const response = await this.api.get(
      `/recommendations/users/${userId}?limit=${limit}`
    );
    return response.data;
  }

  async getPopularGames(limit = 10) {
    const response = await this.api.get(
      `/recommendations/ranking/popular?limit=${limit}`
    );
    return response.data;
  }

  async getBestRatedGames(limit = 10, minRatings = 5) {
    const response = await this.api.get(
      `/recommendations/ranking/best?limit=${limit}&minRatings=${minRatings}`
    );
    return response.data;
  }

  async getSimilarGames(gameId: number, limit = 5) {
    const response = await this.api.get(
      `/recommendations/games/${gameId}/similar?limit=${limit}`
    );
    return response.data;
  }

  async getSystemHealth() {
    const response = await this.api.get('/recommendations/system/health');
    return response.data;
  }

  // ========================================================================
  // AUTH STORAGE
  // ========================================================================

  private async saveAuth(user: any): Promise<void> {
    await AsyncStorage.multiSet([
      [USER_KEY, JSON.stringify(user)],
    ]);
  }

  private async clearAuth(): Promise<void> {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  }

  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem(TOKEN_KEY);
  }

  async getStoredUser(): Promise<User | null> {
    const userJson = await AsyncStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getStoredUser();
    return !!user;
  }
}

export default new ApiService();
