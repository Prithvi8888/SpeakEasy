import { TrendingUp, Award, Target, Calendar } from 'lucide-react';

export default function AnalyticsPage() {
  const stats = [
    { label: 'Total Sessions', value: '0', icon: Calendar, color: 'blue' },
    { label: 'Avg Confidence', value: '0%', icon: TrendingUp, color: 'green' },
    { label: 'Avg Clarity', value: '0%', icon: Target, color: 'cyan' },
    { label: 'Best Score', value: '0%', icon: Award, color: 'yellow' },
  ];

  const getIconBgColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-100',
      green: 'bg-green-100',
      cyan: 'bg-cyan-100',
      yellow: 'bg-yellow-100',
    };
    return colors[color] || 'bg-slate-100';
  };

  const getIconColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      cyan: 'text-cyan-600',
      yellow: 'text-yellow-600',
    };
    return colors[color] || 'text-slate-600';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Performance Analytics</h1>
        <p className="text-slate-600">Track your progress and speaking improvements over time</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getIconBgColor(stat.color)}`}>
                  <Icon className={`w-6 h-6 ${getIconColor(stat.color)}`} />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
              <div className="text-sm text-slate-600">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Recent Sessions</h2>
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No sessions yet</h3>
          <p className="text-slate-600 mb-6">
            Start a practice session to see your performance data here
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Speaking Metrics</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">Filler Words Reduction</span>
                <span className="font-medium text-slate-900">0%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '0%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">Pace Consistency</span>
                <span className="font-medium text-slate-900">0%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '0%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">Tone Variation</span>
                <span className="font-medium text-slate-900">0%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '0%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Key Insights</h2>
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <h4 className="font-semibold text-slate-900 mb-1">Start Practicing</h4>
              <p className="text-sm text-slate-600">
                Complete your first session to unlock personalized insights
              </p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <h4 className="font-semibold text-slate-900 mb-1">Track Progress</h4>
              <p className="text-sm text-slate-600">
                Regular practice helps identify patterns and areas for improvement
              </p>
            </div>
            <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-100">
              <h4 className="font-semibold text-slate-900 mb-1">Build Confidence</h4>
              <p className="text-sm text-slate-600">
                Watch your scores improve as you master speaking techniques
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
