import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import styled from '../utils/styled';
import { theme } from '../../constants/theme';
import Input from '../components/atoms/Input';
import Button from '../components/atoms/Button';
import ApiService from '../services/api';

const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.background};
`;

const Header = styled.View`
  padding: ${theme.spacing.xl}px ${theme.spacing.lg}px;
  align-items: center;
  padding-top: ${theme.spacing.xxl}px;
`;

const Title = styled.Text`
  color: ${theme.colors.primary};
  font-size: ${theme.fonts.size.xxlarge}px;
  font-weight: bold;
  margin-bottom: ${theme.spacing.xs}px;
`;

const Subtitle = styled.Text`
  color: ${theme.colors.muted};
  font-size: ${theme.fonts.size.regular}px;
  text-align: center;
`;

const FormCard = styled.View`
  padding: ${theme.spacing.lg}px;
  background-color: ${theme.colors.cardBackground};
  margin: ${theme.spacing.lg}px;
  border-radius: ${theme.borderRadius.lg}px;
  border-width: 1px;
  border-color: ${theme.colors.border};
`;

const SectionLabel = styled.Text`
  color: ${theme.colors.foreground};
  font-size: ${theme.fonts.size.medium}px;
  font-weight: 500;
`;

const GenresSummaryText = styled.Text`
  color: ${theme.colors.muted};
  font-size: ${theme.fonts.size.small}px;
  margin-top: ${theme.spacing.xs}px;
`;

const SelectedGenresContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: ${theme.spacing.sm}px;
`;

const SelectedGenreChip = styled.View`
  background-color: ${theme.colors.secondary};
  border-radius: ${theme.borderRadius.full}px;
  padding: ${theme.spacing.xs}px ${theme.spacing.sm}px;
  margin-right: ${theme.spacing.sm}px;
  margin-bottom: ${theme.spacing.sm}px;
`;

const SelectedGenreText = styled.Text`
  color: ${theme.colors.background};
  font-size: ${theme.fonts.size.small}px;
  font-weight: 600;
`;

const ErrorText = styled.Text`
  color: ${theme.colors.error};
  font-size: ${theme.fonts.size.small}px;
  margin-top: ${theme.spacing.xs}px;
`;

const FeedbackText = styled.Text<{ type: 'success' | 'error' }>`
  color: ${(props) => (props.type === 'success' ? theme.colors.success : theme.colors.error)};
  font-size: ${theme.fonts.size.medium}px;
  margin-top: ${theme.spacing.md}px;
  text-align: center;
`;

const Footer = styled.View`
  padding: ${theme.spacing.lg}px;
  align-items: center;
`;

const FooterText = styled.Text`
  color: ${theme.colors.muted};
  font-size: ${theme.fonts.size.medium}px;
`;

const FooterLink = styled.Text`
  color: ${theme.colors.primary};
  font-size: ${theme.fonts.size.medium}px;
  font-weight: 600;
`;

const ModalOverlay = styled.View`
  flex: 1;
  background-color: ${theme.colors.overlay};
  justify-content: center;
  padding: ${theme.spacing.lg}px;
`;

const ModalContent = styled.View`
  background-color: ${theme.colors.background};
  border-radius: ${theme.borderRadius.lg}px;
  padding: ${theme.spacing.lg}px;
  max-height: 80%;
`;

const ModalTitle = styled.Text`
  color: ${theme.colors.foreground};
  font-size: ${theme.fonts.size.large}px;
  font-weight: 600;
`;

const ModalDescription = styled.Text`
  color: ${theme.colors.muted};
  font-size: ${theme.fonts.size.small}px;
  margin-top: ${theme.spacing.xs}px;
  margin-bottom: ${theme.spacing.md}px;
`;

const GenreOption = styled.TouchableOpacity<{ selected: boolean }>`
  padding: ${theme.spacing.md}px;
  border-radius: ${theme.borderRadius.md}px;
  background-color: ${(props) => (props.selected ? theme.colors.primary : theme.colors.cardBackground)};
  border-width: 1px;
  border-color: ${(props) => (props.selected ? theme.colors.primary : theme.colors.border)};
  margin-bottom: ${theme.spacing.sm}px;
`;

const GenreOptionText = styled.Text<{ selected: boolean }>`
  color: ${(props) => (props.selected ? theme.colors.background : theme.colors.foreground)};
  font-size: ${theme.fonts.size.medium}px;
  font-weight: ${(props) => (props.selected ? '600' : '400')};
`;

const ModalActions = styled.View`
  margin-top: ${theme.spacing.md}px;
`;

const ScrollContent = styled(ScrollView)`
  flex: 1;
`;

const defaultGenres = [
  'acao',
  'aventura',
  'rpg',
  'estrategia',
  'esportes',
  'corrida',
  'fps',
  'moba',
  'simulacao',
  'puzzle',
];

const maxGenreSelections = 4;

