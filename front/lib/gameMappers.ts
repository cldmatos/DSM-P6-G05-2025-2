import type { ApiResponse } from "./api";

export interface BackendGame {
  id: number | string;
  name?: string | null;
  header_image?: string | null;
  nota_media?: number | null;
  positive?: number | null;
  negative?: number | null;
  description?: string | null;
  release_date?: string | null;
  genres?: string | null;
  categories?: string | null;
  price?: number | string | null;
  [key: string]: unknown;
}

export interface GameCardData {
  id: number;
  title: string;
  image: string;
  rating: number;
}

const FALLBACK_IMAGE = "/Icon.svg";
const DEFAULT_RATING_PERCENT = 50;

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function normalizePercent(value: number): number {
  return Number.isFinite(value) ? Number(value.toFixed(1)) : DEFAULT_RATING_PERCENT;
}

export function resolveGameImage(game: BackendGame | null | undefined): string {
  if (game?.header_image && typeof game.header_image === "string") {
    const trimmed = game.header_image.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  }

  return FALLBACK_IMAGE;
}

export function getRatingPercent(game: BackendGame | null | undefined): number {
  if (!game) {
    return DEFAULT_RATING_PERCENT;
  }

  const average = toFiniteNumber(game.nota_media);
  if (average !== null) {
    return normalizePercent(average * 20);
  }

  const positive = toFiniteNumber(game.positive) ?? 0;
  const negative = toFiniteNumber(game.negative) ?? 0;
  const total = positive + negative;

  if (total > 0) {
    return normalizePercent((positive / total) * 100);
  }

  return DEFAULT_RATING_PERCENT;
}

export function mapBackendGameToCard(game: BackendGame): GameCardData {
  const id = toFiniteNumber(game.id);

  return {
    id: id ?? NaN,
    title: (game.name && game.name.trim().length > 0 ? game.name.trim() : `Jogo #${id ?? ""}`),
    image: resolveGameImage(game),
    rating: getRatingPercent(game),
  };
}

export function mapBackendGamesToCards(games: BackendGame[]): GameCardData[] {
  return games
    .map((game) => mapBackendGameToCard(game))
    .filter((game) => Number.isFinite(game.id));
}

export function extractGamesFromPayload(payload: unknown): BackendGame[] {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload as BackendGame[];
  }

  if (typeof payload === "object") {
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
      return extractGamesFromPayload(data.dados);
    }
  }

  return [];
}

export function mapApiResponseToCardGames<T>(response: ApiResponse<T>): GameCardData[] {
  return mapBackendGamesToCards(extractGamesFromPayload(response.dados));
}

export function splitCommaSeparated(value?: string | null): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function formatReleaseDate(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

export function formatPrice(value?: number | string | null): string | null {
  const numeric = toFiniteNumber(value);

  if (numeric === null) {
    return null;
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(numeric);
}

export const FALLBACK_GAME_IMAGE = FALLBACK_IMAGE;
