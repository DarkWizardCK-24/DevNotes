-- ============================================================
-- DevNotes — Supabase Schema (standalone)
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Shared trigger ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── Notebooks (folders) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS notebooks (
  id         UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT    NOT NULL,
  color      TEXT    DEFAULT '#4d8cff',
  icon       TEXT    DEFAULT '📁',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_notebooks_updated_at
  BEFORE UPDATE ON notebooks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_notebooks_user ON notebooks(user_id);

-- ── Notes ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notes (
  id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notebook_id UUID    REFERENCES notebooks(id) ON DELETE SET NULL,
  title       TEXT    NOT NULL,
  content_md  TEXT    DEFAULT '',
  tags        TEXT[]  DEFAULT '{}',
  pinned      BOOLEAN DEFAULT FALSE,
  archived    BOOLEAN DEFAULT FALSE,
  color       TEXT    DEFAULT '',
  word_count  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_notes_user        ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_notebook    ON notes(notebook_id) WHERE notebook_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notes_updated     ON notes(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_pinned      ON notes(user_id, pinned) WHERE pinned = true;
CREATE INDEX IF NOT EXISTS idx_notes_tags        ON notes USING gin(tags);

-- ── Note versions (revision history) ────────────────────────
CREATE TABLE IF NOT EXISTS note_versions (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id    UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_md TEXT NOT NULL,
  title      TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_note_versions_note ON note_versions(note_id, created_at DESC);

-- ── Tags (normalized, for autocomplete) ──────────────────────
CREATE TABLE IF NOT EXISTS note_tags (
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tag        TEXT NOT NULL,
  use_count  INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id, tag)
);

-- ── Row Level Security ───────────────────────────────────────
ALTER TABLE notebooks     ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_tags     ENABLE ROW LEVEL SECURITY;

-- All tables: strictly owner-only (notes are private)
CREATE POLICY "notebooks_owner"     ON notebooks     FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "notes_owner"         ON notes         FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "note_versions_owner" ON note_versions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "note_tags_owner"     ON note_tags     FOR ALL USING (auth.uid() = user_id);

-- ── Helper: update tag counts on note change ─────────────────
CREATE OR REPLACE FUNCTION sync_note_tags()
RETURNS TRIGGER AS $$
DECLARE
  tag TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    FOREACH tag IN ARRAY OLD.tags LOOP
      UPDATE note_tags SET use_count = use_count - 1
      WHERE user_id = OLD.user_id AND note_tags.tag = tag;
      DELETE FROM note_tags WHERE user_id = OLD.user_id AND note_tags.tag = tag AND use_count <= 0;
    END LOOP;
    RETURN OLD;
  END IF;

  IF TG_OP = 'INSERT' THEN
    FOREACH tag IN ARRAY NEW.tags LOOP
      INSERT INTO note_tags(user_id, tag, use_count)
      VALUES (NEW.user_id, tag, 1)
      ON CONFLICT (user_id, tag) DO UPDATE SET use_count = note_tags.use_count + 1;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notes_sync_tags
  AFTER INSERT OR DELETE ON notes
  FOR EACH ROW EXECUTE FUNCTION sync_note_tags();
