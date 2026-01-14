import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated } from 'react-native';
import { CheckCircle2, ChevronLeft } from 'lucide-react-native';

const COLORS = {
  primary: '#5F7161',
  accent: '#C71585',
  text: '#2C3639',
  white: '#FFFFFF',
  secondary: '#E6EAE5'
};

export default function CompletionScreen({ onDone, fileName }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <CheckCircle2 size={100} color={COLORS.primary} />
        </View>

        <Text style={styles.title}>Success!</Text>
        <Text style={styles.subtitle}>
          {fileName ? `"${fileName}" has been transferred and saved to your Downloads folder.` : 'The file transfer was successful.'}
        </Text>

        <TouchableOpacity style={styles.doneButton} onPress={onDone}>
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: '#E6EAE5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 30,
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 100,
    elevation: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.text,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 26,
    marginBottom: 60,
    paddingHorizontal: 20,
  },
  doneButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 18,
    paddingHorizontal: 54,
    borderRadius: 35,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
  }
});
