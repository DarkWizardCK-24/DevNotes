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

export async function getAll(search = ''): Promise<Note[]> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();

  if (!user) {
    const notes = lsGet();
    return search ? notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.tags.some(t => t.includes(search.toLowerCase()))) : notes;
  }

  let q = sb.from('notes').select('*').eq('user_id', user.id).order('updated_at', { ascending: false });
  if (search) q = q.or(`title.ilike.%${search}%,tags.cs.{${search}}`);
  const { data } = await q;
  return data ?? [];
}

export async function getById(id: string): Promise<Note | null> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();

  if (!user) return lsGet().find(n => n.id === id) ?? null;

  const { data } = await sb.from('notes').select('*').eq('id', id).eq('user_id', user.id).single();
  return data;
}

export async function create(title: string, content_md: string, tags: string[]): Promise<Note> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();

  if (!user) {
    const note: Note = { id: uid(), title, content_md, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    lsSet([note, ...lsGet()]);
    return note;
  }

  const { data, error } = await sb.from('notes').insert({ user_id: user.id, title, content_md, tags }).select().single();
  if (error) throw error;
  return data;
}

export async function update(id: string, patch: Partial<Pick<Note, 'title' | 'content_md' | 'tags'>>): Promise<void> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();

  if (!user) {
    lsSet(lsGet().map(n => n.id === id ? { ...n, ...patch, updated_at: new Date().toISOString() } : n));
    return;
  }

  await sb.from('notes').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', user.id);
}

export async function remove(id: string): Promise<void> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();

  if (!user) { lsSet(lsGet().filter(n => n.id !== id)); return; }

  await sb.from('notes').delete().eq('id', id).eq('user_id', user.id);
}
