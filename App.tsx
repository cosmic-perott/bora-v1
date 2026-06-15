import { useState, useEffect } from 'react';
import { CameraView } from './components/CameraView';
import { ControlPanel } from './components/ControlPanel';
import { StatusBar } from './components/StatusBar';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './components/ui/sheet';
import { Cloud, Eye } from 'lucide-react';

export default function App() {
  const [cameraMode, setCameraMode] = useState<'front' | 'back'>('front');
  const [aiEnabled, setAiEnabled] = useState(true);
  const [enhancementLevel, setEnhancementLevel] = useState(0.7);
  const [visibilityScore, setVisibilityScore] = useState(45);
  const [processingFps, setProcessingFps] = useState(30);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [carStatus, setCarStatus] = useState<'accelerating' | 'decelerating' | 'halt'>('accelerating');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Simulate visibility improvement when AI is enabled
  useEffect(() => {
    if (aiEnabled) {
      const baseScore = 45;
      const improvement = enhancementLevel * 40;
      setVisibilityScore(Math.min(95, Math.round(baseScore + improvement)));
      setProcessingFps(30);
    } else {
      setVisibilityScore(45);
      setProcessingFps(60);
    }
  }, [aiEnabled, enhancementLevel]);

  // Simulate car status changes
  useEffect(() => {
    const statuses: ('accelerating' | 'decelerating' | 'halt')[] = ['accelerating', 'decelerating', 'halt'];
    const interval = setInterval(() => {
      setCarStatus(statuses[Math.floor(Math.random() * statuses.length)]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="size-full p-6 flex flex-col bg-[#ffffff]">
      {/* Time and Weather Bar */}
      <div className="flex items-center justify-between mb-4 text-blue-600">
        <div className="flex items-center gap-6">
          {/* App Name */}
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-600">BoRa</span>
          </div>
          
          {/* Time and Weather */}
          <div className="text-sm flex items-center gap-3">
            <span className="text-blue-600">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span className="text-blue-600/40">|</span>
            <div className="flex items-center gap-1.5">
              <Cloud className="w-4 h-4 text-blue-600" />
              <span className="text-blue-600">Fog · 8°C</span>
            </div>
          </div>
        </div>
      </div>

      {/* Camera View with margins */}
      <div className="flex-1 min-h-0">
        <CameraView
          cameraMode={cameraMode}
          aiEnabled={aiEnabled}
          enhancementLevel={enhancementLevel}
          imageUrl="https://images.unsplash.com/photo-1760969115142-faabe51a867b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb2dneSUyMHJvYWQlMjBkcml2aW5nJTIwdmlld3xlbnwxfHx8fDE3NzYyNjAyODZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          onMenuClick={() => setIsMenuOpen(true)}
          carStatus={carStatus}
        />
      </div>

      {/* Side Drawer with Controls */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[400px] p-0 overflow-y-auto" hideOverlay>
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-gray-200">
            <SheetTitle>Camera Controls</SheetTitle>
          </SheetHeader>
          
          <div className="px-6 py-4 space-y-6">
            {/* Status Info */}
            <div className="space-y-3 pb-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Weather</span>
                <span className="text-sm font-semibold">Fog</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Temperature</span>
                <span className="text-sm font-semibold">8°C</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Processing</span>
                <span className="text-sm font-semibold text-blue-600">{processingFps} FPS</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-semibold">Active</span>
                </div>
              </div>
            </div>

            {/* Control Panel */}
            <ControlPanel
              cameraMode={cameraMode}
              onCameraModeChange={setCameraMode}
              aiEnabled={aiEnabled}
              onAiEnabledChange={setAiEnabled}
              enhancementLevel={enhancementLevel}
              onEnhancementLevelChange={setEnhancementLevel}
              visibilityScore={visibilityScore}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}