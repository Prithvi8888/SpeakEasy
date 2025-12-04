import { Mic, Video, Shield, Zap, Target, TrendingUp } from 'lucide-react';

interface HomePageProps {
  onStartPractice: () => void;
}

export default function HomePage({ onStartPractice }: HomePageProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-slate-900 mb-4">
          Master Your Speaking Skills with{' '}
          <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            AI-Powered Analysis
          </span>
        </h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Real-time feedback on confidence, clarity, tone, and emotional delivery.
          Perfect for interviews, presentations, and public speaking.
        </p>
        <button
          onClick={onStartPractice}
          className="mt-8 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Start Practice Session
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
            <Mic className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Voice Analysis</h3>
          <p className="text-slate-600 leading-relaxed">
            Track filler words, speaking pace, tone variations, and clarity in real-time.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mb-4">
            <Video className="w-6 h-6 text-cyan-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Facial Expression</h3>
          <p className="text-slate-600 leading-relaxed">
            Analyze confidence levels and emotional delivery through facial cues.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Privacy First</h3>
          <p className="text-slate-600 leading-relaxed">
            All processing happens in-memory. No data is stored or transmitted.
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-12 border border-blue-100">
        <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">1. Start Recording</h3>
            <p className="text-slate-600">
              Enable your camera and microphone to begin your practice session.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Target className="w-8 h-8 text-cyan-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">2. Get Real-Time Feedback</h3>
            <p className="text-slate-600">
              Receive instant analysis on your speaking patterns and delivery.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">3. Track Progress</h3>
            <p className="text-slate-600">
              View your performance metrics and improve over time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
