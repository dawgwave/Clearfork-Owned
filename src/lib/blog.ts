import { query, getConnection } from './database';

// Blog Post Types
export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  content_format: 'markdown' | 'html';
  author_id?: number;
  category?: string;
  tags: string[];
  featured_image_url?: string;
  meta_description?: string;
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BlogPostWithAuthor extends BlogPost {
  author_name?: string;
  author_email?: string;
}

export interface BlogPostInput {
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  content_format?: 'markdown' | 'html';
  author_id?: number;
  category?: string;
  tags?: string[];
  featured_image_url?: string;
  meta_description?: string;
  is_published?: boolean;
}

export interface BlogPostFilters {
  category?: string;
  tag?: string;
  author_id?: number;
  published_only?: boolean;
  search?: string;
}

export interface BlogPostPagination {
  page?: number;
  limit?: number;
}

/**
 * Get all blog posts with pagination and filters
 */
export async function getAllBlogPosts(
  filters: BlogPostFilters = {},
  pagination: BlogPostPagination = {}
): Promise<{ posts: BlogPostWithAuthor[]; total: number; hasMore: boolean }> {
  const {
    category,
    tag,
    author_id,
    published_only = true,
    search
  } = filters;
  
  const {
    page = 1,
    limit = 10
  } = pagination;
  
  const offset = (page - 1) * limit;
  let whereConditions = [];
  let params: any[] = [];
  
  if (published_only) {
    whereConditions.push('bp.is_published = TRUE');
  }
  
  if (category) {
    whereConditions.push('bp.category = ?');
    params.push(category);
  }
  
  if (author_id) {
    whereConditions.push('bp.author_id = ?');
    params.push(author_id);
  }
  
  if (tag) {
    whereConditions.push('JSON_CONTAINS(bp.tags, ?)');
    params.push(JSON.stringify(tag));
  }
  
  if (search) {
    whereConditions.push(`(
      bp.title LIKE ? OR 
      bp.excerpt LIKE ? OR 
      bp.content LIKE ?
    )`);
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
  
  // Get posts with author info
  const postsQuery = `
    SELECT 
      bp.*,
      u.first_name as author_name,
      u.email as author_email
    FROM blog_posts bp
    LEFT JOIN users u ON bp.author_id = u.id
    ${whereClause}
    ORDER BY bp.published_at DESC, bp.created_at DESC
    LIMIT ? OFFSET ?
  `;
  
  const finalParams = [...params, Number(limit), Number(offset)];
  const posts = await query<BlogPostWithAuthor>(postsQuery, finalParams);
  
  // Parse JSON tags
  const processedPosts = posts.map(post => ({
    ...post,
    tags: typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags || []
  }));
  
  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM blog_posts bp
    LEFT JOIN users u ON bp.author_id = u.id
    ${whereClause}
  `;
  
  const [{ total }] = await query<{ total: number }>(countQuery, params);
  
  return {
    posts: processedPosts,
    total,
    hasMore: offset + posts.length < total
  };
}

/**
 * Get a single blog post by slug
 */
export async function getBlogPostBySlug(slug: string, includeUnpublished = false): Promise<BlogPostWithAuthor | null> {
  let whereClause = 'bp.slug = ?';
  const params = [slug];
  
  if (!includeUnpublished) {
    whereClause += ' AND bp.is_published = TRUE';
  }
  
  const posts = await query<BlogPostWithAuthor>(
    `SELECT 
      bp.*,
      u.first_name as author_name,
      u.email as author_email
    FROM blog_posts bp
    LEFT JOIN users u ON bp.author_id = u.id
    WHERE ${whereClause}`,
    params
  );
  
  if (posts.length === 0) return null;
  
  const post = posts[0];
  return {
    ...post,
    tags: typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags || []
  };
}

/**
 * Get a single blog post by ID
 */
export async function getBlogPostById(id: number, includeUnpublished = false): Promise<BlogPostWithAuthor | null> {
  let whereClause = 'bp.id = ?';
  const params = [id];
  
  if (!includeUnpublished) {
    whereClause += ' AND bp.is_published = TRUE';
  }
  
  const posts = await query<BlogPostWithAuthor>(
    `SELECT 
      bp.*,
      u.first_name as author_name,
      u.email as author_email
    FROM blog_posts bp
    LEFT JOIN users u ON bp.author_id = u.id
    WHERE ${whereClause}`,
    params
  );
  
  if (posts.length === 0) return null;
  
  const post = posts[0];
  return {
    ...post,
    tags: typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags || []
  };
}

/**
 * Create a new blog post
 */
export async function createBlogPost(postData: BlogPostInput): Promise<number> {
  const connection = await getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Generate slug from title if not provided
    const slug = postData.slug || generateSlugFromTitle(postData.title);
    
    // Check if slug already exists
    const [existingPost] = await connection.execute(
      'SELECT id FROM blog_posts WHERE slug = ?',
      [slug]
    ) as any;
    
    if (existingPost.length > 0) {
      throw new Error(`Blog post with slug "${slug}" already exists`);
    }
    
    const insertSql = `
      INSERT INTO blog_posts (
        slug, title, excerpt, content, content_format, author_id, category, tags,
        featured_image_url, meta_description, is_published, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const published_at = postData.is_published ? formatDateForMySQL(new Date()) : null;
    
    const params = [
      slug,
      postData.title,
      postData.excerpt || null,
      postData.content,
      postData.content_format || 'markdown',
      postData.author_id || null,
      postData.category || null,
      JSON.stringify(postData.tags || []),
      postData.featured_image_url || null,
      postData.meta_description || null,
      postData.is_published || false,
      published_at
    ];
    
    const [insertResult] = await connection.execute(insertSql, params);
    const insertId = (insertResult as any).insertId;
    
    await connection.commit();
    return insertId;
    
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Update an existing blog post
 */
export async function updateBlogPost(id: number, postData: Partial<BlogPostInput>): Promise<boolean> {
  const connection = await getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Check if post exists
    const [existingPost] = await connection.execute(
      'SELECT slug, is_published FROM blog_posts WHERE id = ?',
      [id]
    ) as any;
    
    if (existingPost.length === 0) {
      throw new Error(`Blog post with ID ${id} not found`);
    }
    
    // Check if slug already exists (if being changed)
    if (postData.slug && postData.slug !== existingPost[0].slug) {
      const [slugCheck] = await connection.execute(
        'SELECT id FROM blog_posts WHERE slug = ? AND id != ?',
        [postData.slug, id]
      ) as any;
      
      if (slugCheck.length > 0) {
        throw new Error(`Blog post with slug "${postData.slug}" already exists`);
      }
    }
    
    const updateFields = [];
    const params = [];
    
    if (postData.slug !== undefined) {
      updateFields.push('slug = ?');
      params.push(postData.slug);
    }
    if (postData.title !== undefined) {
      updateFields.push('title = ?');
      params.push(postData.title);
    }
    if (postData.excerpt !== undefined) {
      updateFields.push('excerpt = ?');
      params.push(postData.excerpt);
    }
    if (postData.content !== undefined) {
      updateFields.push('content = ?');
      params.push(postData.content);
    }
    if (postData.content_format !== undefined) {
      updateFields.push('content_format = ?');
      params.push(postData.content_format);
    }
    if (postData.author_id !== undefined) {
      updateFields.push('author_id = ?');
      params.push(postData.author_id);
    }
    if (postData.category !== undefined) {
      updateFields.push('category = ?');
      params.push(postData.category);
    }
    if (postData.tags !== undefined) {
      updateFields.push('tags = ?');
      params.push(JSON.stringify(postData.tags));
    }
    if (postData.featured_image_url !== undefined) {
      updateFields.push('featured_image_url = ?');
      params.push(postData.featured_image_url);
    }
    if (postData.meta_description !== undefined) {
      updateFields.push('meta_description = ?');
      params.push(postData.meta_description);
    }
    if (postData.is_published !== undefined) {
      updateFields.push('is_published = ?');
      params.push(postData.is_published);
      
      // Set published_at if publishing for the first time
      if (postData.is_published && !existingPost[0].is_published) {
        updateFields.push('published_at = ?');
        params.push(formatDateForMySQL(new Date()));
      }
    }
    
    if (updateFields.length === 0) {
      await connection.commit();
      return true; // Nothing to update
    }
    
    const updateSql = `UPDATE blog_posts SET ${updateFields.join(', ')} WHERE id = ?`;
    params.push(id);
    
    await connection.execute(updateSql, params);
    await connection.commit();
    return true;
    
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Delete a blog post
 */
export async function deleteBlogPost(id: number): Promise<boolean> {
  const connection = await getConnection();
  
  try {
    const [result] = await connection.execute(
      'DELETE FROM blog_posts WHERE id = ?',
      [id]
    ) as any;
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Failed to delete blog post:', error);
    return false;
  } finally {
    connection.release();
  }
}

/**
 * Get categories with post counts
 */
export async function getBlogCategories(): Promise<{ category: string; count: number }[]> {
  const categories = await query<{ category: string; count: number }>(
    `SELECT 
      category,
      COUNT(*) as count
    FROM blog_posts 
    WHERE is_published = TRUE AND category IS NOT NULL AND category != ''
    GROUP BY category 
    ORDER BY count DESC, category ASC`
  );
  
  return categories;
}

/**
 * Get all tags with usage counts
 */
export async function getBlogTags(): Promise<{ tag: string; count: number }[]> {
  const posts = await query<{ tags: string }>(
    'SELECT tags FROM blog_posts WHERE is_published = TRUE AND tags IS NOT NULL'
  );
  
  const tagCounts: { [tag: string]: number } = {};
  
  posts.forEach(post => {
    try {
      const tags = typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags;
      if (Array.isArray(tags)) {
        tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    } catch (e) {
      // Skip invalid JSON
    }
  });
  
  return Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/**
 * Record a blog post view (for analytics)
 */
export async function recordBlogPostView(
  blogPostId: number,
  userId?: number,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    await query(
      `INSERT INTO blog_post_views (blog_post_id, user_id, ip_address, user_agent) 
       VALUES (?, ?, ?, ?)`,
      [blogPostId, userId || null, ipAddress || null, userAgent || null]
    );
  } catch (error) {
    // Don't throw errors for view tracking
    console.error('Failed to record blog post view:', error);
  }
}

/**
 * Generate URL-friendly slug from title
 */
function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Replace multiple hyphens with single
    .trim();
}

/**
 * Format date for MySQL TIMESTAMP format (YYYY-MM-DD HH:MM:SS)
 */
function formatDateForMySQL(date: Date): string {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}