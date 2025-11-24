'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Bold, Italic, Link, Image as ImageIcon, Code, List, 
  ListOrdered, Quote, Eye, Save, Upload 
} from 'lucide-react';

import { API_BASE_URL } from '@/lib/config';

interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  placeholder?: string;
  autoSave?: boolean;
  className?: string;
}

export function RichEditor({ 
  value, 
  onChange, 
  onSave,
  placeholder = "Start writing...",
  autoSave = true,
  className = ""
}: RichEditorProps) {
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && onSave) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        setSaving(true);
        onSave();
        setTimeout(() => setSaving(false), 1000);
      }, 2000);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [value, autoSave, onSave]);

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newText = value.substring(0, start) + 
                   before + selectedText + after + 
                   value.substring(end);
    
    onChange(newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length, 
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const insertImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const token = localStorage.getItem('admin_token');
        if (!token) return;

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/media/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });

        if (response.ok) {
          const uploadedFile = await response.json();
          insertText(`![${file.name}](${uploadedFile.file_url})`);
        }
      } catch (error) {
        console.error('Image upload failed:', error);
      }
    };
    
    input.click();
  };

  const toolbarButtons = [
    { icon: Bold, action: () => insertText('**', '**'), title: 'Bold' },
    { icon: Italic, action: () => insertText('*', '*'), title: 'Italic' },
    { icon: Code, action: () => insertText('`', '`'), title: 'Code' },
    { icon: Link, action: () => insertText('[', '](url)'), title: 'Link' },
    { icon: ImageIcon, action: insertImage, title: 'Image' },
    { icon: Quote, action: () => insertText('> '), title: 'Quote' },
    { icon: List, action: () => insertText('- '), title: 'Bullet List', label: '•' },
    { icon: ListOrdered, action: () => insertText('1. '), title: 'Numbered List', label: '1.' },
  ];

  const renderPreview = (markdown: string) => {
    const formatInline = (text: string) =>
      text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;" />');

    const lines = markdown.split(/\r?\n/);
    const out: string[] = [];
    let inUl = false;
    let inOl = false;

    const closeLists = () => {
      if (inUl) out.push('</ul>');
      if (inOl) out.push('</ol>');
      inUl = false;
      inOl = false;
    };

    lines.forEach((raw) => {
      const line = raw.trim();
      if (!line) {
        closeLists();
        out.push('<br>');
        return;
      }

      // Headings
      const h3 = line.match(/^### (.*)$/);
      const h2 = line.match(/^## (.*)$/);
      const h1 = line.match(/^# (.*)$/);
      if (h3 || h2 || h1) {
        closeLists();
        if (h1) out.push(`<h1>${formatInline(h1[1])}</h1>`);
        else if (h2) out.push(`<h2>${formatInline(h2[1])}</h2>`);
        else if (h3) out.push(`<h3>${formatInline(h3[1])}</h3>`);
        return;
      }

      // Blockquote
      const quote = line.match(/^> (.*)$/);
      if (quote) {
        closeLists();
        out.push(`<blockquote>${formatInline(quote[1])}</blockquote>`);
        return;
      }

      // Lists
      if (/^\- /.test(line)) {
        if (!inUl) {
          closeLists();
          inUl = true;
          out.push('<ul>');
        }
        out.push(`<li>${formatInline(line.replace(/^\- /, ''))}</li>`);
        return;
      }
      if (/^\d+\.\s+/.test(line)) {
        if (!inOl) {
          closeLists();
          inOl = true;
          out.push('<ol>');
        }
        out.push(`<li>${formatInline(line.replace(/^\d+\.\s+/, ''))}</li>`);
        return;
      }

      // Paragraph
      closeLists();
      out.push(`<p>${formatInline(line)}</p>`);
    });

    closeLists();
    return out.join('');
  };

  return (
    <div className={`bg-card/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-glow-soft ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          {toolbarButtons.map((button, index) => (
            <button
              key={index}
              onClick={button.action}
              title={button.title}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-1">
                <button.icon className="h-4 w-4 text-muted" />
                {button.label && <span className="text-[11px] text-muted">{button.label}</span>}
              </div>
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          {saving && (
            <span className="text-xs text-green-400 flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Saving...
            </span>
          )}
          
          <button
            onClick={() => setPreview(!preview)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm transition-colors ${
              preview 
                ? 'bg-accent/20 text-accent' 
                : 'hover:bg-white/10 text-muted'
            }`}
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
          
          {onSave && (
            <button
              onClick={onSave}
              className="flex items-center gap-2 px-3 py-1.5 bg-accent/20 text-accent rounded-xl text-sm hover:bg-accent/30 transition-colors"
            >
              <Save className="h-4 w-4" />
              Save
            </button>
          )}
        </div>
      </div>

      {/* Editor/Preview */}
      <div className="p-4">
        {preview ? (
          <div 
            className="prose prose-invert max-w-none min-h-[300px] p-4 bg-white/5 rounded-2xl"
            dangerouslySetInnerHTML={{ __html: renderPreview(value) }}
          />
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full min-h-[300px] p-4 bg-white/5 border border-white/10 rounded-2xl text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-colors resize-none font-mono text-sm"
          />
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t border-white/10 text-xs text-muted">
        <div className="flex items-center gap-4">
          <span>{value.length} characters</span>
          <span>{value.split(/\s+/).filter(w => w.length > 0).length} words</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Markdown supported</span>
          {autoSave && <span>• Auto-save enabled</span>}
        </div>
      </div>
    </div>
  );
}
