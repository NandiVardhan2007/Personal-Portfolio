'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

export function SecurityGuard() {
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const showWarning = (message: string) => {
      setWarning(message);
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWarning(null);
      }, 4000);
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      showWarning("Right-click is disabled to protect content.");
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        showWarning("Developer tools are disabled.");
        return;
      }

      // Ctrl+Shift+I / Cmd+Option+I (DevTools)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
        e.preventDefault();
        showWarning("Developer tools are disabled.");
        return;
      }

      // Ctrl+Shift+J / Cmd+Option+J (DevTools Console)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
        e.preventDefault();
        showWarning("Developer tools are disabled.");
        return;
      }
      
      // Ctrl+Shift+C / Cmd+Option+C (DevTools Inspect)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        showWarning("Developer tools are disabled.");
        return;
      }

      // Ctrl+U / Cmd+U (View Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        showWarning("Viewing source code is disabled.");
        return;
      }

      // Ctrl+S / Cmd+S (Save)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        showWarning("Saving is disabled.");
        return;
      }
      
      // Ctrl+P / Cmd+P (Print)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault();
        showWarning("Printing is disabled.");
        return;
      }
    };

    const handleDragStart = (e: DragEvent) => {
      if (e.target instanceof HTMLImageElement || e.target instanceof HTMLAnchorElement) {
        e.preventDefault();
        showWarning("Dragging is disabled to prevent downloads.");
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <AnimatePresence>
      {warning && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: "-50%", scale: 0.9 }}
          animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, x: "-50%", transition: { duration: 0.2 } }}
          className="fixed bottom-6 left-1/2 z-[99999] flex items-center gap-3 px-4 py-3 bg-red-600/95 text-white rounded-lg shadow-[0_10px_40px_-10px_rgba(220,38,38,0.5)] backdrop-blur-md border border-red-400"
        >
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium text-sm whitespace-nowrap">{warning}</span>
          <button 
            onClick={() => setWarning(null)} 
            className="p-1.5 hover:bg-white/20 rounded-md transition-colors ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
