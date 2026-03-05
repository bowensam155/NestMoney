import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Button } from '@/components/ui/Button';

interface ExplainerSheetProps {
  visible: boolean;
  title: string;
  explanation: string;
  onClose: () => void;
}

export function ExplainerSheet({ visible, title, explanation, onClose }: ExplainerSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.explanation}>{explanation}</Text>
          <Text style={styles.disclaimer}>
            This is for educational purposes only, not financial advice.
          </Text>
          <Button title="Got it" onPress={onClose} />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  explanation: {
    fontSize: 15,
    color: '#1E293B',
    lineHeight: 22,
    marginBottom: 16,
  },
  disclaimer: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 24,
  },
});
