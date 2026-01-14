import io from 'socket.io-client';

class SignalingService {
  constructor() {
    this.socket = null;
    this.roomCode = null;
    this.onPeerJoined = null;
    this.onOffer = null;
    this.onAnswer = null;
    this.onIceCandidate = null;
    this.onPeerLeft = null;
  }

  connect(url, roomCode) {
    this.roomCode = roomCode;
    this.socket = io(url);

    this.socket.on('connect', () => {
      console.log('Connected to signaling server');
      this.socket.emit('join', roomCode);
    });

    this.socket.on('peer-joined', (peerId) => {
      if (this.onPeerJoined) this.onPeerJoined(peerId);
    });

    this.socket.on('offer', ({ from, offer }) => {
      console.log('Received offer from:', from);
      if (this.onOffer) this.onOffer({ from, offer });
    });

    this.socket.on('answer', ({ from, answer }) => {
      console.log('Received answer from:', from);
      if (this.onAnswer) this.onAnswer({ from, answer });
    });

    this.socket.on('ice-candidate', ({ from, candidate }) => {
      console.log('Received ICE candidate from:', from);
      if (this.onIceCandidate) this.onIceCandidate({ from, candidate });
    });

    this.socket.on('peer-left', (peerId) => {
      console.log('Peer left:', peerId);
      if (this.onPeerLeft) this.onPeerLeft(peerId);
    });
  }

  sendOffer(offer) {
    this.socket.emit('offer', { roomCode: this.roomCode, offer });
  }

  sendAnswer(answer) {
    this.socket.emit('answer', { roomCode: this.roomCode, answer });
  }

  sendIceCandidate(candidate) {
    this.socket.emit('ice-candidate', { roomCode: this.roomCode, candidate });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export default new SignalingService();
