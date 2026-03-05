import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
}

export function Button({ 
  title, 
  onPress, 
  variant = 'primary',
  disabled = false,
  loading = false,
}: ButtonProps) {
  const buttonStyles = [
    styles.button,
    variant === 'secondary' && styles.buttonSecondary,
    variant === 'destructive' && styles.buttonDestructive,
    variant === 'ghost' && styles.buttonGhost,
    disabled && styles.buttonDisabled,
  ];

  const textStyles = [
    styles.text,
    variant === 'secondary' && styles.textSecondary,
    variant === 'destructive' && styles.textDestructive,
    variant === 'ghost' && styles.textGhost,
  ];

  return (
    <TouchableOpacity 
      style={buttonStyles} 
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : '#F97316'} />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#F97316',
    borderRadius: 100,
    height: 52,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  buttonDestructive: {
    backgroundColor: '#FEF2F2',
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  textSecondary: {
    color: '#1E293B',
  },
  textDestructive: {
    color: '#EF4444',
  },
  textGhost: {
    color: '#F97316',
  },
});
