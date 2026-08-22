import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'navy' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  leftIcon,
  rightIcon,
  ...props
}) => {
  const baseStyles = 
    'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] select-none';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 font-mono uppercase tracking-wider',
    md: 'text-sm px-4 py-2 gap-2 font-medium',
    lg: 'text-base px-6 py-3 gap-2.5 font-semibold',
  };

  const variantStyles = {
    primary:
      'bg-boarding-amber text-ink-800 hover:bg-boarding-amber-500 shadow-sm focus:ring-boarding-amber font-semibold hover:shadow',
    secondary:
      'bg-signal-teal text-white hover:bg-signal-teal-500 shadow-sm focus:ring-signal-teal font-medium hover:shadow',
    navy:
      'bg-ink-navy text-runway-white hover:bg-ink-navy-700 shadow-sm focus:ring-ink-navy font-semibold hover:shadow',
    outline:
      'border-2 border-ink-navy/20 bg-transparent text-ink-navy hover:bg-ink-navy/5 focus:ring-ink-navy',
    ghost:
      'bg-transparent text-ink-navy hover:bg-ink-navy/5 focus:ring-ink-navy',
    danger:
      'bg-stamp-red text-white hover:bg-stamp-red-600 shadow-sm focus:ring-stamp-red',
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, sizeStyles[size], variantStyles[variant], className))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
