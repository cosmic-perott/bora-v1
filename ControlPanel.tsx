import { Video, VideoOff, Sparkles, Gauge, Camera, FlipVertical } from 'lucide-react';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Button } from './ui/button';

interface ControlPanelProps {
  cameraMode: 'front' | 'back';
  onCameraModeChange: (mode: 'front' | 'back') => void;
  aiEnabled: boolean;
  onAiEnabledChange: (enabled: boolean) => void;
  enhancementLevel: number;
  onEnhancementLevelChange: (level: number) => void;
  visibilityScore: number;
}

export function ControlPanel({
  cameraMode,
  onCameraModeChange,
  aiEnabled,
  onAiEnabledChange,
  enhancementLevel,
  onEnhancementLevelChange,
  visibilityScore
}: ControlPanelProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Camera Toggle */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Camera className="w-4 h-4" />
          Camera View
        </h3>
        <div className="flex gap-2">
          <Button
            variant={cameraMode === 'front' ? 'default' : 'outline'}
            className={`flex-1 ${cameraMode === 'front' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
            onClick={() => onCameraModeChange('front')}
          >
            Front
          </Button>
          <Button
            variant={cameraMode === 'back' ? 'default' : 'outline'}
            className={`flex-1 ${cameraMode === 'back' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
            onClick={() => onCameraModeChange('back')}
          >
            Rear
          </Button>
        </div>
      </div>

      {/* AI Enhancement Toggle */}
      <div className="space-y-3 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Enhancement
          </h3>
          <Switch
            checked={aiEnabled}
            onCheckedChange={onAiEnabledChange}
          />
        </div>
        <p className="text-xs text-gray-500">
          Enhance visibility in fog, rain, and low-light conditions
        </p>
      </div>

      {/* Enhancement Level */}
      {aiEnabled && (
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Gauge className="w-4 h-4" />
              Enhancement Level
            </h3>
            <span className="text-sm font-semibold text-blue-600">
              {Math.round(enhancementLevel * 100)}%
            </span>
          </div>
          <Slider
            value={[enhancementLevel]}
            onValueChange={(value) => onEnhancementLevelChange(value[0])}
            max={1}
            step={0.01}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Subtle</span>
            <span>Maximum</span>
          </div>
        </div>
      )}

      {/* Visibility Score */}
      <div className="space-y-3 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700">Visibility Score</h3>
        <div className="relative">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-300"
              style={{ width: `${visibilityScore}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Poor</span>
            <span>Excellent</span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{visibilityScore}%</div>
          <div className="text-xs text-gray-500">Current Visibility</div>
        </div>
      </div>
    </div>
  );
}