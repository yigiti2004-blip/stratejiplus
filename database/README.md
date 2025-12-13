# Database Setup Instructions

## Step 1: Create Database in phpMyAdmin

1. Open phpMyAdmin (usually at `http://localhost/phpmyadmin`)
2. Click "New" to create a new database
3. Database name: `stratejiplus`
4. Collation: `utf8mb4_unicode_ci`
5. Click "Create"

## Step 2: Import Schema

1. In phpMyAdmin, select the `stratejiplus` database
2. Click the "Import" tab
3. Click "Choose File" and select `mysql_schema.sql`
4. Click "Go" to import

## Step 3: Configure Database Connection

1. Copy `config.example.js` to `config.js`:
   ```bash
   cp database/config.example.js database/config.js
   ```

2. Edit `database/config.js` with your MySQL credentials:
   ```javascript
   export const dbConfig = {
     host: 'localhost',
     port: 3306,
     user: 'root',        // Your MySQL username
     password: 'your_password',  // Your MySQL password
     database: 'stratejiplus',
     // ... rest of config
   };
   ```

## Step 4: Install Database Dependencies

```bash
npm install mysql2
```

## Step 5: Test Connection

Run the test script:
```bash
node database/test-connection.js
```

## Database Structure

The schema includes:
- **units** - Organizational units
- **users** - System users
- **strategic_areas** - Strategic planning areas
- **strategic_objectives** - Objectives
- **targets** - Targets
- **indicators** - Performance indicators
- **activities** - Activities
- **budget_chapters** - Budget classification
- **expenses** - Expense records
- **risks** - Risk management
- **risk_action_plans** - Risk mitigation plans
- **risk_monitoring_logs** - Risk monitoring
- **risk_projects** - Risk projects
- **revisions** - Change requests
- **activity_monitoring_records** - Activity progress tracking
- **annual_work_plan_items** - Annual work planning

## Default Admin User

After importing, you'll need to create an admin user. You can do this via:
1. phpMyAdmin SQL tab, or
2. The migration script: `node database/migrate-localstorage-to-db.js`

