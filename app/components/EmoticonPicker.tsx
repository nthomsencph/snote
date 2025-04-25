import { useState } from 'react';
import { Button } from './Button';

interface EmoticonPickerProps {
  onSelect: (emoticon: string) => void;
  currentEmoticon?: string;
}

const emoticons = [
  ':)', ':(', ':D', ':P', ';)', ':O', 'XD', ':/', ':|', '>:(',
  ':3', '<3', '^_^', '-_-', 'o_O', 'B)', ':*', '>:)', ':\'(', ':v'
];

export default function EmoticonPicker({ onSelect, currentEmoticon }: EmoticonPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="text-lg font-mono hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-3 py-1"
        title="Choose emoticon"
      >
        {currentEmoticon || ':)'}
      </Button>

      {isOpen && (
        <div className="absolute z-50 mt-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 grid grid-cols-5 gap-1">
          {emoticons.map((emoticon) => (
            <button
              key={emoticon}
              onClick={() => {
                onSelect(emoticon);
                setIsOpen(false);
              }}
              className={`text-lg font-mono p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded ${
                currentEmoticon === emoticon ? 'bg-gray-100 dark:bg-gray-700' : ''
              }`}
            >
              {emoticon}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 