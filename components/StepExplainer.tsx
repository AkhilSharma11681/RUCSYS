import React from 'react';

export interface StepItem {
  title: string;
  description: string;
  icon?: React.ReactNode;
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
            <div className="w-8 h-8 rounded-full bg-[#FFF2EB] text-[#E4572E] border border-[#FCDDC9] flex items-center justify-center text-[12px] font-bold mb-2 group-hover:bg-[#E4572E] group-hover:text-white transition-colors">
              {step.icon ?? idx + 1}
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

  // Vertical orientation with dashed connecting line
  return (
    <div className={`relative flex flex-col space-y-6 ${className}`}>
      {steps.map((step, idx) => (
        <div key={idx} className="relative flex flex-row items-start space-x-3.5 group">
          {/* Connecting dashed line between steps */}
          {idx < steps.length - 1 && (
            <div className="absolute left-4 top-8 bottom-[-24px] w-0 border-l-2 border-dashed border-[#E8E0D8]" />
          )}
          <div className="relative z-10 shrink-0 w-8 h-8 rounded-full bg-[#FFF2EB] text-[#E4572E] border border-[#FCDDC9] flex items-center justify-center text-[13px] font-bold shadow-xs">
            {step.icon ?? idx + 1}
          </div>
          <div className="flex flex-col pt-0.5">
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
