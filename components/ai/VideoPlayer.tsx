import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  duration?: number;
}

export function VideoPlayer({ videoUrl, title, duration }: VideoPlayerProps) {
  return (
    <Card>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Video Player</Text>
        <Text style={styles.title}>{title}</Text>
        {duration && <Text style={styles.duration}>{duration}s</Text>}
      </View>
      <Text style={styles.note}>
        Video player will be implemented with expo-av or similar
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 15,
    color: '#94A3B8',
    marginBottom: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
  duration: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },
  note: {
    fontSize: 13,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
});
