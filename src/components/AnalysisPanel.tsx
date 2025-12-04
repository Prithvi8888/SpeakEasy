import { Activity, MessageSquare, Gauge, Volume2, Smile } from 'lucide-react';

interface AnalysisData {
  fillerWords: number;
  wordsPerMinute: number;
  confidenceScore: number;
  clarity: number;
  emotionalTone: string;
}

interface AnalysisPanelProps {
  data: AnalysisData;
  isRecording: boolean;
}

export default function AnalysisPanel({ data, isRecording }: AnalysisPanelProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-orange-100';
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">Real-Time Analysis</h2>
          {isRecording && (
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-blue-600 animate-pulse" />
              <span className="text-sm text-blue-600 font-medium">Analyzing</span>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Gauge className="w-4 h-4 text-blue-600" />
                </div>
                <span className="font-medium text-slate-700">Confidence</span>
              </div>
              <span className={`text-2xl font-bold ${getScoreColor(data.confidenceScore)}`}>
                {data.confidenceScore}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  data.confidenceScore >= 80
                    ? 'bg-green-500'
                    : data.confidenceScore >= 60
                    ? 'bg-yellow-500'
                    : 'bg-orange-500'
                }`}
                style={{ width: `${data.confidenceScore}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <Volume2 className="w-4 h-4 text-cyan-600" />
                </div>
                <span className="font-medium text-slate-700">Clarity</span>
              </div>
              <span className={`text-2xl font-bold ${getScoreColor(data.clarity)}`}>
                {data.clarity}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  data.clarity >= 80
                    ? 'bg-green-500'
                    : data.clarity >= 60
                    ? 'bg-yellow-500'
                    : 'bg-orange-500'
                }`}
                style={{ width: `${data.clarity}%` }}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-slate-600" />
                <span className="text-slate-700">Filler Words</span>
              </div>
              <span className="text-lg font-semibold text-slate-900">{data.fillerWords}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-slate-600" />
                <span className="text-slate-700">Words/Min</span>
              </div>
              <span className="text-lg font-semibold text-slate-900">{data.wordsPerMinute}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Smile className="w-5 h-5 text-slate-600" />
                <span className="text-slate-700">Emotional Tone</span>
              </div>
              <span className="text-lg font-semibold text-slate-900">{data.emotionalTone}</span>
            </div>
          </div>
        </div>
      </div>

      {isRecording && (
        <div className={`rounded-xl p-4 border flex items-start space-x-3 ${
          data.confidenceScore === 0
            ? 'bg-slate-50 border-slate-200'
            : data.confidenceScore >= 80
            ? 'bg-green-50 border-green-200'
            : data.confidenceScore >= 60
            ? 'bg-yellow-50 border-yellow-200'
            : 'bg-orange-50 border-orange-200'
        }`}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
            data.confidenceScore === 0
              ? 'bg-slate-100'
              : getScoreBgColor(data.confidenceScore)
          }`}>
            <Activity className={`w-4 h-4 ${
              data.confidenceScore === 0
                ? 'text-slate-400'
                : getScoreColor(data.confidenceScore)
            }`} />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 text-sm mb-1">Live Feedback</h4>
            <p className="text-sm text-slate-600">
              {data.confidenceScore === 0
                ? 'Enable camera and microphone to start analysis.'
                : data.confidenceScore >= 80
                ? 'Great job! Your delivery is confident and clear.'
                : data.confidenceScore >= 60
                ? 'Good progress. Try to speak with more conviction.'
                : data.clarity === 0
                ? 'Enable microphone to analyze your voice clarity.'
                : 'Focus on maintaining eye contact and speaking clearly.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
