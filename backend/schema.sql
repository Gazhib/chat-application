-- PostgreSQL schema for chat-application
-- Run once against your PG database to initialise all tables and indexes.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- pg_trgm enables fast ILIKE searches on the login column
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ────────────────────────────────────────────────
-- users
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email               TEXT        NOT NULL,
  login               TEXT        NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  role                TEXT        NOT NULL DEFAULT 'USER',
  password            TEXT        NOT NULL,
  is_verified         BOOLEAN     NOT NULL DEFAULT false,
  public_key          TEXT,
  key_version         INTEGER     NOT NULL DEFAULT 0,
  key_updated_at      TIMESTAMPTZ,
  description         TEXT,
  profile_picture     TEXT,
  verify_code         TEXT,
  verify_code_expires TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_uidx  ON users (email);
CREATE UNIQUE INDEX IF NOT EXISTS users_login_uidx  ON users (login);
CREATE        INDEX IF NOT EXISTS users_login_trgm  ON users USING gin (login gin_trgm_ops);

-- ────────────────────────────────────────────────
-- chats
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chats (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_type  TEXT        NOT NULL DEFAULT 'DIRECT',
  creator_id UUID        REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────
-- chat_members  (replaces the embedded membershipIds array)
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_members (
  chat_id       UUID        NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role          TEXT        NOT NULL DEFAULT 'MEMBER',
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_read_seq INTEGER,
  PRIMARY KEY (chat_id, user_id)
);

CREATE INDEX IF NOT EXISTS chat_members_user_id_idx ON chat_members (user_id);

-- ────────────────────────────────────────────────
-- messages
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id          UUID        NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id        UUID        NOT NULL REFERENCES users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  message_type     TEXT        NOT NULL DEFAULT 'txt',
  -- status (was an embedded document { delievered, read })
  status_delivered SMALLINT    NOT NULL DEFAULT 0,
  status_read      SMALLINT    NOT NULL DEFAULT 0,
  -- cipher (was an embedded document { iv, data })
  cipher_iv        TEXT,
  cipher_data      TEXT,
  enc_version      INTEGER     NOT NULL DEFAULT 1,
  picture          TEXT,
  finished_at      TIMESTAMPTZ,
  room_id          TEXT
);

CREATE INDEX IF NOT EXISTS messages_chat_created_idx ON messages (chat_id, created_at DESC);
CREATE INDEX IF NOT EXISTS messages_room_id_idx      ON messages (room_id) WHERE room_id IS NOT NULL;

-- ────────────────────────────────────────────────
-- call_rooms
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS call_rooms (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID        REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  room_id    TEXT        NOT NULL UNIQUE
);

-- ────────────────────────────────────────────────
-- call_room_members  (replaces the embedded membershipIds array)
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS call_room_members (
  call_room_id UUID NOT NULL REFERENCES call_rooms(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (call_room_id, user_id)
);

CREATE INDEX IF NOT EXISTS call_room_members_user_id_idx ON call_room_members (user_id);

-- ────────────────────────────────────────────────
-- devices  (schema-present but not yet used in app logic)
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS devices (
  id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID        REFERENCES users(id) ON DELETE CASCADE,
  pub_key   TEXT        NOT NULL,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
