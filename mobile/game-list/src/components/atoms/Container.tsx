import styled from '../../utils/styled';
import { theme } from '../../../constants/theme';

export const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.background};
`;

export const ScrollContainer = styled.ScrollView`
  flex: 1;
  background-color: ${theme.colors.background};
`;

export const SafeContainer = styled.SafeAreaView`
  flex: 1;
  background-color: ${theme.colors.background};
`;

export const Card = styled.View`
  background-color: ${theme.colors.cardBackground};
  border-radius: ${theme.borderRadius.lg}px;
  padding: ${theme.spacing.md}px;
  margin-bottom: ${theme.spacing.md}px;
  border-width: 1px;
  border-color: ${theme.colors.border};
`;

export const Title = styled.Text`
  color: ${theme.colors.primary};
  font-size: ${theme.fonts.size.title}px;
  font-weight: bold;
  margin-bottom: ${theme.spacing.md}px;
`;

export const Subtitle = styled.Text`
  color: ${theme.colors.foreground};
  font-size: ${theme.fonts.size.large}px;
  font-weight: 600;
  margin-bottom: ${theme.spacing.sm}px;
`;

export const Text = styled.Text`
  color: ${theme.colors.foreground};
  font-size: ${theme.fonts.size.regular}px;
  line-height: 22px;
`;

export const MutedText = styled.Text`
  color: ${theme.colors.muted};
  font-size: ${theme.fonts.size.medium}px;
`;

export const Row = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const Spacer = styled.View<{ size?: 'sm' | 'md' | 'lg' }>`
  height: ${props => {
    switch (props.size) {
      case 'sm': return theme.spacing.sm;
      case 'lg': return theme.spacing.lg;
      default: return theme.spacing.md;
    }
  }}px;
`;
