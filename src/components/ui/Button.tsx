import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-display tracking-wider uppercase font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFE93B] disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer rounded-[5px] active:scale-[0.98]';

    const variants = {
      primary:
        'bg-[#FFE93B] text-black hover:bg-[#E5D02C] shadow-[0_0_12px_rgba(255,233,59,0.25)] hover:shadow-[0_0_18px_rgba(255,233,59,0.4)]',
      secondary:
        'bg-[#1F1F1F] text-white border border-[#837D72] hover:bg-[#2A2A2A] hover:border-white',
      outline:
        'bg-transparent text-white border border-[#837D72] hover:border-[#FFE93B] hover:text-[#FFE93B]',
      ghost:
        'bg-transparent text-[#ADABAB] hover:text-white hover:bg-[#141414]',
      danger:
        'bg-[#FF3D00] text-white hover:bg-[#D50000]',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-10 px-5 text-sm gap-2',
      lg: 'h-12 px-7 text-base gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4 text-current mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
