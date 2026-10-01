import * as React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg' | string;
  className?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ size = 'sm', className = '' }) => {
  const iconSize = size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  return (
    <span className={`inline-flex items-center text-[#FFE93B] title="Verified Competitor" ${className}`}>
      <CheckCircle2 className={`${iconSize} fill-[#FFE93B]/20`} />
    </span>
  );
};
