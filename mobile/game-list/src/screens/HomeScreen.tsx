import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import styled from '../utils/styled';
import { theme } from '../../constants/theme';
import { Title, Text, Spacer } from '../components/atoms/Container';
import GameCard from '../components/molecules/GameCard';
import ApiService from '../services/api';
import { mapApiResponseToGames } from '../services/gameMapper';
import { ApiError, Game } from '../types';

const Header = styled.View`
  padding: ${theme.spacing.lg}px;
  padding-bottom: ${theme.spacing.md}px;
`;

const SectionTitle = styled.Text`
  color: ${theme.colors.foreground};
  font-size: ${theme.fonts.size.large}px;
  font-weight: 600;
  margin-top: ${theme.spacing.lg}px;
  margin-bottom: ${theme.spacing.md}px;
  padding-horizontal: ${theme.spacing.lg}px;
`;

const ErrorMessage = styled.Text`
  color: ${theme.colors.error};
  text-align: center;
  margin: ${theme.spacing.sm}px ${theme.spacing.lg}px;
`;

const ContentContainer = styled.View`
  padding-horizontal: ${theme.spacing.lg}px;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const EmptyContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing.xl}px;
`;

const SafeScreen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${theme.colors?.background ?? '#0a0a0a'};
`;

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recommendedGames, setRecommendedGames] = useState<Game[]>([]);
  const [popularGames, setPopularGames] = useState<Game[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadGames = useCallback(async (withSpinner = true) => {
    if (withSpinner) {
      setLoading(true);
    }

    setError(null);

    try {
      const storedUser = await ApiService.getStoredUser();

      let recommended: Game[] = [];
      if (storedUser?.id) {
        const recommendedResponse = await ApiService.getRecommendedGames(storedUser.id, 12);
        recommended = mapApiResponseToGames(recommendedResponse);
      }

      if (!recommended.length) {
        const bestRatedResponse = await ApiService.getBestRatedGames(12, 20);
        recommended = mapApiResponseToGames(bestRatedResponse);
      }

      const popularResponse = await ApiService.getPopularGames(16);
      let popular = mapApiResponseToGames(popularResponse);

      if (!popular.length && !recommended.length) {
        const fallbackResponse = await ApiService.getAllGames(1, 20);
        popular = mapApiResponseToGames(fallbackResponse);
      }

      const recommendedSelection = recommended.slice(0, 6);
      const recommendedIds = new Set(recommendedSelection.map((game) => game.id));
      const popularSelection = popular
        .filter((game) => !recommendedIds.has(game.id))
        .slice(0, 12);

      if (!recommendedSelection.length && !popularSelection.length) {
        setError('Não foi possível carregar jogos no momento.');
      }

      setRecommendedGames(recommendedSelection);
      setPopularGames(popularSelection);
    } catch (err) {
      const message =
        typeof (err as ApiError)?.message === 'string'
          ? (err as ApiError).message
          : err instanceof Error
            ? err.message
            : 'Não foi possível carregar os jogos.';

      setError(message);
      setRecommendedGames([]);
      setPopularGames([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  const onRefresh = () => {
    setRefreshing(true);
    loadGames(false);
  };

  const sectionedGames = useMemo(() => {
    const recommendedData = recommendedGames.map((game) => ({
      section: 'recommended' as const,
      game,
    }));

    const popularData = popularGames.map((game) => ({
      section: 'popular' as const,
      game,
    }));

    return [...recommendedData, ...popularData];
  }, [recommendedGames, popularGames]);

  const handleGamePress = (gameId: number) => {
    router.push({ pathname: '/game/[id]', params: { id: String(gameId) } });
  };

  if (loading) {
    return (
      <SafeScreen>
        <LoadingContainer>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Spacer />
          <Text>Carregando jogos...</Text>
        </LoadingContainer>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <FlatList
        data={sectionedGames}
        keyExtractor={(item) => `${item.section}-${item.game.id}`}
        renderItem={({ item, index }) => (
          <>
            {index === 0 && (
              <Header>
                <Title>Descubra Jogos</Title>
                <Text style={{ color: theme.colors.muted }}>
                  Explore os melhores jogos recomendados para você
                </Text>
                {error ? <ErrorMessage>{error}</ErrorMessage> : null}
              </Header>
            )}
            {item.section === 'recommended' && index === 0 && recommendedGames.length > 0 && (
              <SectionTitle>✨ Recomendados</SectionTitle>
            )}
            {item.section === 'popular' &&
              (index === 0 || sectionedGames[index - 1].section !== 'popular') && (
                <SectionTitle>🔥 Populares</SectionTitle>
              )}
            <ContentContainer>
              <GameCard
                game={item.game}
                onPress={() => handleGamePress(item.game.id)}
              />
            </ContentContainer>
          </>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          <EmptyContainer>
            <Text style={{ color: error ? theme.colors.error : theme.colors.foreground }}>
              {error ?? 'Nenhum jogo encontrado'}
            </Text>
          </EmptyContainer>
        }
        contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
      />
    </SafeScreen>
  );
}
