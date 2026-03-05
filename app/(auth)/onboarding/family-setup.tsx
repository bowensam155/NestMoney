import { View, Text, StyleSheet, TextInput } from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';

export default function FamilySetupScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [familyName, setFamilyName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    setLoading(true);
    try {
      // Create family in database
      // For now, just navigate to next screen
      router.push('/(auth)/onboarding/invite');
    } catch (error) {
      console.error('Family setup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Set Up Your Family</Text>
        <Text style={styles.subtitle}>
          Give your family a name to get started
        </Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Family Name (e.g., The Smiths)"
            value={familyName}
            onChangeText={setFamilyName}
          />
        </View>

        <View style={styles.actions}>
          <Button
            title="Continue"
            onPress={handleContinue}
            loading={loading}
            disabled={!familyName.trim()}
          />
          <Button
            title="Skip for now"
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
    gap: 12,
  },
});
