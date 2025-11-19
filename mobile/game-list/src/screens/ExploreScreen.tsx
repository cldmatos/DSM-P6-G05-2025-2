import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import styled from '../utils/styled';
import { theme } from '../../constants/theme';
import { Title, Text, Spacer } from '../components/atoms/Container';
import GameCard from '../components/molecules/GameCard';
import ApiService from '../services/api';
import { mapApiResponseToGames } from '../services/gameMapper';
import { ApiError, Game } from '../types';

const SafeScreen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${theme.colors?.background ?? '#0a0a0a'};
`;

const Header = styled.View`
  padding: ${theme.spacing.lg}px;
`;

const SearchInput = styled.TextInput`
  padding: ${theme.spacing.md}px;
  border-radius: ${theme.borderRadius.md ?? 6}px;
  background-color: ${theme.colors.cardBackground};
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

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing.xl}px;
`;

const StatusText = styled.Text`
  color: ${theme.colors.muted};
  margin-top: ${theme.spacing.sm}px;
`;

const ErrorMessage = styled.Text`
  color: ${theme.colors.error};
  margin-top: ${theme.spacing.sm}px;
  text-align: center;
`;

type TimeoutRef = ReturnType<typeof setTimeout> | null;

export default function ExploreScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [games, setGames] = useState<Game[]>([]);
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchTimeoutRef = useRef<TimeoutRef>(null);

  const loadInitialGames = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const bestRatedResponse = await ApiService.getBestRatedGames(40, 20);
      let fetchedGames = mapApiResponseToGames(bestRatedResponse);

      if (!fetchedGames.length) {
        const popularResponse = await ApiService.getPopularGames(40);
        fetchedGames = mapApiResponseToGames(popularResponse);
      }

      if (!fetchedGames.length) {
        const fallbackResponse = await ApiService.getAllGames(1, 40);
        fetchedGames = mapApiResponseToGames(fallbackResponse);
      }

      if (!fetchedGames.length) {
        setError('Não encontramos jogos para exibir agora.');
      }

      setGames(fetchedGames);
    } catch (err) {
      const message =
        typeof (err as ApiError)?.message === 'string'
          ? (err as ApiError).message
          : err instanceof Error
            ? err.message
            : 'Não foi possível carregar os jogos.';

      setError(message);
      setGames([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialGames();
  }, [loadInitialGames]);

  useEffect(() => {
    const term = query.trim();

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }

    if (!term) {
      setSearchResults([]);
      setSearchError(null);
      setSearching(false);
      return;
    }

    setSearching(true);
    setSearchError(null);

    let cancelled = false;

    const timeoutId = setTimeout(async () => {
      try {
        const response = await ApiService.searchGames(term);
        if (cancelled) {
          return;
        }

        const results = mapApiResponseToGames(response);
        setSearchResults(results);
        setSearchError(
          results.length === 0 ? 'Nenhum jogo encontrado para este termo.' : null
        );
      } catch (err) {
        if (cancelled) {
          return;
        }

        const message =
          typeof (err as ApiError)?.message === 'string'
            ? (err as ApiError).message
            : err instanceof Error
              ? err.message
              : 'Não foi possível buscar jogos.';
        setSearchError(message);
        setSearchResults([]);
      } finally {
        if (!cancelled) {
          setSearching(false);
        }
        if (searchTimeoutRef.current === timeoutId) {
          searchTimeoutRef.current = null;
        }
      }
    }, 400);

    searchTimeoutRef.current = timeoutId;

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      if (searchTimeoutRef.current === timeoutId) {
        searchTimeoutRef.current = null;
      }
    };
  }, [query]);

  const trimmedQuery = query.trim();

  const displayedGames = useMemo(() => {
    return trimmedQuery ? searchResults : games;
  }, [trimmedQuery, searchResults, games]);

  const statusLabel = useMemo(() => {
    if (trimmedQuery) {
      if (searching) {
        return 'Buscando jogos...';
      }
      const count = displayedGames.length;
      return `${count} ${count === 1 ? 'jogo encontrado' : 'jogos encontrados'}`;
    }

    if (error) {
      return error;
    }

    const count = games.length;
    return `${count} ${count === 1 ? 'jogo disponível' : 'jogos disponíveis'}`;
  }, [trimmedQuery, searching, displayedGames.length, games.length, error]);

  const currentError = trimmedQuery ? searchError : error;

  const handleGamePress = (gameId: number) => {
    router.push({ pathname: '/game/[id]', params: { id: String(gameId) } });
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
        {statusLabel && !currentError ? <StatusText>{statusLabel}</StatusText> : null}
        {currentError ? <ErrorMessage>{currentError}</ErrorMessage> : null}
        {trimmedQuery && searching ? (
          <ActivityIndicator
            size="small"
            color={theme.colors.primary}
            style={{ marginTop: theme.spacing.sm }}
          />
        ) : null}
      </Header>
      {loading ? (
        <LoadingContainer>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Spacer />
          <Text>Carregando jogos...</Text>
        </LoadingContainer>
      ) : (
        <FlatList
          data={displayedGames}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ContentContainer>
              <GameCard game={item} onPress={() => handleGamePress(item.id)} />
            </ContentContainer>
          )}
          ListEmptyComponent={
            <EmptyContainer>
              <Text style={{ color: currentError ? theme.colors.error : theme.colors.foreground }}>
                {currentError ?? (trimmedQuery ? 'Nenhum jogo encontrado' : 'Nenhum jogo disponível no momento.')}
              </Text>
            </EmptyContainer>
          }
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
        />
      )}
    </SafeScreen>
  );
}
