'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RiFileTextLine, RiAddLine, RiSearchLine, RiMenu3Line, RiCloseLine } from 'react-icons/ri';
import AuthButton from '@/components/auth/AuthButton';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md border-b border-[var(--color-border)] bg-[rgba(5,7,15,0.7)]">
      <div className="container-app flex items-center justify-between h-16 gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <RiFileTextLine className="text-[var(--color-neon-purple)]" size={20} />
          <span className="font-bold">
            <span className="text-[var(--color-neon-purple)]">dev</span>
            <span className="text-[var(--color-neon-cyan)]">notes</span>
            <span className="text-[var(--color-text-dim)]">.sh</span>
          </span>
        </Link>

        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm">
          <div className="flex items-center w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] focus-within:border-[var(--color-neon-cyan)] overflow-hidden transition-colors">
            <RiSearchLine size={13} className="ml-3 text-[var(--color-text-dim)] shrink-0" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="grep notes..."
              className="flex-1 bg-transparent py-1.5 px-2 text-xs font-mono text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] outline-none" />
          </div>
        </form>

        <nav className="hidden md:flex items-center gap-2">
          <Link href="/" className="px-3 py-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-neon-cyan)] rounded transition-colors">~/notes</Link>
          <Link href="/new" className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded border border-[var(--color-neon-green)] text-[var(--color-neon-green)] hover:bg-[rgba(0,255,163,0.08)] transition-colors">
            <RiAddLine size={14} /> new note
          </Link>
          <a href="http://localhost:3000" className="ml-1 px-3 py-1.5 text-xs border border-[var(--color-border)] rounded hover:border-[var(--color-neon-cyan)] hover:text-[var(--color-neon-cyan)] text-[var(--color-text-muted)] transition-colors">↩ DevFolio</a>
          <AuthButton />
        </nav>

        <button className="md:hidden" onClick={() => setOpen(v => !v)}>
          {open ? <RiCloseLine size={22} /> : <RiMenu3Line size={22} />}
        </button>
      </div>
      {open && (
        <nav className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-3">
          <form onSubmit={handleSearch}>
            <div className="flex items-center rounded border border-[var(--color-border)] bg-[var(--color-bg)] focus-within:border-[var(--color-neon-cyan)] overflow-hidden">
              <RiSearchLine size={13} className="ml-3 text-[var(--color-text-dim)] shrink-0" />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="grep notes..."
                className="flex-1 bg-transparent py-2 px-2 text-xs font-mono outline-none" />
            </div>
          </form>
          <Link href="/" onClick={() => setOpen(false)} className="block text-sm text-[var(--color-text-muted)]">~/notes</Link>
          <Link href="/new" onClick={() => setOpen(false)} className="block text-sm text-[var(--color-neon-green)]">+ new note</Link>
          <a href="http://localhost:3000" onClick={() => setOpen(false)} className="block text-sm text-[var(--color-text-muted)] hover:text-[var(--color-neon-cyan)]">↩ DevFolio</a>
        </nav>
      )}
    </header>
  );
}
