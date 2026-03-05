import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import type { FamilyMember } from '@/types/family';
import { Colors, Typography, Spacing } from '@/constants/theme';

interface MemberRowProps {
  member: FamilyMember;
  onPress?: () => void;
}

export function MemberRow({ member, onPress }: MemberRowProps) {
  const content = (
    <>
      <Avatar
        name={member.display_name ?? undefined}
        imageUrl={member.avatar_url ?? undefined}
        size={40}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{member.display_name ?? '—'}</Text>
        <Text style={styles.role}>{member.role.replace('_', ' ')}</Text>
      </View>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={styles.container} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.container}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: Typography.sizeBody,
    fontWeight: Typography.weightMedium,
    color: Colors.textPrimary,
  },
  role: {
    fontSize: Typography.sizeBodySmall,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
});
