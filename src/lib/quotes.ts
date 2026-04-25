import { query, getConnection } from './database';

// Types
export interface Quote {
  id: number;
  user_id?: number;
  assigned_agent_id?: number;
  first_name: string;
  last_name: string;
  email_address?: string;
  phone_number?: string;
  quote_number: string;
  /** e.g. `auto`, `cyber`, `home` — see `QUOTE_TYPE_LABEL` in quote-line-schemas. */
  quote_type?: string | null;
  /** Line-quote type-specific answers (JSON). */
  details_json?: unknown;
  status: 'New' | 'In Review' | 'Quoted' | 'Accepted' | 'Declined' | 'Expired' | 'Cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  internal_notes?: string;
  submitted_at: string;
  updated_at: string;
}

export interface QuoteWithDetails extends Quote {
  date_of_birth?: string;
  marital_status?: string;
  gender?: string;
  street_address?: string;
  state?: string;
  zip_code?: string;
  can_receive_texts?: boolean;
  driver_license_number?: string;
  social_security_number?: string;
  additional_driver_first_name?: string;
  additional_driver_last_name?: string;
  additional_driver_dob?: string;
  additional_driver_license?: string;
  vin_number?: string;
  vehicle_use?: string;
  estimated_annual_mileage?: number;
  occupation?: string;
  military_service?: string;
  is_student?: boolean;
  user_email?: string;
  user_name?: string;
  agent_name?: string;
  extra_drivers?: QuoteExtraDriverRow[];
  extra_vehicles?: QuoteExtraVehicleRow[];
}

export interface QuoteExtraDriverRow {
  id: number;
  quote_request_id: number;
  sort_order: number;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  marital_status: string | null;
  gender: string | null;
  driver_license_number: string | null;
  created_at: string;
}

export interface QuoteExtraVehicleRow {
  id: number;
  quote_request_id: number;
  sort_order: number;
  vin_number: string;
  vehicle_use: string | null;
  estimated_annual_mileage: number | null;
  created_at: string;
}

export interface Chat {
  id: number;
  quote_id: number;
  status: 'active' | 'closed' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: number;
  chat_id: number;
  sender_id: number;
  message_type: 'text' | 'system' | 'quote_update';
  message: string;
  metadata?: any;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
  sender_name?: string;
  sender_email?: string;
  attachments?: ChatAttachment[];
}

export interface ChatAttachment {
  id: number;
  message_id: number;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  mime_type: string;
  upload_by: number;
  created_at: string;
}

export interface QuoteUpdate {
  id: number;
  quote_id: number;
  updated_by: number;
  field_name: string;
  old_value?: string;
  new_value?: string;
  notes?: string;
  created_at: string;
  updated_by_name?: string;
}

/**
 * Get all quotes with pagination and filters (admin view)
 */
