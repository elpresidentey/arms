CREATE TABLE IF NOT EXISTS admin_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tokenHash" varchar NOT NULL UNIQUE,
  email varchar NOT NULL,
  role text NOT NULL DEFAULT 'admin',
  "createdByUserId" varchar NOT NULL,
  "usedByUserId" varchar,
  "expiresAt" timestamp NOT NULL,
  "usedAt" timestamp,
  "revokedAt" timestamp,
  note text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_invites_email ON admin_invites (email);
CREATE INDEX IF NOT EXISTS idx_admin_invites_expires_at ON admin_invites ("expiresAt");
