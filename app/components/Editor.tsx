'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import ImageResize from 'tiptap-extension-resize-image';
import CodeBlock from '@tiptap/extension-code-block';
import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { Button } from './Button';
import { useState, useEffect, useCallback, useRef } from 'react';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-markdown';

export interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

interface CommandItem {
  title: string;
  command: (props: { editor: any; range: any }) => void;
  icon?: React.ReactNode;
}

const SlashCommands = Extension.create({
  name: 'slash-commands',

  addOptions() {
    const items = [
      {
        title: 'image',
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).run();
          if (window.openImageModal) {
            window.openImageModal();
          }
        },
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        ),
      }
    ];

    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }) => {
          props.command({ editor, range });
        },
        items: ({ query }) => items,
        render: () => {
          let popup: any;
          let element: HTMLElement;

          const setPopupPosition = (coords: DOMRect) => {
            popup?.setProps({
              getReferenceClientRect: () => coords,
            });
          };

          return {
            onStart: (props) => {
              element = document.createElement('div');
              element.className = 'slash-commands-menu';

              popup = tippy('body', {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
              })[0];

              // Show initial items immediately
              element.innerHTML = `
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[200px]">
                  ${items.map((item, index) => `
                    <button
                      class="slash-commands-item flex items-center gap-2 w-full px-3 py-1.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                      data-index="${index}"
                    >
                      <div class="w-4 h-4 flex-shrink-0 text-gray-500 dark:text-gray-400">
                        ${item.icon?.outerHTML || ''}
                      </div>
                      <span class="text-gray-900 dark:text-gray-100">${item.title}</span>
                    </button>
                  `).join('')}
                </div>
              `;

              element.querySelectorAll('button').forEach((button, index) => {
                button.addEventListener('click', () => {
                  const item = items[index];
                  item.command(props);
                  popup?.hide();
                });
              });

              setPopupPosition(props.clientRect());
            },

            onUpdate: (props) => {
              if (!props.items.length) {
                popup?.hide();
                return;
              }

              element.innerHTML = `
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[200px]">
                  ${props.items.map((item: any, index) => `
                    <button
                      class="slash-commands-item flex items-center gap-2 w-full px-3 py-1.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                      data-index="${index}"
                    >
                      <div class="w-4 h-4 flex-shrink-0 text-gray-500 dark:text-gray-400">
                        ${item.icon?.outerHTML || ''}
                      </div>
                      <span class="text-gray-900 dark:text-gray-100">${item.title}</span>
                    </button>
                  `).join('')}
                </div>
              `;

              element.querySelectorAll('button').forEach((button, index) => {
                button.addEventListener('click', () => {
                  const item = props.items[index];
                  item.command(props);
                  popup?.hide();
                });
              });

              setPopupPosition(props.clientRect());
            },

            onKeyDown: (props) => {
              if (props.event.key === 'Escape') {
                popup?.hide();
                return true;
              }
              return false;
            },

            onExit: () => {
              popup?.destroy();
              element.remove();
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

const Editor = ({ value, onChange }: EditorProps) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [mounted, setMounted] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);

  // Make the openImageModal function available globally
  useEffect(() => {
    window.openImageModal = () => setIsImageModalOpen(true);
    return () => {
      window.openImageModal = undefined;
    };
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: 'min-h-[1.5em]',
          },
        },
        codeBlock: false, // Disable default code block to use our custom one
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'rounded-lg bg-gray-900 p-4 font-mono text-sm text-white my-4',
        },
        languageClassPrefix: 'language-',
      }),
      ImageResize,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 hover:text-blue-700 underline',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Color,
      TextStyle,
      Underline,
      CharacterCount.configure({
        limit: null,
      }),
      Placeholder.configure({
        placeholder: 'Start writing your entry...',
        emptyEditorClass: 'cursor-text before:content-[attr(data-placeholder)] before:absolute before:text-gray-400 before:opacity-50 before:pointer-events-none',
      }),
      SlashCommands,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
      setCharCount(editor.getText().length);

      // Enhanced syntax highlighting for code blocks
      editor.view.dom.querySelectorAll('pre code').forEach((block) => {
        // Remove existing classes except language class
        const languageClass = Array.from(block.classList).find(cls => cls.startsWith('language-'));
        block.className = languageClass || '';
        
        // Add Prism classes
        block.classList.add('prism-code');
        
        // Force Prism to highlight
        Prism.highlightElement(block);
      });
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[200px]',
      },
      handleClick: (view, pos, event) => {
        if (pos >= view.state.doc.content.size) {
          const transaction = view.state.tr.setSelection(
            view.state.selection.constructor.near(
              view.state.doc.resolve(view.state.doc.content.size)
            )
          );
          view.dispatch(transaction);
          return true;
        }
        return false;
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Add click handler for the editor container
  const handleEditorClick = useCallback((e: React.MouseEvent) => {
    if (editor && e.target === e.currentTarget) {
      editor.commands.focus('end');
    }
  }, [editor]);

  const addImage = () => {
    if (imageUrl) {
      editor?.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setIsImageModalOpen(false);
    }
  };

  if (!mounted || !editor) {
    return null;
  }

  return (
    <div className="prose dark:prose-invert max-w-none relative" ref={editorRef}>
      <style jsx global>{`
        .slash-commands-menu {
          z-index: 50;
        }
        .slash-commands-item {
          font-size: 0.875rem;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror {
          min-height: 200px;
        }
        .ProseMirror pre {
          background: transparent !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .ProseMirror pre code {
          display: block;
          padding: 1rem;
          border-radius: 0.5rem;
          font-family: var(--font-geist-mono);
          font-size: 0.875rem;
          line-height: 1.5;
          tab-size: 2;
          background-color: rgb(17, 24, 39) !important;
          color: #e5e7eb !important;
        }
        
        /* Syntax highlighting colors */
        .token.comment,
        .token.prolog,
        .token.doctype,
        .token.cdata {
          color: #8b949e;
        }
        
        .token.punctuation {
          color: #c9d1d9;
        }
        
        .token.property,
        .token.tag,
        .token.boolean,
        .token.number,
        .token.constant,
        .token.symbol,
        .token.deleted {
          color: #79c0ff;
        }
        
        .token.selector,
        .token.attr-name,
        .token.string,
        .token.char,
        .token.builtin,
        .token.inserted {
          color: #a5d6ff;
        }
        
        .token.operator,
        .token.entity,
        .token.url,
        .language-css .token.string,
        .style .token.string {
          color: #d2a8ff;
        }
        
        .token.atrule,
        .token.attr-value,
        .token.keyword {
          color: #ff7b72;
        }
        
        .token.function,
        .token.class-name {
          color: #d2a8ff;
        }
        
        .token.regex,
        .token.important,
        .token.variable {
          color: #ffa657;
        }
      `}</style>
      <div className="relative overflow-hidden" onClick={handleEditorClick}>
        <div 
          className={`absolute z-10 left-0 right-0 transform transition-transform duration-300 ease-in-out ${
            showFormatting ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
          }`}
        >
          <div className="flex flex-wrap gap-2 p-2 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-t-lg shadow-lg">
            <div className="flex gap-1 border-r border-gray-200 dark:border-gray-700 pr-2">
              <Button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700' : ''}
                title="Bold (Ctrl+B)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path></svg>
              </Button>
              <Button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700' : ''}
                title="Italic (Ctrl+I)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg>
              </Button>
              <Button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={editor.isActive('underline') ? 'bg-gray-200 dark:bg-gray-700' : ''}
                title="Underline (Ctrl+U)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path><line x1="4" y1="21" x2="20" y2="21"></line></svg>
              </Button>
              <Button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={editor.isActive('strike') ? 'bg-gray-200 dark:bg-gray-700' : ''}
                title="Strikethrough"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><path d="M16 6C16 6 14 4 12 4C10 4 8 6 8 6C8 6 10 8 12 8C14 8 16 6 16 6Z"></path><path d="M8 18C8 18 10 16 12 16C14 16 16 18 16 18C16 18 14 20 12 20C10 20 8 18 8 18Z"></path></svg>
              </Button>
            </div>

            <div className="flex gap-1 border-r border-gray-200 dark:border-gray-700 pr-2">
              <Button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 dark:bg-gray-700' : ''}
                title="Heading 1"
              >
                H1
              </Button>
              <Button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 dark:bg-gray-700' : ''}
                title="Heading 2"
              >
                H2
              </Button>
            </div>

            <div className="flex gap-1 border-r border-gray-200 dark:border-gray-700 pr-2">
              <Button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-700' : ''}
                title="Bullet List"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
              </Button>
              <Button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={editor.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-700' : ''}
                title="Numbered List"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path></svg>
              </Button>
              <Button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={editor.isActive('blockquote') ? 'bg-gray-200 dark:bg-gray-700' : ''}
                title="Quote"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path></svg>
              </Button>
            </div>

            <div className="flex gap-1 border-r border-gray-200 dark:border-gray-700 pr-2">
              <Button
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200 dark:bg-gray-700' : ''}
                title="Align Left"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="15" y2="12"></line><line x1="3" y1="18" x2="18" y2="18"></line></svg>
              </Button>
              <Button
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200 dark:bg-gray-700' : ''}
                title="Align Center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="6" y1="12" x2="18" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
              </Button>
              <Button
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200 dark:bg-gray-700' : ''}
                title="Align Right"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="9" y1="12" x2="21" y2="12"></line><line x1="6" y1="18" x2="21" y2="18"></line></svg>
              </Button>
            </div>

            <Button
              onClick={() => setIsImageModalOpen(true)}
              title="Add Image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            </Button>
          </div>
        </div>
        
        <EditorContent editor={editor} className={`min-h-[300px] p-4 ${showFormatting ? 'pt-16' : 'pt-2'} bg-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-padding duration-300`} />
        
        <Button
          onClick={() => setShowFormatting(!showFormatting)}
          className={`absolute top-2 right-2 z-20 transition-transform duration-200 ${showFormatting ? 'rotate-180' : ''}`}
          title="Toggle formatting options"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </Button>

        <div className="absolute bottom-2 right-2 text-sm text-gray-500 dark:text-gray-400">
          {charCount} characters
        </div>
      </div>

      {isImageModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Add Image</h3>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Enter image URL"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-4 dark:bg-gray-700 dark:text-white"
            />
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => setIsImageModalOpen(false)}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={addImage}
                variant="primary"
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor; 