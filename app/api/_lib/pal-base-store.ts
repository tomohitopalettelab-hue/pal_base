import { sql } from '@vercel/postgres';
import { randomUUID } from 'crypto';

// ── Types ─────────────────────────────────────────────────────────────────────

export type PalBaseSettings = {
  id: string;
  paletteId: string;
  gbpAccessToken: string | null;
  gbpRefreshToken: string | null;
  gbpLocationId: string | null;
  lineChannelAccessToken: string | null;
  lineChannelSecret: string | null;
  lineDefaultRichMenuId: string | null;
  qrCodes: { label: string; url: string }[] | null;
  createdAt: string;
  updatedAt: string;
};

// ── Ensure Tables ─────────────────────────────────────────────────────────────

export const ensurePalBaseTables = async () => {
  await sql`
    CREATE TABLE IF NOT EXISTS pal_base_settings (
      id                          TEXT PRIMARY KEY,
      palette_id                  TEXT NOT NULL UNIQUE,
      gbp_access_token            TEXT,
      gbp_refresh_token           TEXT,
      gbp_location_id             TEXT,
      line_channel_access_token   TEXT,
      line_channel_secret         TEXT,
      line_default_rich_menu_id   TEXT,
      qr_codes                    TEXT,
      created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  // Add qr_codes column if missing (migration)
  try { await sql`ALTER TABLE pal_base_settings ADD COLUMN IF NOT EXISTS qr_codes TEXT`; } catch { /* already exists */ }
};

// ── Settings ──────────────────────────────────────────────────────────────────

const rowToSettings = (row: Record<string, unknown>): PalBaseSettings => ({
  id: String(row.id || ''),
  paletteId: String(row.palette_id || ''),
  gbpAccessToken: (row.gbp_access_token as string) || null,
  gbpRefreshToken: (row.gbp_refresh_token as string) || null,
  gbpLocationId: (row.gbp_location_id as string) || null,
  lineChannelAccessToken: (row.line_channel_access_token as string) || null,
  lineChannelSecret: (row.line_channel_secret as string) || null,
  lineDefaultRichMenuId: (row.line_default_rich_menu_id as string) || null,
  qrCodes: row.qr_codes ? JSON.parse(row.qr_codes as string) : null,
  createdAt: String(row.created_at || ''),
  updatedAt: String(row.updated_at || ''),
});

export const getSettingsByPaletteId = async (paletteId: string): Promise<PalBaseSettings | null> => {
  await ensurePalBaseTables();
  const pid = String(paletteId || '').trim().toUpperCase();
  const { rows } = await sql`SELECT * FROM pal_base_settings WHERE palette_id = ${pid} LIMIT 1`;
  return rows.length > 0 ? rowToSettings(rows[0]) : null;
};

export const upsertSettings = async (paletteId: string, data: Partial<Omit<PalBaseSettings, 'id' | 'paletteId' | 'createdAt' | 'updatedAt'>>): Promise<PalBaseSettings> => {
  await ensurePalBaseTables();
  const pid = String(paletteId || '').trim().toUpperCase();
  const existing = await getSettingsByPaletteId(pid);
  const id = existing?.id || randomUUID();

  const gbpAccessToken = data.gbpAccessToken !== undefined ? data.gbpAccessToken : (existing?.gbpAccessToken ?? null);
  const gbpRefreshToken = data.gbpRefreshToken !== undefined ? data.gbpRefreshToken : (existing?.gbpRefreshToken ?? null);
  const gbpLocationId = data.gbpLocationId !== undefined ? data.gbpLocationId : (existing?.gbpLocationId ?? null);
  const lineChannelAccessToken = data.lineChannelAccessToken !== undefined ? data.lineChannelAccessToken : (existing?.lineChannelAccessToken ?? null);
  const lineChannelSecret = data.lineChannelSecret !== undefined ? data.lineChannelSecret : (existing?.lineChannelSecret ?? null);
  const lineDefaultRichMenuId = data.lineDefaultRichMenuId !== undefined ? data.lineDefaultRichMenuId : (existing?.lineDefaultRichMenuId ?? null);
  const qrCodesJson = data.qrCodes !== undefined ? JSON.stringify(data.qrCodes) : (existing?.qrCodes ? JSON.stringify(existing.qrCodes) : null);

  await sql`
    INSERT INTO pal_base_settings (
      id, palette_id, gbp_access_token, gbp_refresh_token, gbp_location_id,
      line_channel_access_token, line_channel_secret, line_default_rich_menu_id, qr_codes
    ) VALUES (
      ${id}, ${pid}, ${gbpAccessToken}, ${gbpRefreshToken}, ${gbpLocationId},
      ${lineChannelAccessToken}, ${lineChannelSecret}, ${lineDefaultRichMenuId}, ${qrCodesJson}
    )
    ON CONFLICT (palette_id) DO UPDATE SET
      gbp_access_token          = EXCLUDED.gbp_access_token,
      gbp_refresh_token         = EXCLUDED.gbp_refresh_token,
      gbp_location_id           = EXCLUDED.gbp_location_id,
      line_channel_access_token = EXCLUDED.line_channel_access_token,
      line_channel_secret       = EXCLUDED.line_channel_secret,
      line_default_rich_menu_id = EXCLUDED.line_default_rich_menu_id,
      qr_codes                  = EXCLUDED.qr_codes,
      updated_at                = NOW()
  `;

  const result = await getSettingsByPaletteId(pid);
  return result!;
};
