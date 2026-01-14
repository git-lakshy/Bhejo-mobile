import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { FileUp, FileText, XCircle } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#5F7161',
  accent: '#C71585',
  text: '#2C3639',
  white: '#FFFFFF',
  secondary: '#E6EAE5'
};

export default function TransferScreen({ progress, fileName, status, role, onSelectFile, onCancel }) {
  const isSender = role === 'offerer';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <FileText size={80} color={COLORS.primary} />
        </View>

        <Text style={styles.title}>{isSender ? 'Sending File' : 'Receiving File'}</Text>
        <Text style={styles.status}>{status}</Text>

        <View style={styles.transferBox}>
          {fileName ? (
            <View style={styles.fileInfo}>
              <Text style={styles.fileName} numberOfLines={1}>{fileName}</Text>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{Math.round(progress)}% Complete</Text>
            </View>
          ) : (
            <View style={styles.idleState}>
              <Text style={styles.idleText}>
                {isSender ? 'Select a file to start transfer' : 'Waiting for sender to select a file...'}
              </Text>
            </View>
          )}
        </View>

        {isSender && !fileName && (
          <TouchableOpacity style={styles.selectButton} onPress={onSelectFile}>
            <FileUp size={24} color={COLORS.white} />
            <Text style={styles.buttonText}>Choose File</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <XCircle size={20} color={COLORS.accent} />
          <Text style={styles.cancelText}>Cancel Transfer</Text>
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
    marginBottom: 20,
    backgroundColor: COLORS.white,
    padding: 30,
    borderRadius: 100,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 5,
  },
  status: {
    fontSize: 16,
    color: COLORS.text,
    opacity: 0.6,
    marginBottom: 40,
  },
  transferBox: {
    width: '100%',
    backgroundColor: COLORS.white,
    padding: 25,
    borderRadius: 24,
    marginBottom: 40,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  fileInfo: {
    alignItems: 'center',
  },
  fileName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    height: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.accent,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '700',
  },
  idleState: {
    alignItems: 'center',
    padding: 20,
  },
  idleText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    opacity: 0.5,
    fontStyle: 'italic',
  },
  selectButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: 'center',
    gap: 12,
    elevation: 4,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cancelText: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: '600',
  }
});
