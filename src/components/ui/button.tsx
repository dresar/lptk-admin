import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const variants = {
      primary: 'bg-black text-white hover:bg-neutral-800 border border-black',
      secondary: 'bg-neutral-100 text-black hover:bg-neutral-200 border border-neutral-200',
      outline: 'bg-white text-black hover:bg-neutral-50 border border-neutral-300',
      danger: 'bg-black text-white hover:bg-neutral-800 border border-black underline decoration-1',
    };

    const sizes = {
      sm: 'text-xs px-2.5 py-1.5 rounded',
      md: 'text-sm px-3.5 py-2 rounded',
      lg: 'text-base px-4 py-2.5 rounded',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
