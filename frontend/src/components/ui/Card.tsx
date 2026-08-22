import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'parchment' | 'dark' | 'outline';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  hoverEffect = false,
  ...props
}) => {
  const baseStyles = 'rounded-xl border transition-all duration-200';

  const variantStyles = {
    default: 'bg-white border-tarmac-grey/15 shadow-sm text-ink-navy',
    parchment: 'bg-parchment border-tarmac-grey/25 text-ink-navy shadow-sm',
    dark: 'bg-ink-navy border-ink-navy-700 text-runway-white shadow-md',
    outline: 'bg-transparent border-dashed border-2 border-tarmac-grey/30 text-ink-navy',
  };

  const hoverStyles = hoverEffect ? 'hover:shadow-md hover:border-boarding-amber/40 hover:-translate-y-0.5' : '';

  return (
    <div className={twMerge(clsx(baseStyles, variantStyles[variant], hoverStyles, className))} {...props}>
      {children}
    </div>
  );
};
