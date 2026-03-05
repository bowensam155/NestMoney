import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Colors, Typography, Spacing, Radii, InputDimensions } from '@/constants/theme';

export default function SignupScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendCode = async () => {
    if (!phone) return;
    setLoading(true);
    setError(null);
    try {
      // TODO: call initiatePhoneOtp(phone) from lib/auth.ts
      router.push('/(auth)/onboarding/language');
    } catch {
      setError(t('auth.errors.networkError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <Text style={styles.title}>{t('auth.signup')}</Text>
          <Text style={styles.subtitle}>{t('auth.continueWithPhone')}</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder={t('auth.phoneNumber')}
              placeholderTextColor={Colors.textSecondary}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoComplete="tel"
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.actions}>
            <Button title={t('auth.sendCode')} onPress={handleSendCode} loading={loading} />
            <Button
              title={t('auth.login')}
              onPress={() => router.back()}
              variant="ghost"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
  },
  title: {
    fontSize: Typography.sizeDisplay,
    fontWeight: Typography.weightBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.sizeH2,
    fontWeight: Typography.weightSemiBold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  form: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    height: InputDimensions.height,
    paddingHorizontal: InputDimensions.paddingHorizontal,
    fontSize: Typography.sizeBody,
    color: Colors.textPrimary,
  },
  errorText: {
    fontSize: Typography.sizeBodySmall,
    color: Colors.danger,
    marginBottom: Spacing.sm,
  },
  actions: {
    gap: Spacing.sm,
  },
});
