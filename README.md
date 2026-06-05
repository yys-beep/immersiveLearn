<div align="center">
<img width="1200" height="475" alt="ImmersiLearn Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# ImmersiLearn

**An AI-powered 3D Knowledge Graph visualization platform with hand gesture recognition.**

Transform the way you learn by building dynamic, interactive knowledge architectures in immersive 3D space. ImmersiLearn uses Google's Gemini AI to construct personalized knowledge graphs from natural language conversations, powered by hand gesture recognition for seamless interaction.

---

## ✨ Key Features

### 🤖 AI-Powered Knowledge Graphs
- **Conversational Interface**: Chat with an AI assistant to dynamically build your knowledge architecture
- **Intelligent Graph Generation**: Gemini AI analyzes your input and automatically creates nodes and relationships
- **Semantic Connections**: AI identifies meaningful relationships between concepts and visualizes them as graph connections

### 🎮 3D Visualization & Interaction
- **Immersive 3D Scene**: Explore your knowledge graph in a stunning three-dimensional space using Three.js
- **Force-Directed Physics**: Graph nodes naturally repel and attract each other based on physical forces for optimal layout
- **Interactive Nodes**: Hover over concepts to view descriptions, categories, and metadata
- **Dynamic Node Sizing**: Concepts are sized proportionally to represent their importance

### 👋 Hand Gesture Recognition
- **MediaPipe Integration**: Real-time hand tracking and gesture detection via webcam
- **Gesture-Based Controls**: 
  - Pinch gestures for zoom interactions
  - Palm gestures for interface control
  - Pointer tracking for intuitive navigation

### 📚 Knowledge Management
- **Memory Archives**: Browse and restore previous knowledge graph states
- **Search History**: Quick access to your past queries and explorations
- **State Snapshots**: Automatic preservation of graph configurations for easy revisiting

### 🎯 Immersive Learning Experience
- **Tutorial System**: Built-in guidance for new users
- **Real-Time Chat**: Contextual AI responses alongside graph visualization
- **System Status Indicators**: Visual feedback showing system readiness and connectivity

---

## 🛠 Tech Stack

### Frontend Framework
- **React 19** - Modern UI library with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Next-generation build tool for blazing-fast development

### 3D Graphics & Visualization
- **Three.js** (`three@^0.181.2`) - WebGL 3D graphics library
- **React Force Graph 3D** (`react-force-graph-3d@^1.29.0`) - Force-directed graph visualization in 3D space

### AI & Machine Learning
- **Google Gemini API** (`@google/genai@^1.30.0`) - Generative AI for knowledge graph generation and responses
- **MediaPipe Tasks Vision** (`@mediapipe/tasks-vision@^0.10.22-rc`) - Hand pose detection and gesture recognition

### Development Tools
- **Vite Plugins**: React plugin for JSX transformation
- **TypeScript Compiler**: ~5.8.2 for strict type checking
- **Node.js**: Runtime environment (v14+)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 14 or higher
- Gemini API key (get one at [Google AI Studio](https://ai.studio))
- Webcam for hand gesture recognition

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yys-beep/immersiveLearn.git
   cd immersiveLearn
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure your Gemini API Key**
   - Create a `.env.local` file in the root directory
   - Add your API key:
     ```env
     VITE_GEMINI_API_KEY=your_gemini_api_key_here
     ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in your browser**
   - Navigate to `http://localhost:5173` (or the URL shown in your terminal)
   - Grant camera permissions when prompted
   - Start exploring!

### Build for Production

```bash
npm run build
npm run preview  # Test the production build locally
```

---

## 📖 How It Works

1. **Ask a Question**: Type a topic or concept in the chat interface
2. **AI Analysis**: Gemini AI analyzes your query and generates relevant concepts and connections
3. **Graph Generation**: The system creates nodes (concepts) and links (relationships) automatically
4. **3D Visualization**: Watch your knowledge graph build in real-time in 3D space
5. **Gesture Interaction**: Use hand gestures to zoom, navigate, and explore
6. **Memory Management**: Access previous graph states from the Memory Archives

---

## 🎮 Controls

| Action | Input |
|--------|-------|
| Navigate | Mouse movement |
| Zoom | Scroll wheel or pinch gesture |
| View Node Info | Hover over a node |
| Submit Query | Type in chat and press Enter |
| Access History | Click "Memory Archives" |
| Restart Tutorial | Click "? Tutorial" button |

---

## 📂 Project Structure

```
immersiveLearn/
├── App.tsx                 # Main application component
├── index.tsx              # Entry point
├── components/            # React components (Scene, ChatInterface, Tutorial)
├── services/              # API and utility services (Gemini integration)
├── types.ts              # TypeScript type definitions
├── metadata.json         # App metadata and permissions
├── vite.config.ts        # Vite configuration
└── tsconfig.json         # TypeScript configuration
```

---

## 🔧 Configuration

### Environment Variables
- `VITE_GEMINI_API_KEY` - Your Google Gemini API key (required)

### Camera Permissions
The app requests camera and microphone permissions in `metadata.json` for:
- Hand gesture recognition via webcam
- Potential future voice input features

---

## 🌟 Features in Development

- Voice input for hands-free learning
- Knowledge export/import (JSON, PDF)
- Collaborative knowledge graphs
- Advanced gesture commands
- Mobile-responsive design

---

## 📄 License

This project is part of Google AI Studio and available under the specified license.

---

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests to help improve ImmersiLearn.

---

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check the built-in Tutorial for guidance
- Visit [Google AI Studio](https://ai.studio) for Gemini API documentation

---

**Built with ❤️ using React, Three.js, and Google Gemini AI**
