import { createClient } from './supabase';

export type Note = {
  id: string;
  title: string;
  content_md: string;
  tags: string[];
  created_at: string;
  updated_at: string;
};

const LS_KEY = 'devnotes_notes';

function lsGet(): Note[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]'); } catch { return []; }
}
function lsSet(notes: Note[]) { localStorage.setItem(LS_KEY, JSON.stringify(notes)); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

async function getUser() {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  return { sb, user };
}

export async function getAll(search = ''): Promise<Note[]> {
  const { sb, user } = await getUser();

  if (!user) {
    const notes = lsGet();
    if (!search) return notes;
    const q = search.toLowerCase();
    return notes.filter(n =>
      n.title.toLowerCase().includes(q) || n.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  let query = sb
    .from('notes')
    .select('id, title, content_md, tags, created_at, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (search) query = query.or(`title.ilike.%${search}%,tags.cs.{${search}}`);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getById(id: string): Promise<Note | null> {
  const { sb, user } = await getUser();

  if (!user) return lsGet().find(n => n.id === id) ?? null;

  const { data, error } = await sb
    .from('notes')
    .select('id, title, content_md, tags, created_at, updated_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) return null;
  return data;
}

export async function create(title: string, content_md: string, tags: string[]): Promise<Note> {
  const { sb, user } = await getUser();

  if (!user) {
    const note: Note = {
      id: uid(),
      title: title || 'untitled',
      content_md,
      tags,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    lsSet([note, ...lsGet()]);
    return note;
  }

  const { data, error } = await sb
    .from('notes')
    .insert({ user_id: user.id, title: title || 'untitled', content_md, tags })
    .select('id, title, content_md, tags, created_at, updated_at')
    .single();

  if (error) throw error;
  return data;
}

export async function update(
  id: string,
  patch: Partial<Pick<Note, 'title' | 'content_md' | 'tags'>>
): Promise<void> {
  const { sb, user } = await getUser();

  if (!user) {
    lsSet(
      lsGet().map(n =>
        n.id === id ? { ...n, ...patch, updated_at: new Date().toISOString() } : n
      )
    );
    return;
  }

  // DB trigger (trg_notes_updated_at) handles updated_at automatically
  const { error } = await sb
    .from('notes')
    .update(patch)
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
}

export async function remove(id: string): Promise<void> {
  const { sb, user } = await getUser();

  if (!user) {
    lsSet(lsGet().filter(n => n.id !== id));
    return;
  }

  const { error } = await sb
    .from('notes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
}
