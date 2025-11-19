import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import styled from '../utils/styled';
import { theme } from '../../constants/theme';
import Button from '../components/atoms/Button';
import Input from '../components/atoms/Input';
import ApiService from '../services/api';
import { ApiError } from '../types';

const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.background};
`;

const Header = styled.View`
  padding: ${theme.spacing.xl}px ${theme.spacing.lg}px;
  align-items: center;
  padding-top: ${theme.spacing.xxl}px;
`;

const WelcomeTitle = styled.Text`
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

const FormContainer = styled.View`
  padding: ${theme.spacing.lg}px;
  background-color: ${theme.colors.cardBackground};
  margin: ${theme.spacing.lg}px;
  border-radius: ${theme.borderRadius.lg}px;
  border-width: 1px;
  border-color: ${theme.colors.border};
`;

const ForgotPasswordContainer = styled.View`
  align-items: flex-end;
  margin-bottom: ${theme.spacing.md}px;
`;

const ForgotPasswordText = styled.Text`
  color: ${theme.colors.primary};
  font-size: ${theme.fonts.size.medium}px;
`;

const Footer = styled.View`
  padding: ${theme.spacing.lg}px;
  align-items: center;
`;

const FormError = styled.Text`
  color: ${theme.colors.error};
  font-size: ${theme.fonts.size.small}px;
  text-align: center;
  margin-bottom: ${theme.spacing.sm}px;
`;

const SignUpContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${theme.spacing.xs}px;
`;

const SignUpText = styled.Text`
  color: ${theme.colors.muted};
  font-size: ${theme.fonts.size.medium}px;
`;

const SignUpLink = styled.Text`
  color: ${theme.colors.primary};
  font-size: ${theme.fonts.size.medium}px;
  font-weight: 600;
`;

const ScrollContent = styled(ScrollView)`
  flex: 1;
`;

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    setEmailError('');
    setPasswordError('');
    setSubmissionError(null);

    let hasError = false;

    if (!email.trim()) {
      setEmailError('Email é obrigatório');
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError('Email inválido');
      hasError = true;
    }

    if (!password.trim()) {
      setPasswordError('Senha é obrigatória');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('Senha deve ter no mínimo 6 caracteres');
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);

    try {
      const response = await ApiService.login(email.trim(), password);
      const message = response?.mensagem ?? 'Login realizado com sucesso!';

      try {
        await ApiService.getProfile();
      } catch (profileError) {
        if (__DEV__) {
          console.warn('Falha ao atualizar perfil apos login:', profileError);
        }
      }

      Alert.alert('Login realizado!', message);
      router.replace('/(tabs)/profile');
    } catch (err) {
      const message =
        typeof (err as ApiError)?.message === 'string'
          ? (err as ApiError).message
          : err instanceof Error
            ? err.message
            : 'Não foi possível realizar login.';

      setSubmissionError(message);
      Alert.alert('Erro ao entrar', message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Recuperar Senha',
      'Funcionalidade em desenvolvimento.\nEm breve você poderá recuperar sua senha.',
      [{ text: 'OK' }]
    );
  };

  const handleSignUp = () => {
    router.push('/cadastro');
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
            <WelcomeTitle>Bem-vindo de volta</WelcomeTitle>
            <Subtitle>Entre para continuar explorando jogos incríveis</Subtitle>
          </Header>

          <FormContainer>
            <Input
              label="Email"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError('');
                setSubmissionError(null);
              }}
              error={emailError}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!loading}
            />

            <Input
              label="Senha"
              placeholder="••••••••"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError('');
                setSubmissionError(null);
              }}
              error={passwordError}
              secureTextEntry={true}
              autoCapitalize="none"
              autoComplete="password"
              editable={!loading}
            />

            <ForgotPasswordContainer>
              <TouchableOpacity onPress={handleForgotPassword} disabled={loading}>
                <ForgotPasswordText>Esqueceu sua senha?</ForgotPasswordText>
              </TouchableOpacity>
            </ForgotPasswordContainer>

            <Button
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>

            {submissionError ? <FormError>{submissionError}</FormError> : null}
          </FormContainer>

          <Footer>
            <SignUpContainer>
              <SignUpText>Não possui conta?</SignUpText>
              <TouchableOpacity onPress={handleSignUp} disabled={loading}>
                <SignUpLink>Crie uma aqui</SignUpLink>
              </TouchableOpacity>
            </SignUpContainer>
          </Footer>
        </ScrollContent>
      </KeyboardAvoidingView>
    </Container>
  );
}
