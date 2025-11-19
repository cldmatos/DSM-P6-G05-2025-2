import { Game } from '../types';

export interface BackendGame {
  id: number | string;
  name?: string | null;
  nome?: string | null;
  title?: string | null;
  header_image?: string | null;
  imagem?: string | null;
  image?: string | null;
  nota_media?: number | string | null;
  positive?: number | string | null;
  negative?: number | string | null;
  assessment_positive?: number | string | null;
  assessment_negative?: number | string | null;
  description?: string | null;
  descricao?: string | null;
  resumo?: string | null;
  release_date?: string | null;
  data_lancamento?: string | null;
  releaseDate?: string | null;
  genres?: string | null;
  categories?: string | null;
  generos?: string | null;
  categoria?: string | null;
  developers?: string | null;
  developer?: string | null;
  plataformas?: string | string[] | null;
  plataforma?: string | string[] | null;
  platforms?: string | string[] | null;
  price?: number | string | null;
  preco?: number | string | null;
  [key: string]: unknown;
}

const FALLBACK_IMAGE = 'https://placehold.co/600x400/101010/ffffff?text=Game';
const DEFAULT_RATING_PERCENT = 50;

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

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

const toOptionalString = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  return undefined;
};

const normalizeTitle = (game: BackendGame, id: number | null): string => {
  const value = game.name ?? game.nome ?? game.title;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  }

  return id ? `Jogo #${id}` : 'Jogo desconhecido';
};

const resolveImage = (game: BackendGame): string => {
  const value = game.header_image ?? game.imagem ?? game.image;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  }

  return FALLBACK_IMAGE;
};

const normalizePercent = (value: number): number => {
  return clamp(Number.isFinite(value) ? Number(value.toFixed(1)) : DEFAULT_RATING_PERCENT, 0, 100);
};

const calculateRating = (game: BackendGame): number => {
  const average = toFiniteNumber(game.nota_media);
  if (average !== null) {
    const treated = average > 5 ? average : average * 20;
    return normalizePercent(treated);
  }

  const positive =
    toFiniteNumber(game.positive) ??
    toFiniteNumber(game.assessment_positive) ??
    0;
  const negative =
    toFiniteNumber(game.negative) ??
    toFiniteNumber(game.assessment_negative) ??
    0;
  const total = positive + negative;

  if (total > 0) {
    return normalizePercent((positive / total) * 100);
  }

  return DEFAULT_RATING_PERCENT;
};

const splitCommaSeparated = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter((item) => item.length > 0);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
  }

  return [];
};

const parsePlatforms = (value: unknown): string[] => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter((item) => item.length > 0);
  }

  if (typeof value === 'string') {
    return value
      .split(/[,;\|]/)
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
  }

  return [];
};

const formatReleaseDate = (value: unknown): string | undefined => {
  const raw = toOptionalString(value);
  if (!raw) {
    return undefined;
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return raw;
  }

  try {
    return parsed.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return raw;
  }
};

const formatPriceValue = (value: unknown): string | undefined => {
  const numeric = toFiniteNumber(value);

  if (numeric !== null) {
    if (numeric === 0) {
      return 'Gratuito';
    }

    try {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
      }).format(numeric);
    } catch {
      return numeric.toFixed(2);
    }
  }

  const fallback = toOptionalString(value);
  return fallback;
};

export const mapBackendGameToGame = (game: BackendGame): Game | null => {
  const id = toFiniteNumber(game.id);
  if (id === null) {
    return null;
  }

  const genres =
    splitCommaSeparated(game.genres ?? game.generos ?? game.categories ?? game.categoria);

  const platforms = parsePlatforms(
    game.platforms ?? game.plataformas ?? game.plataforma
  );

  return {
    id,
    title: normalizeTitle(game, id),
    image: resolveImage(game),
    rating: calculateRating(game),
    description:
      toOptionalString(game.description ?? game.descricao ?? game.resumo),
    releaseDate: formatReleaseDate(
      game.release_date ?? game.releaseDate ?? game.data_lancamento
    ),
    genre: genres.length ? genres.join(', ') : undefined,
    developer: toOptionalString(game.developer ?? game.developers),
    platform: platforms.length ? platforms : undefined,
    price: formatPriceValue(game.price ?? game.preco),
    raw: game as Record<string, unknown>,
  };
};

export const extractBackendGames = (payload: unknown): BackendGame[] => {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload as BackendGame[];
  }

  if (typeof payload === 'object') {
    const data = payload as Record<string, unknown>;

    if (Array.isArray(data.jogos)) {
      return data.jogos as BackendGame[];
    }

    if (Array.isArray(data.recomendacoes)) {
      return data.recomendacoes as BackendGame[];
    }

    if (Array.isArray(data.resultados)) {
      return data.resultados as BackendGame[];
    }

    if (Array.isArray(data.dados)) {
      return extractBackendGames(data.dados);
    }

    if (data.dados && typeof data.dados === 'object') {
      return extractBackendGames(data.dados);
    }
  }

  return [];
};

export const mapApiResponseToGames = (response: unknown): Game[] => {
  const payload = (response as { dados?: unknown })?.dados ?? response;
  return extractBackendGames(payload)
    .map((game) => mapBackendGameToGame(game))
    .filter((game): game is Game => Boolean(game));
};

export const mapApiResponseToGame = (response: unknown): Game | null => {
  const payload = (response as { dados?: unknown })?.dados ?? response;

  if (!payload) {
    return null;
  }

  if (Array.isArray(payload)) {
    const first = payload[0] as BackendGame | undefined;
    return first ? mapBackendGameToGame(first) : null;
  }

  if (typeof payload === 'object') {
    const direct = mapBackendGameToGame(payload as BackendGame);
    if (direct) {
      return direct;
    }

    const fromList = extractBackendGames(payload)[0];
    return fromList ? mapBackendGameToGame(fromList) : null;
  }

  return null;
};
