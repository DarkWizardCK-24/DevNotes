'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { RiGithubFill, RiTerminalBoxLine, RiLockLine } from 'react-icons/ri';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/';
  const [checking, setChecking] = useState(true);
  const [signing, setSigning] = useState(false);
  const sb = createClient();

  useEffect(() => {
    sb.auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace(next);
      else setChecking(false);
    });
  }, []);

  async function signIn() {
    setSigning(true);
    await sb.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="font-mono text-sm text-[var(--color-text-dim)] animate-pulse">
          <span className="text-[var(--color-neon-green)]">$</span> checking session...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="term-card glow-cyan w-full max-w-sm">
        <div className="term-card-header">
          <div className="flex items-center gap-2">
            <RiTerminalBoxLine size={14} className="text-[var(--color-neon-cyan)]" />
            <span className="text-[var(--color-neon-cyan)]">devnotes.sh — auth</span>
          </div>
          <RiLockLine size={13} className="text-[var(--color-text-dim)]" />
        </div>

        <div className="term-card-body items-center text-center gap-6 py-8">
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-widest text-[var(--color-text-dim)]">
              // authenticate
            </div>
            <p className="text-[var(--color-text-muted)] text-xs leading-relaxed">
              sign in to sync your notes to the cloud
              <br />and access them anywhere
            </p>
          </div>

          <button
            onClick={signIn}
            disabled={signing}
            className="flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded border border-[var(--color-neon-cyan)] text-[var(--color-neon-cyan)] text-sm hover:bg-[rgba(0,229,255,0.08)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RiGithubFill size={16} />
            {signing ? 'redirecting to github...' : 'continue with github'}
          </button>

          <p className="text-[10px] font-mono text-[var(--color-text-dim)]">
            <span className="text-[var(--color-neon-green)]">$</span>{' '}
            your notes are private — only you can access them
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <span className="font-mono text-sm text-[var(--color-text-dim)] animate-pulse">loading...</span>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}