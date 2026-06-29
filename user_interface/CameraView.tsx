import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { MoreVertical } from 'lucide-react';

interface CameraViewProps {
  cameraMode: 'front' | 'back';
  aiEnabled: boolean;
  enhancementLevel: number;
  imageUrl: string;
  onMenuClick: () => void;
  carStatus: 'accelerating' | 'decelerating' | 'halt';
}

export function CameraView({ cameraMode, aiEnabled, enhancementLevel, imageUrl, onMenuClick, carStatus }: CameraViewProps) {
  const statusColors = {
    accelerating: 'bg-green-600',
    decelerating: 'bg-yellow-600',
    halt: 'bg-red-600'
  };

  const statusLabels = {
    accelerating: 'Accelerating',
    decelerating: 'Decelerating',
    halt: 'Halt'
  };

  return (
    <div className="relative h-full w-full bg-black overflow-hidden rounded-lg">
      {/* Camera Feed */}
      <div className="relative w-full h-full">
        <ImageWithFallback
          src={imageUrl}
          alt={`${cameraMode} camera view`}
          className="w-full h-full object-cover"
          style={{
            filter: aiEnabled 
              ? `contrast(${1 + enhancementLevel * 0.3}) brightness(${1 + enhancementLevel * 0.2}) saturate(${1 + enhancementLevel * 0.1})`
              : 'none',
            transition: 'filter 0.3s ease'
          }}
        />
        
        {/* Three Dot Menu Button */}
        <button
          onClick={onMenuClick}
          className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm p-3 rounded-full hover:bg-white transition-colors shadow-lg"
        >
          <MoreVertical className="w-6 h-6 text-gray-700" />
        </button>
        
        {/* AI Processing Indicator */}
        {aiEnabled && (
          <div className="absolute top-6 left-6 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            AI Enhanced
          </div>
        )}
        
        {/* Front Car Status - Bottom Left */}
        <div className={`absolute bottom-6 left-6 ${statusColors[carStatus]} text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg`}>
          Front Car: {statusLabels[carStatus]}
        </div>
        
        {/* Visibility Grid Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full opacity-20" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>
    </div>
  );
}