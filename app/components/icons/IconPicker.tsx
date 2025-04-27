import React, { useState } from 'react';
import { Button } from '../ui';
import { icons } from '../../lib/constants/icons';
import { IconSelectBase } from './IconSelectBase';

interface IconPickerProps {
  onSelect: (icon: string) => void;
  currentIcon?: string;
}

export default function IconPicker({ onSelect, currentIcon }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentIconSvg = currentIcon ? (
    icons.find(i => i.name === currentIcon)?.svg
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="w-6 h-6"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );

  const trigger = (
    <Button
      onClick={() => setIsOpen(!isOpen)}
      className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2"
      title="Choose icon"
    >
      <div className="w-6 h-6 text-gray-700 dark:text-gray-300">{currentIconSvg}</div>
    </Button>
  );

  return (
    <IconSelectBase
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      trigger={trigger}
      icons={icons}
      selectedIcon={currentIcon}
      onSelect={onSelect}
      showEmptyOption={true}
      dropdownClassName="absolute left-0 z-50 mt-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
      buttonClassName="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300"
    />
  );
}
