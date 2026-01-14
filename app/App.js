import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, StatusBar, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import SignalingService from './src/services/SignalingService';
import WebRTCService from './src/services/WebRTCService';
import FileTransferService from './src/services/FileTransferService';
import { getAutoSignalingUrl } from './src/services/DiscoveryService';
import HomeScreen from './src/screens/HomeScreen';
import PairingScreen from './src/screens/PairingScreen';
import TransferScreen from './src/screens/TransferScreen';
import CompletionScreen from './src/screens/CompletionScreen';

const COLORS = {
  background: '#E6EAE5',
  primary: '#5F7161',
  accent: '#C71585',
  text: '#2C3639',
  white: '#FFFFFF'
};

let SIGNALING_SERVER_URL = 'http://localhost:3000';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [role, setRole] = useState(null);
  const [roomCode, setRoomCode] = useState(null);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const [status, setStatus] = useState('Idle');

  useEffect(() => {
    SignalingService.onPeerJoined = (peerId) => {
      setStatus(`Peer joined: ${peerId.substring(0, 5)}`);
      if (role === 'offerer') {
        WebRTCService.createOffer();
      }
    };

    SignalingService.onOffer = (data) => {
      setStatus('Negotiating...');
      WebRTCService.handleOffer(data.offer);
    };

    SignalingService.onAnswer = (data) => {
      setStatus('Negotiating...');
      WebRTCService.handleAnswer(data.answer);
    };

    SignalingService.onIceCandidate = (data) => {
      WebRTCService.handleIceCandidate(data.candidate);
    };

    WebRTCService.initialize();
    
    WebRTCService.onDataChannelOpen = () => {
      setStatus('Connected! Ready to transfer.');
      setCurrentScreen('transfer');
    };

    WebRTCService.onDataChannelMessage = (data) => {
      FileTransferService.handleIncomingData(data);
    };

    WebRTCService.onConnectionStateChange = (state) => {
      if (state === 'failed') {
        Alert.alert('Connection Failed', 'Failed to establish P2P connection. Check local network.');
        reset();
      }
    };

    FileTransferService.onProgress = (p) => setProgress(p);
    FileTransferService.onComplete = (uri) => {
      setStatus('Transfer Complete');
      setCurrentScreen('completion');
    };
    FileTransferService.onError = (err) => {
      Alert.alert('Transfer Error', err);
      reset();
    };

    return () => {
      SignalingService.disconnect();
      WebRTCService.close();
    };
  }, [role]);

  const startAsSender = async () => {
    const code = Math.random().toString(36).substring(7).toUpperCase();
    setRoomCode(code);
    setRole('offerer');
    const autoUrl = await getAutoSignalingUrl();
    SignalingService.connect(autoUrl, code);
    setCurrentScreen('pairing');
  };

  const startAsReceiver = async (code) => {
    setRoomCode(code);
    setRole('answerer');
    const autoUrl = await getAutoSignalingUrl();
    SignalingService.connect(autoUrl, code);
    setCurrentScreen('pairing');
  };

  const selectFileAndSend = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (!result.canceled && result.assets && result.assets[0]) {
        const file = result.assets[0];
        setFileName(file.name);
        setStatus('Sending...');
        await FileTransferService.sendFile(file.uri, file.name);
      }
    } catch (err) {
      console.error('File selection error:', err);
    }
  };

  const reset = () => {
    SignalingService.disconnect();
    WebRTCService.close();
    FileTransferService.reset();
    setCurrentScreen('home');
    setRole(null);
    setRoomCode(null);
    setProgress(0);
    setStatus('Idle');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {currentScreen === 'home' && (
        <HomeScreen onSend={startAsSender} onReceive={() => setCurrentScreen('join')} />
      )}
      
      {currentScreen === 'join' && (
        <PairingScreen mode="input" onJoin={startAsReceiver} onBack={() => setCurrentScreen('home')} />
      )}

      {currentScreen === 'pairing' && (
        <PairingScreen 
          mode={role === 'offerer' ? 'display' : 'scan'} 
          roomCode={roomCode} 
          status={status}
          onBack={reset} 
        />
      )}

      {currentScreen === 'transfer' && (
        <TransferScreen 
          progress={progress} 
          fileName={fileName} 
          status={status}
          role={role}
          onSelectFile={selectFileAndSend}
          onCancel={reset}
        />
      )}

      {currentScreen === 'completion' && (
        <CompletionScreen onDone={reset} fileName={fileName} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6EAE5',
  },
});
