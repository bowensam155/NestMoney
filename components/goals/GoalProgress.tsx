import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import type { SavingsGoalRow } from '@/types/database';
import { Colors, Typography, Spacing } from '@/constants/theme';

interface GoalProgressProps {
  goal: SavingsGoalRow;
}

export function GoalProgress({ goal }: GoalProgressProps) {
  const { t } = useTranslation();
  const progress = goal.target_amount > 0
    ? (goal.current_amount / goal.target_amount) * 100
    : 0;

  const fmt = (cents: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: goal.currency,
    }).format(cents / 100);

  return (
    <Card>
      <Text style={styles.title}>{goal.title}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${Math.min(progress, 100)}%` as `${number}%` }]} />
      </View>
      <View style={styles.amountsRow}>
        <Text style={styles.current}>{fmt(goal.current_amount)}</Text>
        <Text style={styles.target}>{t('goals.progress', { percent: Math.round(progress) })}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: Typography.sizeH3,
    fontWeight: Typography.weightSemiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  barTrack: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 4,
  },
  amountsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  current: {
    fontSize: Typography.sizeH2,
    fontWeight: Typography.weightBold,
    color: Colors.textPrimary,
  },
  target: {
    fontSize: Typography.sizeBodySmall,
    color: Colors.textSecondary,
  },
});
