import { useState } from 'react';
import { Mic, Video, Home, BarChart3 } from 'lucide-react';
import HomePage from './pages/HomePage';
import PracticePage from './pages/PracticePage';
import AnalyticsPage from './pages/AnalyticsPage';

type Page = 'home' | 'practice' | 'analytics';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                SpeakEasy
              </span>
            </div>

            <div className="flex space-x-1">
              <button
                onClick={() => setCurrentPage('home')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === 'home'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Home className="w-5 h-5 inline mr-2" />
                Home
              </button>
              <button
                onClick={() => setCurrentPage('practice')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === 'practice'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Video className="w-5 h-5 inline mr-2" />
                Practice
              </button>
              <button
                onClick={() => setCurrentPage('analytics')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === 'analytics'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <BarChart3 className="w-5 h-5 inline mr-2" />
                Analytics
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {currentPage === 'home' && <HomePage onStartPractice={() => setCurrentPage('practice')} />}
        {currentPage === 'practice' && <PracticePage />}
        {currentPage === 'analytics' && <AnalyticsPage />}
      </main>
    </div>
  );
}

export default App;
