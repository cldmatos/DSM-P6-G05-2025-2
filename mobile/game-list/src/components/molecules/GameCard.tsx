import React from 'react';
import { TouchableOpacity } from 'react-native';
import styled from '../../utils/styled';
import { theme } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
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

const CardContent = styled.View`
  padding: ${theme.spacing.md}px;
`;

const GameTitle = styled.Text`
  color: ${theme.colors.foreground};
  font-size: ${theme.fonts.size.large}px;
  font-weight: 600;
  margin-bottom: ${theme.spacing.xs}px;
`;

const RatingContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${theme.spacing.xs}px;
`;

const RatingText = styled.Text`
  color: ${theme.colors.primary};
  font-size: ${theme.fonts.size.medium}px;
  font-weight: 500;
`;

const GameCard: React.FC<GameCardProps> = ({ game, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <CardContainer>
        <GameImage
          source={{ uri: game.image }}
          resizeMode="cover"
        />
        <CardContent>
          <GameTitle numberOfLines={2}>{game.title}</GameTitle>
          <RatingContainer>
            <Ionicons name="star" size={16} color={theme.colors.primary} />
            <RatingText>{game.rating.toFixed(1)}</RatingText>
          </RatingContainer>
        </CardContent>
      </CardContainer>
    </TouchableOpacity>
  );
};

export default GameCard;
