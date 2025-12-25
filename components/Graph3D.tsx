import React, { useRef, useEffect, useState, useCallback } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import { GraphData, GraphNode, HandGesture } from '../services/types';
import * as THREE from 'three';

interface Graph3DProps {
  data: GraphData;
  width: number;
  height: number;
  hoverNodeId: string | null;
  onNodeClick: (node: GraphNode) => void;
  onNodeHover?: (node: GraphNode | null) => void;
  gestureRef: React.MutableRefObject<HandGesture | null>;
}

const Graph3D: React.FC<Graph3DProps> = ({ data, width, height, hoverNodeId, onNodeClick, onNodeHover, gestureRef }) => {
  const fgRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);
  const animationFrameRef = useRef<number>(0);

  const prevPointer = useRef<{x: number, y: number} | null>(null);
  const wasPinching = useRef<boolean>(false);
  const raycaster = useRef(new THREE.Raycaster());

  useEffect(() => {
    raycaster.current.params.Points!.threshold = 30; 
    setMounted(true);
    if (fgRef.current) {
      // Spread nodes out more to accommodate huge text
      fgRef.current.d3Force('charge')?.strength(-500);
      fgRef.current.d3Force('link')?.distance(150);
    }
  }, []);

  const interactionLoop = useCallback(() => {
    if (!fgRef.current || !gestureRef.current) {
      prevPointer.current = null;
      wasPinching.current = false;
      animationFrameRef.current = requestAnimationFrame(interactionLoop);
      return;
    }

    const gesture = gestureRef.current;
    const graph = fgRef.current;
    
    // --- MODE A: ZOOM (Open Palm) ---
    if (gesture.gestureMode === 'zoom') {
       if (onNodeHover) onNodeHover(null); 
       prevPointer.current = null; 

       // Optimized Zoom Range
       const minZ = 100;  
       const maxZ = 1000;  
       
       const targetZ = minZ + (gesture.pointer.y * (maxZ - minZ));
       const currentPos = graph.cameraPosition();
       const lerpFactor = 0.2; 
       const newZ = currentPos.z + (targetZ - currentPos.z) * lerpFactor;

       graph.cameraPosition({ z: newZ }, { x: 0, y: 0, z: 0 }, 0);
    } 
    
    // --- MODE B: POINTING (Index Finger) ---
    else if (gesture.gestureMode === 'pointing') {
        const camera = graph.camera();
        const scene = graph.scene();

        const ndcX = (gesture.pointer.x * 2) - 1;
        const ndcY = -(gesture.pointer.y * 2) + 1;

        raycaster.current.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
        const intersects = raycaster.current.intersectObjects(scene.children, true);
        
        let foundNode: GraphNode | null = null;
        for (const intersect of intersects) {
          let obj: any = intersect.object;
          while (obj) {
            if (obj.__data) {
              foundNode = obj.__data as GraphNode;
              break;
            }
            obj = obj.parent;
            if (obj === scene) break;
          }
          if (foundNode) break;
        }

        if (onNodeHover) onNodeHover(foundNode); 

        if (gesture.isPinching && !wasPinching.current && foundNode) {
           onNodeClick(foundNode);
        }
        wasPinching.current = gesture.isPinching;

        if (gesture.isPinching) {
          if (!prevPointer.current) {
            prevPointer.current = { x: gesture.pointer.x, y: gesture.pointer.y };
          } else {
            const deltaX = gesture.pointer.x - prevPointer.current.x;
            const deltaY = gesture.pointer.y - prevPointer.current.y;
            const ROTATION_SPEED = 6; 

            const currentPos = graph.cameraPosition(); 
            const vec = new THREE.Vector3(currentPos.x, currentPos.y, currentPos.z);
            const spherical = new THREE.Spherical();
            spherical.setFromVector3(vec);

            spherical.theta += deltaX * ROTATION_SPEED;
            spherical.phi -= deltaY * ROTATION_SPEED;
            spherical.phi = Math.max(0.01, Math.min(Math.PI - 0.01, spherical.phi));

            vec.setFromSpherical(spherical);
            graph.cameraPosition({ x: vec.x, y: vec.y, z: vec.z }, { x: 0, y: 0, z: 0 }, 0);
            prevPointer.current = { x: gesture.pointer.x, y: gesture.pointer.y };
          }
        } else {
          prevPointer.current = null;
        }
    }
    animationFrameRef.current = requestAnimationFrame(interactionLoop);
  }, [onNodeClick, onNodeHover, gestureRef]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(interactionLoop);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [interactionLoop]);

  // --- RENDERING HELPERS ---

  const stringToColor = (str: string = '') => {
    if (!str) return '#ffffff'; 
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 90%, 60%)`;
  };

  const createTextSprite = (text: string, fontSize: number, color: string, scale: number) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const font = `Bold ${fontSize}px Arial`;
    if (context) {
        context.font = font;
        const metrics = context.measureText(text);
        
        // Massive canvas size for high resolution text
        canvas.width = metrics.width + 60; 
        canvas.height = fontSize + 60;
        
        context.font = font;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // Thick black outline for readability
        context.strokeStyle = 'rgba(0,0,0, 0.9)';
        context.lineWidth = 8;
        context.strokeText(text, canvas.width / 2, canvas.height / 2);
        
        context.fillStyle = color;
        context.fillText(text, canvas.width / 2, canvas.height / 2);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, depthTest: false });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.renderOrder = 99; 
    
    // The scale parameter here determines the world-space size
    sprite.scale.set((canvas.width / fontSize) * scale, scale, 1);
    return sprite;
  };

  const nodeThreeObject = useCallback((node: any) => {
    const group = new THREE.Group();
    if (!node) return group;
    const category = node.category || 'Unknown';
    const color = stringToColor(category);
    
    // Large Node Size
    const size = (node.val || 40); 
    const radius = size * 0.6; 

    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshLambertMaterial({ color: color, transparent: true, opacity: 0.95 });
    const sphere = new THREE.Mesh(geometry, material);
    group.add(sphere);

    if (node.label) {
      // FIX: Increased font scaling factor from 0.08 to 0.3
      // This makes the text roughly 4x larger
      const textScale = size * 0.3; 
      const sprite = createTextSprite(node.label, 80, '#ffffff', textScale);
      
      // Position text higher above the node
      sprite.position.y = radius + (textScale * 0.8); 
      group.add(sprite);
    }
    return group;
  }, [hoverNodeId]);

  const linkThreeObject = useCallback((link: any) => {
    if (!link.relation) return new THREE.Group();
    // Bigger link labels too
    const sprite = createTextSprite(link.relation, 40, 'rgba(200,200,255,0.9)', 12);
    return sprite;
  }, []);

  const linkPositionUpdate = useCallback((sprite: any, { start, end }: any) => {
    if (!sprite || !start || !end) return;
    const middlePos = Object.assign({}, start, {
      x: start.x + (end.x - start.x) / 2,
      y: start.y + (end.y - start.y) / 2,
      z: start.z + (end.z - start.z) / 2
    });
    Object.assign(sprite.position, middlePos);
  }, []);

  if (!mounted) return null;

  return (
    <ForceGraph3D
      ref={fgRef}
      width={width}
      height={height}
      graphData={data}
      backgroundColor="rgba(0,0,0,0)" 
      showNavInfo={false}
      nodeThreeObject={nodeThreeObject}
      nodeThreeObjectExtend={false}
      onNodeClick={onNodeClick}
      onNodeHover={onNodeHover}
      linkWidth={2} 
      linkColor={() => 'rgba(100, 150, 255, 0.5)'}
      linkDirectionalParticles={4}
      linkDirectionalParticleSpeed={0.01}
      linkThreeObject={linkThreeObject}
      linkThreeObjectExtend={true}
      linkPositionUpdate={linkPositionUpdate}
    />
  );
};

export default React.memo(Graph3D);