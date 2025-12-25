import { FilesetResolver, HandLandmarker, HandLandmarkerResult } from "@mediapipe/tasks-vision";
// FIX: Import from ./types (plural)
import { HandGesture } from "./types"; 

let handLandmarker: HandLandmarker | null = null;
let lastVideoTime = -1;

export const initializeHandLandmarker = async (): Promise<void> => {
  if (handLandmarker) return;

  try {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );

    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        delegate: "GPU"
      },
      runningMode: "VIDEO",
      numHands: 1
    });
    console.log("Hand Landmarker initialized");
  } catch (err) {
    console.error("Failed to initialize hand landmarker", err);
  }
};

export const detectHands = (video: HTMLVideoElement): HandGesture | null => {
  if (!handLandmarker || video.currentTime === lastVideoTime) return null;

  lastVideoTime = video.currentTime;
  
  let results: HandLandmarkerResult | undefined;
  try {
    results = handLandmarker.detectForVideo(video, performance.now());
  } catch (e) {
    return null;
  }

  if (results && results.landmarks && results.landmarks.length > 0) {
    const lm = results.landmarks[0]; 

    // Landmarks
    const wrist = lm[0];
    const thumbTip = lm[4];
    const indexTip = lm[8];
    const middleTip = lm[12];
    const ringTip = lm[16];
    const pinkyTip = lm[20];

    const middlePip = lm[10];
    const ringPip = lm[14];
    const pinkyPip = lm[18];

    // 1. Calculate Pinch
    const distance = Math.sqrt(
      Math.pow(indexTip.x - thumbTip.x, 2) + 
      Math.pow(indexTip.y - thumbTip.y, 2)
    );
    const isPinching = distance < 0.08;

    // 2. Detect Finger Extensions
    const distToWrist = (point: any) => Math.sqrt(Math.pow(point.x - wrist.x, 2) + Math.pow(point.y - wrist.y, 2));

    const middleExtended = distToWrist(middleTip) > distToWrist(middlePip); 
    const ringExtended = distToWrist(ringTip) > distToWrist(ringPip);
    const pinkyExtended = distToWrist(pinkyTip) > distToWrist(pinkyPip);

    // 3. Determine Mode
    let gestureMode: 'pointing' | 'zoom' | 'idle' = 'idle';

    if (!middleExtended && !ringExtended && !pinkyExtended) {
      gestureMode = 'pointing';
    } 
    else if (middleExtended && ringExtended && pinkyExtended) {
      gestureMode = 'zoom';
    }

    return {
      isPinching,
      gestureMode,
      pinchDistance: distance,
      pointer: {
        x: 1 - indexTip.x, 
        y: indexTip.y
      }
    };
  }

  return null;
};