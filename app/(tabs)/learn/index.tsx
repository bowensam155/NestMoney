import { Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Colors, Typography, Spacing } from '@/constants/theme';

export default function LearnScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{t('learn.education')}</Text>

        <Card>
          <Text style={styles.placeholder}>{t('learn.noVideos')}</Text>
          <Text style={styles.description}>{t('learn.noVideosDescription')}</Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.sizeH1,
    fontWeight: Typography.weightBold,
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  placeholder: {
    fontSize: Typography.sizeBody,
    color: Colors.textPrimary,
    textAlign: 'center',
    paddingTop: Spacing.lg,
  },
  description: {
    fontSize: Typography.sizeBodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingBottom: Spacing.lg,
    marginTop: Spacing.sm,
  },
});
