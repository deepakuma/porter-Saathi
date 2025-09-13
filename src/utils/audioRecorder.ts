export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async startRecording(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000, // Optimal for Whisper
        } 
      });

      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: this.getSupportedMimeType()
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100); // Collect data every 100ms
    } catch (error) {
      throw new Error(`Failed to start recording: ${error}`);
    }
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'));
        return;
      }

      if (this.mediaRecorder.state === 'inactive') {
        reject(new Error('Recording is already stopped'));
        return;
      }

      if (this.mediaRecorder.state === 'paused') {
        reject(new Error('Recording is paused, cannot stop'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { 
          type: this.getSupportedMimeType() 
        });
        this.cleanup();
        resolve(audioBlob);
      };

      this.mediaRecorder.onerror = (event) => {
        this.cleanup();
        reject(new Error(`Recording error: ${event}`));
      };

      try {
        this.mediaRecorder.stop();
      } catch (error) {
        this.cleanup();
        reject(new Error(`Failed to stop recording: ${error}`));
      }
    });
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/wav'
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'audio/webm'; // Fallback
  }
}

export interface TranscriptionResponse {
  text: string;
  confidence: number;
  duration?: number;
  language?: string;
  segments?: number;
  model?: string;
}

export class TranscriptionService {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3001') {
    this.baseUrl = baseUrl;
  }

  async transcribe(audioBlob: Blob): Promise<TranscriptionResponse> {
    console.log('🔄 TranscriptionService: Sending request to', `${this.baseUrl}/transcribe`);
    console.log('📁 Audio blob details:', {
      size: audioBlob.size,
      type: audioBlob.type
    });

    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    try {
      const response = await fetch(`${this.baseUrl}/transcribe`, {
        method: 'POST',
        body: formData,
      });

      console.log('📡 Response status:', response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.error('❌ Server error response:', errorData);
        } catch (parseError) {
          // Don't try to read response.text() after response.json() failed
          console.error('❌ Failed to parse error response as JSON:', parseError);
          errorMessage = `HTTP ${response.status} - ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ Transcription successful:', result);
      return result;
    } catch (error) {
      console.error('❌ TranscriptionService error:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to transcription service. Please ensure the server is running on port 3001.');
      }
      throw error;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}
