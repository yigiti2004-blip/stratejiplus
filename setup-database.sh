#!/bin/bash
# Automated database setup script
# This creates the database and imports the schema

export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"

echo "🗄️  Setting up StratejiPlus database..."
echo ""

# Check if PostgreSQL is running
if ! lsof -ti:5432 &> /dev/null; then
    echo "❌ PostgreSQL is not running"
    echo "Starting PostgreSQL..."
    brew services start postgresql@15
    sleep 3
fi

# Create database (will fail if exists, that's OK)
echo "📦 Creating database 'stratejiplus'..."
psql -U postgres -c "CREATE DATABASE stratejiplus;" 2>&1 | grep -v "already exists" || echo "Database already exists or created"

# Import schema
echo "📥 Importing database schema..."
if [ -f "database/postgres_schema.sql" ]; then
    psql -U postgres -d stratejiplus -f database/postgres_schema.sql
    echo "✅ Schema imported!"
else
    echo "❌ Schema file not found: database/postgres_schema.sql"
    exit 1
fi

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Update password in: database/config.js"
echo "2. Test connection: npm run test-db"
echo "3. Create admin user: npm run migrate"
echo "4. Start API server: npm run server"

