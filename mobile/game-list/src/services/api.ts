import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { User, ApiError } from '../types';

const DEFAULT_DEV_API_URL = 'http://10.0.2.2:3000/api';
const DEFAULT_WEB_DEV_API_URL = 'http://localhost:3000/api';
const DEFAULT_PROD_API_URL = 'https://seu-backend-prod.com/api';

const TOKEN_KEY = '@GameList:token';
const USER_KEY = '@GameList:user';

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const toFiniteNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return null;
    }

    const parsed = Number(trimmed);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
};

const adjustUrlForPlatform = (rawUrl: string): string => {
  if (!rawUrl) {
    return rawUrl;
  }

  if (Platform.OS === 'web' && /^https?:\/\/10\.0\.2\.2/.test(rawUrl)) {
    return rawUrl.replace('10.0.2.2', 'localhost');
  }

  return rawUrl;
};

const getDevFallbackUrl = () =>
  Platform.select<string | undefined>({
    ios: DEFAULT_WEB_DEV_API_URL,
    android: DEFAULT_DEV_API_URL,
    web: DEFAULT_WEB_DEV_API_URL,
    default: DEFAULT_DEV_API_URL,
  }) ?? DEFAULT_DEV_API_URL;

const resolveApiBaseUrl = (): string => {
  const envUrl = typeof process.env.EXPO_PUBLIC_API_URL === 'string'
    ? process.env.EXPO_PUBLIC_API_URL.trim()
    : '';

  if (envUrl.length > 0) {
    return stripTrailingSlash(adjustUrlForPlatform(envUrl));
  }

  const fallback = __DEV__ ? getDevFallbackUrl() : DEFAULT_PROD_API_URL;
  return stripTrailingSlash(adjustUrlForPlatform(fallback));
};

const API_BASE_URL = resolveApiBaseUrl();

type BackendCategoriesResponse = {
  categorias?: unknown;
  [key: string]: unknown;
};

type BackendUser = {
  id?: unknown;
  nome?: unknown;
  name?: unknown;
  email?: unknown;
  avatar?: unknown;
  criadoEm?: unknown;
  createdAt?: unknown;
  categorias?: unknown;
  [key: string]: unknown;
};

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
      const data = error.response.data as Record<string, unknown> | undefined;
      const rawErrors = Array.isArray((data as any)?.erros)
        ? ((data as any).erros as unknown[]).filter((item): item is string => typeof item === 'string')
        : [];

      const message =
        (typeof (data as any)?.mensagem === 'string' && (data as any).mensagem) ||
        (typeof (data as any)?.erro === 'string' && (data as any).erro) ||
        (rawErrors.length ? rawErrors.join(' ') : undefined) ||
        error.message ||
        'Erro ao processar requisição';

      return {
        message,
        statusCode: error.response.status,
        code: typeof (data as any)?.code === 'string' ? (data as any).code : undefined,
        details: data,
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
    if (response.data?.dados) {
      const user = await this.saveAuth(response.data.dados);
      const token = this.extractToken(response.data);
      await this.persistToken(token);

      const normalizedResponse: Record<string, unknown> = {
        ...response.data,
        dados: user,
      };

      if (token) {
        normalizedResponse.token = token;
      }

      return normalizedResponse;
    }

    await this.clearAuth();
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
    if (response.data?.dados) {
      const normalized = this.normalizeUser(response.data.dados);
      return { ...response.data, dados: normalized };
    }

    return response.data;
  }

  async logout(): Promise<void> {
    await this.clearAuth();
  }

  async getProfile(): Promise<User | null> {
    const stored = await this.getStoredUser();
    if (!stored?.id) {
      return null;
    }

    try {
      const response = await this.api.get(`/users/${stored.id}`);
      if (response.data?.dados) {
        return this.saveAuth(response.data.dados);
      }
    } catch (error) {
      if (__DEV__) {
        console.warn('Falha ao atualizar perfil:', error);
      }
    }

    return stored;
  }

  async getCategories(): Promise<BackendCategoriesResponse> {
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

  async rateGame(gameId: number, positiva: boolean, userId: number) {
    const response = await this.api.post(`/games/${gameId}/rate`, {
      positiva,
      userId,
    });
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

  private normalizeUser(payload: unknown): User {
    if (!payload || typeof payload !== 'object') {
      return {
        id: 0,
        name: 'Usuário',
        email: '',
        raw: {},
      };
    }

    const data = payload as BackendUser;
    const idValue = toFiniteNumber(data.id);
    const email = typeof data.email === 'string' ? data.email.trim() : '';

    const avatar =
      typeof data.avatar === 'string' && data.avatar.trim().length > 0
        ? data.avatar.trim()
        : undefined;

    const rawName =
      typeof data.nome === 'string'
        ? data.nome
        : typeof data.name === 'string'
          ? data.name
          : undefined;

    let name = rawName && typeof rawName === 'string' ? rawName.trim() : '';

    if (!name && email) {
      const [emailName] = email.split('@');
      name = emailName || '';
    }

    if (!name) {
      name = 'Usuário';
    }

    const rawCategories = Array.isArray(data.categorias)
      ? data.categorias
      : Array.isArray((data as any).categories)
        ? ((data as any).categories as unknown[])
        : undefined;

    const categories = rawCategories
      ? rawCategories
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter((item) => item.length > 0)
      : undefined;

    const createdAt =
      typeof data.criadoEm === 'string'
        ? data.criadoEm
        : typeof data.createdAt === 'string'
          ? data.createdAt
          : undefined;

    return {
      id: idValue && idValue > 0 ? idValue : 0,
      name,
      email,
      avatar,
      createdAt,
      categories,
      raw: data as Record<string, unknown>,
    };
  }

  private async saveAuth(userPayload: unknown): Promise<User> {
    const normalized = this.normalizeUser(userPayload);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(normalized));
    return normalized;
  }

  private extractToken(payload: unknown): string | null {
    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const candidates: unknown[] = [];
    const data = payload as Record<string, unknown>;

    candidates.push(data.token);

    if (data.accessToken) {
      candidates.push(data.accessToken);
    }

    if (typeof data.dados === 'object' && data.dados !== null) {
      const nested = data.dados as Record<string, unknown>;
      candidates.push(nested.token);
      if (nested.accessToken) {
        candidates.push(nested.accessToken);
      }
    }

    for (const candidate of candidates) {
      if (typeof candidate === 'string') {
        const trimmed = candidate.trim();
        if (trimmed.length > 0) {
          return trimmed;
        }
      }
    }

    return null;
  }

  private async persistToken(token: string | null): Promise<void> {
    if (token) {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } else {
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
  }

  private async clearAuth(): Promise<void> {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  }

  private async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
  }

  async getStoredUser(): Promise<User | null> {
    const userJson = await AsyncStorage.getItem(USER_KEY);
    if (!userJson) {
      return null;
    }

    try {
      const parsed = JSON.parse(userJson);
      const normalized = this.normalizeUser(parsed);
      if (!normalized.id) {
        return null;
      }
      return normalized;
    } catch (error) {
      if (__DEV__) {
        console.warn('Falha ao ler usuário armazenado:', error);
      }
      await AsyncStorage.removeItem(USER_KEY);
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getStoredUser();
    return Boolean(user?.id);
  }
}

export default new ApiService();
