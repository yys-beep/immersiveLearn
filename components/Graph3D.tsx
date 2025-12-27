import React, { useRef, useEffect, useState, useCallback } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import { GraphData, GraphNode, HandGesture } from '../services/types';
import * as THREE from 'three';
import { forceCollide } from 'd3-force-3d'; 

interface Graph3DProps {
  data: GraphData;
  width: number;
  height: number;
  hoverNodeId: string | null;
  onNodeClick: (node: GraphNode) => void;
  onNodeHover?: (node: GraphNode | null) => void;
  onNodeProximate?: (node: GraphNode) => void;
  gestureRef: React.MutableRefObject<HandGesture | null>;
}

const PROXIMITY_THRESHOLD = 180;
const PROXIMITY_COOLDOWN = 3000;

const Graph3D: React.FC<Graph3DProps> = ({ 
  data, 
  width, 
  height, 
  hoverNodeId, 
  onNodeClick, 
  onNodeHover, 
  onNodeProximate, 
  gestureRef 
}) => {
  const fgRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);
  
  const prevPointer = useRef<{x: number, y: number} | null>(null);
  const wasPinching = useRef<boolean>(false);
  const zoomStabilityFrames = useRef(0);
  const raycaster = useRef(new THREE.Raycaster());
  
  const lastTriggerRef = useRef<number>(0);

  useEffect(() => {
    if (raycaster.current && raycaster.current.params && raycaster.current.params.Points) {
        raycaster.current.params.Points.threshold = 15;
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
        if (fgRef.current) {
          const graph = fgRef.current;
          
          const controls = graph.controls ? graph.controls() : null;
          if (controls) {
            controls.maxDistance = 20000; 
            controls.zoomSpeed = 1.2;
            controls.enableDamping = true;
            controls.dampingFactor = 0.2;
            controls.mouseButtons = {
                LEFT: THREE.MOUSE.ROTATE,
                MIDDLE: THREE.MOUSE.DOLLY,
                RIGHT: THREE.MOUSE.PAN
            };
          }
    
          graph.d3Force('link')?.distance(480).strength(0.6);
          graph.d3Force('charge')?.strength(-9000);
          graph.d3Force('center')?.strength(0.02);

          const collideRadius = (n: any) => {
            const r = (n?.val || 20) * 2;
            return r * 1.15;
          };
          graph.d3Force('collision', forceCollide(collideRadius).iterations(2));

          if (graph.d3AlphaDecay) graph.d3AlphaDecay(0.01); 
          if (graph.d3VelocityDecay) graph.d3VelocityDecay(0.1);
    
          if (data.nodes.length > 0) {
             let avgX = 0, avgY = 0, avgZ = 0;
             let count = 0;

             data.nodes.forEach((node: any) => {
                 if (typeof node.x === 'number' && !isNaN(node.x)) {
                     avgX += node.x;
                     avgY += node.y;
                     avgZ += node.z;
                     count++;
                 }
             });

             if (count > 0) {
                 avgX /= count;
                 avgY /= count;
                 avgZ /= count;
                 
                 graph.cameraPosition(
                    { x: avgX, y: avgY, z: avgZ + 2500 }, 
                    { x: avgX, y: avgY, z: avgZ },        
                    1000
                 );
             } else {
                 graph.cameraPosition({ x: 0, y: 0, z: 2500 }, { x: 0, y: 0, z: 0 }, 1000);
             }
          }

          if (graph.d3ReheatSimulation) graph.d3ReheatSimulation();
        }
    }, 500); 

    return () => clearTimeout(timer);
  }, [data, mounted]); 

  const interactionLoop = useCallback(() => {
    if (!fgRef.current) {
        requestAnimationFrame(interactionLoop);
        return;
    }

    const graph = fgRef.current;

    if (onNodeProximate) {
        const cameraPos = graph.cameraPosition();
        const now = Date.now();

        if (now - lastTriggerRef.current > PROXIMITY_COOLDOWN) {
            let closestNode: GraphNode | null = null;
            let minDistance = Infinity;

            for (const node of data.nodes) {
                if (node.isExpanded) continue;
                
                const nx = (node as any).x;
                const ny = (node as any).y;
                const nz = (node as any).z;

                if (typeof nx === 'number' && typeof ny === 'number' && typeof nz === 'number') {
                    const dist = Math.sqrt(
                        Math.pow(cameraPos.x - nx, 2) +
                        Math.pow(cameraPos.y - ny, 2) +
                        Math.pow(cameraPos.z - nz, 2)
                    );

                    if (dist < PROXIMITY_THRESHOLD && dist < minDistance) {
                        minDistance = dist;
                        closestNode = node;
                    }
                }
            }

            if (closestNode) {
                lastTriggerRef.current = now;
                onNodeProximate(closestNode);
            }
        }
    }

    if (!gestureRef.current) {
      prevPointer.current = null;
      wasPinching.current = false;
      zoomStabilityFrames.current = 0;
      requestAnimationFrame(interactionLoop);
      return;
    }

    const gesture = gestureRef.current;
    
    if (gesture.isPinching) {
        zoomStabilityFrames.current = 0;
        if (onNodeHover) onNodeHover(null);

        if (!prevPointer.current) {
            prevPointer.current = { x: gesture.pointer.x, y: gesture.pointer.y };
        } else {
            let deltaX = gesture.pointer.x - prevPointer.current.x;
            let deltaY = gesture.pointer.y - prevPointer.current.y;
            
            if (isNaN(deltaX)) deltaX = 0;
            if (isNaN(deltaY)) deltaY = 0;
            
            if (Math.abs(deltaX) < 0.0005) deltaX = 0;
            if (Math.abs(deltaY) < 0.0005) deltaY = 0;

            const MAX_SPEED = 0.25; 
            deltaX = Math.max(Math.min(deltaX, MAX_SPEED), -MAX_SPEED);
            deltaY = Math.max(Math.min(deltaY, MAX_SPEED), -MAX_SPEED);

            const ROTATION_SPEED = 12.0; 
            const currentPos = graph.cameraPosition(); 

            if (currentPos && isFinite(currentPos.x)) {
                const vec = new THREE.Vector3(currentPos.x, currentPos.y, currentPos.z);
                const spherical = new THREE.Spherical();
                spherical.setFromVector3(vec);

                spherical.theta += deltaX * ROTATION_SPEED;
                spherical.phi -= deltaY * ROTATION_SPEED;
                spherical.phi = Math.max(0.01, Math.min(Math.PI - 0.01, spherical.phi));
                
                if (spherical.radius < 100) spherical.radius = 100;

                vec.setFromSpherical(spherical);

                if (isFinite(vec.x) && isFinite(vec.y) && isFinite(vec.z)) {
                    graph.cameraPosition(
                      { x: vec.x, y: vec.y, z: vec.z },
                      { x: 0, y: 0, z: 0 }, 
                      0 
                    );
                }
            }
            prevPointer.current = { x: gesture.pointer.x, y: gesture.pointer.y };
        }
        wasPinching.current = true;
    }
    
    else if (gesture.gestureMode === 'zoom') {
       if (onNodeHover) onNodeHover(null); 
       wasPinching.current = false;
       zoomStabilityFrames.current += 1;

       if (zoomStabilityFrames.current > 5) {
           if (!prevPointer.current) {
               prevPointer.current = { x: gesture.pointer.x, y: gesture.pointer.y };
           } else {
               const deltaY = gesture.pointer.y - prevPointer.current.y;
               const currentPos = graph.cameraPosition();
               
               if (currentPos && isFinite(currentPos.z)) {
                   let newZ = currentPos.z + (deltaY * 6000); 
                   newZ = Math.max(200, Math.min(newZ, 20000));

                   if (isFinite(newZ)) {
                        graph.cameraPosition({ z: newZ }, { x: 0, y: 0, z: 0 }, 0);
                   }
               }
               prevPointer.current = { x: gesture.pointer.x, y: gesture.pointer.y };
           }
       }
    } 
    
    else {
        zoomStabilityFrames.current = 0;
        prevPointer.current = null; 
        
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

        if (!gesture.isPinching && wasPinching.current) {
            if (foundNode) {
                onNodeClick(foundNode);
                const distRatio = 1 + 600 / (Math.hypot(
                   (foundNode as any).x||0, 
                   (foundNode as any).y||0, 
                   (foundNode as any).z||0
                )||1);

                graph.cameraPosition(
                    { 
                      x: (foundNode as any).x * distRatio, 
                      y: (foundNode as any).y * distRatio, 
                      z: (foundNode as any).z * distRatio 
                    },
                    foundNode,
                    2000
                );
            }
            wasPinching.current = false;
        }
    }

    requestAnimationFrame(interactionLoop);
  }, [onNodeClick, onNodeHover, onNodeProximate, data.nodes, gestureRef]);

  useEffect(() => {
    requestAnimationFrame(interactionLoop);
  }, [interactionLoop]);

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
        canvas.width = metrics.width + 40; 
        canvas.height = fontSize + 40;
        context.font = font;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.strokeStyle = 'rgba(0,0,0, 0.9)';
        context.lineWidth = 4;
        context.strokeText(text, canvas.width / 2, canvas.height / 2);
        context.fillStyle = color;
        context.fillText(text, canvas.width / 2, canvas.height / 2);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, depthTest: false });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.renderOrder = 99; 
    const w = canvas.width || 1;
    const h = canvas.height || 1;
    const aspectRatio = w / h;
    sprite.scale.set(scale * aspectRatio, scale, 1);
    return sprite;
  };

  const nodeThreeObject = useCallback((node: any) => {
    const group = new THREE.Group();
    if (!node) return group;
    const category = node.category || 'Unknown';
    const color = stringToColor(category);
    const val = node.val || 20; 
    const radius = val * 2.0; 
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshLambertMaterial({ color: color, transparent: true, opacity: 0.95 });
    const sphere = new THREE.Mesh(geometry, material);
    group.add(sphere);
    if (node.label) {
      const sprite = createTextSprite(node.label, 48, '#ffffff', radius * 1.5);
      sprite.position.y = radius + (radius * 0.4); 
      group.add(sprite);
    }
    return group;
  }, []); 

  const linkThreeObject = useCallback((link: any) => {
    if (!link || !link.relation) return new THREE.Group();
    const sprite = createTextSprite(link.relation, 48, '#ffff00', 40);
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
      warmupTicks={100}
      cooldownTicks={0}
      nodeThreeObject={nodeThreeObject}
      nodeThreeObjectExtend={false}
      onNodeClick={onNodeClick}
      onNodeHover={onNodeHover}
      linkWidth={10}
      linkColor={() => 'rgba(255, 255, 255, 1)'}
      linkDirectionalParticles={2}
      linkDirectionalParticleSpeed={0.005}
      linkThreeObject={linkThreeObject}
      linkThreeObjectExtend={true}
      linkPositionUpdate={linkPositionUpdate}
    />
  );
};

export default React.memo(Graph3D);
