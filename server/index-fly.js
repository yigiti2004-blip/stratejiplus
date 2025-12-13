// Express Server for Fly.io Deployment
// Serves React frontend + API endpoints

import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase client (optional - can use direct client in frontend)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    supabase: supabase ? 'connected' : 'not configured'
  });
});

// ============================================
// API ROUTES (Optional - frontend can use Supabase directly)
// ============================================

// Users endpoint
app.get('/api/users', async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase not configured' });
  }
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase not configured' });
  }
  
  try {
    // Get user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();
    
    if (userError || !user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Kullanıcı bulunamadı.' 
      });
    }
    
    // Check password (in production, use bcrypt.compare)
    // For now, assuming password_hash is bcrypt hashed
    const bcrypt = await import('bcrypt');
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!passwordMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Hatalı şifre.' 
      });
    }
    
    // Update last login
    await supabase
      .from('users')
      .update({ last_login_date: new Date().toISOString() })
      .eq('user_id', user.user_id);
    
    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user;
    
    res.json({ 
      success: true, 
      user: userWithoutPassword 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// STATIC FILES (React App)
// ============================================
app.use(express.static(join(__dirname, '../dist')));

// ============================================
// SPA FALLBACK
// ============================================
// Serve index.html for all routes (React Router)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Supabase: ${supabase ? 'Connected' : 'Not configured'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

