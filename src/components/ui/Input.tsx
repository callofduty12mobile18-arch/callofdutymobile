import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-4 text-[#ADABAB] pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              'w-full bg-[#141414] text-white border border-[#837D72] placeholder:text-[#ADABAB] text-sm transition-all duration-200 focus:outline-none focus:border-[#FFE93B] focus:ring-1 focus:ring-[#FFE93B] rounded-[50px] disabled:opacity-50 disabled:cursor-not-allowed',
              leftIcon ? 'pl-11 pr-5 py-2.5' : 'px-5 py-2.5',
              rightIcon && 'pr-11',
              error && 'border-[#FF3D00] focus:border-[#FF3D00] focus:ring-[#FF3D00]',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-4 text-[#ADABAB] flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1.5 ml-4 text-xs text-[#FF3D00] font-sans">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
