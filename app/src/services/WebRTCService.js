import { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';
import SignalingService from './SignalingService';

class WebRTCService {
  constructor() {
    this.pc = null;
    this.dataChannel = null;
    this.onDataChannelOpen = null;
    this.onDataChannelMessage = null;
    this.onConnectionStateChange = null;
    this.onIceCandidate = null;
  }

  initialize() {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    this.pc = new RTCPeerConnection(configuration);

    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        SignalingService.sendIceCandidate(event.candidate);
      }
    };

    this.pc.onconnectionstatechange = () => {
      console.log('Connection state change:', this.pc.connectionState);
      if (this.onConnectionStateChange) this.onConnectionStateChange(this.pc.connectionState);
    };

    this.pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state change:', this.pc.iceConnectionState);
    };

    this.pc.ondatachannel = (event) => {
      this.setupDataChannel(event.channel);
    };
  }

  async createOffer() {
    this.dataChannel = this.pc.createDataChannel('fileTransfer', {
      ordered: true
    });
    this.setupDataChannel(this.dataChannel);

    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    SignalingService.sendOffer(offer);
  }

  async handleOffer(offer) {
    await this.pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    SignalingService.sendAnswer(answer);
  }

  async handleAnswer(answer) {
    await this.pc.setRemoteDescription(new RTCSessionDescription(answer));
  }

  async handleIceCandidate(candidate) {
    await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
  }

  setupDataChannel(channel) {
    this.dataChannel = channel;

    this.dataChannel.onopen = () => {
      console.log('Data channel is OPEN');
      if (this.onDataChannelOpen) this.onDataChannelOpen();
    };

    this.dataChannel.onmessage = (event) => {
      if (this.onDataChannelMessage) this.onDataChannelMessage(event.data);
    };

    this.dataChannel.onclose = () => {
      console.log('Data channel is CLOSED');
    };

    this.dataChannel.onerror = (error) => {
      console.error('Data channel error:', error);
    };
  }

  sendData(data) {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(data);
    }
  }

  close() {
    if (this.dataChannel) this.dataChannel.close();
    if (this.pc) this.pc.close();
    this.initialize(); // Reset for next connection
  }
}

export default new WebRTCService();
