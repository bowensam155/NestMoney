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
import { signInWithEmail } from '@/lib/auth';
import { useAuthStore } from '@/store/authStore';
import { Colors, Typography, Spacing, Radii, InputDimensions } from '@/constants/theme';

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { setCognitoUser } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    try {
      const { userId } = await signInWithEmail(email, password);
      setCognitoUser({ id: userId, email });
    } catch {
      setError(t('auth.errors.invalidCredentials'));
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
          <Text style={styles.title}>{t('auth.welcome')}</Text>
          <Text style={styles.subtitle}>{t('common.appName')}</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder={t('auth.emailAddress')}
              placeholderTextColor={Colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
            <TextInput
              style={styles.input}
              placeholder={t('auth.password')}
              placeholderTextColor={Colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.actions}>
            <Button title={t('auth.login')} onPress={handleLogin} loading={loading} />
            <Button
              title={t('auth.signup')}
              onPress={() => router.push('/(auth)/signup')}
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
    color: Colors.accent,
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
