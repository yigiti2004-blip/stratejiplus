// Simple Express API Server for StratejiPlus
// Run with: node server/index.js

import express from 'express';
import cors from 'cors';
import pg from 'pg';
import { dbConfig } from '../database/config.js';

const { Pool } = pg;

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Create PostgreSQL connection pool
const pool = new Pool(dbConfig);

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT 1 as healthy, NOW() as server_time');
    res.json({ status: 'ok', database: 'connected', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ============================================
// USERS
// ============================================
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { user_id, full_name, email, password_hash, role_id, unit_id, status } = req.body;
    await pool.query(
      'INSERT INTO users (user_id, full_name, email, password_hash, role_id, unit_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [user_id, full_name, email, password_hash, role_id, unit_id, status || 'aktif']
    );
    res.json({ success: true, user_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// UNITS
// ============================================
app.get('/api/units', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM units ORDER BY unit_name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// STRATEGIC AREAS
// ============================================
app.get('/api/strategic-areas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM strategic_areas ORDER BY code');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/strategic-areas', async (req, res) => {
  try {
    const { id, code, name, organization_id, responsible_unit, description } = req.body;
    await pool.query(
      'INSERT INTO strategic_areas (id, code, name, organization_id, responsible_unit, description) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, code, name, organization_id, responsible_unit, description]
    );
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// STRATEGIC OBJECTIVES
// ============================================
app.get('/api/strategic-objectives', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM strategic_objectives ORDER BY code');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// TARGETS
// ============================================
app.get('/api/targets', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM targets ORDER BY code');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// INDICATORS
// ============================================
app.get('/api/indicators', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM indicators ORDER BY code');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ACTIVITIES
// ============================================
app.get('/api/activities', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM activities ORDER BY code');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// BUDGET CHAPTERS
// ============================================
app.get('/api/budget-chapters', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM budget_chapters ORDER BY code');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// EXPENSES
// ============================================
app.get('/api/expenses', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM expenses ORDER BY expense_date DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// RISKS
// ============================================
app.get('/api/risks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM risks ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/risks', async (req, res) => {
  try {
    const { id, name, description, probability, impact, status, linked_entity_type, linked_entity_id, responsible, target_date } = req.body;
    const score = probability * impact;
    await pool.query(
      'INSERT INTO risks (id, name, description, probability, impact, score, status, linked_entity_type, linked_entity_id, responsible, target_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
      [id, name, description, probability, impact, score, status || 'Aktif', linked_entity_type, linked_entity_id, responsible, target_date]
    );
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// MONITORING RECORDS
// ============================================
app.get('/api/activity-monitoring-records', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM activity_monitoring_records ORDER BY record_date DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/activity-monitoring-records', async (req, res) => {
  try {
    const { id, activity_id, record_date, indicator_values, budget_status, recorded_by, notes } = req.body;
    await pool.query(
      'INSERT INTO activity_monitoring_records (id, activity_id, record_date, indicator_values, budget_status, recorded_by, notes) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [id, activity_id, record_date, indicator_values, budget_status, recorded_by, notes]
    );
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// REVISIONS
// ============================================
app.get('/api/revisions', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM revisions ORDER BY created_at DESC');
    // PostgreSQL returns JSONB as objects, no need to parse
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/revisions', async (req, res) => {
  try {
    const { revision_id, item_level, item_id, revision_type, revision_reason, before_state, after_state, proposed_by, status } = req.body;
    await pool.query(
      'INSERT INTO revisions (revision_id, item_level, item_id, revision_type, revision_reason, before_state, after_state, proposed_by, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [revision_id, item_level, item_id, revision_type, revision_reason, before_state, after_state, proposed_by, status || 'draft']
    );
    res.json({ success: true, revision_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log(`🚀 StratejiPlus API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

