'use client';

import React from 'react';

interface OtpDigitDisplayProps {
  code: string; // 4-digit string e.g. "8492"
  className?: string;
}

export const OtpDigitDisplay: React.FC<OtpDigitDisplayProps> = ({
  code,
  className = '',
}) => {
  // Ensure code is formatted to 4 characters
  const digits = code.padStart(4, ' ').slice(0, 4).split('');

  return (
    <div className={`flex items-center justify-center space-x-2.5 sm:space-x-3.5 ${className}`}>
      {digits.map((digit, idx) => (
        <div
          key={idx}
          className="w-11 h-14 sm:w-13 sm:h-16 rounded-xl bg-white border-2 border-[#E8E0D8] shadow-sm flex items-center justify-center font-mono font-bold text-2xl sm:text-3xl text-[#1a1a1a]"
        >
          {digit !== ' ' ? digit : '•'}
        </div>
      ))}
    </div>
  );
};
