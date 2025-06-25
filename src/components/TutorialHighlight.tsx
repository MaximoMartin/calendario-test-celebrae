import React from 'react';

interface TutorialHighlightProps {
  isActive: boolean;
  targetSelector?: string;
  children?: React.ReactNode;
}

export function TutorialHighlight({ isActive, targetSelector, children }: TutorialHighlightProps) {
  React.useEffect(() => {
    if (!isActive || !targetSelector) return;

    const element = document.querySelector(targetSelector);
    if (element) {
      // Agregar clase para resaltar
      element.classList.add('tutorial-highlight');
      
      // Hacer scroll al elemento
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });

      return () => {
        element.classList.remove('tutorial-highlight');
      };
    }
  }, [isActive, targetSelector]);

  if (!isActive) return null;

  return (
    <div className="tutorial-highlight-overlay">
      {children}
    </div>
  );
}

// Estilos CSS que se pueden agregar globalmente
export const tutorialStyles = `
  .tutorial-highlight {
    position: relative;
    z-index: 30;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3);
    border-radius: 8px;
    animation: tutorial-pulse 2s infinite;
  }

  @keyframes tutorial-pulse {
    0%, 100% {
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3);
    }
    50% {
      box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.3), 0 0 30px rgba(59, 130, 246, 0.2);
    }
  }

  .tutorial-highlight-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 25;
    pointer-events: none;
  }
`; 