const formatLabel = (value: string) =>
  value
    .replace(/[_-]/g, ' ')
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [genreError, setGenreError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [availableGenres, setAvailableGenres] = useState<string[]>(defaultGenres);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const redirectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const data = await ApiService.getCategories();
        if (isActive && Array.isArray(data?.categorias) && data.categorias.length) {
          setAvailableGenres(data.categorias);
        }
      } catch (error) {
        if (__DEV__) {
          console.warn('Falha ao carregar categorias', error);
        }
      } finally {
        if (isActive) {
          setIsLoadingCategories(false);
        }
      }
    };

    loadCategories();

    return () => {
      isActive = false;
      if (redirectTimeout.current) {
        clearTimeout(redirectTimeout.current);
      }
    };
  }, []);

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleToggleGenre = (genre: string) => {
    setFeedback(null);
    setSelectedGenres((prev) => {
      if (prev.includes(genre)) {
        setGenreError('');
        return prev.filter((item) => item !== genre);
      }
      if (prev.length >= maxGenreSelections) {
        setGenreError(`Selecione no maximo ${maxGenreSelections} generos.`);
        return prev;
      }
      setGenreError('');
      return [...prev, genre];
    });
  };

  const handleClearGenres = () => {
    setSelectedGenres([]);
    setGenreError('');
  };

  const resetFieldErrors = () => {
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setGenreError('');
  };

  const handleSubmit = async () => {
    resetFieldErrors();
    setFeedback(null);

    let hasError = false;

    if (!name.trim()) {
      setNameError('Nome e obrigatorio');
      hasError = true;
    }

    if (!email.trim()) {
      setEmailError('Email e obrigatorio');
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError('Email invalido');
      hasError = true;
    }

    if (!password.trim()) {
      setPasswordError('Senha e obrigatoria');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('Senha deve ter no minimo 6 caracteres');
      hasError = true;
    }

    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Confirme sua senha');
      hasError = true;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError('As senhas nao coincidem');
      hasError = true;
    }

    if (!selectedGenres.length) {
      setGenreError('Selecione pelo menos um genero.');
      hasError = true;
    } else if (selectedGenres.length > maxGenreSelections) {
      setGenreError(`Selecione no maximo ${maxGenreSelections} generos.`);
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        nome: name.trim(),
        email: email.trim(),
        senha: password,
        confirmarSenha: confirmPassword,
        categorias: selectedGenres,
      };

      const response = await ApiService.register(payload);
      const message = response?.mensagem || 'Conta criada com sucesso.';

      setFeedback({ type: 'success', text: message });
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setSelectedGenres([]);
      setIsModalVisible(false);

      redirectTimeout.current = setTimeout(() => {
        router.replace('/login');
      }, 1200);
    } catch (error: any) {
      const message = error?.message || 'Nao foi possivel criar a conta.';
      setFeedback({ type: 'error', text: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNavigateToLogin = () => {
    if (redirectTimeout.current) {
      clearTimeout(redirectTimeout.current);
      redirectTimeout.current = null;
    }
    router.replace('/login');
  };

  return (
    <Container>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollContent
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Header>
            <Title>Crie sua conta</Title>
            <Subtitle>Personalize suas recomendacoes escolhendo ate quatro generos favoritos</Subtitle>
          </Header>

          <FormCard>
            <Input
              label="Nome"
              placeholder="Seu nome completo"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setNameError('');
                setFeedback(null);
              }}
              error={nameError}
              autoCapitalize="words"
            />

            <Input
              label="Email"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError('');
                setFeedback(null);
              }}
              error={emailError}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <Input
              label="Senha"
              placeholder="••••••••"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError('');
                setFeedback(null);
              }}
              error={passwordError}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
            />

            <Input
              label="Confirmar senha"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setConfirmPasswordError('');
                setFeedback(null);
              }}
              error={confirmPasswordError}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
            />

            <SectionLabel>Generos favoritos</SectionLabel>
            <Button
              onPress={() => setIsModalVisible(true)}
              variant="secondary"
              fullWidth={false}
              style={{ alignSelf: 'flex-start', marginTop: theme.spacing.sm }}
            >
              Selecionar categorias
            </Button>

            {selectedGenres.length ? (
              <SelectedGenresContainer>
                {selectedGenres.map((genre) => (
                  <SelectedGenreChip key={genre}>
                    <SelectedGenreText>{formatLabel(genre)}</SelectedGenreText>
                  </SelectedGenreChip>
                ))}
              </SelectedGenresContainer>
            ) : (
              <GenresSummaryText>Nenhum genero selecionado</GenresSummaryText>
            )}

            {genreError ? <ErrorText>{genreError}</ErrorText> : null}

            {feedback ? <FeedbackText type={feedback.type}>{feedback.text}</FeedbackText> : null}

            <Button onPress={handleSubmit} loading={isSubmitting} disabled={isSubmitting} style={{ marginTop: theme.spacing.lg }}>
              {isSubmitting ? 'Enviando...' : 'Criar conta'}
            </Button>
          </FormCard>

          <Footer>
            <FooterText>Ja possui conta?</FooterText>
            <TouchableOpacity onPress={handleNavigateToLogin} style={{ marginTop: theme.spacing.xs }}>
              <FooterLink>Faca login aqui</FooterLink>
            </TouchableOpacity>
          </Footer>
        </ScrollContent>
      </KeyboardAvoidingView>

      <Modal visible={isModalVisible} transparent animationType="fade">
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>Selecione ate quatro generos</ModalTitle>
            <ModalDescription>Personalize suas recomendacoes escolhendo os generos que mais gosta.</ModalDescription>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 260 }}>
              {isLoadingCategories ? (
                <ActivityIndicator color={theme.colors.primary} style={{ marginTop: theme.spacing.lg }} />
              ) : (
                availableGenres.map((genre) => {
                  const selected = selectedGenres.includes(genre);
                  return (
                    <GenreOption key={genre} selected={selected} onPress={() => handleToggleGenre(genre)}>
                      <GenreOptionText selected={selected}>{formatLabel(genre)}</GenreOptionText>
                    </GenreOption>
                  );
                })
              )}
            </ScrollView>

            <ModalActions>
              <Button
                onPress={handleClearGenres}
                variant="outline"
                fullWidth
                style={{ marginTop: theme.spacing.sm }}
              >
                Limpar seleção
              </Button>
              <Button
                onPress={() => setIsModalVisible(false)}
                variant="secondary"
                fullWidth
                style={{ marginTop: theme.spacing.sm }}
              >
                Concluir
              </Button>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      </Modal>
    </Container>
  );
}
