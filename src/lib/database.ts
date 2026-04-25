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
    database:
      process.env.DB_DATABASE ||
      process.env.DB_NAME ||
      'clearfork-insurance',
    user: process.env.DB_USERNAME || process.env.DB_USER || 'clearfork_user',
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
    // Avoid BigInt in row values (breaks JSON.stringify in API routes)
    supportBigNumbers: true,
    bigNumberStrings: true,
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

/** MySQL ER_NO_SUCH_TABLE — used to degrade gracefully before migrations run. */
export function isMysqlNoSuchTableError(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "errno" in e &&
    (e as { errno?: number }).errno === 1146
  );
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
export type QuoteInsertExtraDriver = {
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  maritalStatus: string;
  gender: string;
  driverLicenseNumber: string;
};

export type QuoteInsertExtraVehicle = {
  vinNumber: string;
  vehicleUse: string;
  estimatedAnnualMileage: number;
};

export async function insertQuote(quoteData: {
  userId?: number;
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
  vinNumber?: string;
  vehicleUse?: string;
  estimatedAnnualMileage?: number;
  occupation?: string;
  militaryService?: boolean;
  isStudent?: boolean;
  extraDrivers?: QuoteInsertExtraDriver[];
  extraVehicles?: QuoteInsertExtraVehicle[];
  /** When set with `details_json` column, classifies the request (e.g. `auto`, `cyber`). */
  quoteType?: string | null;
  /** Type-specific fields for non-auto line quotes (JSON). */
  detailsJson?: Record<string, unknown> | null;
}): Promise<number> {
  const connection = await getConnection();
  const extraDrivers = quoteData.extraDrivers ?? [];
  const extraVehicles = quoteData.extraVehicles ?? [];

  try {
    await connection.beginTransaction();

    const insertSql = `
      INSERT INTO quote_requests (
        user_id, quote_type, details_json,
        first_name, last_name, date_of_birth, marital_status, gender,
        street_address, state, zip_code, phone_number, can_receive_texts,
        email_address, driver_license_number, social_security_number,
        additional_driver_first_name, additional_driver_last_name, additional_driver_dob,
        additional_driver_license, vin_number, vehicle_use, estimated_annual_mileage,
        occupation, military_service, is_student
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const detailsPayload =
      quoteData.detailsJson != null && Object.keys(quoteData.detailsJson).length > 0
        ? JSON.stringify(quoteData.detailsJson)
        : null;

    const params = [
      quoteData.userId || null,
      quoteData.quoteType ?? "auto",
      detailsPayload,
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
      null,
      null,
      null,
      null,
      quoteData.vinNumber || null,
      quoteData.vehicleUse || null,
      quoteData.estimatedAnnualMileage ?? null,
      quoteData.occupation || null,
      quoteData.militaryService ?? false,
      quoteData.isStudent || false,
    ];

    const [insertResult] = await connection.execute(insertSql, params);
    const insertId = (insertResult as mysql.ResultSetHeader).insertId;

    for (let i = 0; i < extraDrivers.length; i++) {
      const d = extraDrivers[i]!;
      await connection.execute(
        `INSERT INTO quote_request_extra_drivers (
          quote_request_id, sort_order, first_name, last_name, date_of_birth,
          marital_status, gender, driver_license_number
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          insertId,
          i,
          d.firstName,
          d.lastName,
          d.dateOfBirth,
          d.maritalStatus,
          d.gender,
          d.driverLicenseNumber,
        ],
      );
    }

    for (let j = 0; j < extraVehicles.length; j++) {
      const v = extraVehicles[j]!;
      await connection.execute(
        `INSERT INTO quote_request_extra_vehicles (
          quote_request_id, sort_order, vin_number, vehicle_use, estimated_annual_mileage
        ) VALUES (?, ?, ?, ?, ?)`,
        [insertId, j, v.vinNumber, v.vehicleUse, v.estimatedAnnualMileage],
      );
    }

    const quoteNumber = `QTE-${new Date().getFullYear()}-${String(insertId).padStart(6, "0")}`;
    await connection.execute("UPDATE quote_requests SET quote_number = ? WHERE id = ?", [
      quoteNumber,
      insertId,
    ]);

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