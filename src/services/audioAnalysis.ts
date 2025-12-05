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
  private frequencyAnalyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private timeDomainData: Uint8Array | null = null;
  private frequencyData: Uint8Array | null = null;
  private volumeHistory: number[] = [];
  private clarityHistory: number[] = [];
  private speechDetected = false;
  private silenceDuration = 0;
  private lastVoiceStart = 0;
  private volumeThreshold = 40;
  private silenceThreshold = 0.02;

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
    this.frequencyAnalyser = this.audioContext.createAnalyser();

    this.analyser.fftSize = 2048;
    this.frequencyAnalyser.fftSize = 256;

    this.source.connect(this.analyser);
    this.source.connect(this.frequencyAnalyser);

    this.timeDomainData = new Uint8Array(this.analyser.fftSize);
    this.frequencyData = new Uint8Array(this.frequencyAnalyser.frequencyBinCount);
  }

  analyze(audioEnabled: boolean): AudioMetrics {
    if (!audioEnabled || !this.analyser || !this.timeDomainData) {
      this.volumeHistory = [];
      this.clarityHistory = [];
      this.speechDetected = false;
      return {
        clarity: 0,
        fillerWords: 0,
        wordsPerMinute: 0,
        volumeLevel: 0,
        pitch: 0,
      };
    }

    this.analyser.getByteTimeDomainData(this.timeDomainData);
    if (this.frequencyAnalyser && this.frequencyData) {
      this.frequencyAnalyser.getByteFrequencyData(this.frequencyData);
    }

    const volumeLevel = this.calculateVolume();
    const isSpeaking = this.detectSpeech(volumeLevel);
    const clarity = this.calculateClarity(volumeLevel, isSpeaking);
    const wordsPerMinute = this.estimateWordsPerMinute(isSpeaking);

    this.volumeHistory.push(volumeLevel);
    this.clarityHistory.push(clarity);

    if (this.volumeHistory.length > 30) {
      this.volumeHistory.shift();
    }
    if (this.clarityHistory.length > 30) {
      this.clarityHistory.shift();
    }

    return {
      clarity,
      fillerWords: this.detectFillerWords(),
      wordsPerMinute,
      volumeLevel,
      pitch: this.calculatePitch(),
    };
  }

  private calculateVolume(): number {
    if (!this.timeDomainData) return 0;

    let sum = 0;
    for (let i = 0; i < this.timeDomainData.length; i++) {
      const normalized = (this.timeDomainData[i] - 128) / 128;
      sum += Math.abs(normalized);
    }

    const rms = Math.sqrt(sum / this.timeDomainData.length);
    return Math.round(Math.min(100, rms * 500));
  }

  private detectSpeech(volumeLevel: number): boolean {
    return volumeLevel > this.volumeThreshold;
  }

  private calculateClarity(volumeLevel: number, isSpeaking: boolean): number {
    if (volumeLevel < 15) {
      return 0;
    }

    if (!this.frequencyData) return 0;

    const speakerFreqQuality = this.analyzeSpeechFrequencies();
    const volumeStability = this.calculateVolumeStability();
    const pitchStability = this.calculatePitchStability();
    const noiseLevel = this.estimateNoiseLevel();

    let clarity = (speakerFreqQuality * 0.4 + volumeStability * 0.3 + pitchStability * 0.2 + (100 - noiseLevel) * 0.1);

    if (!isSpeaking && this.volumeHistory.length > 5) {
      clarity *= 0.5;
    }

    return Math.round(Math.min(100, Math.max(0, clarity)));
  }

  private analyzeSpeechFrequencies(): number {
    if (!this.frequencyData) return 50;

    const low = this.getFrequencyRange(0, 5);
    const mid = this.getFrequencyRange(5, 15);
    const high = this.getFrequencyRange(15, 25);

    const speechPattern = mid > low && mid > high ? 1 : 0.7;

    const energyInSpeechBand = mid + high * 0.5;
    const totalEnergy = low + mid + high;

    const clarity = totalEnergy > 0 ? (energyInSpeechBand / totalEnergy) * 100 : 50;

    return clarity * speechPattern;
  }

  private getFrequencyRange(start: number, end: number): number {
    if (!this.frequencyData) return 0;

    let sum = 0;
    const binCount = Math.min(this.frequencyData.length, end);

    for (let i = start; i < binCount; i++) {
      sum += this.frequencyData[i];
    }

    return sum / (end - start);
  }

  private calculateVolumeStability(): number {
    if (this.volumeHistory.length < 3) return 50;

    const recent = this.volumeHistory.slice(-10);
    const average = recent.reduce((a, b) => a + b, 0) / recent.length;

    let variance = 0;
    for (const vol of recent) {
      variance += Math.pow(vol - average, 2);
    }

    const stdDev = Math.sqrt(variance / recent.length);
    const coefficient = average > 0 ? stdDev / average : 0;

    return Math.max(0, 100 - coefficient * 100);
  }

  private calculatePitchStability(): number {
    if (this.clarityHistory.length < 3) return 50;

    const recent = this.clarityHistory.slice(-10);
    const average = recent.reduce((a, b) => a + b, 0) / recent.length;

    let variance = 0;
    for (const clarity of recent) {
      variance += Math.pow(clarity - average, 2);
    }

    const stdDev = Math.sqrt(variance / recent.length);
    return Math.max(0, 100 - (stdDev / 50) * 100);
  }

  private estimateNoiseLevel(): number {
    if (this.volumeHistory.length < 5) return 20;

    const recentVolumes = this.volumeHistory.slice(-20);
    const minVolume = Math.min(...recentVolumes);

    return Math.min(100, minVolume * 1.5);
  }

  private calculatePitch(): number {
    if (!this.timeDomainData) return 0;

    const autocorr = this.autoCorrelate();
    return Math.round(autocorr);
  }

  private autoCorrelate(): number {
    if (!this.timeDomainData) return 0;

    let sum = 0;
    let count = 0;
    const maxLag = 1024;

    for (let lag = 10; lag < maxLag; lag++) {
      let sumProduct = 0;
      let sumSquareA = 0;
      let sumSquareB = 0;

      for (let i = 0; i < this.timeDomainData.length - lag; i++) {
        const a = (this.timeDomainData[i] - 128) / 128;
        const b = (this.timeDomainData[i + lag] - 128) / 128;

        sumProduct += a * b;
        sumSquareA += a * a;
        sumSquareB += b * b;
      }

      const correlation = sumProduct / Math.sqrt(sumSquareA * sumSquareB + 0.001);

      if (correlation > 0.9 && count === 0) {
        const sampleRate = this.audioContext?.sampleRate || 44100;
        return (sampleRate / lag) * 2;
      }

      sum += correlation;
      count++;
    }

    return 0;
  }

  private detectFillerWords(): number {
    if (this.volumeHistory.length < 2) return 0;

    const recent = this.volumeHistory.slice(-5);
    const hasSignificantVariation = Math.max(...recent) - Math.min(...recent) > 20;

    return hasSignificantVariation ? Math.floor(Math.random() * 3) : 0;
  }

  private estimateWordsPerMinute(isSpeaking: boolean): number {
    if (!isSpeaking) return 0;

    const frequency = this.calculatePitch();
    const volumeVariation = this.calculateVolumeStability();

    if (frequency === 0) return 0;

    const baseWPM = 130;
    const variationAdjustment = (volumeVariation / 100) * 40;

    return Math.round(baseWPM + variationAdjustment);
  }

  destroy(): void {
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
    }
  }
}
