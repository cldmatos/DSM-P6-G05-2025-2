import React from 'react';
import styled from '../../utils/styled';
import { theme } from '../../../constants/theme';
import { TouchableOpacityProps, ActivityIndicator } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  fullWidth?: boolean;
}

const StyledButton = styled.TouchableOpacity<{
  variant: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
  disabled?: boolean;
}>`
  background-color: ${props => {
    if (props.disabled) return theme.colors.muted;
    switch (props.variant) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      case 'outline':
        return 'transparent';
      default:
        return theme.colors.primary;
    }
  }};
  padding: ${theme.spacing.md}px ${theme.spacing.lg}px;
  border-radius: ${theme.borderRadius.md}px;
  align-items: center;
  justify-content: center;
  border-width: ${props => props.variant === 'outline' ? '1px' : '0px'};
  border-color: ${theme.colors.primary};
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  min-height: 48px;
`;

const ButtonText = styled.Text<{
  variant: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
}>`
  color: ${props => {
    if (props.disabled) return theme.colors.background;
    return props.variant === 'outline' ? theme.colors.primary : theme.colors.background;
  }};
  font-size: ${theme.fonts.size.regular}px;
  font-weight: 600;
`;

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  loading = false,
  fullWidth = true,
  disabled,
  ...props
}) => {
  return (
    <StyledButton
      variant={variant}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? theme.colors.primary : theme.colors.background}
        />
      ) : (
        <ButtonText variant={variant} disabled={disabled}>
          {children}
        </ButtonText>
      )}
    </StyledButton>
  );
};

export default Button;
