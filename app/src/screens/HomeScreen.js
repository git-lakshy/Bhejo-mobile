import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Send, Download } from 'lucide-react-native';

const COLORS = {
  primary: '#5F7161',
  accent: '#C71585',
  text: '#2C3639',
  white: '#FFFFFF',
  secondary: '#4A5D4E'
};

export default function HomeScreen({ onSend, onReceive }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>LAN Share</Text>
        <Text style={styles.subtitle}>Direct P2P File Transfer</Text>
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity style={[styles.button, styles.sendButton]} onPress={onSend}>
          <Send size={48} color={COLORS.white} />
          <Text style={styles.buttonText}>Send File</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.receiveButton]} onPress={onReceive}>
          <Download size={48} color={COLORS.white} />
          <Text style={styles.buttonText}>Receive File</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Same local network only</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.text,
    opacity: 0.7,
    marginTop: 10,
  },
  buttonGroup: {
    gap: 20,
  },
  button: {
    padding: 30,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
  },
  receiveButton: {
    backgroundColor: COLORS.accent,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.white,
    marginTop: 15,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.text,
    opacity: 0.5,
    fontStyle: 'italic',
  }
});