export async function getAllQuotes(options: {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  search?: string;
  assigned_agent_id?: number;
  quote_type?: string;
} = {}): Promise<{ quotes: QuoteWithDetails[]; total: number; hasMore: boolean }> {
  const {
    page = 1,
    limit = 20,
    status,
    priority,
    search,
    assigned_agent_id,
    quote_type,
  } = options;
  
  const offset = (page - 1) * limit;
  let whereConditions = [];
  let params: any[] = [];
  
  if (status) {
    whereConditions.push('q.status = ?');
    params.push(status);
  }
  
  if (priority) {
    whereConditions.push('q.priority = ?');
    params.push(priority);
  }
  
  if (assigned_agent_id) {
    whereConditions.push('q.assigned_agent_id = ?');
    params.push(assigned_agent_id);
  }

  if (quote_type) {
    whereConditions.push('q.quote_type = ?');
    params.push(quote_type);
  }

  if (search) {
    whereConditions.push(`(
      q.quote_number LIKE ? OR 
      q.first_name LIKE ? OR 
      q.last_name LIKE ? OR 
      q.email_address LIKE ? OR
      CONCAT(q.first_name, ' ', q.last_name) LIKE ?
    )`);
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
  }
  
  const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
  
  // Get quotes
  const quotesQuery = `
    SELECT 
      q.*,
      u.email as user_email,
      COALESCE(CONCAT(u.first_name, ' ', u.last_name), '') as user_name,
      COALESCE(CONCAT(a.first_name, ' ', a.last_name), '') as agent_name
    FROM quote_requests q
    LEFT JOIN users u ON q.user_id = u.id
    LEFT JOIN users a ON q.assigned_agent_id = a.id
    ${whereClause}
    ORDER BY q.submitted_at DESC
    LIMIT ? OFFSET ?
  `;
  
  const finalParams = [...params, Number(limit), Number(offset)];
  const quotes = await query<QuoteWithDetails>(quotesQuery, finalParams);
  
  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM quote_requests q
    LEFT JOIN users u ON q.user_id = u.id
    LEFT JOIN users a ON q.assigned_agent_id = a.id
    ${whereClause}
  `;
  
  const [{ total }] = await query<{ total: number }>(countQuery, params);
  
  return {
    quotes,
    total,
    hasMore: offset + quotes.length < total
  };
}

/**
 * Get quotes for a specific user
 */
export async function getUserQuotes(userId: number): Promise<Quote[]> {
  const quotes = await query<Quote>(
    `SELECT 
      id, user_id, assigned_agent_id, first_name, last_name, email_address, 
      phone_number, quote_number, quote_type, status, priority, submitted_at, updated_at
    FROM quote_requests 
    WHERE user_id = ? 
    ORDER BY submitted_at DESC`,
    [userId]
  );
  
  return quotes;
}

/**
 * Get a single quote by ID with full details
 */
export async function getQuoteById(quoteId: number, includePersonalData = false): Promise<QuoteWithDetails | null> {
  const selectFields = includePersonalData 
    ? 'q.*'
    : `q.id, q.user_id, q.assigned_agent_id, q.first_name, q.last_name, 
       q.email_address, q.phone_number, q.quote_number, q.status, q.priority, 
       q.internal_notes, q.submitted_at, q.updated_at`;
  
  const quotes = await query<QuoteWithDetails>(
    `SELECT 
      ${selectFields},
      u.email as user_email,
      CONCAT(u.first_name, ' ', u.last_name) as user_name,
      CONCAT(a.first_name, ' ', a.last_name) as agent_name
    FROM quote_requests q
    LEFT JOIN users u ON q.user_id = u.id
    LEFT JOIN users a ON q.assigned_agent_id = a.id
    WHERE q.id = ?`,
    [quoteId]
  );
  
  if (quotes.length === 0) return null;
  const row = quotes[0]!;
  const [extra_drivers, extra_vehicles] = await Promise.all([
    query<QuoteExtraDriverRow>(
      "SELECT * FROM quote_request_extra_drivers WHERE quote_request_id = ? ORDER BY sort_order ASC, id ASC",
      [quoteId]
    ),
    query<QuoteExtraVehicleRow>(
      "SELECT * FROM quote_request_extra_vehicles WHERE quote_request_id = ? ORDER BY sort_order ASC, id ASC",
      [quoteId]
    ),
  ]);
  row.extra_drivers = extra_drivers;
  row.extra_vehicles = extra_vehicles;
  return row;
}

/**
 * Permanently remove a quote request and dependent rows (FK CASCADE: chats, extras, etc.).
 */
export async function deleteQuoteRequest(quoteId: number): Promise<boolean> {
  const connection = await getConnection();
  try {
    const [result] = await connection.execute('DELETE FROM quote_requests WHERE id = ?', [
      quoteId,
    ]) as any;
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Failed to delete quote request:', error);
    return false;
  } finally {
    connection.release();
  }
}

/**
 * Update quote status and create audit log
 */
export async function updateQuoteStatus(
  quoteId: number, 
  status: Quote['status'], 
  updatedBy: number,
  notes?: string
): Promise<boolean> {
  const connection = await getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Get current status
    const [currentQuote] = await connection.execute(
      'SELECT status FROM quote_requests WHERE id = ?',
      [quoteId]
    ) as any;
    
    if (!currentQuote.length) {
      throw new Error('Quote not found');
    }
    
    const oldStatus = currentQuote[0].status;
    
    // Update quote
    await connection.execute(
      'UPDATE quote_requests SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, quoteId]
    );
    
    // Log the update
    await connection.execute(
      `INSERT INTO quote_updates (quote_id, updated_by, field_name, old_value, new_value, notes)
       VALUES (?, ?, 'status', ?, ?, ?)`,
      [quoteId, updatedBy, oldStatus, status, notes || null]
    );
    
    // Create system message in chat
    const [chatRows] = await connection.execute(
      'SELECT id FROM chats WHERE quote_id = ?',
      [quoteId]
    ) as any;
    
    if (chatRows.length > 0) {
      const chatId = chatRows[0].id;
      await connection.execute(
        `INSERT INTO chat_messages (chat_id, sender_id, message_type, message, metadata)
         VALUES (?, ?, 'system', ?, ?)`,
        [
          chatId, 
          updatedBy, 
          `Quote status updated from "${oldStatus}" to "${status}"`,
          JSON.stringify({ old_status: oldStatus, new_status: status, notes })
        ]
      );
    }
    
    await connection.commit();
    return true;
    
  } catch (error) {
    await connection.rollback();
    console.error('Failed to update quote status:', error);
    return false;
  } finally {
    connection.release();
  }
}

/**
 * Assign quote to an agent
 */
export async function assignQuote(
  quoteId: number,
  agentId: number,
  assignedBy: number
): Promise<boolean> {
  const connection = await getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Get current assignment
    const [currentQuote] = await connection.execute(
      'SELECT assigned_agent_id FROM quote_requests WHERE id = ?',
      [quoteId]
    ) as any;
    
    if (!currentQuote.length) {
      throw new Error('Quote not found');
    }
    
    const oldAgentId = currentQuote[0].assigned_agent_id;
    
    // Update assignment
    await connection.execute(
      'UPDATE quote_requests SET assigned_agent_id = ?, updated_at = NOW() WHERE id = ?',
      [agentId, quoteId]
    );
    
    // Log the assignment
    await connection.execute(
      `INSERT INTO quote_updates (quote_id, updated_by, field_name, old_value, new_value)
       VALUES (?, ?, 'assigned_agent_id', ?, ?)`,
      [quoteId, assignedBy, oldAgentId, agentId]
    );
    
    await connection.commit();
    return true;
    
  } catch (error) {
    await connection.rollback();
    console.error('Failed to assign quote:', error);
    return false;
  } finally {
    connection.release();
  }
}

/**
 * Get or create chat for a quote
 */
export async function getQuoteChat(quoteId: number): Promise<Chat | null> {
  const chats = await query<Chat>(
    'SELECT * FROM chats WHERE quote_id = ?',
    [quoteId]
  );
  
  if (chats.length > 0) {
    return chats[0];
  }
  
  // Create chat if it doesn't exist
  const connection = await getConnection();
  try {
    const [result] = await connection.execute(
      'INSERT INTO chats (quote_id) VALUES (?)',
      [quoteId]
    ) as any;
    
    return {
      id: result.insertId,
      quote_id: quoteId,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to create chat:', error);
    return null;
  } finally {
    connection.release();
  }
}

/**
 * Get chat messages with pagination
 */
export async function getChatMessages(
  chatId: number,
  options: { page?: number; limit?: number; includeInternal?: boolean } = {}
): Promise<{ messages: ChatMessage[]; hasMore: boolean }> {
  const { page = 1, limit = 50, includeInternal = false } = options;
  const offset = (page - 1) * limit;
  
  const internalFilter = includeInternal ? '' : 'AND cm.is_internal = FALSE';
  
  const messages = await query<ChatMessage>(
    `SELECT 
      cm.*,
      CONCAT(u.first_name, ' ', u.last_name) as sender_name,
      u.email as sender_email
    FROM chat_messages cm
    LEFT JOIN users u ON cm.sender_id = u.id
    WHERE cm.chat_id = ? ${internalFilter}
    ORDER BY cm.created_at ASC
    LIMIT ? OFFSET ?`,
    [chatId, limit + 1, offset]
  );
  
  const hasMore = messages.length > limit;
  if (hasMore) messages.pop(); // Remove the extra record
  
  // Get attachments for each message
  for (const message of messages) {
    const attachments = await query<ChatAttachment>(
      'SELECT * FROM chat_attachments WHERE message_id = ?',
      [message.id]
    );
    message.attachments = attachments;
  }
  
  return { messages, hasMore };
}

/**
 * Send a chat message
 */
export async function sendChatMessage(
  chatId: number,
  senderId: number,
  message: string,
  messageType: 'text' | 'system' | 'quote_update' = 'text',
  isInternal = false,
  metadata?: any
): Promise<ChatMessage | null> {
  const connection = await getConnection();
  
  try {
    const [result] = await connection.execute(
      `INSERT INTO chat_messages (chat_id, sender_id, message_type, message, metadata, is_internal)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [chatId, senderId, messageType, message, metadata ? JSON.stringify(metadata) : null, isInternal]
    ) as any;
    
    // Update chat timestamp
    await connection.execute(
      'UPDATE chats SET updated_at = NOW() WHERE id = ?',
      [chatId]
    );
    
    // Get the created message with sender info
    const [messageData] = await query<ChatMessage>(
      `SELECT 
        cm.*,
        CONCAT(u.first_name, ' ', u.last_name) as sender_name,
        u.email as sender_email
      FROM chat_messages cm
      LEFT JOIN users u ON cm.sender_id = u.id
      WHERE cm.id = ?`,
      [result.insertId]
    );
    
    return messageData || null;
    
  } catch (error) {
    console.error('Failed to send message:', error);
    return null;
  } finally {
    connection.release();
  }
}