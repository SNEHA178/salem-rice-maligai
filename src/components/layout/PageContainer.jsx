import React from 'react';

/**
 * Reusable PageContainer for Salem Rice & Maligai
 * Responsive centered container supporting: 'default' (max-w-[1440px]), 'narrow' (max-w-4xl), 'wide' (max-w-[1600px]), 'full' (max-w-full)
 */
export const PageContainer = ({
  children,
  variant = 'default',
  className = '',
  id,
}) => {
  const maxWidthClasses = {
    narrow: 'max-w-4xl',
    default: 'max-w-[1440px]',
    wide: 'max-w-[1600px]',
    full: 'max-w-full',
  }[variant] || 'max-w-[1440px]';

  return (
    <div
      id={id}
      className={`w-full mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-150 ${maxWidthClasses} ${className}`}
    >
      {children}
    </div>
  );
};

export default PageContainer;
