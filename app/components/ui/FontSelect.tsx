import { useState, useRef, useEffect } from 'react';

interface FontSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const fonts = [
  { value: 'font-system', label: 'System Default' },
  { value: 'font-inter', label: 'Inter' },
  { value: 'font-georgia', label: 'Georgia' },
  { value: 'font-merriweather', label: 'Merriweather' },
  { value: 'font-mono', label: 'Monospace' },
];

export function FontSelect({ value, onChange }: FontSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentFont = fonts.find(font => font.value === value) || fonts[0];

  return (
    <div className="flex items-center justify-between w-full">
      <span className="text-sm text-gray-700 dark:text-gray-300">Font</span>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-2 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        >
          <span>{currentFont.label}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {isOpen && (
          <div
            className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-[110]"
            style={{
              animation: 'dropdown-in 0.2s ease-out',
            }}
          >
            {fonts.map(font => (
              <button
                key={font.value}
                onClick={() => {
                  onChange(font.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  value === font.value
                    ? 'text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
                style={{
                  fontFamily:
                    font.value === 'font-system'
                      ? 'system-ui'
                      : font.value === 'font-mono'
                        ? 'monospace'
                        : font.value.replace('font-', ''),
                }}
              >
                {font.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
