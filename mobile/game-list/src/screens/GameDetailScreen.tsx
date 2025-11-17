import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, SafeAreaView, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import styled from '../utils/styled';
import { theme } from '../../constants/theme';
import { Title, Text, Spacer } from '../components/atoms/Container';
import Button from '../components/atoms/Button';
import Rating from '../components/molecules/Rating';
import { Game } from '../types';

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

export default function GameDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState<Game | null>(null);
  const [userVote, setUserVote] = useState(0);

  useEffect(() => {
    loadGameDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadGameDetails = async () => {
    try {
      // TODO: Carregar detalhes reais da API
      const mockGame: Game = {
        id: Number(params.id) || 1,
        title: "The Witcher 3: Wild Hunt",
        image: "https://via.placeholder.com/800x480/0788d9/ffffff?text=Witcher+3",
        rating: 4.8,
        description: "Você é Geralt de Rívia, caçador de monstros mercenário. Você tem à sua disposição todas as ferramentas do ofício: lâminas profissionais, poções preparadas e habilidades de combate - tudo isso para ser usado contra uma nova ameaça.\n\nExplore um mundo de fantasia aberto e vibrante: trace seu próprio caminho para a aventura, faça escolhas que terão consequências e procure por um poder misterioso do mito antigo.",
        releaseDate: "19 de maio de 2015",
        genre: "RPG, Ação, Aventura",
        developer: "CD PROJEKT RED",
        platform: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
      };

      setGame(mockGame);
      setUserVote(0);
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = (vote: number) => {
    setUserVote(vote);
  };

  const handleSaveVote = () => {
    if (!game || userVote === 0) {
      return;
    }

    console.log('Salvando voto:', {
      gameId: game.id,
      vote: userVote,
    });
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

  if (!game) {
    return (
      <SafeScreen>
        <LoadingContainer>
          <Text>Jogo não encontrado</Text>
          <Spacer />
          <Button onPress={() => router.back()}>Voltar</Button>
        </LoadingContainer>
      </SafeScreen>
    );
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
          <InfoValue>{game.description}</InfoValue>

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

          {game.platform && (
            <>
              <InfoLabel>Plataformas</InfoLabel>
              <InfoValue>{game.platform.join(', ')}</InfoValue>
            </>
          )}

          <VoteCard>
            <VoteTitle>Avaliar este jogo</VoteTitle>

            <VoteActions>
              <Rating
                rating={game.rating}
                size="lg"
                interactive
                userVote={userVote}
                onRate={handleVote}
                showLabel={false}
              />

              {userVote === 0 ? (
                <VoteHint>Selecione uma opção para votar.</VoteHint>
              ) : (
                <Button onPress={handleSaveVote}>
                  Salvar
                </Button>
              )}
            </VoteActions>
          </VoteCard>
        </Content>
      </ScrollContent>
    </SafeScreen>
  );
}
