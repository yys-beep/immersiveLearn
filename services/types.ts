export interface GraphNode {
  id: string;
  label: string;
  category: string;
  desc?: string;
  val?: number;
  color?: string;
  x?: number;
  y?: number;
  z?: number;
  isExpanded?: boolean;
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

export interface GraphAction {
  action: "create" | "connect" | "update";
  subject: {
    id: string;
    label: string;
    category: string;
    desc?: string;
  };
  object?: string;
  relation?: string;
}

export interface AgentResponse {
  markdown_reply: string;
  graph_actions: GraphAction[];
}

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface HandGesture {
  isPinching: boolean;
  isOpenPalm: boolean;
  pointer: { x: number; y: number };
  pinchDistance?: number;
  isZooming?: boolean;
}
