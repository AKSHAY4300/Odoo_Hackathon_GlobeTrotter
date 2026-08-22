import React from 'react';
import { Plane } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export interface DashedRouteProps {
  orientation?: 'vertical' | 'horizontal';
  className?: string;
  showPlane?: boolean;
  length?: string | number;
}

export const DashedRoute: React.FC<DashedRouteProps> = ({
  orientation = 'vertical',
  className,
  showPlane = true,
}) => {
  if (orientation === 'horizontal') {
    return (
      <div className={twMerge('relative flex items-center justify-center w-full my-4', className)}>
        <div className="w-full h-0.5 border-t-2 border-dashed border-boarding-amber" />
        {showPlane && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-runway-white p-1 rounded-full border border-boarding-amber/40 shadow-sm text-boarding-amber">
            <Plane className="w-3.5 h-3.5 transform rotate-90" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={twMerge('relative flex flex-col items-center justify-center my-1', className)}>
      <div className="w-0.5 h-12 border-l-2 border-dashed border-boarding-amber" />
      {showPlane && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-runway-white p-1 rounded-full border border-boarding-amber/40 shadow-sm text-boarding-amber">
          <Plane className="w-3.5 h-3.5 transform rotate-180" />
        </div>
      )}
    </div>
  );
};
