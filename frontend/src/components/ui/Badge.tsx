import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'amber' | 'teal' | 'navy' | 'grey' | 'red' | 'stamp' | 'tag';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'amber',
  size = 'md',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-mono font-medium rounded transition-colors';

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 tracking-wider uppercase',
    md: 'text-xs px-2.5 py-1 tracking-wider uppercase',
  };

  const variantStyles = {
    amber: 'bg-boarding-amber/15 text-boarding-amber-700 border border-boarding-amber/40',
    teal: 'bg-signal-teal/15 text-signal-teal-600 border border-signal-teal/40',
    navy: 'bg-ink-navy text-runway-white',
    grey: 'bg-tarmac-grey/15 text-tarmac-grey-700 border border-tarmac-grey/30',
    red: 'bg-stamp-red/15 text-stamp-red-600 border border-stamp-red/40',
    stamp: 'passport-stamp text-xs',
    tag: 'bg-parchment text-ink-navy border border-tarmac-grey/40 shadow-sm relative pl-4',
  };

  return (
    <span
      className={twMerge(clsx(baseStyles, sizeStyles[size], variantStyles[variant], className))}
      {...props}
    >
      {variant === 'tag' && (
        <span className="w-1.5 h-1.5 rounded-full bg-tarmac-grey/60 absolute left-1.5 top-1/2 -translate-y-1/2" />
      )}
      {children}
    </span>
  );
};
