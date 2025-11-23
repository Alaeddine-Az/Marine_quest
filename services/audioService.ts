
export class AudioPlayer {
  private audioContext: AudioContext | null = null;

  constructor() {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      // The Gemini TTS model output is 24kHz
      this.audioContext = new AudioContextClass({ sampleRate: 24000 });
    }
  }

  async playBuffer(buffer: ArrayBuffer) {
    if (!this.audioContext) return;
    
    // Resume context if suspended (browser autoplay policy)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    try {
      // The Gemini API returns raw PCM 16-bit data, not a WAV/MP3 file.
      // We must manually decode this raw stream.
      const audioBuffer = await this.decodeRawPCM(buffer, 24000);
      
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      source.start(0);
    } catch (e) {
      console.error("Error playing audio:", e);
    }
  }

  /**
   * Decodes raw 16-bit PCM audio data into an AudioBuffer.
   */
  private async decodeRawPCM(arrayBuffer: ArrayBuffer, sampleRate: number): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error("No AudioContext");

    const dataInt16 = new Int16Array(arrayBuffer);
    const numChannels = 1; // Gemini TTS is mono
    const frameCount = dataInt16.length;
    
    const audioBuffer = this.audioContext.createBuffer(numChannels, frameCount, sampleRate);
    
    // Convert Int16 to Float32 (-1.0 to 1.0)
    const channelData = audioBuffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }

    return audioBuffer;
  }
}

export const audioPlayer = new AudioPlayer();
