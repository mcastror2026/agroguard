import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  text: string;
  children?: React.ReactNode;
}

export function Tooltip({ text, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="inline-flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
        aria-label="Más información"
      >
        {children || <HelpCircle className="w-4 h-4" />}
      </button>

      {isVisible && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 px-3 py-2 text-xs text-white bg-gray-900 rounded-lg shadow-lg">
          <div className="relative">
            {text}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
