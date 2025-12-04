export interface FacialMetrics {
  confidence: number;
  emotionalTone: string;
  faceVisible: boolean;
  eyeOpenness: number;
  brightness: number;
}

export class FacialAnalyzer {
  private canvasRef: HTMLCanvasElement | null = null;
  private previousFrameData: ImageData | null = null;
  private faceDetectionHistory: boolean[] = [];
  private volumeHistory: number[] = [];

  async initialize(canvas: HTMLCanvasElement): Promise<void> {
    this.canvasRef = canvas;
  }

  analyze(videoElement: HTMLVideoElement, videoEnabled: boolean): FacialMetrics {
    if (!videoEnabled || !this.canvasRef) {
      return this.getDefaultMetrics();
    }

    const ctx = this.canvasRef.getContext('2d');
    if (!ctx) return this.getDefaultMetrics();

    this.canvasRef.width = videoElement.videoWidth;
    this.canvasRef.height = videoElement.videoHeight;
    ctx.drawImage(videoElement, 0, 0);

    const frameData = ctx.getImageData(0, 0, this.canvasRef.width, this.canvasRef.height);
    const metrics = this.detectFaceAndEmotions(frameData);

    this.faceDetectionHistory.push(metrics.faceVisible);
    if (this.faceDetectionHistory.length > 30) {
      this.faceDetectionHistory.shift();
    }

    this.previousFrameData = frameData;

    return metrics;
  }

  private detectFaceAndEmotions(frameData: ImageData): FacialMetrics {
    const data = frameData.data;
    const width = frameData.width;
    const height = frameData.height;

    const centerRegion = this.analyzeRegion(data, width, height, 0.3, 0.3, 0.7, 0.7);
    const faceDetected = centerRegion.brightness > 60 && centerRegion.variance > 500;

    if (!faceDetected) {
      return this.getDefaultMetrics();
    }

    const brightness = centerRegion.brightness;
    const eyeOpenness = this.detectEyeOpenness(frameData);
    const movementLevel = this.detectMovement(frameData);
    const symmetry = this.detectFacialSymmetry(frameData);

    const confidenceScore = this.calculateConfidence(brightness, eyeOpenness, movementLevel, symmetry);
    const emotionalTone = this.determineEmotionalTone(brightness, eyeOpenness, movementLevel);

    return {
      confidence: confidenceScore,
      emotionalTone,
      faceVisible: true,
      eyeOpenness,
      brightness,
    };
  }

  private analyzeRegion(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ): { brightness: number; variance: number } {
    const startPixel = Math.floor(startY * height) * width + Math.floor(startX * width);
    const endPixel = Math.floor(endY * height) * width + Math.floor(endX * width);

    let sum = 0;
    let count = 0;

    for (let i = startPixel; i < Math.min(endPixel, data.length); i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      sum += brightness;
      count++;
    }

    const average = count > 0 ? sum / count : 0;

    let variance = 0;
    for (let i = startPixel; i < Math.min(endPixel, data.length); i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      variance += Math.pow(brightness - average, 2);
    }

    return {
      brightness: Math.round(average),
      variance: variance / Math.max(1, count),
    };
  }

  private detectEyeOpenness(frameData: ImageData): number {
    const data = frameData.data;
    const width = frameData.width;

    const leftEye = this.analyzeRegion(data, width, frameData.height, 0.25, 0.3, 0.4, 0.45);
    const rightEye = this.analyzeRegion(data, width, frameData.height, 0.6, 0.3, 0.75, 0.45);

    const avgEyeBrightness = (leftEye.brightness + rightEye.brightness) / 2;
    const eyeOpenness = Math.max(0, Math.min(100, (avgEyeBrightness / 150) * 100));

    return Math.round(eyeOpenness);
  }

  private detectMovement(frameData: ImageData): number {
    if (!this.previousFrameData) {
      this.previousFrameData = frameData;
      return 50;
    }

    const currentData = frameData.data;
    const previousData = this.previousFrameData.data;
    let differences = 0;

    for (let i = 0; i < Math.min(currentData.length, 10000); i += 4) {
      const currentBrightness = (currentData[i] + currentData[i + 1] + currentData[i + 2]) / 3;
      const previousBrightness = (previousData[i] + previousData[i + 1] + previousData[i + 2]) / 3;
      if (Math.abs(currentBrightness - previousBrightness) > 15) {
        differences++;
      }
    }

    return Math.round((differences / 2500) * 100);
  }

  private detectFacialSymmetry(frameData: ImageData): number {
    const data = frameData.data;
    const width = frameData.width;
    const height = frameData.height;

    const centerX = Math.floor(width / 2);
    let symmetryScore = 0;
    let sampleCount = 0;

    for (let y = Math.floor(height * 0.2); y < Math.floor(height * 0.7); y += 5) {
      for (let x = 1; x < Math.floor(width * 0.4); x += 5) {
        const leftIdx = (y * width + x) * 4;
        const rightIdx = (y * width + (width - x)) * 4;

        const leftBrightness = (data[leftIdx] + data[leftIdx + 1] + data[leftIdx + 2]) / 3;
        const rightBrightness = (data[rightIdx] + data[rightIdx + 1] + data[rightIdx + 2]) / 3;

        const diff = Math.abs(leftBrightness - rightBrightness);
        symmetryScore += Math.max(0, 100 - diff);
        sampleCount++;
      }
    }

    return sampleCount > 0 ? Math.round(symmetryScore / sampleCount) : 50;
  }

  private calculateConfidence(
    brightness: number,
    eyeOpenness: number,
    movement: number,
    symmetry: number
  ): number {
    const brightnessConfidence = Math.min(100, (brightness / 200) * 100);
    const eyeConfidence = eyeOpenness > 40 ? eyeOpenness : Math.max(20, eyeOpenness * 0.5);
    const movementConfidence = movement > 20 && movement < 60 ? 80 : Math.max(40, 100 - Math.abs(movement - 40));
    const symmetryConfidence = symmetry * 0.8;

    const overall = (brightnessConfidence + eyeConfidence + movementConfidence + symmetryConfidence) / 4;

    return Math.round(Math.max(0, Math.min(100, overall)));
  }

  private determineEmotionalTone(brightness: number, eyeOpenness: number, movement: number): string {
    if (brightness < 60) return 'Nervous';
    if (eyeOpenness < 40) return 'Uncertain';
    if (movement > 60) return 'Energetic';
    if (movement > 30) return 'Engaged';
    if (brightness > 150 && eyeOpenness > 70) return 'Confident';
    return 'Neutral';
  }

  private getDefaultMetrics(): FacialMetrics {
    return {
      confidence: 0,
      emotionalTone: 'Unknown',
      faceVisible: false,
      eyeOpenness: 0,
      brightness: 0,
    };
  }

  destroy(): void {
    this.previousFrameData = null;
    this.faceDetectionHistory = [];
    this.volumeHistory = [];
  }
}
