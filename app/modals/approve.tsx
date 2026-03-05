import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { BalanceDisplay } from '@/components/ui/BalanceDisplay';

export default function ApproveModal() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const handleApprove = () => {
    // Approve transaction logic
    router.back();
  };

  const handleDeny = () => {
    // Deny transaction logic
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Approval Needed</Text>
        <Text style={styles.merchant}>Transaction Details</Text>
        <BalanceDisplay amount={0} size="large" />

        <View style={styles.actions}>
          <Button title="Deny" onPress={handleDeny} variant="secondary" />
          <Button title="Approve" onPress={handleApprove} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  merchant: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
});
