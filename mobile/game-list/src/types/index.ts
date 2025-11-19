export interface Game {
  id: number;
  title: string;
  image: string;
  rating: number;
  description?: string;
  releaseDate?: string;
  genre?: string;
  developer?: string;
  platform?: string[];
  price?: string;
  raw?: Record<string, unknown>;
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  createdAt?: string;
  categories?: string[];
  raw?: Record<string, unknown>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: unknown;
}

export interface GameListResponse {
  games: Game[];
  total: number;
  page: number;
  limit: number;
}
