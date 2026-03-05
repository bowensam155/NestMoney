import { View, Text, StyleSheet } from 'react-native';
import { UserRole } from '@/types/family';

interface VisibilityBadgeProps {
  visibleTo: UserRole[];
}

export function VisibilityBadge({ visibleTo }: VisibilityBadgeProps) {
  const badgeText = visibleTo.includes('contributor')
    ? 'Visible to family abroad'
    : 'Family only';

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{badgeText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#C7D2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '500',
    color: '#4C1D95',
  },
});
