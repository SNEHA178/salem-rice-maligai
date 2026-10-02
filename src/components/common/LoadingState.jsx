import React from 'react';

export const LoadingState = ({ message = 'Loading fresh essentials...' }) => {
  return (
    <div className="w-full py-12 flex flex-col items-center justify-center text-center">
      <div className="relative w-12 h-12 mb-4">
        <div className="w-12 h-12 rounded-full border-3 border-[#F0EBDD] border-t-[#205A3B] animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-[#DFBA5C] border-b-transparent animate-spin-reverse" />
      </div>
      <p className="text-sm font-semibold text-[#16402A] font-heading">{message}</p>
      <p className="text-xs text-[#5A5A5A] mt-1 font-tamil">சேலம் அரிசி &amp; மளிகை</p>
    </div>
  );
};

export default LoadingState;
