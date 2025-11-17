import React from 'react';
import styled from '../../utils/styled';
import { theme } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface RatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRate?: (vote: number) => void;
  userVote?: number;
  showLabel?: boolean;
}

const Container = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${theme.spacing.sm}px;
`;

const VoteButton = styled.TouchableOpacity<{
  active?: boolean;
  disabled?: boolean;
}>`
  padding: ${theme.spacing.xs}px;
  border-radius: ${theme.borderRadius.full}px;
  background-color: ${props => (props.active ? 'rgba(5, 219, 242, 0.12)' : 'transparent')};
  opacity: ${props => (props.disabled ? 0.6 : 1)};
`;

const Label = styled.Text<{ size: 'sm' | 'md' | 'lg' }>`
  color: ${theme.colors.muted};
  font-weight: 500;
  font-size: ${props => {
    switch (props.size) {
      case 'sm':
        return theme.fonts.size.medium;
      case 'lg':
        return theme.fonts.size.large;
      default:
        return theme.fonts.size.regular;
    }
  }}px;
`;

const iconSizes = {
  sm: 20,
  md: 28,
  lg: 34,
} as const;

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

const toPositivePercentage = (rating: number) => {
  const base = rating > 5 ? rating : rating * 20;
  return clamp(Math.round(base), 0, 100);
};

const Rating: React.FC<RatingProps> = ({
  rating,
  size = 'md',
  interactive = false,
  onRate,
  userVote = 0,
  showLabel,
}) => {
  const positivePercentage = toPositivePercentage(rating);
  const negativePercentage = 100 - positivePercentage;

  const resolvedShowLabel = showLabel ?? !interactive;

  const handleVote = (vote: number) => {
    if (!interactive || !onRate) {
      return;
    }

    const nextVote = userVote === vote ? 0 : vote;
    onRate(nextVote);
  };

  return (
    <Container>
      <VoteButton
        onPress={() => handleVote(1)}
        active={userVote === 1}
        disabled={!interactive}
        activeOpacity={interactive ? 0.8 : 1}
      >
        <Ionicons
          name={userVote === 1 ? 'thumbs-up' : 'thumbs-up-outline'}
          size={iconSizes[size]}
          color={userVote === 1 ? theme.colors.success : theme.colors.muted}
        />
      </VoteButton>

      <VoteButton
        onPress={() => handleVote(-1)}
        active={userVote === -1}
        disabled={!interactive}
        activeOpacity={interactive ? 0.8 : 1}
      >
        <Ionicons
          name={userVote === -1 ? 'thumbs-down' : 'thumbs-down-outline'}
          size={iconSizes[size]}
          color={userVote === -1 ? theme.colors.error : theme.colors.muted}
        />
      </VoteButton>

      {resolvedShowLabel && (
        <Label size={size}>
          {positivePercentage}% positivo · {negativePercentage}% negativo
        </Label>
      )}
    </Container>
  );
};

export default Rating;
