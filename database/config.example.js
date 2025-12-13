// Database Configuration
// Copy this file to config.js and update with your PostgreSQL credentials

export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'stratejiplus',
  // PostgreSQL specific options
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// API Base URL (if using separate backend)
export const apiConfig = {
  baseURL: 'http://localhost:3001/api',
  timeout: 30000
};

