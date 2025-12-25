import React, { useState } from 'react';

interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ isOpen, onClose }: TutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to ImmersiLearn",
      description: "An augmented reality knowledge explorer powered by hand gestures and AI.",
      icon: "👋",
      action: "Let's learn the gestures!"
    },
    {
      title: "Dragging - Rotate the Graph",
      description: "✊ Make a FIST (pinch your thumb and index finger together) and move your hand to rotate the 3D knowledge graph in any direction.",
      icon: "✊",
      action: "Got it! The graph spins!"
    },
    {
      title: "Zooming - Vertical Control",
      // FIX: Updated description for new Zoom Logic
      description: "🤚 Keep your hand OPEN (palm facing camera). Move your hand UP to Zoom IN (get closer), and move it DOWN to Zoom OUT (fly away).",
      icon: "🤚",
      action: "Perfect! I can zoom now!"
    },
    {
      title: "Clicking - Explore Concepts",
      description: "☝️ Point your INDEX FINGER at a glowing sphere (concept ball) and make a quick PINCH gesture to select it and see more details.",
      icon: "☝️",
      action: "Ready to explore!"
    },
    {
      title: "Chat with AI",
      description: "💬 Ask questions in the chat box. The AI will generate new concepts and connections based on your questions. Watch the graph grow!",
      icon: "💬",
      action: "Let's create knowledge!"
    },
    {
      title: "Tips for Success",
      description: "✨ Keep your hand in front of the camera, maintain good lighting, and move smoothly. The more you practice, the more responsive the gestures become!",
      icon: "✨",
      action: "I'm ready!"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-cyan-500 rounded-lg p-8 max-w-lg w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">{step.icon}</div>
          <h2 className="text-2xl font-bold text-cyan-400 mb-2">{step.title}</h2>
        </div>

        {/* Description */}
        <p className="text-gray-200 text-lg mb-8 leading-relaxed text-center">
          {step.description}
        </p>

        {/* Progress indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full transition-all ${
                index === currentStep ? 'bg-cyan-400 w-6' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-4 justify-between items-center">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`px-6 py-2 rounded font-semibold transition-all ${
              currentStep === 0
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
            }`}
          >
            ← Previous
          </button>

          <span className="text-gray-400 text-sm">
            {currentStep + 1} / {steps.length}
          </span>

          <button
            onClick={handleNext}
            className="px-6 py-2 bg-cyan-500 text-white rounded font-semibold hover:bg-cyan-400 transition-all"
          >
            {currentStep === steps.length - 1 ? "Let's Go! 🚀" : (step.action)}
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-cyan-400 text-2xl"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default Tutorial;