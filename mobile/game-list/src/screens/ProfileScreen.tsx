import React, { useEffect, useState } from 'react';
import { Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import styled from '../utils/styled';
import { theme } from '../../constants/theme';
import { SafeContainer, ScrollContainer, Title, Text, Spacer, Card } from '../components/atoms/Container';
import Button from '../components/atoms/Button';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/api';
import { User } from '../types';

const Header = styled.View`
  align-items: center;
  padding: ${theme.spacing.xl}px;
  background-color: ${theme.colors.cardBackground};
`;

const Avatar = styled.View`
  width: 100px;
  height: 100px;
  border-radius: 50px;
  background-color: ${theme.colors.primary};
  align-items: center;
  justify-content: center;
  margin-bottom: ${theme.spacing.md}px;
`;

const AvatarText = styled.Text`
  color: ${theme.colors.background};
  font-size: ${theme.fonts.size.xxlarge}px;
  font-weight: bold;
`;

const UserName = styled.Text`
  color: ${theme.colors.foreground};
  font-size: ${theme.fonts.size.xlarge}px;
  font-weight: bold;
  margin-bottom: ${theme.spacing.xs}px;
`;

const UserEmail = styled.Text`
  color: ${theme.colors.muted};
  font-size: ${theme.fonts.size.medium}px;
`;

const Content = styled.View`
  padding: ${theme.spacing.lg}px;
`;

const InfoRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${theme.spacing.md}px;
  padding: ${theme.spacing.md}px;
`;

const InfoText = styled.Text`
  color: ${theme.colors.foreground};
  font-size: ${theme.fonts.size.regular}px;
  flex: 1;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const storedUser = await ApiService.getStoredUser();

      if (storedUser) {
        setUser(storedUser);
      } else {
        setUser({
          id: 1,
          name: "Usuário Teste",
          email: "usuario@teste.com",
        });
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await ApiService.logout();
            // @ts-ignore
            router.replace('/login');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeContainer>
        <LoadingContainer>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Spacer />
          <Text>Carregando perfil...</Text>
        </LoadingContainer>
      </SafeContainer>
    );
  }

  if (!user) {
    return (
      <SafeContainer>
        <LoadingContainer>
          <Text>Erro ao carregar perfil</Text>
          <Spacer />
          <Button onPress={loadProfile}>Tentar novamente</Button>
        </LoadingContainer>
      </SafeContainer>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <SafeContainer>
      <ScrollContainer>
        <Header>
          <Avatar>
            <AvatarText>{getInitials(user.name)}</AvatarText>
          </Avatar>
          <UserName>{user.name}</UserName>
          <UserEmail>{user.email}</UserEmail>
        </Header>

        <Content>
          <Title>Informações da Conta</Title>

          <Card>
            <InfoRow>
              <Ionicons name="person-outline" size={24} color={theme.colors.primary} />
              <InfoText>{user.name}</InfoText>
            </InfoRow>

            <InfoRow>
              <Ionicons name="mail-outline" size={24} color={theme.colors.primary} />
              <InfoText>{user.email}</InfoText>
            </InfoRow>

            {user.createdAt && (
              <InfoRow>
                <Ionicons name="calendar-outline" size={24} color={theme.colors.primary} />
                <InfoText>Membro desde {new Date(user.createdAt).toLocaleDateString()}</InfoText>
              </InfoRow>
            )}
          </Card>

          <Spacer size="lg" />

          <Button
            variant="outline"
            onPress={handleLogout}
          >
            Sair da Conta
          </Button>
        </Content>
      </ScrollContainer>
    </SafeContainer>
  );
}
