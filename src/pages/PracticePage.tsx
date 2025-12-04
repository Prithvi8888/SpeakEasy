import { useState, useRef, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, Play, Square, AlertCircle } from 'lucide-react';
import AnalysisPanel from '../components/AnalysisPanel';
import { AudioAnalyzer } from '../services/audioAnalysis';
import { FacialAnalyzer } from '../services/faceAnalysis';

type RecordingState = 'idle' | 'recording' | 'paused';

export default function PracticePage() {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [analysisData, setAnalysisData] = useState({
    fillerWords: 0,
    wordsPerMinute: 0,
    confidenceScore: 0,
    clarity: 0,
    emotionalTone: 'Neutral' as string,
  });
  const [faceDetected, setFaceDetected] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);
  const analysisIntervalRef = useRef<number | null>(null);
  const audioAnalyzerRef = useRef<AudioAnalyzer | null>(null);
  const facialAnalyzerRef = useRef<FacialAnalyzer | null>(null);

  useEffect(() => {
    initializeMedia();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
      audioAnalyzerRef.current?.destroy();
      facialAnalyzerRef.current?.destroy();
    };
  }, []);

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      audioAnalyzerRef.current = new AudioAnalyzer();
      await audioAnalyzerRef.current.initialize(stream);

      if (canvasRef.current) {
        facialAnalyzerRef.current = new FacialAnalyzer();
        await facialAnalyzerRef.current.initialize(canvasRef.current);
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const toggleRecording = () => {
    if (recordingState === 'idle') {
      startRecording();
    } else {
      stopRecording();
    }
  };

  const startRecording = () => {
    setRecordingState('recording');
    setElapsedTime(0);

    intervalRef.current = window.setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    analysisIntervalRef.current = window.setInterval(() => {
      updateAnalysis();
    }, 2000);
  };

  const stopRecording = () => {
    setRecordingState('idle');
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
  };

  const updateAnalysis = () => {
    let audioMetrics = {
      clarity: 0,
      fillerWords: 0,
      wordsPerMinute: 0,
    };

    let facialMetrics = {
      confidenceScore: 0,
      emotionalTone: 'Neutral',
      faceVisible: false,
    };

    if (audioAnalyzerRef.current) {
      const audio = audioAnalyzerRef.current.analyze(audioEnabled);
      audioMetrics = {
        clarity: audio.clarity,
        fillerWords: audio.fillerWords,
        wordsPerMinute: audio.wordsPerMinute,
      };
    }

    if (facialAnalyzerRef.current && videoRef.current) {
      const facial = facialAnalyzerRef.current.analyze(videoRef.current, videoEnabled);
      facialMetrics = {
        confidenceScore: facial.confidence,
        emotionalTone: facial.emotionalTone,
        faceVisible: facial.faceVisible,
      };
      setFaceDetected(facial.faceVisible);
    }

    setAnalysisData({
      fillerWords: audioMetrics.fillerWords,
      wordsPerMinute: audioMetrics.wordsPerMinute,
      confidenceScore: facialMetrics.confidenceScore,
      clarity: audioMetrics.clarity,
      emotionalTone: facialMetrics.emotionalTone,
    });
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoEnabled;
        setVideoEnabled(!videoEnabled);
      }
    }
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioEnabled;
        setAudioEnabled(!audioEnabled);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <canvas ref={canvasRef} className="hidden" />
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {recordingState === 'recording' && !videoEnabled && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-900 text-sm">Camera Disabled</h3>
                <p className="text-orange-800 text-sm">Confidence and facial analysis require camera to be enabled.</p>
              </div>
            </div>
          )}

          {recordingState === 'recording' && !audioEnabled && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-900 text-sm">Microphone Disabled</h3>
                <p className="text-orange-800 text-sm">Clarity and audio analysis require microphone to be enabled.</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="relative bg-slate-900 aspect-video">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              {!videoEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                  <VideoOff className="w-16 h-16 text-slate-400" />
                </div>
              )}
              {recordingState === 'recording' && (
                <div className="absolute top-4 right-4 flex items-center space-x-2 bg-red-500 text-white px-3 py-1.5 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-sm font-medium">REC {formatTime(elapsedTime)}</span>
                </div>
              )}
            </div>

            <div className="p-6 bg-white">
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={toggleVideo}
                  className={`p-4 rounded-xl transition-all ${
                    videoEnabled
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-red-100 text-red-600 hover:bg-red-200'
                  }`}
                >
                  {videoEnabled ? (
                    <Video className="w-6 h-6" />
                  ) : (
                    <VideoOff className="w-6 h-6" />
                  )}
                </button>

                <button
                  onClick={toggleAudio}
                  className={`p-4 rounded-xl transition-all ${
                    audioEnabled
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-red-100 text-red-600 hover:bg-red-200'
                  }`}
                >
                  {audioEnabled ? (
                    <Mic className="w-6 h-6" />
                  ) : (
                    <MicOff className="w-6 h-6" />
                  )}
                </button>

                <button
                  onClick={toggleRecording}
                  className={`p-6 rounded-xl font-semibold transition-all shadow-md ${
                    recordingState === 'recording'
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700'
                  }`}
                >
                  {recordingState === 'recording' ? (
                    <Square className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
            <h3 className="font-semibold text-slate-900 mb-3">Practice Tips</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Maintain eye contact with the camera</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Speak clearly and at a moderate pace</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Avoid filler words like "um", "uh", "like"</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Use natural gestures to emphasize points</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-1">
          <AnalysisPanel
            data={analysisData}
            isRecording={recordingState === 'recording'}
          />
        </div>
      </div>
    </div>
  );
}
