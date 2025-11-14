/**
 * Image Enrichment Middleware
 * Enriquece respostas de jogos com URLs de imagem do Steam
 * Se header_image estiver vazio, gera URL baseada no app ID (se disponível)
 */

const enrichGameImages = (gameData) => {
  if (!gameData) return gameData;

  // Se for array, processar cada jogo
  if (Array.isArray(gameData)) {
    return gameData.map(game => enrichGameData(game));
  }

  // Se for objeto único, processar
  return enrichGameData(gameData);
};

const enrichGameData = (game) => {
  if (!game || typeof game !== 'object') return game;

  // Se já tem header_image e não é vazio, retornar como está
  if (game.header_image && game.header_image.trim()) {
    return game;
  }

  // Fallback: gerar URL padrão baseado no name ou ID
  const placeholderImage = generatePlaceholderImage(game);
  
  return {
    ...game,
    header_image: placeholderImage || game.header_image || '',
  };
};

const generatePlaceholderImage = (game) => {
  // Se tiver ID, tentar extrair app_id da URL da Steam ou usar padrão
  if (game.id) {
    // Padrão genérico de imagem de placeholder
    return `https://via.placeholder.com/460x215?text=${encodeURIComponent(game.name || 'Game')}`;
  }
  return null;
};

module.exports = { enrichGameImages };
