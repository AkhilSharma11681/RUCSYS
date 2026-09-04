'use client';

import React, { useRef, useEffect } from 'react';

interface NumberPickerProps {
  min?: number;
  max?: number;
  value: number;
  onChange: (val: number) => void;
  className?: string;
  takenNumbers?: number[]; // Array of numbers currently in use (so they can be disabled or styled differently)
}

export const NumberPicker: React.FC<NumberPickerProps> = ({
  min = 1,
  max = 100,
  value,
  onChange,
  className = '',
  takenNumbers = [],
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  // Auto-scroll to selected value on mount
  useEffect(() => {
    if (scrollRef.current) {
      const activeEl = scrollRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [value]);

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <div
        ref={scrollRef}
        className="flex space-x-3 overflow-x-auto pb-4 pt-1 px-4 -mx-4 snap-x hide-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {numbers.map((num) => {
          const isActive = num === value;
          const isTaken = takenNumbers.includes(num);

          return (
            <button
              key={num}
              type="button"
              disabled={isTaken && !isActive}
              onClick={() => onChange(num)}
              data-active={isActive ? 'true' : 'false'}
              className={`shrink-0 snap-center w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold transition-all border ${
                isActive
                  ? 'bg-[#E4572E] text-white border-[#E4572E] shadow-sm scale-110'
                  : isTaken
                  ? 'bg-[#F5EDE6] text-[#A69B91] border-[#E8E0D8]/40 cursor-not-allowed hidden' // Hide or disable taken boxes
                  : 'bg-white text-[#1a1a1a] border-[#E8E0D8] hover:border-[#E4572E]/50'
              } ${isTaken && !isActive ? 'opacity-40' : ''}`}
            >
              {num}
            </button>
          );
        })}
      </div>
    </div>
  );
};
