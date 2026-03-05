import { Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useGoals } from '@/hooks/useGoals';
import { Colors, Typography, Spacing } from '@/constants/theme';

export default function GoalsScreen() {
  const { t } = useTranslation();
  const { goals, isLoading } = useGoals();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{t('goals.title')}</Text>

        {isLoading ? (
          <Card>
            <Text style={styles.placeholder}>{t('common.loading')}</Text>
          </Card>
        ) : goals.length === 0 ? (
          <>
            <Card>
              <Text style={styles.placeholder}>{t('goals.noGoals')}</Text>
              <Text style={styles.description}>{t('goals.noGoalsDescription')}</Text>
            </Card>
            <Button
              title={t('goals.createGoal')}
              onPress={() => {}}
              variant="secondary"
            />
          </>
        ) : (
          goals.map((goal) => (
            <Card key={goal.id}>
              <Text style={styles.goalTitle}>{goal.title}</Text>
            </Card>
          ))
        )}
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
  goalTitle: {
    fontSize: Typography.sizeH3,
    fontWeight: Typography.weightSemiBold,
    color: Colors.textPrimary,
  },
});
