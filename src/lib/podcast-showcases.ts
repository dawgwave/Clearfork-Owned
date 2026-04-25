import { getConnection, isMysqlNoSuchTableError, query } from "./database";
import type { PodcastShowcaseRow } from "@/types/podcast-showcase";

export type { PodcastShowcaseRow } from "@/types/podcast-showcase";
export { rowToShowcase } from "./podcast-showcase-card";

export interface PodcastShowcaseInput {
  public_slug?: string;
  title: string;
  excerpt?: string;
  image_url: string;
  avatar_url: string;
  author_name: string;
  author_subtitle: string;
  listen_url: string;
  audio_url?: string;
  is_published?: boolean;
  sort_order?: number;
}

export interface PodcastShowcaseFilters {
  published_only?: boolean;
  search?: string;
}

export async function getAllPodcastShowcases(
  filters: PodcastShowcaseFilters = {},
  pagination: { page?: number; limit?: number } = {},
): Promise<{
  showcases: PodcastShowcaseRow[];
  total: number;
  hasMore: boolean;
}> {
  const { published_only = true, search } = filters;
  const { page = 1, limit = 20 } = pagination;
  const offset = (page - 1) * limit;

  const whereClauses: string[] = [];
  const params: unknown[] = [];
  if (published_only) whereClauses.push("p.is_published = TRUE");
  if (search) {
    whereClauses.push(
      "(p.title LIKE ? OR p.excerpt LIKE ? OR p.author_name LIKE ? OR p.public_slug LIKE ?)",
    );
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }
  const where =
    whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

  try {
    const showcases = await query<PodcastShowcaseRow>(
      `SELECT p.* FROM podcast_showcases p
     ${where}
     ORDER BY p.sort_order ASC, p.id ASC
     LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)],
    );

    const [{ total }] = await query<{ total: number }>(
      `SELECT COUNT(*) as total FROM podcast_showcases p ${where}`,
      params,
    );

    return {
      showcases,
      total,
      hasMore: offset + showcases.length < total,
    };
  } catch (e) {
    if (isMysqlNoSuchTableError(e)) {
      return { showcases: [], total: 0, hasMore: false };
    }
    throw e;
  }
}

export async function getShowcaseById(
  id: number,
  includeUnpublished = false,
): Promise<PodcastShowcaseRow | null> {
  let w = "p.id = ?";
  const p: unknown[] = [id];
  if (!includeUnpublished) w += " AND p.is_published = TRUE";
  const rows = await query<PodcastShowcaseRow>(
    `SELECT p.* FROM podcast_showcases p WHERE ${w}`,
    p,
  );
  return rows[0] ?? null;
}

export async function createPodcastShowcase(
  data: PodcastShowcaseInput,
): Promise<number> {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();
    const publishedAt = data.is_published ? formatDateForMySQL(new Date()) : null;
    if (data.public_slug?.trim()) {
      const [dupe] = (await connection.execute(
        "SELECT id FROM podcast_showcases WHERE public_slug = ?",
        [data.public_slug.trim()],
      )) as [{ id: number }[], unknown];
      if (dupe.length) {
        throw new Error(
          `Podcast showcase with public slug "${data.public_slug}" already exists`,
        );
      }
    }
    const [result] = await connection.execute(
      `INSERT INTO podcast_showcases (
        public_slug, title, excerpt, image_url, avatar_url, author_name, author_subtitle,
        listen_url, audio_url, is_published, published_at, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.public_slug?.trim() || null,
        data.title,
        data.excerpt?.trim() || null,
        data.image_url.trim(),
        data.avatar_url.trim(),
        data.author_name,
        data.author_subtitle,
        data.listen_url.trim(),
        data.audio_url?.trim() || null,
        data.is_published ? 1 : 0,
        publishedAt,
        data.sort_order ?? 0,
      ],
    );
    const insertId = (result as { insertId: number }).insertId;
    await connection.commit();
    return insertId;
  } catch (e) {
    await connection.rollback();
    throw e;
  } finally {
    connection.release();
  }
}

export async function updatePodcastShowcase(
  id: number,
  data: Partial<PodcastShowcaseInput>,
): Promise<boolean> {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();
    const [ex] = (await connection.execute(
      "SELECT is_published, public_slug FROM podcast_showcases WHERE id = ?",
      [id],
    )) as [
      { is_published: number | boolean; public_slug: string | null }[],
      unknown,
    ];
    if (!ex.length) throw new Error(`Podcast showcase with ID ${id} not found`);
    const wasUnpublished = !ex[0].is_published;

    if (data.public_slug !== undefined && data.public_slug?.trim()) {
      const [slugCheck] = (await connection.execute(
        "SELECT id FROM podcast_showcases WHERE public_slug = ? AND id != ?",
        [data.public_slug.trim(), id],
      )) as [{ id: number }[], unknown];
      if (slugCheck.length) {
        throw new Error(
          `Podcast showcase with public slug "${data.public_slug}" already exists`,
        );
      }
    }

    const fields: string[] = [];
    const params: (string | number | null)[] = [];
    const set = (col: string, val: string | number | null) => {
      fields.push(`${col} = ?`);
      params.push(val);
    };
    if (data.public_slug !== undefined)
      set("public_slug", data.public_slug?.trim() || null);
    if (data.title !== undefined) set("title", data.title);
    if (data.excerpt !== undefined) set("excerpt", data.excerpt?.trim() || null);
    if (data.image_url !== undefined) set("image_url", data.image_url.trim());
    if (data.avatar_url !== undefined) set("avatar_url", data.avatar_url.trim());
    if (data.author_name !== undefined) set("author_name", data.author_name);
    if (data.author_subtitle !== undefined)
      set("author_subtitle", data.author_subtitle);
    if (data.listen_url !== undefined) set("listen_url", data.listen_url.trim());
    if (data.audio_url !== undefined) set("audio_url", data.audio_url?.trim() || null);
    if (data.sort_order !== undefined) set("sort_order", data.sort_order);
    if (data.is_published !== undefined) {
      set("is_published", data.is_published ? 1 : 0);
      if (data.is_published && wasUnpublished) {
        set("published_at", formatDateForMySQL(new Date()));
      }
    }

    if (fields.length === 0) {
      await connection.commit();
      return true;
    }
    params.push(id);
    await connection.execute(
      `UPDATE podcast_showcases SET ${fields.join(", ")} WHERE id = ?`,
      params,
    );
    await connection.commit();
    return true;
  } catch (e) {
    await connection.rollback();
    throw e;
  } finally {
    connection.release();
  }
}

export async function deletePodcastShowcase(id: number): Promise<boolean> {
  const connection = await getConnection();
  try {
    const [result] = (await connection.execute(
      "DELETE FROM podcast_showcases WHERE id = ?",
      [id],
    )) as [{ affectedRows: number }, unknown];
    return result.affectedRows > 0;
  } catch (e) {
    console.error("deletePodcastShowcase", e);
    return false;
  } finally {
    connection.release();
  }
}

function formatDateForMySQL(date: Date): string {
  return date.toISOString().slice(0, 19).replace("T", " ");
}
