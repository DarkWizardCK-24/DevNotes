export type Note = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

const KEY = 'devnotes_notes';

function load(): Note[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]'); } catch { return []; }
}

function save(notes: Note[]) {
  localStorage.setItem(KEY, JSON.stringify(notes));
}

export function getAll(): Note[] {
  return load().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getById(id: string): Note | undefined {
  return load().find(n => n.id === id);
}

export function create(data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note {
  const notes = load();
  const note: Note = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  notes.unshift(note);
  save(notes);
  return note;
}

export function update(id: string, data: Partial<Omit<Note, 'id' | 'createdAt'>>): Note | null {
  const notes = load();
  const idx = notes.findIndex(n => n.id === id);
  if (idx === -1) return null;
  notes[idx] = { ...notes[idx], ...data, updatedAt: new Date().toISOString() };
  save(notes);
  return notes[idx];
}

export function remove(id: string): void {
  save(load().filter(n => n.id !== id));
}
