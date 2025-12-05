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
  private confidenceHistory: number[] = [];
  private headPositionHistory: { x: number; y: number }[] = [];
  private smileHistory: number[] = [];

  async initialize(canvas: HTMLCanvasElement): Promise<void> {
    this.canvasRef = canvas;
  }

  analyze(videoElement: HTMLVideoElement, videoEnabled: boolean): FacialMetrics {
    if (!videoEnabled || !this.canvasRef) {
      this.resetHistory();
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

    if (metrics.faceVisible) {
      this.confidenceHistory.push(metrics.confidence);
      if (this.confidenceHistory.length > 30) {
        this.confidenceHistory.shift();
      }
    }

    this.previousFrameData = frameData;

    return metrics;
  }

  private resetHistory(): void {
    this.faceDetectionHistory = [];
    this.confidenceHistory = [];
    this.headPositionHistory = [];
    this.smileHistory = [];
  }

  private detectFaceAndEmotions(frameData: ImageData): FacialMetrics {
    const data = frameData.data;
    const width = frameData.width;
    const height = frameData.height;

    const centerRegion = this.analyzeRegion(data, width, height, 0.2, 0.15, 0.8, 0.85);
    const hasSignificantFeatures = this.detectFacialFeatures(frameData);

    if (centerRegion.brightness < 40 || !hasSignificantFeatures) {
      return this.getDefaultMetrics();
    }

    const brightness = centerRegion.brightness;
    const symmetry = this.detectFacialSymmetry(frameData);
    const eyeOpenness = this.detectEyeOpenness(frameData);
    const mouthSmile = this.detectMouthSmile(frameData);
    const headPose = this.estimateHeadPose(frameData);
    const faceStability = this.calculateFaceStability();
    const faceCenteredness = this.calculateCenteredness(frameData);

    const confidenceScore = this.calculateConfidence(
      brightness,
      eyeOpenness,
      mouthSmile,
      symmetry,
      headPose,
      faceStability,
      faceCenteredness
    );

    const emotionalTone = this.determineEmotionalTone(brightness, eyeOpenness, mouthSmile, headPose);

    return {
      confidence: confidenceScore,
      emotionalTone,
      faceVisible: true,
      eyeOpenness,
      brightness,
    };
  }

  private detectFacialFeatures(frameData: ImageData): boolean {
    const edges = this.detectEdges(frameData);
    return edges > 100;
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
    const height = frameData.height;

    const leftEyeRegion = this.analyzeRegion(data, width, height, 0.3, 0.35, 0.42, 0.48);
    const rightEyeRegion = this.analyzeRegion(data, width, height, 0.58, 0.35, 0.7, 0.48);

    const leftEyeDarkness = 255 - leftEyeRegion.brightness;
    const rightEyeDarkness = 255 - rightEyeRegion.brightness;
    const avgEyeDarkness = (leftEyeDarkness + rightEyeDarkness) / 2;

    const eyeOpenness = Math.max(0, Math.min(100, (avgEyeDarkness / 150) * 100));

    return Math.round(eyeOpenness);
  }

  private detectMouthSmile(frameData: ImageData): number {
    const data = frameData.data;
    const width = frameData.width;
    const height = frameData.height;

    const mouthRegion = this.analyzeRegion(data, width, height, 0.35, 0.6, 0.65, 0.75);

    const mouthDarkness = 255 - mouthRegion.brightness;
    const smile = Math.max(0, Math.min(100, (mouthDarkness / 100) * 80));

    this.smileHistory.push(smile);
    if (this.smileHistory.length > 20) {
      this.smileHistory.shift();
    }

    return Math.round(smile);
  }

  private estimateHeadPose(frameData: ImageData): { yaw: number; pitch: number } {
    const data = frameData.data;
    const width = frameData.width;
    const height = frameData.height;

    const leftHalf = this.analyzeRegion(data, width, height, 0.1, 0.2, 0.4, 0.8);
    const rightHalf = this.analyzeRegion(data, width, height, 0.6, 0.2, 0.9, 0.8);

    const yawAngle = leftHalf.brightness > rightHalf.brightness ? -15 : rightHalf.brightness > leftHalf.brightness ? 15 : 0;

    const topHalf = this.analyzeRegion(data, width, height, 0.2, 0.1, 0.8, 0.4);
    const bottomHalf = this.analyzeRegion(data, width, height, 0.2, 0.5, 0.8, 0.85);

    const pitchAngle = topHalf.brightness > bottomHalf.brightness ? 15 : bottomHalf.brightness > topHalf.brightness ? -15 : 0;

    return { yaw: yawAngle, pitch: pitchAngle };
  }

  private detectFacialSymmetry(frameData: ImageData): number {
    const data = frameData.data;
    const width = frameData.width;
    const height = frameData.height;

    let symmetryScore = 0;
    let sampleCount = 0;

    for (let y = Math.floor(height * 0.2); y < Math.floor(height * 0.75); y += 4) {
      for (let x = 10; x < Math.floor(width * 0.35); x += 5) {
        const leftIdx = (y * width + x) * 4;
        const rightIdx = (y * width + (width - x)) * 4;

        if (leftIdx >= 0 && rightIdx < data.length) {
          const leftBrightness = (data[leftIdx] + data[leftIdx + 1] + data[leftIdx + 2]) / 3;
          const rightBrightness = (data[rightIdx] + data[rightIdx + 1] + data[rightIdx + 2]) / 3;

          const diff = Math.abs(leftBrightness - rightBrightness);
          symmetryScore += Math.max(0, 100 - diff * 0.5);
          sampleCount++;
        }
      }
    }

    return sampleCount > 0 ? Math.round(symmetryScore / sampleCount) : 50;
  }

  private detectEdges(frameData: ImageData): number {
    const data = frameData.data;
    const width = frameData.width;
    const height = frameData.height;

    let edgeCount = 0;
    const threshold = 30;

    for (let y = 1; y < height - 1; y += 2) {
      for (let x = 1; x < width - 1; x += 2) {
        const idx = (y * width + x) * 4;

        const centerBrightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        const rightBrightness = (data[idx + 4] + data[idx + 5] + data[idx + 6]) / 3;
        const downBrightness = (data[idx + width * 4] + data[idx + width * 4 + 1] + data[idx + width * 4 + 2]) / 3;

        const edgeStrength = Math.abs(centerBrightness - rightBrightness) + Math.abs(centerBrightness - downBrightness);

        if (edgeStrength > threshold) {
          edgeCount++;
        }
      }
    }

    return edgeCount;
  }

  private calculateFaceStability(): number {
    if (this.confidenceHistory.length < 3) return 50;

    const recent = this.confidenceHistory.slice(-15);
    const average = recent.reduce((a, b) => a + b, 0) / recent.length;

    let variance = 0;
    for (const conf of recent) {
      variance += Math.pow(conf - average, 2);
    }

    const stdDev = Math.sqrt(variance / recent.length);
    return Math.max(0, 100 - (stdDev / 30) * 100);
  }

  private calculateCenteredness(frameData: ImageData): number {
    const data = frameData.data;
    const width = frameData.width;
    const height = frameData.height;

    const centerRegion = this.analyzeRegion(data, width, height, 0.25, 0.25, 0.75, 0.75);
    const peripheryAvg =
      (this.analyzeRegion(data, width, height, 0, 0, 0.2, 1).brightness +
        this.analyzeRegion(data, width, height, 0.8, 0, 1, 1).brightness) /
      2;

    const centeredness = centerRegion.brightness > peripheryAvg ? 100 : 50;
    return centeredness;
  }

  private calculateConfidence(
    brightness: number,
    eyeOpenness: number,
    smile: number,
    symmetry: number,
    headPose: { yaw: number; pitch: number },
    stability: number,
    centeredness: number
  ): number {
    const brightnessScore = Math.min(100, (brightness / 200) * 100);
    const eyeScore = Math.min(100, (eyeOpenness / 80) * 100);
    const smileScore = Math.min(100, (smile / 100) * 80);
    const symmetryScore = symmetry * 0.8;

    const headAlignmentScore = 100 - (Math.abs(headPose.yaw) + Math.abs(headPose.pitch)) * 2;
    const stabilityScore = stability;
    const centerednessScore = centeredness;

    const overall =
      brightnessScore * 0.15 +
      eyeScore * 0.25 +
      smileScore * 0.15 +
      symmetryScore * 0.15 +
      headAlignmentScore * 0.15 +
      stabilityScore * 0.1 +
      centerednessScore * 0.05;

    return Math.round(Math.max(0, Math.min(100, overall)));
  }

  private determineEmotionalTone(
    brightness: number,
    eyeOpenness: number,
    smile: number,
    headPose: { yaw: number; pitch: number }
  ): string {
    if (eyeOpenness < 30) return 'Nervous';
    if (brightness < 80) return 'Uncertain';
    if (smile > 50 && eyeOpenness > 60) return 'Confident';
    if (smile > 40) return 'Engaged';
    if (Math.abs(headPose.pitch) > 10 || Math.abs(headPose.yaw) > 10) return 'Distracted';
    if (eyeOpenness > 70 && brightness > 130) return 'Alert';
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
    this.resetHistory();
  }
}
