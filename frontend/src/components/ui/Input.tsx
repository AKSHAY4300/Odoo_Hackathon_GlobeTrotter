import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  monoLabel?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      monoLabel = false,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className={twMerge(
              'block text-xs font-semibold text-ink-navy/80',
              monoLabel && 'font-mono uppercase tracking-wider text-[11px]'
            )}
          >
            {label}
          </label>
        )}

        <div className="relative rounded-md shadow-sm">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-tarmac-grey">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            className={twMerge(
              clsx(
                'block w-full rounded-md border border-tarmac-grey/30 bg-white text-ink-navy text-sm placeholder-tarmac-grey/60 transition-colors py-2 px-3 focus:outline-none focus:ring-2 focus:ring-boarding-amber focus:border-boarding-amber disabled:opacity-50 disabled:bg-runway-white/60',
                leftIcon && 'pl-9',
                rightIcon && 'pr-9',
                error && 'border-stamp-red focus:ring-stamp-red focus:border-stamp-red',
                className
              )
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-tarmac-grey">
              {rightIcon}
            </div>
          )}
        </div>

        {error && <p className="text-xs text-stamp-red font-medium">{error}</p>}
        {!error && helperText && <p className="text-[11px] text-tarmac-grey">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
