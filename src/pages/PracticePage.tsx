import { useState, useRef, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, Play, Square } from 'lucide-react';
import AnalysisPanel from '../components/AnalysisPanel';

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

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);
  const analysisIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    initializeMedia();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
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
    setAnalysisData({
      fillerWords: Math.floor(Math.random() * 5),
      wordsPerMinute: Math.floor(120 + Math.random() * 60),
      confidenceScore: Math.floor(70 + Math.random() * 30),
      clarity: Math.floor(75 + Math.random() * 25),
      emotionalTone: ['Confident', 'Neutral', 'Engaged', 'Energetic'][Math.floor(Math.random() * 4)],
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
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
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
