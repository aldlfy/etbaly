import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Image } from '@tiptap/extension-image';
import { MathToolbar } from './MathToolbar';
import { renderLatex } from '@/lib/katex';
import { Button } from '@/components/ui/Button';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Table as TableIcon, 
  Sigma, 
  AlignRight, 
  AlignLeft, 
  Undo, 
  Redo, 
  Image as ImageIcon 
} from 'lucide-react';

interface QuestionEditorProps {
  initialContent?: string;
  direction?: 'rtl' | 'ltr';
  onChange?: (html: string) => void;
  onDirectionChange?: (dir: 'rtl' | 'ltr') => void;
}

export function QuestionEditor({
  initialContent = '',
  direction = 'rtl',
  onChange,
  onDirectionChange,
}: QuestionEditorProps) {
  const [showMathToolbar, setShowMathToolbar] = useState(false);
  const [currentDir, setCurrentDir] = useState<'rtl' | 'ltr'>(direction);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({ inline: true, allowBase64: true }),
    ],
    content: initialContent || '<p>اكتب نص السؤال هنا...</p>',
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  const handleToggleDirection = (dir: 'rtl' | 'ltr') => {
    setCurrentDir(dir);
    onDirectionChange?.(dir);
  };

  const handleInsertLatex = (latex: string, isBlock: boolean = false) => {
    if (!editor) return;
    const renderedHtml = renderLatex(latex, { displayMode: isBlock });
    
    if (isBlock) {
      editor.chain().focus().insertContent(`<div class="math-block-container text-center my-3">${renderedHtml}</div><p></p>`).run();
    } else {
      editor.chain().focus().insertContent(` ${renderedHtml} `).run();
    }
    setShowMathToolbar(false);
  };

  const handleAddTable = () => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const handleAddImage = () => {
    const url = prompt('أدخل رابط الصورة (أو رابط محلي):');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Editor Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
        {/* Text formatting */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`p-1.5 ${editor?.isActive('bold') ? 'bg-slate-200 dark:bg-slate-700' : ''}`}
            title="عريض (Bold)"
          >
            <Bold className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`p-1.5 ${editor?.isActive('italic') ? 'bg-slate-200 dark:bg-slate-700' : ''}`}
            title="مائل (Italic)"
          >
            <Italic className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={`p-1.5 ${editor?.isActive('bulletList') ? 'bg-slate-200 dark:bg-slate-700' : ''}`}
            title="قائمة نقطية"
          >
            <List className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 ${editor?.isActive('orderedList') ? 'bg-slate-200 dark:bg-slate-700' : ''}`}
            title="قائمة رقمية"
          >
            <ListOrdered className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAddTable}
            className="p-1.5"
            title="إدراج جدول مقارنة أو بيانات"
          >
            <TableIcon className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAddImage}
            className="p-1.5"
            title="إدراج مخطط / صورة"
          >
            <ImageIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* Direction & Math Buttons */}
        <div className="flex items-center gap-1.5">
          {/* RTL / LTR Per-question direction toggle */}
          <div className="flex items-center bg-slate-200/80 dark:bg-slate-700/80 p-0.5 rounded">
            <button
              type="button"
              onClick={() => handleToggleDirection('rtl')}
              className={`p-1 rounded text-xs font-bold ${
                currentDir === 'rtl' ? 'bg-white dark:bg-slate-800 text-brand-600 shadow-xs' : 'text-slate-500'
              }`}
              title="اتجاه السؤال: عربي (يمين لليسار)"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleToggleDirection('ltr')}
              className={`p-1 rounded text-xs font-bold ${
                currentDir === 'ltr' ? 'bg-white dark:bg-slate-800 text-brand-600 shadow-xs' : 'text-slate-500'
              }`}
              title="اتجاه السؤال: إنجليزي (يسار لليمين)"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Visual Math Toolbar Button */}
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setShowMathToolbar(!showMathToolbar)}
            className="gap-1.5 py-1 px-2.5 text-xs font-bold bg-brand-600 hover:bg-brand-500"
          >
            <Sigma className="w-3.5 h-3.5" />
            <span>إدراج معادلة / رمز</span>
          </Button>

          {/* Undo / Redo */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().undo().run()}
            disabled={!editor?.can().undo()}
            className="p-1.5 text-slate-500"
            title="تراجع"
          >
            <Undo className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={!editor?.can().redo()}
            className="p-1.5 text-slate-500"
            title="إعادة"
          >
            <Redo className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* MathLive & KaTeX Visual Math Toolbar Drawer */}
      {showMathToolbar && (
        <div className="animate-fade-in">
          <MathToolbar
            onInsertLatex={handleInsertLatex}
            onClose={() => setShowMathToolbar(false)}
          />
        </div>
      )}

      {/* Tiptap Editable Area */}
      <div
        dir={currentDir}
        className={`p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-[140px] focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500 transition-all font-cairo leading-relaxed ${
          currentDir === 'ltr' ? 'text-left font-sans' : 'text-right'
        }`}
      >
        <EditorContent editor={editor} className="prose dark:prose-invert max-w-none focus:outline-none" />
      </div>
    </div>
  );
}
