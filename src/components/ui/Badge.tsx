import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'verified' | 'role' | 'tier' | 'gold' | 'success' | 'warning' | 'error';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'secondary',
  children,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center font-display tracking-wider uppercase font-semibold text-xs px-2.5 py-0.5 select-none rounded-[3px]';

  const variants = {
    primary: 'bg-[#FFE93B] text-black font-bold',
    secondary: 'bg-[#1F1F1F] text-[#ADABAB] border border-[#2A2A2A]',
    outline: 'border border-[#837D72] text-white bg-transparent',
    verified: 'bg-[#FFE93B]/10 text-[#FFE93B] border border-[#FFE93B]/40 font-bold',
    role: 'bg-[#1F1F1F] text-white border-l-2 border-l-[#FFE93B] border-t border-r border-b border-[#2A2A2A] px-2',
    tier: 'bg-gradient-to-r from-[#1F1F1F] to-[#2A2A2A] text-[#FFE93B] border border-[#837D72]',
    gold: 'bg-gradient-to-r from-[#FFE93B]/20 to-[#FFE93B]/10 text-[#FFE93B] border border-[#FFE93B]/60 font-bold shadow-sm shadow-[#FFE93B]/10',
    success: 'bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30',
    warning: 'bg-[#FF9100]/10 text-[#FF9100] border border-[#FF9100]/30',
    error: 'bg-[#FF3D00]/10 text-[#FF3D00] border border-[#FF3D00]/30',
  };

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </span>
  );
};
