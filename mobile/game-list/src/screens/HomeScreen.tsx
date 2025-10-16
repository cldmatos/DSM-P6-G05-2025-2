import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import styled from '../utils/styled';
import { theme } from '../../constants/theme';
import { SafeContainer, Title, Text, Spacer } from '../components/atoms/Container';
import GameCard from '../components/molecules/GameCard';
// import ApiService from '../services/api';
import { Game } from '../types';

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

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recommendedGames, setRecommendedGames] = useState<Game[]>([]);
  const [popularGames, setPopularGames] = useState<Game[]>([]);

  const loadGames = async () => {
    try {
      // TODO: Substituir por dados reais da API quando disponível
      const mockGames: Game[] = [
        {
          id: 1,
          title: "The Witcher 3: Wild Hunt",
          image: "https://via.placeholder.com/400x200/0788d9/ffffff?text=Witcher+3",
          rating: 4.8,
          description: "RPG de mundo aberto aclamado pela crítica",
        },
        {
          id: 2,
          title: "Elden Ring",
          image: "https://via.placeholder.com/400x200/05dbf2/ffffff?text=Elden+Ring",
          rating: 4.7,
          description: "Action RPG épico dos criadores de Dark Souls",
        },
        {
          id: 3,
          title: "Red Dead Redemption 2",
          image: "https://via.placeholder.com/400x200/0788d9/ffffff?text=RDR2",
          rating: 4.9,
          description: "Aventura de faroeste em mundo aberto",
        },
        {
          id: 4,
          title: "Cyberpunk 2077",
          image: "https://via.placeholder.com/400x200/05dbf2/ffffff?text=Cyberpunk",
          rating: 4.3,
          description: "RPG futurista em Night City",
        },
      ];

      setRecommendedGames(mockGames.slice(0, 2));
      setPopularGames(mockGames.slice(2, 4));
    } catch (error) {
      console.error('Erro ao carregar jogos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadGames();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadGames();
  };

  const handleGamePress = (gameId: number) => {
    // @ts-ignore
    router.push(`/game/${gameId}`);
  };

  if (loading) {
    return (
      <SafeContainer>
        <LoadingContainer>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Spacer />
          <Text>Carregando jogos...</Text>
        </LoadingContainer>
      </SafeContainer>
    );
  }

  const allGames = [...recommendedGames, ...popularGames];

  return (
    <SafeContainer>
      <FlatList
        data={allGames}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <>
            {index === 0 && (
              <Header>
                <Title>Descubra Jogos</Title>
                <Text style={{ color: theme.colors.muted }}>
                  Explore os melhores jogos recomendados para você
                </Text>
              </Header>
            )}
            {index === 0 && <SectionTitle>✨ Recomendados</SectionTitle>}
            {index === recommendedGames.length && (
              <SectionTitle>🔥 Populares</SectionTitle>
            )}
            <ContentContainer>
              <GameCard
                game={item}
                onPress={() => handleGamePress(item.id)}
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
            <Text>Nenhum jogo encontrado</Text>
          </EmptyContainer>
        }
        contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
      />
    </SafeContainer>
  );
}
