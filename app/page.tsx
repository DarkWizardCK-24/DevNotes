'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { RiAddLine, RiFileTextLine } from 'react-icons/ri';
import { getAll, remove, type Note } from '@/lib/db';

const TAG_COLORS = [
  '#00E5FF', '#00FFA3', '#8A5BFF', '#FFB547', '#4D8CFF', '#FF6B9D',
];

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function NoteCard({ note, onDelete, index }: { note: Note; onDelete: (id: string) => void; index: number }) {
  const preview = note.content_md
    .split('\n')
    .filter(l => l.trim() && !l.startsWith('#'))
    .join(' ')
    .replace(/[*`>_\[\]!~]/g, '')
    .slice(0, 130)
    .trim();

  return (
    <div className="mac-card" style={{ animationDelay: `${index * 55}ms` }}>
      <div className="mac-titlebar">
        <div className="mac-lights">
          <button
            className="mac-light mac-close"
            onClick={e => { e.preventDefault(); e.stopPropagation(); if (window.confirm('Delete this note?')) onDelete(note.id); }}
            aria-label="Delete note"
          />
          <span className="mac-light mac-minimize" />
          <span className="mac-light mac-maximize" />
        </div>
        <span className="mac-title">{note.title || 'untitled'}</span>
      </div>

      <Link href={`/note/${note.id}`} className="mac-body">
        {preview ? (
          <p className="mac-preview">{preview}</p>
        ) : (
          <p className="mac-preview mac-empty">empty note</p>
        )}

        <div className="mac-footer">
          {note.tags.length > 0 && (
            <div className="mac-tags">
              {note.tags.slice(0, 3).map((t, i) => (
                <span
                  key={t}
                  className="mac-tag"
                  style={{
                    color: TAG_COLORS[i % TAG_COLORS.length],
                    background: `${TAG_COLORS[i % TAG_COLORS.length]}18`,
                    border: `1px solid ${TAG_COLORS[i % TAG_COLORS.length]}40`,
                  }}
                >
                  {t}
                </span>
              ))}
              {note.tags.length > 3 && (
                <span className="mac-tag-more">+{note.tags.length - 3}</span>
              )}
            </div>
          )}
          <span className="mac-timestamp">{relativeTime(note.updated_at)}</span>
        </div>
      </Link>
    </div>
  );
}

function NotesGrid() {
  const [notes, setNotes] = useState<Note[]>([]);
  const searchParams = useSearchParams();
  const query = searchParams.get('q')?.toLowerCase() ?? '';

  useEffect(() => { getAll(query).then(setNotes); }, [query]);

  async function handleDelete(id: string) {
    await remove(id);
    setNotes(await getAll(query));
  }

  if (notes.length === 0) {
    return (
      <div className="mac-card max-w-md mx-auto mt-16" style={{ animationDelay: '0ms' }}>
        <div className="mac-titlebar">
          <div className="mac-lights">
            <span className="mac-light mac-close" />
            <span className="mac-light mac-minimize" />
            <span className="mac-light mac-maximize" />
          </div>
          <span className="mac-title">~/notes/</span>
        </div>
        <div className="mac-body" style={{ alignItems: 'center', textAlign: 'center', gap: '16px' }}>
          <RiFileTextLine size={36} style={{ color: 'var(--color-text-dim)', margin: '4px auto' }} />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
            <div style={{ color: 'var(--color-text-muted)' }}>
              <span style={{ color: 'var(--color-neon-green)' }}>$</span> ls ~/notes/
            </div>
            <div style={{ color: 'var(--color-neon-red)', marginTop: '6px', fontSize: '11px' }}>
              // no notes found{query ? ` for "${query}"` : ''}
            </div>
          </div>
          {!query && (
            <Link href="/new" className="mac-new-btn">
              <RiAddLine size={13} /> new note
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="notes-grid">
      {notes.map((n, i) => (
        <NoteCard key={n.id} note={n} onDelete={handleDelete} index={i} />
      ))}
    </div>
  );
}

export default function NotesPage() {
  return (
    <div className="container-app py-10 space-y-8">
      <div className="notes-header">
        <div>
          <div className="notes-header-cmd">
            <span style={{ color: 'var(--color-neon-green)' }}>$</span> ls ~/notes/ --all
          </div>
          <h1 className="notes-header-title">
            My Notes<span className="caret" />
          </h1>
        </div>
        <Link href="/new" className="mac-new-btn mac-new-btn-lg">
          <RiAddLine size={15} /> new note
        </Link>
      </div>

      <Suspense fallback={
        <div style={{ color: 'var(--color-text-dim)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
          loading...
        </div>
      }>
        <NotesGrid />
      </Suspense>
    </div>
  );
}
