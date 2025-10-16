import React from 'react';
import styled from '../../utils/styled';
import { theme } from '../../../constants/theme';
import { TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

const Container = styled.View`
  width: 100%;
  margin-bottom: ${theme.spacing.md}px;
`;

const Label = styled.Text`
  color: ${theme.colors.foreground};
  font-size: ${theme.fonts.size.medium}px;
  margin-bottom: ${theme.spacing.xs}px;
  font-weight: 500;
`;

const StyledTextInput = styled.TextInput<{ hasError?: boolean }>`
  background-color: ${theme.colors.cardBackground};
  color: ${theme.colors.foreground};
  padding: ${theme.spacing.md}px;
  border-radius: ${theme.borderRadius.md}px;
  font-size: ${theme.fonts.size.regular}px;
  border-width: 1px;
  border-color: ${(props: { hasError?: boolean }) => props.hasError ? theme.colors.error : theme.colors.border};
`;

const ErrorText = styled.Text`
  color: ${theme.colors.error};
  font-size: ${theme.fonts.size.small}px;
  margin-top: ${theme.spacing.xs}px;
`;

const Input = React.forwardRef<any, InputProps>(({ label, error, ...props }, _ref) => {
  return (
    <Container>
      {label && <Label>{label}</Label>}
      <StyledTextInput
        hasError={!!error}
        placeholderTextColor={theme.colors.muted}
        {...props}
      />
      {error && <ErrorText>{error}</ErrorText>}
    </Container>
  );
});

Input.displayName = 'Input';

export default Input;
