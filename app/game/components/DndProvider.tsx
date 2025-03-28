import React, { useState, useEffect } from 'react';
import { DndProvider as ReactDndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';

// Custom DnD provider with backend selection based on device capabilities
interface DndProviderProps {
  children: React.ReactNode;
}

export const DndProvider: React.FC<DndProviderProps> = ({ children }) => {
  // Use a state to track if we're on client side
  const [isMounted, setIsMounted] = useState(false);
  
  // Check if we're on client-side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only check for touch capability on client-side
  const isTouchDevice = () => {
    if (typeof window === 'undefined') return false;
    
    return (
      ('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0) ||
      // @ts-ignore
      (navigator.msMaxTouchPoints > 0)
    );
  };

  // Only detect touch after component is mounted (client-side)
  const isTouch = isMounted && isTouchDevice();
  
  return (
    <ReactDndProvider 
      backend={isTouch ? TouchBackend : HTML5Backend}
      options={isTouch ? { enableMouseEvents: true } : {}}
    >
      {children}
    </ReactDndProvider>
  );
};

export default DndProvider; 