import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { useLanguageStore, LanguageCode } from '@/store/languageStore';
import { Colors, Typography, Spacing, Radii } from '@/constants/theme';

const LANGUAGES: { code: LanguageCode; name: string; native: string }[] = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'tl', name: 'Tagalog', native: 'Tagalog' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt' },
  { code: 'yue', name: 'Cantonese', native: '粵語' },
  { code: 'zh', name: 'Mandarin', native: '中文' },
  { code: 'mn', name: 'Mongolian', native: 'Монгол' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
];

export default function LanguageSelectionScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { language, setLanguage } = useLanguageStore();
  const [selected, setSelected] = useState<LanguageCode>(language);

  const handleContinue = () => {
    setLanguage(selected);
    router.push('/(auth)/onboarding/family-setup');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('auth.chooseLanguage')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.step1Title')}</Text>

        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.option,
                selected === lang.code && styles.optionSelected,
              ]}
              onPress={() => setSelected(lang.code)}
              accessibilityRole="radio"
              accessibilityState={{ selected: selected === lang.code }}
            >
              <Text style={styles.optionName}>{lang.name}</Text>
              <Text style={styles.optionNative}>{lang.native}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Button title={t('common.next')} onPress={handleContinue} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
  },
  title: {
    fontSize: Typography.sizeDisplay,
    fontWeight: Typography.weightBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.sizeBody,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  list: {
    flex: 1,
    marginBottom: Spacing.lg,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    marginBottom: Spacing.sm,
  },
  optionSelected: {
    borderColor: Colors.accent,
    backgroundColor: '#FFF7ED',
  },
  optionName: {
    fontSize: Typography.sizeH3,
    fontWeight: Typography.weightSemiBold,
    color: Colors.textPrimary,
  },
  optionNative: {
    fontSize: Typography.sizeBody,
    color: Colors.textSecondary,
  },
});
