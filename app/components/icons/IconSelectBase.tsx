import React, { useRef, useEffect } from 'react';
import { Icon } from '../../lib/types/icon';

interface IconSelectBaseProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: React.ReactNode;
  icons: Icon[];
  selectedIcon?: string | null;
  onSelect: (iconName: string) => void;
  showEmptyOption?: boolean;
  emptyOptionLabel?: string;
  buttonClassName?: string;
}

export function IconSelectBase({
  isOpen,
  onClose,
  trigger,
  icons,
  selectedIcon,
  onSelect,
  showEmptyOption = false,
  emptyOptionLabel = 'No icon',
  buttonClassName = 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center',
}: IconSelectBaseProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <div className="relative" ref={dropdownRef}>
      {trigger}

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg py-1 z-[110] transition-all duration-200 origin-top-right"
          style={{
            animation: 'dropdown-in 0.2s ease-out',
          }}
        >
          <div className="grid grid-cols-4 gap-2 p-3 w-[200px]">
            {showEmptyOption && (
              <button
                onClick={() => {
                  onSelect('');
                  onClose();
                }}
                className={`${buttonClassName} w-10 h-10 rounded-lg`}
                title={emptyOptionLabel}
              >
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
              </button>
            )}
            {icons.map(icon => (
              <button
                key={icon.name}
                onClick={() => {
                  onSelect(icon.name);
                  onClose();
                }}
                className={`${buttonClassName} w-10 h-10 rounded-lg ${selectedIcon === icon.name ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                title={icon.name}
              >
                <span className="w-6 h-6">{icon.svg}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
