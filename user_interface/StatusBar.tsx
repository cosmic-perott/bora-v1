import { Cloud, Droplets, Sun, Moon, Thermometer } from 'lucide-react';

interface StatusBarProps {
  weather: 'clear' | 'fog' | 'rain' | 'night';
  temperature: number;
  processingFps: number;
}

export function StatusBar({ weather, temperature, processingFps }: StatusBarProps) {
  const weatherIcons = {
    clear: Sun,
    fog: Cloud,
    rain: Droplets,
    night: Moon
  };

  const WeatherIcon = weatherIcons[weather];

  return (
    <div className="bg-white rounded-lg px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        {/* Time */}
        <div className="flex items-center gap-2">
          <div className="text-2xl font-semibold">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>

        {/* Weather Condition */}
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
          <WeatherIcon className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium capitalize">{weather}</span>
        </div>

        {/* Temperature */}
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
          <Thermometer className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium">{temperature}°C</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Processing Status */}
        <div className="text-sm text-gray-600">
          Processing: <span className="font-semibold text-blue-600">{processingFps} FPS</span>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-gray-700">System Active</span>
        </div>
      </div>
    </div>
  );
}
