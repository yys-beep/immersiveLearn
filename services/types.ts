export interface GraphNode {
  id: string;
  label: string;
  category?: string;
  val?: number; 
  desc?: string;
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  relation?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface HandGesture {
  isPinching: boolean;
  gestureMode: 'pointing' | 'zoom' | 'idle'; 
  pinchDistance: number;
  pointer: {
    x: number;
    y: number;
  };
}