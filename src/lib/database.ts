import mysql from 'mysql2/promise';

// Load environment variables if not already loaded
if (!process.env.DB_HOST && !process.env.NODE_ENV) {
  try {
    require('dotenv').config({ path: '.env.local' });
  } catch (error) {
    // dotenv not available, continue without it
  }
}

// Database connection configuration
function getConnectionConfig() {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    database: process.env.DB_DATABASE || 'clearfork-insurance',
    user: process.env.DB_USERNAME || 'clearfork_user',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true' ? {} : false,
    charset: 'utf8mb4',
  };
}

// Pool configuration (includes connection config + pool-specific options)
function getPoolConfig() {
  return {
    ...getConnectionConfig(),
        connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
        queueLimit: 0,
    // Remove invalid options: acquireTimeout and timeout are not valid mysql2 pool options
  };
}

// Connection pool for better performance
let pool: mysql.Pool | null = null;

/**
 * Get MySQL connection pool
 */
export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(getPoolConfig());
  }
  return pool;
}

/**
 * Get a single database connection
 */
export async function getConnection(): Promise<mysql.PoolConnection> {
  const pool = getPool();
  return await pool.getConnection();
}

/**
 * Execute a query with automatic connection management
 */
export async function query<T = any>(
  sql: string,
  params?: any[]
): Promise<T[]> {
  const connection = await getConnection();
  try {
    const [rows] = await connection.query(sql, params || []);
    return rows as T[];
  } finally {
    connection.release();
  }
}

/**
 * Insert a new quote record and return the inserted ID
 */
export async function insertQuote(quoteData: {
  userId?: number;  // Add user_id to link quote to authenticated user
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  maritalStatus?: string;
  gender?: string;
  streetAddress?: string;
  state?: string;
  zipCode?: string;
  phoneNumber?: string;
  canReceiveTexts?: boolean;
  emailAddress?: string;
  driverLicenseNumber?: string;
  socialSecurityNumber?: string;
  additionalDriverFirstName?: string;
  additionalDriverLastName?: string;
  additionalDriverDOB?: string;
  additionalDriverLicense?: string;
  vinNumber?: string;
  vehicleUse?: string;
  estimatedAnnualMileage?: number;
  occupation?: string;
  militaryService?: string;
  isStudent?: boolean;
}): Promise<number> {
  // First insert the record, then update quote_number based on the new ID
  const connection = await getConnection();
  
  try {
    await connection.beginTransaction();
    
    const insertSql = `
      INSERT INTO quote_requests (
        user_id, first_name, last_name, date_of_birth, marital_status, gender,
        street_address, state, zip_code, phone_number, can_receive_texts,
        email_address, driver_license_number, social_security_number,
        additional_driver_first_name, additional_driver_last_name, additional_driver_dob,
        additional_driver_license, vin_number, vehicle_use, estimated_annual_mileage,
        occupation, military_service, is_student
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  const params = [
    quoteData.userId || null,  // Can be NULL for anonymous submissions
    quoteData.firstName,
    quoteData.lastName,
    quoteData.dateOfBirth || null,
    quoteData.maritalStatus || null,
    quoteData.gender || null,
    quoteData.streetAddress || null,
    quoteData.state || null,
    quoteData.zipCode || null,
    quoteData.phoneNumber || null,
    quoteData.canReceiveTexts || false,
    quoteData.emailAddress || null,
    quoteData.driverLicenseNumber || null,
    quoteData.socialSecurityNumber || null,
    quoteData.additionalDriverFirstName || null,
    quoteData.additionalDriverLastName || null,
    quoteData.additionalDriverDOB || null,
    quoteData.additionalDriverLicense || null,
    quoteData.vinNumber || null,
    quoteData.vehicleUse || null,
    quoteData.estimatedAnnualMileage || null,
    quoteData.occupation || null,
    quoteData.militaryService || null,
    quoteData.isStudent || false,
  ];

    // Insert the record
    const [insertResult] = await connection.execute(insertSql, params);
    const insertId = (insertResult as mysql.ResultSetHeader).insertId;
    
    // Generate and update quote number
    const quoteNumber = `QTE-${new Date().getFullYear()}-${String(insertId).padStart(6, '0')}`;
    await connection.execute(
      'UPDATE quote_requests SET quote_number = ? WHERE id = ?',
      [quoteNumber, insertId]
    );
    
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
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const config = getConnectionConfig();
    
    // Debug: Log connection config (without password) only if debug mode
    if (process.env.DEBUG_MIGRATION) {
      console.log('🔍 Connection config:', {
        ...config,
        password: config.password ? '***hidden***' : 'EMPTY'
      });
    }
    
    // Test with direct connection first to isolate the issue
    const directConnection = await mysql.createConnection(config);
    await directConnection.ping();
    await directConnection.end();
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

/**
 * Close all database connections (for graceful shutdown)
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}