import React from 'react';

export interface StepItem {
  title: string;
  description: string;
}

interface StepExplainerProps {
  steps: StepItem[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const StepExplainer: React.FC<StepExplainerProps> = ({
  steps,
  orientation = 'vertical',
  className = '',
}) => {
  if (orientation === 'horizontal') {
    return (
      <div className={`flex flex-row justify-between items-start space-x-2 ${className}`}>
        {steps.map((step, idx) => (
          <div key={idx} className="flex flex-col items-center flex-1 text-center group">
            <div className="w-6 h-6 rounded-full bg-[#F5EDE6] text-[#A69B91] flex items-center justify-center text-[11px] font-bold mb-2 group-hover:bg-[#E4572E] group-hover:text-white transition-colors">
              {idx + 1}
            </div>
            <h4 className="text-[11px] font-bold text-[#1a1a1a] leading-tight mb-1">
              {step.title}
            </h4>
            <p className="text-[10px] text-[#6B6B6B] leading-tight px-1">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    );
  }

  // Vertical orientation
  return (
    <div className={`flex flex-col space-y-4 ${className}`}>
      {steps.map((step, idx) => (
        <div key={idx} className="flex flex-row items-start space-x-3 group">
          <div className="shrink-0 w-7 h-7 rounded-full bg-[#F5EDE6] text-[#A69B91] flex items-center justify-center text-[12px] font-bold mt-0.5 group-hover:bg-[#E4572E] group-hover:text-white transition-colors">
            {idx + 1}
          </div>
          <div className="flex flex-col">
            <h4 className="text-sm font-bold text-[#1a1a1a] leading-tight mb-1">
              {step.title}
            </h4>
            <p className="text-xs text-[#6B6B6B] leading-relaxed">
              {step.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
