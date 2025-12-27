import React, { useRef } from 'react';
import WebcamVideo from './WebcamVideo';
import Graph3D from './Graph3D';
import { useVision } from '../services/visionService';
import { GraphData, GraphNode } from '../services/types';

interface SceneProps {
  graphData: GraphData;
  onNodeSelect: (node: GraphNode) => void;
  onNodeHover?: (node: GraphNode | null) => void;
  onNodeProximate?: (node: GraphNode) => void;
}

const Scene: React.FC<SceneProps> = ({ 
  graphData, 
  onNodeSelect, 
  onNodeHover, 
  onNodeProximate 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { gestureRef, isReady } = useVision(videoRef);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <WebcamVideo 
        videoRef={videoRef} 
        isReady={isReady} 
      />

      <div className="absolute inset-0 z-10">
        <Graph3D 
          data={graphData} 
          width={window.innerWidth} 
          height={window.innerHeight} 
          hoverNodeId={null} 
          onNodeClick={onNodeSelect}
          onNodeHover={onNodeHover}
          onNodeProximate={onNodeProximate}
          gestureRef={gestureRef}
        />
      </div>

      {!isReady && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="text-cyan-400 text-xl font-mono animate-pulse">
            Initializing Vision Systems...
          </div>
        </div>
      )}
    </div>
  );
};

export default Scene;
