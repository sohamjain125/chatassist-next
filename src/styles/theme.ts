export const colors = {
  // Primary Colors
  primary: {
    DEFAULT: 'hsl(201 96% 32%)', // Updated to deep ocean blue
    light: 'hsl(201 96% 42%)',   
    dark: 'hsl(201 96% 22%)',    
    hover: 'hsl(201 96% 42%)',   
    active: 'hsl(201 96% 22%)',  
  },
  
  // Secondary Colors
  secondary: {
    DEFAULT: 'hsl(199 89% 48%)', // Updated to bright sky blue
    light: 'hsl(199 89% 58%)',   
    dark: 'hsl(199 89% 38%)',    
    hover: 'hsl(199 89% 58%)',   
    active: 'hsl(199 89% 38%)',  
  },
  
  // Neutral Colors
  neutral: {
    50: '#F9FAFB',      // Lightest
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',     // Darkest
  },
  
  // Status Colors
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: 'hsl(201 96% 42%)', // Updated to match primary light
  },
  
  // Background Colors
  background: {
    light: '#FFFFFF',
    dark: '#F9FAFB',
    card: '#FFFFFF',
    cardHover: '#F9FAFB',
  },
  
  // Text Colors
  text: {
    primary: '#111827',
    secondary: '#4B5563',
    light: '#6B7280',
    white: '#FFFFFF',
    muted: '#9CA3AF',
  },
  
  // Border Colors
  border: {
    light: '#E5E7EB',
    DEFAULT: '#D1D5DB',
    dark: '#9CA3AF',
  },
};

export const gradients = {
  primary: 'linear-gradient(to right, hsl(201 96% 32%), hsl(201 96% 42%))',
  secondary: 'linear-gradient(to right, hsl(199 89% 48%), hsl(199 89% 58%))',
  header: 'linear-gradient(to right, hsl(201 96% 22%), hsl(201 96% 32%))',
  button: 'linear-gradient(to right, hsl(201 96% 32%), hsl(199 89% 48%))',
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
};

// Common component styles
export const components = {
  card: {
    background: colors.background.card,
    border: `1px solid ${colors.border.light}`,
    borderRadius: '0.5rem',
    padding: '1.5rem',
    hover: {
      background: colors.background.cardHover,
      shadow: shadows.DEFAULT,
    },
  },
  button: {
    primary: {
      background: colors.primary.DEFAULT,
      color: colors.text.white,
      hover: colors.primary.hover,
      active: colors.primary.active,
    },
    secondary: {
      background: colors.secondary.DEFAULT,
      color: colors.text.white,
      hover: colors.secondary.hover,
      active: colors.secondary.active,
    },
    outline: {
      border: `1px solid ${colors.border.DEFAULT}`,
      color: colors.text.primary,
      hover: {
        background: colors.neutral[50],
        border: `1px solid ${colors.border.dark}`,
      },
    },
  },
  input: {
    border: `1px solid ${colors.border.DEFAULT}`,
    borderRadius: '0.375rem',
    focus: {
      border: `1px solid ${colors.primary.DEFAULT}`,
      shadow: `0 0 0 1px ${colors.primary.DEFAULT}`,
    },
  },
};

export const theme = {
  colors,
  gradients,
  shadows,
  components,
};

// Helper functions for common styles
export const getCardStyles = () => ({
  background: components.card.background,
  border: components.card.border,
  borderRadius: components.card.borderRadius,
  padding: components.card.padding,
  '&:hover': {
    background: components.card.hover.background,
    boxShadow: components.card.hover.shadow,
  },
});

export const getButtonStyles = (variant: 'primary' | 'secondary' | 'outline') => {
  const baseStyles = {
    borderRadius: '0.375rem',
    padding: '0.5rem 1rem',
    transition: 'all 0.2s',
  };

  switch (variant) {
    case 'primary':
      return {
        ...baseStyles,
        background: components.button.primary.background,
        color: components.button.primary.color,
        '&:hover': {
          background: components.button.primary.hover,
        },
        '&:active': {
          background: components.button.primary.active,
        },
      };
    case 'secondary':
      return {
        ...baseStyles,
        background: components.button.secondary.background,
        color: components.button.secondary.color,
        '&:hover': {
          background: components.button.secondary.hover,
        },
        '&:active': {
          background: components.button.secondary.active,
        },
      };
    case 'outline':
      return {
        ...baseStyles,
        border: components.button.outline.border,
        color: components.button.outline.color,
        '&:hover': {
          background: components.button.outline.hover.background,
          border: components.button.outline.hover.border,
        },
      };
  }
};
