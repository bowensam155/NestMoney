import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';

export default function ExplainModal() {
  const router = useRouter();
  const params = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>AI Explainer</Text>
        <Text style={styles.explanation}>
          This modal will show AI-generated explanations for transactions and financial terms.
        </Text>
        <Text style={styles.disclaimer}>
          This is for educational purposes only, not financial advice.
        </Text>
        <Button title="Got it" onPress={() => router.back()} />
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
  explanation: {
    fontSize: 15,
    color: '#1E293B',
    lineHeight: 22,
    marginBottom: 16,
  },
  disclaimer: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 24,
  },
});
