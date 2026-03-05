import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFamily } from '@/hooks/useFamily';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Colors, Typography, Spacing } from '@/constants/theme';

export function FamilyDashboard() {
  const { t } = useTranslation();
  const { members, isLoading } = useFamily();

  if (isLoading) {
    return (
      <Card>
        <Text style={styles.loading}>{t('common.loading')}</Text>
      </Card>
    );
  }

  return (
    <Card>
      <Text style={styles.title}>{t('dashboard.familyOverview')}</Text>
      <View style={styles.membersContainer}>
        {members.map((member) => (
          <View key={member.id} style={styles.memberRow}>
            <Avatar
              name={member.display_name ?? undefined}
              imageUrl={member.avatar_url ?? undefined}
            />
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{member.display_name ?? '—'}</Text>
              <Text style={styles.memberRole}>{member.role.replace('_', ' ')}</Text>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  loading: {
    fontSize: Typography.sizeBody,
    color: Colors.textSecondary,
  },
  title: {
    fontSize: Typography.sizeH3,
    fontWeight: Typography.weightSemiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  membersContainer: {
    gap: Spacing.sm,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: Typography.sizeBody,
    fontWeight: Typography.weightMedium,
    color: Colors.textPrimary,
  },
  memberRole: {
    fontSize: Typography.sizeBodySmall,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
});
