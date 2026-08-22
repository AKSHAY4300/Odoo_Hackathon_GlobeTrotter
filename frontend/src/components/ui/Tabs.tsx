import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  variant?: 'pills' | 'underline';
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
  variant = 'pills',
}) => {
  if (variant === 'underline') {
    return (
      <div className={twMerge('flex border-b border-tarmac-grey/20 gap-6 overflow-x-auto', className)}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={clsx(
                'pb-3 pt-1 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap',
                isActive
                  ? 'border-boarding-amber text-ink-navy'
                  : 'border-transparent text-tarmac-grey hover:text-ink-navy hover:border-tarmac-grey/40'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={clsx(
                    'text-[10px] font-mono px-1.5 py-0.5 rounded-full',
                    isActive ? 'bg-boarding-amber/20 text-boarding-amber-700' : 'bg-tarmac-grey/15 text-tarmac-grey'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={twMerge('flex bg-parchment p-1 rounded-lg border border-tarmac-grey/20 gap-1 overflow-x-auto', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap',
              isActive
                ? 'bg-ink-navy text-runway-white shadow-sm'
                : 'text-tarmac-grey hover:text-ink-navy hover:bg-white/50'
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                className={clsx(
                  'text-[10px] font-mono px-1.5 py-0.2 rounded-full',
                  isActive ? 'bg-boarding-amber text-ink-navy' : 'bg-tarmac-grey/20 text-tarmac-grey'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
