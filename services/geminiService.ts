import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AgentResponse } from "../types";

const apiKey = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

// Define the schema for structured JSON output
const graphActionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    action: { 
      type: Type.STRING, 
      enum: ["create", "connect", "update"],
      description: "The type of operation to perform on the graph."
    },
    subject: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING, description: "Unique ID for the node (snake_case)." },
        label: { type: Type.STRING, description: "Display name of the node." },
        category: { type: Type.STRING, description: "A short category name (e.g., 'Physics', 'Person', 'Abstract'). AI should determine this dynamically." },
        desc: { type: Type.STRING, description: "Short description/definition of the node." }
      },
      required: ["id", "label", "category"]
    },
    object: { type: Type.STRING, description: "The target node ID if connecting." },
    relation: { type: Type.STRING, description: "Label for the edge (e.g., 'invented', 'part of')." }
  },
  required: ["action", "subject"]
};

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    markdown_reply: { type: Type.STRING, description: "Conversational reply to the user." },
    graph_actions: {
      type: Type.ARRAY,
      items: graphActionSchema,
      description: "List of actions to update the knowledge graph."
    }
  },
  required: ["markdown_reply", "graph_actions"]
};

const SYSTEM_INSTRUCTION = `
You are ImmersiLearn, an advanced AI tutor capable of visualizing knowledge.
Your goal is to explain complex topics while simultaneously building a 3D knowledge graph.

Rules for Graph Generation:
1. **Incremental Updates**: Do not return the whole graph. Return only the NEW nodes and edges needed based on the latest prompt.
2. **De-duplication**: Use consistent, simple IDs (e.g., "quantum_physics" not "Quantum Physics").
3. **Dynamic Categories**: Assign a concise category to each node. Do not use generic 'concept' unless necessary. Use specific tags like 'Theory', 'Scientist', 'Equipment', 'Event', etc.
4. **Relations**: Always provide a 'relation' label when connecting nodes (e.g., "discovered", "contains", "opposes").
5. **Context Awareness**: If the user asks specifically about a node, expand on that node's connections.

Output JSON strictly following the schema.
`;

export const generateGraphUpdate = async (
  userPrompt: string, 
  currentContextNodes: string[] // List of existing node IDs to help AI connect back
): Promise<AgentResponse> => {
  try {
    const model = "gemini-2.5-flash";
    
    const contextPrompt = currentContextNodes.length > 0 
      ? `Current existing nodes in graph: ${currentContextNodes.join(", ")}. Connect new concepts to these if relevant.`
      : "Graph is currently empty. Start fresh.";

    const response = await ai.models.generateContent({
      model,
      contents: [
        { role: 'user', parts: [{ text: `User Question: "${userPrompt}"\n\n${contextPrompt}` }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.3, // Lower temperature for more consistent graph structures
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AgentResponse;
    }
    
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Gemini Graph Generation Error:", error);
    return {
      markdown_reply: "I'm having trouble connecting to the neural core. Please try again.",
      graph_actions: []
    };
  }
};