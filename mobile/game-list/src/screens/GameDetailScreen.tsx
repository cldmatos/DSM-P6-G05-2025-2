import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, SafeAreaView, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import styled from '../utils/styled';
import { theme } from '../../constants/theme';
import { Title, Text, Spacer } from '../components/atoms/Container';
import Button from '../components/atoms/Button';
import Rating from '../components/molecules/Rating';
import ApiService from '../services/api';
import { mapApiResponseToGame } from '../services/gameMapper';
import { ApiError, Game } from '../types';

const { width } = Dimensions.get('window');

const HeaderImage = styled.Image`
  width: ${width}px;
  height: ${width * 0.6}px;
  background-color: ${theme.colors.background};
`;

const Content = styled.View`
  padding: ${theme.spacing.lg}px;
`;

const RatingSection = styled.View`
  margin-bottom: ${theme.spacing.lg}px;
`;

const InfoLabel = styled.Text`
  color: ${theme.colors.muted};
  font-size: ${theme.fonts.size.medium}px;
  margin-bottom: ${theme.spacing.xs}px;
`;

const InfoValue = styled.Text`
  color: ${theme.colors.foreground};
  font-size: ${theme.fonts.size.regular}px;
  margin-bottom: ${theme.spacing.md}px;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const SafeScreen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${theme.colors?.background ?? '#0a0a0a'};
`;

const ScrollContent = styled(ScrollView)`
  flex: 1;
`;

const VoteCard = styled.View`
  margin-top: ${theme.spacing.xl}px;
  padding: ${theme.spacing.lg}px;
  background-color: ${theme.colors.cardBackground};
  border-radius: ${theme.borderRadius.lg}px;
  border-width: 1px;
  border-color: ${theme.colors.border};
`;

const VoteTitle = styled.Text`
  color: ${theme.colors.foreground};
  font-size: ${theme.fonts.size.large}px;
  font-weight: 700;
`;

const VoteActions = styled.View`
  margin-top: ${theme.spacing.md}px;
  align-items: center;
  gap: ${theme.spacing.md}px;
`;

const VoteHint = styled.Text`
  color: ${theme.colors.muted};
  font-size: ${theme.fonts.size.small}px;
`;

const VoteFeedbackMessage = styled.Text`
  color: ${theme.colors.success};
  font-size: ${theme.fonts.size.small}px;
  text-align: center;
`;

const VoteErrorMessage = styled.Text`
  color: ${theme.colors.error};
  font-size: ${theme.fonts.size.small}px;
  text-align: center;
`;

