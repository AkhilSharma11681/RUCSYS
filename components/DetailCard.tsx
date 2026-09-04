import React from 'react';

interface DetailCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  noPadding?: boolean;
}

export const DetailCard: React.FC<DetailCardProps> = ({
  children,
  className = '',
  onClick,
  noPadding = false,
}) => {
  const isClickable = !!onClick;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-[16px] shadow-sm border border-[#E8E0D8]/80 overflow-hidden ${
        noPadding ? '' : 'p-4 sm:p-5'
      } ${
        isClickable ? 'cursor-pointer active:scale-[0.99] hover:shadow-md transition-all' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
