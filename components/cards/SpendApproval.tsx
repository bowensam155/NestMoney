import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Transaction } from '@/types/cards';
import { BalanceDisplay } from '@/components/ui/BalanceDisplay';

interface SpendApprovalProps {
  transaction: Transaction;
  onApprove: () => void;
  onDeny: () => void;
}

export function SpendApproval({ transaction, onApprove, onDeny }: SpendApprovalProps) {
  return (
    <Card>
      <Text style={styles.title}>Approval Needed</Text>
      <Text style={styles.merchant}>{transaction.merchant_name}</Text>
      <BalanceDisplay amount={Math.abs(transaction.amount)} size="medium" />
      <View style={styles.actions}>
        <Button title="Deny" onPress={onDeny} variant="secondary" />
        <Button title="Approve" onPress={onApprove} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  merchant: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
});
