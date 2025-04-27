'use client';

import React, { useState } from 'react';
import { icons } from '../../lib/constants/icons';
import { IconSelectBase } from './IconSelectBase';

interface IconSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  usedIcons: string[];
}

export function IconSelect({ value, onChange, usedIcons }: IconSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedIcon = value ? icons.find(i => i.name === value) : null;
  const filteredIcons = icons.filter(icon => usedIcons.includes(icon.name));

  const trigger = (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100/90 dark:hover:bg-gray-700/90 transition-colors cursor-pointer flex items-center gap-2"
      aria-label="Filter by icon"
      title={selectedIcon ? selectedIcon.name : 'All Icons'}
    >
      {selectedIcon ? (
        <span className="w-6 h-6">{selectedIcon.svg}</span>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
          />
        </svg>
      )}
    </button>
  );

  return (
    <IconSelectBase
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      trigger={trigger}
      icons={filteredIcons}
      selectedIcon={value}
      onSelect={iconName => onChange(iconName || null)}
      showEmptyOption={true}
      emptyOptionLabel="All Icons"
    />
  );
}
