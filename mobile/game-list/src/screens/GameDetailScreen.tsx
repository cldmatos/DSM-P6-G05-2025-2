import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import styled from '../utils/styled';
import { theme } from '../../constants/theme';
import { SafeContainer, ScrollContainer, Title, Text, Spacer } from '../components/atoms/Container';
import Button from '../components/atoms/Button';
import { Ionicons } from '@expo/vector-icons';
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

const RatingContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${theme.spacing.xs}px;
  margin-bottom: ${theme.spacing.md}px;
`;

const RatingText = styled.Text`
  color: ${theme.colors.primary};
  font-size: ${theme.fonts.size.xlarge}px;
  font-weight: bold;
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

export default function GameDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState<Game | null>(null);

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
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeContainer>
        <LoadingContainer>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Spacer />
          <Text>Carregando detalhes...</Text>
        </LoadingContainer>
      </SafeContainer>
    );
  }

  if (!game) {
    return (
      <SafeContainer>
        <LoadingContainer>
          <Text>Jogo não encontrado</Text>
          <Spacer />
          <Button onPress={() => router.back()}>Voltar</Button>
        </LoadingContainer>
      </SafeContainer>
    );
  }

  return (
    <SafeContainer>
      <ScrollContainer>
        <HeaderImage source={{ uri: game.image }} resizeMode="cover" />

        <Content>
          <Title>{game.title}</Title>

          <RatingContainer>
            <Ionicons name="star" size={24} color={theme.colors.primary} />
            <RatingText>{game.rating.toFixed(1)}</RatingText>
            <Text style={{ color: theme.colors.muted }}>/5.0</Text>
          </RatingContainer>

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

          <Spacer size="lg" />

          <Button onPress={() => router.back()}>
            Voltar
          </Button>
        </Content>
      </ScrollContainer>
    </SafeContainer>
  );
}
