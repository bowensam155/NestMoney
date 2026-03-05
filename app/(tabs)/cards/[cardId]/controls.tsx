import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';

export default function CardControlsScreen() {
  const { cardId } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Card Controls</Text>
      <Text style={styles.text}>Card ID: {cardId}</Text>

      <View style={styles.controls}>
        <Button title="Freeze Card" onPress={() => {}} variant="secondary" />
        <Button title="Set Limits" onPress={() => {}} variant="secondary" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  text: {
    fontSize: 15,
    color: '#94A3B8',
    marginBottom: 24,
  },
  controls: {
    gap: 12,
  },
});
