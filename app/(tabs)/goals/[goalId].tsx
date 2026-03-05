import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { useTranslation } from 'react-i18next';

export default function GoalDetailScreen() {
  const { goalId } = useLocalSearchParams();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Goal Details</Text>
      <Text style={styles.text}>Goal ID: {goalId}</Text>

      <View style={styles.actions}>
        <Button title={t('goals.contribute')} onPress={() => {}} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  text: {
    fontSize: 15,
    color: '#94A3B8',
    marginBottom: 24,
  },
  actions: {
    marginTop: 24,
  },
});
