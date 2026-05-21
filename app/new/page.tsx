'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RiSaveLine, RiCloseLine, RiAddLine } from 'react-icons/ri';
import { create } from '@/lib/db';

export default function NewNotePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  function addTag(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) setTags(t => [...t, tagInput.trim()]);
      setTagInput('');
    }
  }

  async function save() {
    if (!content.trim()) return;
    const note = await create(title.trim() || 'untitled', content, tags);
    router.push(`/note/${note.id}`);
  }

  return (
    <div className="container-app py-10 max-w-3xl space-y-4">
      <div className="text-xs text-[var(--color-text-muted)]">
        <span className="text-[var(--color-neon-green)]">$</span> vim new-note.md
      </div>

      <div className="term-card glow-purple">
        <div className="term-card-header">
          <span className="text-[var(--color-neon-purple)]">new note</span>
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="text-[var(--color-text-dim)] hover:text-[var(--color-neon-red)] transition-colors text-xs">$ :q!</button>
            <button onClick={save} className="flex items-center gap-1.5 px-3 py-1 text-xs rounded border border-[var(--color-neon-green)] text-[var(--color-neon-green)] hover:bg-[rgba(0,255,163,0.08)] transition-colors">
              <RiSaveLine size={12} /> $ :wq
            </button>
          </div>
        </div>
        <div className="term-card-body space-y-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[var(--color-text-dim)] mb-1">// title</div>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="untitled"
              className="w-full bg-transparent text-xl font-bold text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-dim)] border-b border-[var(--color-border)] pb-2" />
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-widest text-[var(--color-text-dim)] mb-1">// content (markdown)</div>
            <textarea value={content} onChange={e => setContent(e.target.value)}
              placeholder="# Your note&#10;&#10;Start typing in markdown..."
              rows={16}
              className="w-full bg-[var(--color-surface-2)] rounded border border-[var(--color-border)] p-4 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-[var(--color-neon-purple)] resize-y transition-colors font-mono leading-relaxed" />
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-widest text-[var(--color-text-dim)] mb-2">// tags</div>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(t => (
                <span key={t} className="flex items-center gap-1 px-2 py-0.5 text-xs rounded border border-[var(--color-neon-purple)] text-[var(--color-neon-purple)]">
                  {t}
                  <button onClick={() => setTags(ts => ts.filter(x => x !== t))} className="hover:text-[var(--color-neon-red)]"><RiCloseLine size={11} /></button>
                </span>
              ))}
              <div className="flex items-center gap-1 border border-[var(--color-border)] rounded px-2 py-0.5 focus-within:border-[var(--color-neon-purple)]">
                <RiAddLine size={12} className="text-[var(--color-text-dim)]" />
                <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag}
                  placeholder="add tag" className="bg-transparent text-xs outline-none w-20 text-[var(--color-text)] placeholder:text-[var(--color-text-dim)]" />
              </div>
            </div>
            <div className="text-[10px] text-[var(--color-text-dim)]">press Enter to add a tag</div>
          </div>
        </div>
      </div>
    </div>
  );
}
