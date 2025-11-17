import React, { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import styled from '../../utils/styled';
import { theme } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Rating from './Rating';
import { Game } from '../../types';

interface GameCardProps {
  game: Game;
  onPress: () => void;
}

const CardContainer = styled.View`
  background-color: ${theme.colors.cardBackground};
  border-radius: ${theme.borderRadius.lg}px;
  overflow: hidden;
  border-width: 1px;
  border-color: ${theme.colors.border};
  margin-bottom: ${theme.spacing.md}px;
`;

const GameImage = styled.Image`
  width: 100%;
  height: 200px;
  background-color: ${theme.colors.background};
`;

const FallbackCover = styled.View`
  width: 100%;
  height: 200px;
  align-items: center;
  justify-content: center;
  background-color: ${theme.colors.cardBackground};
  padding: ${theme.spacing.md}px;
`;

const FallbackTitle = styled.Text`
  color: ${theme.colors.primary};
  font-size: ${theme.fonts.size.regular}px;
  font-weight: 600;
  text-align: center;
  margin-top: ${theme.spacing.sm}px;
`;

const CardContent = styled.View`
  padding: ${theme.spacing.md}px;
`;

const GameTitle = styled.Text`
  color: ${theme.colors.foreground};
  font-size: ${theme.fonts.size.large}px;
  font-weight: 600;
  margin-bottom: ${theme.spacing.xs}px;
`;

const GameCard: React.FC<GameCardProps> = ({ game, onPress }) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [game.image]);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <CardContainer>
        {!imageError ? (
          <GameImage
            source={{ uri: game.image }}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <FallbackCover>
            <Ionicons name="image-outline" size={48} color={theme.colors.primary} />
            <FallbackTitle numberOfLines={2}>{game.title}</FallbackTitle>
          </FallbackCover>
        )}
        <CardContent>
          <GameTitle numberOfLines={2}>{game.title}</GameTitle>
          <Rating rating={game.rating} size="sm" />
        </CardContent>
      </CardContainer>
    </TouchableOpacity>
  );
};

export default GameCard;
