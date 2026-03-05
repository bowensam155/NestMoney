import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';

export default function InviteScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Invite Family Members</Text>
        <Text style={styles.subtitle}>
          You can invite family members to join your financial hub
        </Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Parents, children, and family abroad can all be part of your NestMoney family.
            Each member will have their own access level and view of finances.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            title="Invite Family"
            onPress={() => {}}
            variant="secondary"
          />
          <Button
            title="Skip - I'll do this later"
            onPress={() => router.replace('/(tabs)/dashboard')}
            variant="ghost"
          />
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
    padding: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#94A3B8',
    marginBottom: 32,
  },
  infoCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  infoText: {
    fontSize: 15,
    color: '#1E293B',
    lineHeight: 22,
  },
  actions: {
    gap: 12,
  },
});
