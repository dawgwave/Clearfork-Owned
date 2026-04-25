import { getConnection, isMysqlNoSuchTableError, query } from "./database";
import type { VlogEntry } from "@/types/vlog";

export type { VlogEntry } from "@/types/vlog";
export { toVlogPublicCard } from "./vlog-card";
export { normalizeYouTubeId, youtubeThumbFromId } from "./youtube-embed";

export interface VlogInput {
  title: string;
  excerpt?: string;
  video_embed_id: string;
  image_url?: string;
  author_name?: string;
  author_subtitle?: string;
  author_avatar_url?: string;
  external_href?: string;
  is_published?: boolean;
  sort_order?: number;
}

export interface VlogFilters {
  published_only?: boolean;
  search?: string;
}

export interface VlogPagination {
  page?: number;
  limit?: number;
}

export async function getAllVlogs(
  filters: VlogFilters = {},
  pagination: VlogPagination = {},
): Promise<{ vlogs: VlogEntry[]; total: number; hasMore: boolean }> {
  const { published_only = true, search } = filters;
  const { page = 1, limit = 20 } = pagination;
  const offset = (page - 1) * limit;

  const whereClauses: string[] = [];
  const params: unknown[] = [];

  if (published_only) {
    whereClauses.push("v.is_published = TRUE");
  }
  if (search) {
    whereClauses.push(
      "(v.title LIKE ? OR v.excerpt LIKE ? OR v.video_embed_id LIKE ?)",
    );
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  const where =
    whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

  const listSql = `
    SELECT v.*
    FROM vlog_entries v
    ${where}
    ORDER BY v.sort_order ASC, v.id ASC
    LIMIT ? OFFSET ?
  `;
  try {
    const vlogs = await query<VlogEntry>(listSql, [
      ...params,
      Number(limit),
      Number(offset),
    ]);

    const countSql = `SELECT COUNT(*) as total FROM vlog_entries v ${where}`;
    const [{ total }] = await query<{ total: number }>(countSql, params);

    return {
      vlogs,
      total,
      hasMore: offset + vlogs.length < total,
    };
  } catch (e) {
    if (isMysqlNoSuchTableError(e)) {
      return { vlogs: [], total: 0, hasMore: false };
    }
    throw e;
  }
}

export async function getVlogById(
  id: number,
  includeUnpublished = false,
): Promise<VlogEntry | null> {
  let w = "v.id = ?";
  const p: unknown[] = [id];
  if (!includeUnpublished) {
    w += " AND v.is_published = TRUE";
  }
  const rows = await query<VlogEntry>(
    `SELECT v.* FROM vlog_entries v WHERE ${w}`,
    p,
  );
  return rows[0] ?? null;
}

export async function createVlog(data: VlogInput): Promise<number> {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();
    const publishedAt = data.is_published ? formatDateForMySQL(new Date()) : null;
    const [result] = await connection.execute(
      `INSERT INTO vlog_entries (
        title, excerpt, video_embed_id, image_url, author_name, author_subtitle,
        author_avatar_url, external_href, is_published, published_at, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.title,
        data.excerpt?.trim() || null,
        data.video_embed_id.trim(),
        data.image_url?.trim() || null,
        data.author_name?.trim() || "The Insurance Blackbox",
        data.author_subtitle?.trim() || "YouTube",
        (data.author_avatar_url || "").trim() || "/images/david hargrove head shot_1761004385331.jpg",
        data.external_href?.trim() || null,
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

export async function updateVlog(
  id: number,
  data: Partial<VlogInput>,
): Promise<boolean> {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = (await connection.execute(
      "SELECT is_published FROM vlog_entries WHERE id = ?",
      [id],
    )) as [{ is_published: number | boolean }[], unknown];
    if (!rows.length) {
      throw new Error(`Vlog with ID ${id} not found`);
    }
    const wasUnpublished = !rows[0].is_published;

    const fields: string[] = [];
    const params: (string | number | null)[] = [];

    const set = (col: string, val: string | number | null) => {
      fields.push(`${col} = ?`);
      params.push(val);
    };

    if (data.title !== undefined) set("title", data.title);
    if (data.excerpt !== undefined) set("excerpt", data.excerpt?.trim() || null);
    if (data.video_embed_id !== undefined)
      set("video_embed_id", data.video_embed_id.trim());
    if (data.image_url !== undefined)
      set("image_url", data.image_url?.trim() || null);
    if (data.author_name !== undefined)
      set("author_name", data.author_name?.trim() || "The Insurance Blackbox");
    if (data.author_subtitle !== undefined)
      set("author_subtitle", data.author_subtitle?.trim() || "YouTube");
    if (data.author_avatar_url !== undefined)
      set("author_avatar_url", (data.author_avatar_url || "").trim() || "/images/david hargrove head shot_1761004385331.jpg");
    if (data.external_href !== undefined)
      set("external_href", data.external_href?.trim() || null);
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
      `UPDATE vlog_entries SET ${fields.join(", ")} WHERE id = ?`,
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

export async function deleteVlog(id: number): Promise<boolean> {
  const connection = await getConnection();
  try {
    const [result] = (await connection.execute(
      "DELETE FROM vlog_entries WHERE id = ?",
      [id],
    )) as [{ affectedRows: number }, unknown];
    return result.affectedRows > 0;
  } catch (e) {
    console.error("deleteVlog", e);
    return false;
  } finally {
    connection.release();
  }
}

function formatDateForMySQL(date: Date): string {
  return date.toISOString().slice(0, 19).replace("T", " ");
}
