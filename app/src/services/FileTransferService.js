import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import WebRTCService from './WebRTCService';

const CHUNK_SIZE = 64 * 1024; // 64KB

class FileTransferService {
  constructor() {
    this.receivedChunks = [];
    this.totalChunks = 0;
    this.fileName = '';
    this.onProgress = null;
    this.onComplete = null;
    this.onError = null;
    this.isSending = false;
    this.isReceiving = false;
    this.lastFileUri = null;
  }

  async sendFile(fileUri, fileName) {
    try {
      this.isSending = true;
      this.lastFileUri = fileUri;
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      const totalSize = fileInfo.size;
      this.totalChunks = Math.ceil(totalSize / CHUNK_SIZE);
      this.fileName = fileName;

      console.log(`Sending file: ${fileName}, size: ${totalSize}, chunks: ${this.totalChunks}`);

      for (let i = 0; i < this.totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const length = Math.min(CHUNK_SIZE, totalSize - start);
        
        const base64Chunk = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
          position: start,
          length: length
        });
        
        const chunkData = Uint8Array.from(atob(base64Chunk), c => c.charCodeAt(0));
        
        const header = JSON.stringify({
          index: i,
          total: this.totalChunks,
          fileName: this.fileName
        });
        
        const headerBytes = new TextEncoder().encode(header);
        const headerLength = new Uint32Array([headerBytes.length]);
        
        const combined = new Uint8Array(4 + headerBytes.length + chunkData.length);
        combined.set(new Uint8Array(headerLength.buffer), 0);
        combined.set(headerBytes, 4);
        combined.set(chunkData, 4 + headerBytes.length);

        while (WebRTCService.dataChannel.bufferedAmount > 1024 * 1024) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        WebRTCService.sendData(combined.buffer);
        
        if (this.onProgress) {
          this.onProgress((i + 1) / this.totalChunks * 100);
        }
      }

      this.isSending = false;
      console.log('File send complete');
    } catch (error) {
      console.error('Error sending file:', error);
      this.isSending = false;
      if (this.onError) this.onError(error.message);
    }
  }

  async sendSpecificChunks(fileUri, indices) {
    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      for (const i of indices) {
        const start = i * CHUNK_SIZE;
        const length = Math.min(CHUNK_SIZE, fileInfo.size - start);
        const base64Chunk = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
          position: start,
          length: length
        });
        const chunkData = Uint8Array.from(atob(base64Chunk), c => c.charCodeAt(0));
        const header = JSON.stringify({ index: i, total: this.totalChunks, fileName: this.fileName });
        const headerBytes = new TextEncoder().encode(header);
        const combined = new Uint8Array(4 + headerBytes.length + chunkData.length);
        const headerLength = new Uint32Array([headerBytes.length]);
        combined.set(new Uint8Array(headerLength.buffer), 0);
        combined.set(headerBytes, 4);
        combined.set(chunkData, 4 + headerBytes.length);
        WebRTCService.sendData(combined.buffer);
      }
    } catch (error) {
      console.error('Error re-sending chunks:', error);
    }
  }

  handleIncomingData(data) {
    if (typeof data === 'string') {
      try {
        const msg = JSON.parse(data);
        if (msg.type === 're-request' && this.lastFileUri) {
          this.sendSpecificChunks(this.lastFileUri, msg.indices);
        }
        return;
      } catch (e) {}
    }
    try {
      this.isReceiving = true;
      const view = new DataView(data);
      const headerLength = view.getUint32(0, true);
      
      const headerBytes = new Uint8Array(data, 4, headerLength);
      const header = JSON.parse(new TextDecoder().decode(headerBytes));
      
      const chunkData = new Uint8Array(data, 4 + headerLength);
      
      const { index, total, fileName } = header;
      
      if (!this.fileName) {
        this.fileName = fileName;
        this.totalChunks = total;
        this.receivedChunks = new Array(total).fill(null);
      }

      this.receivedChunks[index] = chunkData;
      
      const receivedCount = this.receivedChunks.filter(c => c !== null).length;
      
      if (this.onProgress) {
        this.onProgress(receivedCount / this.totalChunks * 100);
      }

      if (receivedCount === this.totalChunks) {
        this.finalizeFile();
      }
    } catch (error) {
      console.error('Error handling incoming data:', error);
      if (this.onError) this.onError('Corrupted data received');
    }
  }

  async finalizeFile() {
    try {
      console.log('Reassembling file...');
      
      const missingIndices = [];
      for (let i = 0; i < this.totalChunks; i++) {
        if (this.receivedChunks[i] === null) {
          missingIndices.push(i);
        }
      }

      if (missingIndices.length > 0) {
        WebRTCService.sendData(JSON.stringify({ type: 're-request', indices: missingIndices }));
        return;
      }

      const blob = new Blob(this.receivedChunks);
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result.split(',')[1];
        const tempUri = `${FileSystem.cacheDirectory}${this.fileName}`;
        await FileSystem.writeAsStringAsync(tempUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64
        });

        await this.saveToDownloads(tempUri);
      };
      reader.readAsDataURL(blob);

      this.isReceiving = false;
    } catch (error) {
      console.error('Error finalizing file:', error);
      if (this.onError) this.onError(error.message);
    }
  }

  async saveToDownloads(uri) {
    try {
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (permissions.granted) {
        const directoryUri = permissions.directoryUri;
        const base64Data = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64
        });
        
        const destinationUri = await FileSystem.StorageAccessFramework.createFileAsync(
          directoryUri,
          this.fileName,
          'application/octet-stream'
        );
        
        await FileSystem.writeAsStringAsync(destinationUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64
        });
        
        if (this.onComplete) this.onComplete(destinationUri);
      } else {
        await Sharing.shareAsync(uri);
        if (this.onComplete) this.onComplete(uri);
      }
    } catch (error) {
      console.error('Error saving to downloads:', error);
      await Sharing.shareAsync(uri);
    }
  }

  reset() {
    this.receivedChunks = [];
    this.totalChunks = 0;
    this.fileName = '';
    this.isSending = false;
    this.isReceiving = false;
  }
}

export default new FileTransferService();
