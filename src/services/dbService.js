// Database Service Layer
// This service handles all database operations
// For now, it uses localStorage as fallback until backend API is ready

class DatabaseService {
  constructor() {
    this.apiBaseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
    this.apiAvailable = null; // null = not checked, true/false = checked
  }

  // Check if API is available
  async checkApiAvailability() {
    if (this.apiAvailable !== null) return this.apiAvailable;
    
    try {
      const response = await fetch(`${this.apiBaseURL.replace('/api', '')}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000), // 2 second timeout
      });
      this.apiAvailable = response.ok;
      return this.apiAvailable;
    } catch (error) {
      this.apiAvailable = false;
      return false;
    }
  }

  // Generic fetch wrapper
  async fetch(endpoint, options = {}) {
    // Check API availability first
    const apiReady = await this.checkApiAvailability();
    
    if (!apiReady) {
      // Fallback to localStorage
      return this.localStorageFallback(endpoint, options);
    }

    try {
      const response = await fetch(`${this.apiBaseURL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('API request failed, falling back to localStorage:', error.message);
      // Mark API as unavailable for next check
      this.apiAvailable = false;
      return this.localStorageFallback(endpoint, options);
    }
  }

  // LocalStorage fallback
  localStorageFallback(endpoint, options) {
    const method = options.method || 'GET';
    const key = endpoint.replace('/api/', '').replace('/', '');

    if (method === 'GET') {
      const data = localStorage.getItem(key);
      return Promise.resolve(data ? JSON.parse(data) : []);
    } else if (method === 'POST' || method === 'PUT') {
      const data = JSON.parse(options.body || '{}');
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      
      if (method === 'POST') {
        existing.push(data);
      } else {
        const index = existing.findIndex(item => item.id === data.id);
        if (index >= 0) existing[index] = data;
      }
      
      localStorage.setItem(key, JSON.stringify(existing));
      return Promise.resolve(data);
    } else if (method === 'DELETE') {
      const id = options.body ? JSON.parse(options.body).id : null;
      if (id) {
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        const filtered = existing.filter(item => item.id !== id);
        localStorage.setItem(key, JSON.stringify(filtered));
      }
      return Promise.resolve({ success: true });
    }

    return Promise.resolve([]);
  }

  // ============================================
  // USERS
  // ============================================
  async getUsers() {
    return this.fetch('/users');
  }

  async getUserById(userId) {
    const users = await this.getUsers();
    return users.find(u => u.user_id === userId || u.userId === userId);
  }

  async createUser(userData) {
    return this.fetch('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId, userData) {
    return this.fetch(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ ...userData, user_id: userId }),
    });
  }

  async deleteUser(userId) {
    return this.fetch(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // UNITS
  // ============================================
  async getUnits() {
    return this.fetch('/units');
  }

  async createUnit(unitData) {
    return this.fetch('/units', {
      method: 'POST',
      body: JSON.stringify(unitData),
    });
  }

  // ============================================
  // STRATEGIC PLANNING
  // ============================================
  async getStrategicAreas() {
    return this.fetch('/strategic-areas');
  }

  async createStrategicArea(areaData) {
    return this.fetch('/strategic-areas', {
      method: 'POST',
      body: JSON.stringify(areaData),
    });
  }

  async getStrategicObjectives(areaId = null) {
    const objectives = await this.fetch('/strategic-objectives');
    if (areaId) {
      return objectives.filter(obj => obj.strategic_area_id === areaId);
    }
    return objectives;
  }

  async getTargets(objectiveId = null) {
    const targets = await this.fetch('/targets');
    if (objectiveId) {
      return targets.filter(t => t.objective_id === objectiveId);
    }
    return targets;
  }

  async getIndicators(targetId = null) {
    const indicators = await this.fetch('/indicators');
    if (targetId) {
      return indicators.filter(i => i.target_id === targetId);
    }
    return indicators;
  }

  async getActivities(targetId = null) {
    const activities = await this.fetch('/activities');
    if (targetId) {
      return activities.filter(a => a.target_id === targetId);
    }
    return activities;
  }

  // ============================================
  // BUDGET
  // ============================================
  async getBudgetChapters() {
    return this.fetch('/budget-chapters');
  }

  async getExpenses(activityId = null) {
    const expenses = await this.fetch('/expenses');
    if (activityId) {
      return expenses.filter(e => e.activity_id === activityId);
    }
    return expenses;
  }

  // ============================================
  // RISKS
  // ============================================
  async getRisks() {
    return this.fetch('/risks');
  }

  async createRisk(riskData) {
    return this.fetch('/risks', {
      method: 'POST',
      body: JSON.stringify(riskData),
    });
  }

  // ============================================
  // MONITORING
  // ============================================
  async getMonitoringRecords(activityId) {
    const records = await this.fetch('/activity-monitoring-records');
    return records.filter(r => r.activity_id === activityId);
  }

  async createMonitoringRecord(recordData) {
    return this.fetch('/activity-monitoring-records', {
      method: 'POST',
      body: JSON.stringify(recordData),
    });
  }

  // ============================================
  // REVISIONS
  // ============================================
  async getRevisions() {
    return this.fetch('/revisions');
  }

  async createRevision(revisionData) {
    return this.fetch('/revisions', {
      method: 'POST',
      body: JSON.stringify(revisionData),
    });
  }
}

// Export singleton instance
export const dbService = new DatabaseService();
export default dbService;

