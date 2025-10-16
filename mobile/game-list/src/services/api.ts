import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse, LoginCredentials, RegisterData, User, ApiError } from '../types';

// TODO: Ajustar para o endereço correto da sua API
const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api' // Desenvolvimento
  : 'https://exemplo.com/api'; // Produção

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

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/login', credentials);
    await this.saveAuth(response.data);
    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/register', data);
    await this.saveAuth(response.data);
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout');
    } finally {
      await this.clearAuth();
    }
  }

  async getProfile(): Promise<User> {
    const response = await this.api.get<User>('/auth/profile');
    return response.data;
  }

  async getGames(page: number = 1, limit: number = 20) {
    const response = await this.api.get('/games', {
      params: { page, limit },
    });
    return response.data;
  }

  async getGameById(id: number) {
    const response = await this.api.get(`/games/${id}`);
    return response.data;
  }

  async searchGames(query: string) {
    const response = await this.api.get('/games/search', {
      params: { q: query },
    });
    return response.data;
  }

  async getRecommendedGames() {
    const response = await this.api.get('/games/recommended');
    return response.data;
  }

  async getPopularGames() {
    const response = await this.api.get('/games/popular');
    return response.data;
  }

  private async saveAuth(data: AuthResponse): Promise<void> {
    await AsyncStorage.multiSet([
      [TOKEN_KEY, data.token],
      [USER_KEY, JSON.stringify(data.user)],
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
    const token = await this.getToken();
    return !!token;
  }
}

export default new ApiService();
