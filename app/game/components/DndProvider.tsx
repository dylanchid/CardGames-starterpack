import React from 'react';
import { DndProvider as ReactDndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';

// Custom DnD provider with backend selection based on device capabilities
interface DndProviderProps {
  children: React.ReactNode;
}

export const DndProvider: React.FC<DndProviderProps> = ({ children }) => {
  // Check if touch is available - simple detection
  const isTouchDevice = () => {
    return (('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0) ||
      // @ts-ignore
      (navigator.msMaxTouchPoints > 0));
  };

  // Select appropriate backend based on device type
  const backend = isTouchDevice() ? TouchBackend : HTML5Backend;
  const options = isTouchDevice() ? { enableMouseEvents: true } : {};

  return (
    <ReactDndProvider backend={backend} options={options}>
      {children}
    </ReactDndProvider>
  );
};

export default DndProvider; 