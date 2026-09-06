'use client';

import React from 'react';

interface IllustratedBoxProps {
  variant?: 'open' | 'sealed' | 'success' | 'arrived';
  className?: string;
  size?: number;
}

export const IllustratedBox: React.FC<IllustratedBoxProps> = ({
  variant = 'sealed',
  className = '',
  size = 80,
}) => {
  if (variant === 'open') {
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <ellipse cx="50" cy="82" rx="26" ry="5" fill="#8C6D58" fillOpacity="0.14" />
          <path d="M30 45L50 35L70 45L50 55Z" fill="#7A4E2D" />
          <path d="M30 45L50 55V78L30 68V45Z" fill="#DDB694" />
          <path d="M50 55L70 45V68L50 78V55Z" fill="#B98A66" />
        </svg>
      </div>
    );
  }

  if (variant === 'success') {
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Soft botanical / leaf background accents */}
          <path
            d="M18 72C15 64 18 54 24 48C26 56 22 66 18 72Z"
            fill="#D5E6D8"
          />
          <path
            d="M26 78C22 72 24 62 30 57C32 64 29 73 26 78Z"
            fill="#C2DEC7"
          />
          <path
            d="M82 74C86 66 84 56 78 50C76 58 79 68 82 74Z"
            fill="#D5E6D8"
          />
          <path
            d="M88 64C92 58 90 50 85 45C83 52 86 60 88 64Z"
            fill="#E4EFE6"
          />

          {/* Soft shadow */}
          <ellipse cx="48" cy="78" rx="28" ry="6" fill="#2E7D4F" fillOpacity="0.15" />

          {/* Box Left Face */}
          <path
            d="M24 44L48 56V76L24 63V44Z"
            fill="#DDB694"
          />
          {/* Box Right Face */}
          <path
            d="M48 56L72 44V63L48 76V56Z"
            fill="#B98A66"
          />
          {/* Box Top Face */}
          <path
            d="M24 44L48 33L72 44L48 56L24 44Z"
            fill="#ECCAB0"
          />
          {/* Tape stripe across top and down front */}
          <path
            d="M44 35L52 31.5L52 58L44 62V35Z"
            fill="#A77855"
            fillOpacity="0.6"
          />

          {/* Success Checkmark Circle Badge on bottom right of box */}
          <circle cx="74" cy="70" r="13" fill="#2E7D4F" />
          <circle cx="74" cy="70" r="11.5" stroke="white" strokeWidth="1.5" />
          <path
            d="M69 70L72.5 73.5L79 66"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  // Default 'sealed' box
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft botanical / leaf background accents */}
        <path
          d="M18 72C15 64 18 54 24 48C26 56 22 66 18 72Z"
          fill="#EAD9CD"
        />
        <path
          d="M26 78C22 72 24 62 30 57C32 64 29 73 26 78Z"
          fill="#E2CEBF"
        />
        <path
          d="M82 74C86 66 84 56 78 50C76 58 79 68 82 74Z"
          fill="#EAD9CD"
        />

        {/* Soft shadow */}
        <ellipse cx="48" cy="78" rx="28" ry="6" fill="#8C6D58" fillOpacity="0.18" />

        {/* Box Left Face */}
        <path
          d="M24 44L48 56V76L24 63V44Z"
          fill="#DDB694"
        />
        {/* Box Right Face */}
        <path
          d="M48 56L72 44V63L48 76V56Z"
          fill="#B98A66"
        />
        {/* Box Top Face */}
        <path
          d="M24 44L48 33L72 44L48 56L24 44Z"
          fill="#ECCAB0"
        />
        {/* Tape stripe */}
        <path
          d="M44 35L52 31.5L52 58L44 62V35Z"
          fill="#A77855"
          fillOpacity="0.6"
        />
      </svg>
    </div>
  );
};
