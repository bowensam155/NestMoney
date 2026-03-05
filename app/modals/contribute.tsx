import { View, Text, StyleSheet, TextInput } from 'react-native';
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';

export default function ContributeModal() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [amount, setAmount] = useState('');

  const handleContribute = () => {
    // Contribution logic
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Contribute to Goal</Text>
        <Text style={styles.subtitle}>Enter the amount you'd like to contribute</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="$0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.actions}>
          <Button title="Cancel" onPress={() => router.back()} variant="secondary" />
          <Button 
            title="Contribute" 
            onPress={handleContribute}
            disabled={!amount}
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
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#94A3B8',
    marginBottom: 32,
  },
  form: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1E293B',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
});
