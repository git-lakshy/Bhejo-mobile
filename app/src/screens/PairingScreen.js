import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Share } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { ChevronLeft, ArrowRight, Share2 } from 'lucide-react-native';

const COLORS = {
  primary: '#5F7161',
  accent: '#C71585',
  text: '#2C3639',
  white: '#FFFFFF',
  secondary: '#E6EAE5'
};

export default function PairingScreen({ mode, roomCode, status, onJoin, onBack }) {
  const [inputCode, setInputCode] = useState('');

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my LAN Share room: ${roomCode}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <ChevronLeft size={32} color={COLORS.primary} />
      </TouchableOpacity>

      <View style={styles.content}>
        {mode === 'display' && (
          <View style={styles.pairingContainer}>
            <Text style={styles.title}>Scan to Pair</Text>
            <View style={styles.qrContainer}>
              <QRCode value={roomCode} size={250} color={COLORS.primary} backgroundColor={COLORS.white} />
            </View>
            <Text style={styles.codeText}>Room Code: <Text style={styles.bold}>{roomCode}</Text></Text>
            
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Share2 size={20} color={COLORS.white} />
              <Text style={styles.buttonText}>Share Code</Text>
            </TouchableOpacity>

            <View style={styles.statusContainer}>
              <Text style={styles.statusTitle}>Status:</Text>
              <Text style={styles.statusValue}>{status}</Text>
            </View>
          </View>
        )}

        {mode === 'input' && (
          <View style={styles.inputContainer}>
            <Text style={styles.title}>Enter Room Code</Text>
            <Text style={styles.subtitle}>Ask the sender for their code</Text>
            
            <TextInput
              style={styles.input}
              placeholder="e.g. ABCXYZ"
              value={inputCode}
              onChangeText={text => setInputCode(text.toUpperCase())}
              autoCapitalize="characters"
              placeholderTextColor="#999"
            />

            <TouchableOpacity 
              style={[styles.joinButton, !inputCode && styles.disabledButton]} 
              onPress={() => onJoin(inputCode)}
              disabled={!inputCode}
            >
              <Text style={styles.buttonText}>Connect</Text>
              <ArrowRight size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        )}

        {mode === 'scan' && (
          <View style={styles.pairingContainer}>
            <Text style={styles.title}>Connecting...</Text>
            <View style={styles.loaderContainer}>
              <Text style={styles.statusValue}>{status}</Text>
            </View>
            <TouchableOpacity style={styles.cancelButton} onPress={onBack}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#E6EAE5',
  },
  backButton: {
    padding: 10,
    marginTop: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text,
    opacity: 0.6,
    marginBottom: 40,
    textAlign: 'center',
  },
  pairingContainer: {
    alignItems: 'center',
    width: '100%',
  },
  qrContainer: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    marginBottom: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  codeText: {
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 40,
  },
  bold: {
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  shareButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
    gap: 10,
    marginBottom: 30,
  },
  statusContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 14,
    color: COLORS.text,
    opacity: 0.5,
  },
  statusValue: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 5,
  },
  inputContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  input: {
    backgroundColor: COLORS.white,
    height: 60,
    borderRadius: 16,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
    color: COLORS.primary,
  },
  joinButton: {
    backgroundColor: COLORS.accent,
    height: 60,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  cancelButton: {
    marginTop: 40,
  },
  cancelText: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: '600',
  }
});
