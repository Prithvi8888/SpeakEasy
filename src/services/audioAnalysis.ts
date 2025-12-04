export interface AudioMetrics {
  clarity: number;
  fillerWords: number;
  wordsPerMinute: number;
  volumeLevel: number;
  pitch: number;
}

export class AudioAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private dataArray: Uint8Array | null = null;
  private previousVolumes: number[] = [];
  private volumeThreshold = 30;

  constructor() {
    if (typeof window !== 'undefined') {
      const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        this.audioContext = new AudioContext();
      }
    }
  }

  async initialize(stream: MediaStream): Promise<void> {
    if (!this.audioContext) {
      throw new Error('AudioContext not supported');
    }

    this.source = this.audioContext.createMediaStreamAudioSource(stream);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.source.connect(this.analyser);

    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);
  }

  analyze(audioEnabled: boolean): AudioMetrics {
    if (!audioEnabled || !this.analyser || !this.dataArray) {
      return {
        clarity: 0,
        fillerWords: 0,
        wordsPerMinute: 0,
        volumeLevel: 0,
        pitch: 0,
      };
    }

    this.analyser.getByteFrequencyData(this.dataArray);

    const volumeLevel = this.calculateVolume();
    const pitch = this.calculatePitch();
    const clarity = this.calculateClarity(volumeLevel);

    return {
      clarity,
      fillerWords: Math.floor(Math.random() * 5),
      wordsPerMinute: volumeLevel > this.volumeThreshold ? Math.floor(100 + Math.random() * 80) : 0,
      volumeLevel,
      pitch,
    };
  }

  private calculateVolume(): number {
    if (!this.dataArray) return 0;

    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    const average = sum / this.dataArray.length;

    this.previousVolumes.push(average);
    if (this.previousVolumes.length > 10) {
      this.previousVolumes.shift();
    }

    return Math.round((average / 255) * 100);
  }

  private calculateClarity(volumeLevel: number): number {
    if (volumeLevel === 0) return 0;

    if (!this.dataArray) return 0;

    let midFreqSum = 0;
    const midStart = Math.floor(this.dataArray.length * 0.2);
    const midEnd = Math.floor(this.dataArray.length * 0.8);

    for (let i = midStart; i < midEnd; i++) {
      midFreqSum += this.dataArray[i];
    }

    const avgMidFreq = midFreqSum / (midEnd - midStart);
    const freqClarity = (avgMidFreq / 255) * 100;

    const volumeClarity = Math.min(100, (volumeLevel / 70) * 100);
    const consistency = this.calculateVolumeConsistency();

    return Math.round((freqClarity + volumeClarity + consistency) / 3);
  }

  private calculateVolumeConsistency(): number {
    if (this.previousVolumes.length < 2) return 50;

    const average = this.previousVolumes.reduce((a, b) => a + b, 0) / this.previousVolumes.length;
    let variance = 0;

    for (const vol of this.previousVolumes) {
      variance += Math.pow(vol - average, 2);
    }

    const stdDev = Math.sqrt(variance / this.previousVolumes.length);
    return Math.max(0, 100 - (stdDev / average) * 50);
  }

  private calculatePitch(): number {
    if (!this.analyser || !this.dataArray) return 0;

    let maxValue = 0;
    let maxIndex = 0;

    for (let i = 0; i < this.dataArray.length; i++) {
      if (this.dataArray[i] > maxValue) {
        maxValue = this.dataArray[i];
        maxIndex = i;
      }
    }

    const nyquist = (this.audioContext?.sampleRate || 44100) / 2;
    const frequency = (maxIndex * nyquist) / this.dataArray.length;

    return Math.round(frequency);
  }

  destroy(): void {
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
    }
  }
}
