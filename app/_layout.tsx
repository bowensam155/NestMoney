import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SplashScreen } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { checkSession } from '@/lib/auth';
import { loadFonts } from '@/i18n/fonts';
import '@/i18n/config';
import { Colors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { cognitoUser, isLoading, setCognitoUser, setLoading } = useAuthStore();

  useEffect(() => {
    async function prepare() {
      try {
        await loadFonts();
        const session = await checkSession();
        if (session) {
          setCognitoUser({ id: session.userId });
        }
      } catch {
        // Font load or session check failed — continue without session
      } finally {
        setLoading(false);
        await SplashScreen.hideAsync();
      }
    }

    void prepare();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!cognitoUser && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (cognitoUser && inAuthGroup) {
      router.replace('/(tabs)/dashboard');
    }
  }, [cognitoUser, segments, isLoading]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return <Slot />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
