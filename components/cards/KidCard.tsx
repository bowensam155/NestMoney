import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Card as CardType } from '@/types/cards';
import { BalanceDisplay } from '@/components/ui/BalanceDisplay';

interface KidCardProps {
  card: CardType;
}

export function KidCard({ card }: KidCardProps) {
  const statusColor = card.status === 'active' ? '#22C55E' : '#94A3B8';

  return (
    <Card>
      <View style={styles.header}>
        <Text style={styles.title}>Kid Card</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{card.status}</Text>
        </View>
      </View>
      {card.daily_limit && (
        <BalanceDisplay amount={card.daily_limit} label="Daily Limit" size="medium" />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1E293B',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
});
