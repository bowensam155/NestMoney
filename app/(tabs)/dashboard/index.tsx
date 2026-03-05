import { Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore, selectDisplayName } from '@/store/authStore';
import { BalanceDisplay } from '@/components/ui/BalanceDisplay';
import { Card } from '@/components/ui/Card';
import { Colors, Typography, Spacing } from '@/constants/theme';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const displayName = useAuthStore(selectDisplayName);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.greeting}>
          {t('dashboard.greeting', { name: displayName })}
        </Text>

        <Card>
          <BalanceDisplay amount={0} label={t('dashboard.balance')} size="large" />
        </Card>

        <Text style={styles.sectionTitle}>{t('dashboard.recentActivity')}</Text>
        <Card>
          <Text style={styles.placeholder}>{t('dashboard.noActivity')}</Text>
        </Card>

        <Text style={styles.sectionTitle}>{t('dashboard.familyOverview')}</Text>
        <Card>
          <Text style={styles.placeholder}>{t('common.loading')}</Text>
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
  greeting: {
    fontSize: Typography.sizeH1,
    fontWeight: Typography.weightBold,
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sizeH3,
    fontWeight: Typography.weightSemiBold,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  placeholder: {
    fontSize: Typography.sizeBody,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
});
