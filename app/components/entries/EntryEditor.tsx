'use client';

import { useEditor, EditorContent, Editor as TiptapEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Extension } from '@tiptap/core';
import { Suggestion } from '@tiptap/suggestion';
import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';

interface EditorProps {
  value: string;
  onChange: (content: string) => void;
}

interface CommandProps {
  editor: TiptapEditor;
  range: { from: number; to: number };
}

interface SuggestionProps extends CommandProps {
  props: {
    command: (props: CommandProps) => void;
  };
}

interface QueryProps {
  query: string;
}

interface MenuItem {
  title: string;
  command: (props: CommandProps) => void;
  icon: string;
}

interface RenderProps {
  clientRect: () => DOMRect;
  items: MenuItem[];
  command: (item: MenuItem) => void;
  event?: KeyboardEvent;
}

// Create a custom slash commands extension
const SlashCommands = Extension.create({
  name: 'slash-commands',

  addOptions() {
    const items = [
      {
        title: 'Image',
        command: ({ editor, range }: CommandProps) => {
          editor.chain().focus().deleteRange(range).run();
          if (window.openImageModal) {
            window.openImageModal();
          }
        },
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
      },
      {
        title: 'Heading 1',
        command: ({ editor, range }: CommandProps) => {
          editor.chain().focus().deleteRange(range).toggleHeading({ level: 1 }).run();
        },
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16"/><path d="M4 12h16"/><path d="M4 20h16"/></svg>',
      },
      {
        title: 'Heading 2',
        command: ({ editor, range }: CommandProps) => {
          editor.chain().focus().deleteRange(range).toggleHeading({ level: 2 }).run();
        },
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16"/><path d="M4 12h16"/><path d="M4 20h16"/></svg>',
      },
      {
        title: 'Heading 3',
        command: ({ editor, range }: CommandProps) => {
          editor.chain().focus().deleteRange(range).toggleHeading({ level: 3 }).run();
        },
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16"/><path d="M4 12h16"/><path d="M4 20h16"/></svg>',
      },
      {
        title: 'Bullet List',
        command: ({ editor, range }: CommandProps) => {
          editor.chain().focus().deleteRange(range).toggleBulletList().run();
        },
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>',
      },
      {
        title: 'Numbered List',
        command: ({ editor, range }: CommandProps) => {
          editor.chain().focus().deleteRange(range).toggleOrderedList().run();
        },
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path></svg>',
      },
      {
        title: 'Quote',
        command: ({ editor, range }: CommandProps) => {
          editor.chain().focus().deleteRange(range).toggleBlockquote().run();
        },
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path></svg>',
      },
      {
        title: 'Code Block',
        command: ({ editor, range }: CommandProps) => {
          editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
        },
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>',
      },
    ];

    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: SuggestionProps) => {
          props.command({ editor, range });
        },
        items: ({ query }: QueryProps) => {
          return items.filter(item => item.title.toLowerCase().includes(query.toLowerCase()));
        },
        render: () => {
          let element: HTMLElement;
          let selectedIndex = 0;

          const selectItem = (index: number) => {
            const items = element.querySelectorAll('.slash-commands-item');
            items.forEach(item => item.classList.remove('bg-gray-100', 'dark:bg-gray-700'));
            const selectedItem = items[index];
            if (selectedItem) {
              selectedItem.classList.add('bg-gray-100', 'dark:bg-gray-700');
              // Ensure the selected item is visible
              selectedItem.scrollIntoView({ block: 'nearest' });
            }
          };

          return {
            onStart: (props: RenderProps) => {
              element = document.createElement('div');
              element.className = 'slash-commands-menu';

              const menu = document.createElement('div');
              menu.className =
                'bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[200px] max-h-[300px] overflow-y-auto';

              props.items.forEach((item: MenuItem, index: number) => {
                const button = document.createElement('button');
                button.className =
                  'slash-commands-item flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700';
                button.dataset.index = String(index);

                const iconDiv = document.createElement('div');
                iconDiv.className = 'w-6 h-6 flex-shrink-0 text-gray-500 dark:text-gray-400';
                const svgContent = item.icon
                  .replace('width="24"', 'width="100%"')
                  .replace('height="24"', 'height="100%"');
                iconDiv.innerHTML = svgContent;

                const span = document.createElement('span');
                span.className = 'text-gray-900 dark:text-gray-100 text-sm';
                span.style.transform = 'translateY(1px)';
                span.textContent = item.title;

                button.appendChild(iconDiv);
                button.appendChild(span);
                button.addEventListener('click', () => {
                  props.command(item);
                  menu.remove();
                });

                menu.appendChild(button);
              });

              element.appendChild(menu);
              document.body.appendChild(element);

              const { top, left } = props.clientRect();
              element.style.position = 'absolute';
              element.style.top = `${top + 24}px`;
              element.style.left = `${left}px`;

              // Select first item by default
              selectedIndex = 0;
              selectItem(selectedIndex);
            },

            onUpdate: (props: RenderProps) => {
              const items = props.items;
              if (!items.length) {
                element?.remove();
                return;
              }

              const { top, left } = props.clientRect();
              if (element) {
                element.style.top = `${top + 24}px`;
                element.style.left = `${left}px`;

                // Clear existing menu items
                const menu = element.querySelector('div');
                if (menu) {
                  menu.innerHTML = '';

                  // Rebuild menu with filtered items
                  items.forEach((item: MenuItem, index: number) => {
                    const button = document.createElement('button');
                    button.className =
                      'slash-commands-item flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700';
                    button.dataset.index = String(index);

                    const iconDiv = document.createElement('div');
                    iconDiv.className = 'w-6 h-6 flex-shrink-0 text-gray-500 dark:text-gray-400';
                    const svgContent = item.icon
                      .replace('width="24"', 'width="100%"')
                      .replace('height="24"', 'height="100%"');
                    iconDiv.innerHTML = svgContent;

                    const span = document.createElement('span');
                    span.className = 'text-gray-900 dark:text-gray-100 text-sm';
                    span.style.transform = 'translateY(1px)';
                    span.textContent = item.title;

                    button.appendChild(iconDiv);
                    button.appendChild(span);
                    button.addEventListener('click', () => {
                      props.command(item);
                      menu.remove();
                    });

                    menu.appendChild(button);
                  });
                }
              }

              // Reset selection when items update
              selectedIndex = 0;
              selectItem(selectedIndex);
            },

            onKeyDown: (props: { event: KeyboardEvent }) => {
              const items = element.querySelectorAll('.slash-commands-item');

              if (props.event.key === 'ArrowDown') {
                props.event.preventDefault();
                selectedIndex = (selectedIndex + 1) % items.length;
                selectItem(selectedIndex);
                return true;
              }

              if (props.event.key === 'ArrowUp') {
                props.event.preventDefault();
                selectedIndex = (selectedIndex - 1 + items.length) % items.length;
                selectItem(selectedIndex);
                return true;
              }

              if (props.event.key === 'Enter') {
                props.event.preventDefault();
                const selectedItem = items[selectedIndex] as HTMLButtonElement;
                if (selectedItem) {
                  selectedItem.click();
                }
                return true;
              }

              if (props.event.key === 'Escape') {
                element?.remove();
                return true;
              }

              return false;
            },

            onExit: () => {
              element?.remove();
            },
          };
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

declare global {
  interface Window {
    openImageModal?: () => void;
  }
}

export default function Editor({ value, onChange }: EditorProps) {
  const [showFormattingMenu, setShowFormattingMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [editorHeight, setEditorHeight] = useState<number>(320);

  const updateEditorHeight = useCallback((editor: TiptapEditor) => {
    if (!editor || !editor.view) return;
    const editorElement = editor.view.dom as HTMLElement;
    const newHeight = Math.max(320, editorElement.scrollHeight + 192); // 192px for padding
    setEditorHeight(newHeight);
    document.documentElement.style.setProperty('--editor-height', `${newHeight}px`);
  }, []);

  const updateMenuPosition = useCallback((editor: TiptapEditor) => {
    if (!editor || !editor.view) return;

    const selection = editor.view.state.selection;
    const { from } = selection;
    const start = editor.view.coordsAtPos(from);

    setMenuPosition({
      top: start.top,
      left: start.left,
    });
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image,
      Placeholder.configure({
        placeholder: 'Press / for commands...',
      }),
      SlashCommands,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
      updateMenuPosition(editor);
      updateEditorHeight(editor);
    },
  });

  useEffect(() => {
    if (editor) {
      updateMenuPosition(editor);
      updateEditorHeight(editor);
    }
  }, [editor, updateMenuPosition, updateEditorHeight]);

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  const handleFormatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowFormattingMenu(!showFormattingMenu);
  };

  return (
    <div
      className="relative"
      ref={editorContainerRef}
      onClick={() => setShowFormattingMenu(true)}
      onBlur={() => setShowFormattingMenu(false)}
      style={{ height: `${editorHeight}px` }}
    >
      <EditorContent editor={editor} className="max-w-none" />

      <div
        ref={menuRef}
        className={`formatting-menu ${showFormattingMenu ? 'visible' : ''}`}
        onClick={handleFormatClick}
        style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
      >
        <button
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`format-button ${editor?.isActive('bold') ? 'active' : ''}`}
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`format-button ${editor?.isActive('italic') ? 'active' : ''}`}
        >
          <Italic size={16} />
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          className={`format-button ${editor?.isActive('underline') ? 'active' : ''}`}
        >
          <UnderlineIcon size={16} />
        </button>
        <button
          onClick={() => editor?.chain().focus().setTextAlign('left').run()}
          className={`format-button ${editor?.isActive({ textAlign: 'left' }) ? 'active' : ''}`}
        >
          <AlignLeft size={16} />
        </button>
        <button
          onClick={() => editor?.chain().focus().setTextAlign('center').run()}
          className={`format-button ${editor?.isActive({ textAlign: 'center' }) ? 'active' : ''}`}
        >
          <AlignCenter size={16} />
        </button>
        <button
          onClick={() => editor?.chain().focus().setTextAlign('right').run()}
          className={`format-button ${editor?.isActive({ textAlign: 'right' }) ? 'active' : ''}`}
        >
          <AlignRight size={16} />
        </button>
      </div>
    </div>
  );
}
