import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { query, getConnection } from './database';

// Types
export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  email_verified: boolean;
  last_login_at?: string;
  created_at: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: Record<string, string[]>;
}

export interface UserWithRoles extends User {
  roles: Role[];
}

export interface AuthError {
  message: string;
  field?: string;
}

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const BCRYPT_ROUNDS = 12;

if (!JWT_SECRET || JWT_SECRET === 'your-secret-key-change-in-production') {
  console.warn('Warning: Using default JWT_SECRET. Please set a secure JWT_SECRET in production.');
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT token
 */
export function generateToken(payload: object): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): any {
  try {
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }
    return jwt.verify(token, JWT_SECRET as string);
  } catch (error) {
    return null;
  }
}

/**
 * Create a new user
 */
export async function createUser(data: {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}): Promise<{ user: User; error?: AuthError }> {
  try {
    // Check if user already exists
    const existingUsers = await query<User>(
      'SELECT id FROM users WHERE email = ?',
      [data.email]
    );
    
    if (existingUsers.length > 0) {
      return { user: null as any, error: { message: 'Email already exists', field: 'email' } };
    }

    // Hash password
    const password_hash = await hashPassword(data.password);

    // Insert user
    const connection = await getConnection();
    try {
      const [result] = await connection.execute(
        `INSERT INTO users (email, password_hash, first_name, last_name, phone) 
         VALUES (?, ?, ?, ?, ?)`,
        [data.email, password_hash, data.first_name || null, data.last_name || null, data.phone || null]
      );
      
      const insertResult = result as any;
      const userId = insertResult.insertId;

      // Assign default 'user' role
      await connection.execute(
        `INSERT INTO user_roles (user_id, role_id) 
         SELECT ?, id FROM roles WHERE name = 'user'`,
        [userId]
      );

      // Get the created user
      const users = await query<User>(
        'SELECT id, email, first_name, last_name, phone, email_verified, created_at FROM users WHERE id = ?',
        [userId]
      );

      return { user: users[0] };
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create user error:', error);
    return { user: null as any, error: { message: 'Failed to create user' } };
  }
}

/**
 * Authenticate user by email and password
 */
export async function authenticateUser(email: string, password: string): Promise<{ user?: UserWithRoles; error?: AuthError }> {
  try {
    // Get user with password hash
    const users = await query<User & { password_hash: string }>(
      'SELECT id, email, password_hash, first_name, last_name, phone, email_verified, created_at FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return { error: { message: 'Invalid email or password', field: 'email' } };
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return { error: { message: 'Invalid email or password', field: 'password' } };
    }

    // Update last login
    await query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);

    // Get user with roles
    const userWithRoles = await getUserWithRoles(user.id);
    
    return { user: userWithRoles };
  } catch (error) {
    console.error('Authenticate user error:', error);
    return { error: { message: 'Authentication failed' } };
  }
}

/**
 * Get user with their roles
 */
export async function getUserWithRoles(userId: number): Promise<UserWithRoles> {
  // Get user
  const users = await query<User>(
    'SELECT id, email, first_name, last_name, phone, email_verified, last_login_at, created_at FROM users WHERE id = ?',
    [userId]
  );

  if (users.length === 0) {
    throw new Error('User not found');
  }

  // Get roles
  const roles = await query<Role>(
    `SELECT r.id, r.name, r.description, 
            COALESCE(r.permissions, '{}') as permissions
     FROM roles r 
     INNER JOIN user_roles ur ON r.id = ur.role_id 
     WHERE ur.user_id = ?`,
    [userId]
  );

  return {
    ...users[0],
    roles: roles.map(role => ({
      ...role,
      permissions: typeof role.permissions === 'string' ? JSON.parse(role.permissions) : role.permissions
    }))
  };
}

/**
 * Get user by ID
 */
export async function getUserById(userId: number): Promise<UserWithRoles | null> {
  try {
    return await getUserWithRoles(userId);
  } catch (error) {
    return null;
  }
}

/**
 * Check if user has permission
 */
export function hasPermission(user: UserWithRoles, resource: string, action: string): boolean {
  return user.roles.some(role => {
    const resourcePerms = role.permissions[resource];
    return resourcePerms && resourcePerms.includes(action);
  });
}

/**
 * Check if user has role
 */
export function hasRole(user: UserWithRoles, roleName: string): boolean {
  return user.roles.some(role => role.name === roleName);
}

/**
 * Assign role to user
 */
export async function assignRole(userId: number, roleName: string, assignedBy?: number): Promise<boolean> {
  try {
    const connection = await getConnection();
    try {
      await connection.execute(
        `INSERT IGNORE INTO user_roles (user_id, role_id, assigned_by) 
         SELECT ?, r.id, ? FROM roles r WHERE r.name = ?`,
        [userId, assignedBy || null, roleName]
      );
      return true;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Assign role error:', error);
    return false;
  }
}

/**
 * Remove role from user
 */
export async function removeRole(userId: number, roleName: string): Promise<boolean> {
  try {
    const connection = await getConnection();
    try {
      await connection.execute(
        `DELETE ur FROM user_roles ur 
         INNER JOIN roles r ON ur.role_id = r.id 
         WHERE ur.user_id = ? AND r.name = ?`,
        [userId, roleName]
      );
      return true;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Remove role error:', error);
    return false;
  }
}