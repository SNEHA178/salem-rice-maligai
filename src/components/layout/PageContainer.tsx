import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  variant?: 'default' | 'narrow' | 'wide' | 'full';
  className?: string;
  id?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  variant = 'default',
  className = '',
  id,
}) => {
  // Controlled responsive widths keeping layout perfectly centered and responsive across mobile, tablet, laptop, and 1920px desktop
  const maxWidthClasses = {
    narrow: 'max-w-4xl',
    default: 'max-w-[1440px]',
    wide: 'max-w-[1600px]',
    full: 'max-w-full',
  }[variant];

  return (
    <div
      id={id}
      className={`w-full mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-150 ${maxWidthClasses} ${className}`}
    >
      {children}
    </div>
  );
};