export default function GameDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState<Game | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [userVote, setUserVote] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSavingVote, setIsSavingVote] = useState(false);
  const [voteFeedback, setVoteFeedback] = useState<string | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);

  const gameId = useMemo(() => {
    const rawId = (params as Record<string, unknown>)?.id;

    if (Array.isArray(rawId) && rawId.length > 0) {
      const parsed = Number(rawId[0]);
      return Number.isFinite(parsed) ? parsed : null;
    }

    if (typeof rawId === 'string') {
      const parsed = Number(rawId);
      return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
  }, [params]);

  const loadGameDetails = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await ApiService.getGameById(id);
      const mapped = mapApiResponseToGame(response);

      if (!mapped) {
        throw new Error('Não foi possível carregar os detalhes deste jogo.');
      }

      setGame(mapped);
      setVoteFeedback(null);
      setVoteError(null);
      setUserVote(0);
    } catch (err) {
      const message =
        typeof (err as ApiError)?.message === 'string'
          ? (err as ApiError).message
          : err instanceof Error
            ? err.message
            : 'Não foi possível carregar os detalhes deste jogo.';

      setError(message);
      setGame(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (gameId == null) {
      setGame(null);
      setError('Jogo não encontrado.');
      setLoading(false);
      return;
    }

    loadGameDetails(gameId);
  }, [gameId, loadGameDetails]);

  useEffect(() => {
    let isMounted = true;

    ApiService.getStoredUser()
      .then((user) => {
        if (isMounted) {
          setUserId(user?.id ?? null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setUserId(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleVote = (vote: number) => {
    setUserVote(vote);
    setVoteFeedback(null);
    setVoteError(null);
  };

  const handleSaveVote = async () => {
    if (!game || userVote === 0 || isSavingVote) {
      return;
    }

    if (userId == null) {
      setVoteError('Faça login para avaliar este jogo.');
      return;
    }

    try {
      setIsSavingVote(true);
      setVoteFeedback(null);
      setVoteError(null);

      const response = await ApiService.rateGame(game.id, userVote === 1, userId);

      if (response?.sucesso === false) {
        const message = response.erro || response.mensagem;
        throw new Error(message || 'Não foi possível registrar a avaliação.');
      }

      const message =
        response?.mensagem ||
        (userVote === 1
          ? 'Avaliação positiva registrada com sucesso.'
          : 'Avaliação negativa registrada com sucesso.');

      setVoteFeedback(message);
    } catch (err) {
      const message =
        typeof (err as ApiError)?.message === 'string'
          ? (err as ApiError).message
          : err instanceof Error
            ? err.message
            : 'Não foi possível registrar a avaliação.';
      setVoteError(message);
    } finally {
      setIsSavingVote(false);
    }
  };

  if (loading) {
    return (
      <SafeScreen>
        <LoadingContainer>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Spacer />
          <Text>Carregando detalhes...</Text>
        </LoadingContainer>
      </SafeScreen>
    );
  }

  if (!loading && !game) {
    return (
      <SafeScreen>
        <LoadingContainer>
          <Text>{error ?? 'Jogo não encontrado'}</Text>
          <Spacer />
          <Button onPress={() => router.back()}>Voltar</Button>
        </LoadingContainer>
      </SafeScreen>
    );
  }

  if (!game) {
    return null;
  }

  return (
    <SafeScreen>
      <ScrollContent showsVerticalScrollIndicator={false}>
        <HeaderImage source={{ uri: game.image }} resizeMode="cover" />

        <Content>
          <Title>{game.title}</Title>

          <RatingSection>
            <Rating rating={game.rating} size="lg" />
          </RatingSection>

          <Spacer />

          <InfoLabel>Descrição</InfoLabel>
          <InfoValue>{game.description ?? 'Descrição não disponível.'}</InfoValue>

          {game.genre && (
            <>
              <InfoLabel>Gênero</InfoLabel>
              <InfoValue>{game.genre}</InfoValue>
            </>
          )}

          {game.developer && (
            <>
              <InfoLabel>Desenvolvedora</InfoLabel>
              <InfoValue>{game.developer}</InfoValue>
            </>
          )}

          {game.releaseDate && (
            <>
              <InfoLabel>Data de Lançamento</InfoLabel>
              <InfoValue>{game.releaseDate}</InfoValue>
            </>
          )}

          {Array.isArray(game.platform) && game.platform.length > 0 && (
            <>
              <InfoLabel>Plataformas</InfoLabel>
              <InfoValue>{game.platform.join(', ')}</InfoValue>
            </>
          )}

          {game.price && (
            <>
              <InfoLabel>Preço</InfoLabel>
              <InfoValue>{game.price}</InfoValue>
            </>
          )}

          <VoteCard>
            <VoteTitle>Avaliar este jogo</VoteTitle>

            <VoteActions>
              <Rating
                rating={game.rating}
                size="lg"
                interactive={userId != null}
                userVote={userVote}
                onRate={handleVote}
                showLabel={false}
              />

              {userId == null ? (
                <VoteHint>Faça login para avaliar este jogo.</VoteHint>
              ) : userVote === 0 ? (
                <VoteHint>Selecione uma opção para votar.</VoteHint>
              ) : (
                <Button onPress={handleSaveVote} loading={isSavingVote} disabled={isSavingVote}>
                  {isSavingVote ? 'Salvando...' : 'Salvar'}
                </Button>
              )}

              {voteFeedback ? (
                <VoteFeedbackMessage>{voteFeedback}</VoteFeedbackMessage>
              ) : null}

              {voteError ? (
                <VoteErrorMessage>{voteError}</VoteErrorMessage>
              ) : null}
            </VoteActions>
          </VoteCard>
        </Content>
      </ScrollContent>
    </SafeScreen>
  );
}
