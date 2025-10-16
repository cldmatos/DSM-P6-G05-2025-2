import React from 'react';
import { ActivityIndicator } from 'react-native';
import styled from '../../utils/styled';
import { theme } from '../../../constants/theme';
import { Text } from '../atoms/Container';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'large';
}

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing.xl}px;
`;

const Spacer = styled.View`
  height: ${theme.spacing.md}px;
`;

const Loading: React.FC<LoadingProps> = ({ message = 'Carregando...', size = 'large' }) => {
  return (
    <Container>
      <ActivityIndicator size={size} color={theme.colors.primary} />
      {message && (
        <>
          <Spacer />
          <Text>{message}</Text>
        </>
      )}
    </Container>
  );
};

export default Loading;
