import React from 'react';
import { ActivitySearchContent } from './ActivitySearchContent';

export const ActivitySearchPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-mono uppercase text-boarding-amber-700 bg-boarding-amber/20 px-2.5 py-0.5 rounded font-bold">
          EXPERIENCES DIRECTORY
        </span>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink-navy mt-1">
          Explore Activities & Experiences
        </h1>
        <p className="text-xs sm:text-sm text-tarmac-grey mt-0.5">
          Curated guided museum passes, foodie walking trails, outdoor adventures, and relaxation escapes.
        </p>
      </div>

      <ActivitySearchContent />
    </div>
  );
};
