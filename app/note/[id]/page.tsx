'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { RiEditLine, RiDeleteBin7Line, RiCheckLine, RiArrowLeftLine } from 'react-icons/ri';
import { getById, update, remove, type Note } from '@/lib/db';

function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3 style="color:var(--color-neon-cyan);margin:1.5em 0 0.5em">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="color:var(--color-neon-cyan);font-size:1.3em;margin:1.5em 0 0.5em">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="color:var(--color-neon-cyan);font-size:1.6em;margin:1em 0 0.5em">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--color-text)">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background:var(--color-surface-2);color:var(--color-neon-green);padding:2px 6px;border-radius:3px;font-size:0.9em">$1</code>')
    .replace(/^> (.+)$/gm, '<blockquote style="border-left:3px solid var(--color-neon-cyan);padding-left:1em;color:var(--color-text-dim);margin:1em 0">$1</blockquote>')
    .replace(/^- (.+)$/gm, '<li style="color:var(--color-text-muted);margin:0.25em 0">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, s => `<ul style="padding-left:1.5em;margin:0.75em 0">${s}</ul>`)
    .replace(/\n\n/g, '</p><p style="color:var(--color-text-muted);line-height:1.8;margin:0.75em 0">')
    .replace(/^(.+)$/gm, m => m.startsWith('<') ? m : `<p style="color:var(--color-text-muted);line-height:1.8;margin:0.75em 0">${m}</p>`);
}

export default function NotePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ title: '', content_md: '' });

  useEffect(() => {
    getById(id).then(n => {
      if (!n) { router.push('/'); return; }
      setNote(n);
      setDraft({ title: n.title, content_md: n.content_md });
    });
  }, [id, router]);

  if (!note) return null;

  async function save() {
    await update(id, { title: draft.title, content_md: draft.content_md });
    const updated = await getById(id);
    if (updated) setNote(updated);
    setEditing(false);
  }

  async function del() {
    if (confirm('Delete this note?')) { await remove(id); router.push('/'); }
  }

  return (
    <div className="container-app py-10 max-w-3xl space-y-4">
      <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
        <Link href="/" className="flex items-center gap-1 hover:text-[var(--color-neon-cyan)] transition-colors">
          <RiArrowLeftLine size={13} /> $ cd ../
        </Link>
      </div>

      <div className="term-card glow-purple">
        <div className="term-card-header">
          <span className="text-[var(--color-neon-purple)] truncate">{note.title}</span>
          <div className="flex items-center gap-2">
            {editing ? (
              <button onClick={save} className="flex items-center gap-1 px-2 py-1 text-xs rounded border border-[var(--color-neon-green)] text-[var(--color-neon-green)] hover:bg-[rgba(0,255,163,0.08)]">
                <RiCheckLine size={11} /> save
              </button>
            ) : (
              <button onClick={() => setEditing(true)} className="flex items-center gap-1 px-2 py-1 text-xs rounded border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-neon-cyan)] hover:border-[var(--color-neon-cyan)]">
                <RiEditLine size={11} /> edit
              </button>
            )}
            <button onClick={del} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-neon-red)] transition-colors">
              <RiDeleteBin7Line size={13} />
            </button>
          </div>
        </div>
        <div className="term-card-body">
          {editing ? (
            <div className="space-y-3">
              <input value={draft.title} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
                className="w-full bg-transparent text-xl font-bold text-[var(--color-text)] outline-none border-b border-[var(--color-border)] pb-2" />
              <textarea value={draft.content_md} onChange={e => setDraft(d => ({ ...d, content_md: e.target.value }))}
                rows={16} className="w-full bg-[var(--color-surface-2)] rounded border border-[var(--color-border)] p-4 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-neon-purple)] resize-y font-mono leading-relaxed" />
            </div>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: renderMarkdown(note.content_md) }} className="text-sm leading-relaxed" />
          )}
          {note.tags.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex flex-wrap gap-2">
              {note.tags.map(t => (
                <span key={t} className="text-[10px] px-2 py-0.5 rounded border border-[var(--color-neon-purple)] text-[var(--color-neon-purple)]">{t}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
