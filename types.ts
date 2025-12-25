// Graph Types
export interface GraphNode {
  id: string;
  label: string;
  category: string; // Changed from specific union to string for dynamic AI generation
  desc?: string;
  val?: number; // Size weight for visual
  color?: string;
  x?: number;
  y?: number;
  z?: number;
}

export interface GraphLink {
  source: string | GraphNode; // force-graph converts string IDs to object references
  target: string | GraphNode;
  relation?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// Chat Types
export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

// AI Response Schema
export interface GraphAction {
  action: "create" | "connect" | "update";
  subject: {
    id: string;
    label: string;
    category: string;
    desc?: string;
  };
  object?: string; // Target ID for connections
  relation?: string;
}

export interface AgentResponse {
  markdown_reply: string;
  graph_actions: GraphAction[];
}

// AR/Vision Types
export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface HandGesture {
  isPinching: boolean;
  isOpenPalm: boolean;
  pointer: { x: number; y: number }; // Normalized 0-1
  pinchDistance?: number; // Distance between thumb and index for zoom (0-1)
  isZooming?: boolean; // Whether user is doing pinch zoom gesture with both hands
}