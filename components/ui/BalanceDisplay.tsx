import { View, Text, StyleSheet } from 'react-native';

interface BalanceDisplayProps {
  amount: number;
  currency?: string;
  label?: string;
  size?: 'small' | 'medium' | 'large';
}

export function BalanceDisplay({ 
  amount, 
  currency = 'USD', 
  label,
  size = 'large',
}: BalanceDisplayProps) {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount / 100);

  const amountSize = size === 'large' ? 32 : size === 'medium' ? 24 : 17;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Text style={[styles.amount, { fontSize: amountSize }]}>{formattedAmount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 4,
  },
  amount: {
    fontWeight: '700',
    color: '#1E293B',
  },
});
