import React, { useMemo, useState } from 'react';
import { FlatList, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import styled from '../utils/styled';
import { theme } from '../../constants/theme';
import { Title, Text, Spacer } from '../components/atoms/Container';
import GameCard from '../components/molecules/GameCard';
import { Game } from '../types';

const SafeScreen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${theme.colors?.background ?? '#0a0a0a'};
`;

const Header = styled.View`
  padding: ${theme.spacing.lg}px;
`;

const SearchInput = styled.TextInput`
  padding: ${theme.spacing.md}px;
  border-radius: 4px;
  background-color: '#1a1a1a';
  color: ${theme.colors.foreground};
  border-width: 1px;
  border-color: ${theme.colors?.border ?? '#2a2a2a'};
  font-size: ${theme.fonts.size.medium}px;
`;

const ContentContainer = styled.View`
  padding-horizontal: ${theme.spacing.lg}px;
`;

const EmptyContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xl}px;
`;

const mockGames: Game[] = [
  {
    id: 1,
    title: 'The Witcher 3: Wild Hunt',
    image: 'https://via.placeholder.com/400x200/0788d9/ffffff?text=Witcher+3',
    rating: 4.8,
    description: 'RPG de mundo aberto aclamado pela crítica',
  },
  {
    id: 2,
    title: 'Elden Ring',
    image: 'https://via.placeholder.com/400x200/05dbf2/ffffff?text=Elden+Ring',
    rating: 4.7,
    description: 'Action RPG épico dos criadores de Dark Souls',
  },
  {
    id: 3,
    title: 'Red Dead Redemption 2',
    image: 'https://via.placeholder.com/400x200/0788d9/ffffff?text=RDR2',
    rating: 4.9,
    description: 'Aventura de faroeste em mundo aberto',
  },
  {
    id: 4,
    title: 'Cyberpunk 2077',
    image: 'https://via.placeholder.com/400x200/05dbf2/ffffff?text=Cyberpunk',
    rating: 4.3,
    description: 'RPG futurista em Night City',
  },
  {
    id: 5,
    title: 'Hades',
    image: 'https://via.placeholder.com/400x200/0788d9/ffffff?text=Hades',
    rating: 4.6,
    description: 'Roguelike dinâmico nos domínios do submundo',
  },
  {
    id: 6,
    title: 'God of War Ragnarök',
    image: 'https://via.placeholder.com/400x200/05dbf2/ffffff?text=GoW+Ragnarok',
    rating: 4.9,
    description: 'Continuação épica da saga nórdica de Kratos',
  },
];

export default function ExploreScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const filteredGames = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return mockGames;
    }
    return mockGames.filter((game) => game.title.toLowerCase().includes(term));
  }, [query]);

  const handleGamePress = (gameId: number) => {
    // @ts-ignore - rota dinâmica gerenciada pelo Expo Router
    router.push(`/game/${gameId}`);
  };

  return (
    <SafeScreen>
      <Header>
        <Title>Explore Jogos</Title>
        <Spacer />
        <SearchInput
          placeholder="Buscar por nome..."
          placeholderTextColor={theme.colors.muted}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </Header>
      <FlatList
        data={filteredGames}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ContentContainer>
            <GameCard game={item} onPress={() => handleGamePress(item.id)} />
          </ContentContainer>
        )}
        ListEmptyComponent={
          <EmptyContainer>
            <Text>Nenhum jogo encontrado</Text>
          </EmptyContainer>
        }
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
      />
    </SafeScreen>
  );
}
