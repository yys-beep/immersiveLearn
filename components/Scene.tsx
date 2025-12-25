import React, { useEffect, useRef, useState } from 'react';
import { detectHands, initializeHandLandmarker } from '../services/visionService';
import Graph3D from './Graph3D';
import { GraphData, GraphNode, HandGesture } from '../services/types';

interface SceneProps {
  graphData: GraphData;
  onNodeSelect: (node: GraphNode) => void;
  onNodeHover?: (node: GraphNode | null) => void;
}

const Scene: React.FC<SceneProps> = ({ graphData, onNodeSelect, onNodeHover }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const requestRef = useRef<number | null>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  
  const gestureRef = useRef<HandGesture | null>(null);
  const [arHoverNode, setArHoverNode] = useState<string | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      await initializeHandLandmarker();
      if (videoRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }
          });
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener('loadeddata', predictWebcam);
        } catch (err) {
          console.error("Camera access denied:", err);
        }
      }
    };
    startCamera();
    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const predictWebcam = () => {
    if (videoRef.current) {
      const detectedGesture = detectHands(videoRef.current);
      gestureRef.current = detectedGesture;

      if (cursorRef.current && detectedGesture) {
        cursorRef.current.style.display = 'flex';
        cursorRef.current.style.left = `${detectedGesture.pointer.x * 100}%`;
        cursorRef.current.style.top = `${detectedGesture.pointer.y * 100}%`;
        
        // --- CURSOR STYLES BASED ON MODE ---
        if (detectedGesture.gestureMode === 'zoom') {
          // Green Zoom
          cursorRef.current.style.backgroundColor = 'rgba(34, 197, 94, 0.3)';
          cursorRef.current.style.boxShadow = '0 0 20px #22c55e';
          cursorRef.current.style.borderColor = '#4ade80';
          cursorRef.current.style.width = '64px';
          cursorRef.current.style.height = '64px';
          cursorRef.current.innerHTML = '<div class="absolute -top-8 left-1/2 -translate-x-1/2 text-green-400 font-bold text-xs whitespace-nowrap">✋ ZOOMING</div>';
        } else if (detectedGesture.isPinching) {
          // Yellow Pinch
          cursorRef.current.style.backgroundColor = 'rgba(250, 204, 21, 0.9)'; 
          cursorRef.current.style.boxShadow = '0 0 15px #facc15';
          cursorRef.current.style.borderColor = '#fef08a';
          cursorRef.current.style.width = '32px';
          cursorRef.current.style.height = '32px';
          cursorRef.current.innerHTML = '<div class="absolute -top-8 left-1/2 -translate-x-1/2 text-yellow-300 font-bold text-xs whitespace-nowrap">✊ ROTATING</div>';
        } else {
          // Blue Pointer
          cursorRef.current.style.backgroundColor = 'transparent';
          cursorRef.current.style.boxShadow = '0 0 10px #22d3ee';
          cursorRef.current.style.borderColor = '#22d3ee';
          cursorRef.current.style.width = '32px';
          cursorRef.current.style.height = '32px';
          cursorRef.current.innerHTML = '';
        }
      } else if (cursorRef.current) {
        cursorRef.current.style.display = 'none';
      }
    }
    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover opacity-60 z-0"
        style={{ transform: 'scaleX(-1)' }}
      />
      <div className="absolute inset-0 z-10">
        <Graph3D
          width={dimensions.width}
          height={dimensions.height}
          data={graphData}
          hoverNodeId={arHoverNode}
          onNodeClick={onNodeSelect}
          onNodeHover={(node) => {
            setArHoverNode(node ? node.id : null);
            if (onNodeHover) onNodeHover(node);
          }}
          gestureRef={gestureRef}
        />
      </div>
      <div 
        ref={cursorRef}
        className="absolute z-20 rounded-full border-2 transform -translate-x-1/2 -translate-y-1/2 transition-colors duration-75 pointer-events-none hidden"
      ></div>
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06)_1px,transparent_1px),linear-gradient(rgba(255,0,0,0.06)_1px,transparent_1px)] bg-[length:100%_100%,40px_40px,40px_40px]"></div>
    </div>
  );
};

export default Scene;