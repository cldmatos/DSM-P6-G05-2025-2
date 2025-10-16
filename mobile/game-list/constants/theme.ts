/**
 * Theme Configuration
 * Mantém a mesma identidade visual do front web
 * Paleta extraída de: front/app/globals.css
 */

export const theme = {
  colors: {
    // Cores principais (extraídas do globals.css)
    background: '#1A1A1A',
    foreground: '#EEEEDD',
    primary: '#05DBF2',
    secondary: '#0788D9',
    muted: '#999999',

    // Cores adicionais
    accent: '#05DBF2',
    border: 'rgba(7, 136, 217, 0.2)',
    cardBackground: 'rgba(7, 136, 217, 0.1)',
    error: '#FF4444',
    success: '#00C853',

    // Transparências
    overlay: 'rgba(0, 0, 0, 0.7)',
    shadowColor: 'rgba(5, 219, 242, 0.3)',

    // Navegação
    tabIconDefault: '#999999',
    tabIconSelected: '#05DBF2',
  },

  fonts: {
    family: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
    },
    size: {
      small: 12,
      medium: 14,
      regular: 16,
      large: 18,
      xlarge: 24,
      xxlarge: 32,
      title: 28,
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },

  shadows: {
    small: {
      shadowColor: '#05DBF2',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#05DBF2',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#05DBF2',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
} as const;

export type Theme = typeof theme;

// Mantendo compatibilidade com código existente
export const Colors = {
  dark: {
    text: theme.colors.foreground,
    background: theme.colors.background,
    tint: theme.colors.primary,
    icon: theme.colors.muted,
    tabIconDefault: theme.colors.tabIconDefault,
    tabIconSelected: theme.colors.tabIconSelected,
  },
};

export const Fonts = {
  sans: 'System',
  mono: 'monospace',
};
