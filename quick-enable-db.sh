#!/bin/bash
# Quick script to enable database mode
# Run with: bash quick-enable-db.sh

echo "🚀 Enabling Database Mode for StratejiPlus"
echo ""

# Step 1: Install dependencies
echo "📦 Step 1: Installing Node dependencies..."
npm install
echo ""

# Step 2: Check PostgreSQL
echo "🔍 Step 2: Checking PostgreSQL..."
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL is installed"
else
    echo "❌ PostgreSQL not found"
    echo ""
    echo "To install PostgreSQL (macOS):"
    echo "  brew install postgresql@15"
    echo "  brew services start postgresql@15"
    echo ""
    echo "Or download from: https://www.postgresql.org/download/"
    exit 1
fi

# Step 3: Check if PostgreSQL is running
if lsof -ti:5432 &> /dev/null; then
    echo "✅ PostgreSQL server is running"
else
    echo "⚠️  PostgreSQL server is NOT running"
    echo "Start it with: brew services start postgresql@15"
    exit 1
fi

# Step 4: Test database connection
echo ""
echo "🔌 Step 3: Testing database connection..."
npm run test-db

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database connection successful!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Make sure database 'stratejiplus' exists in pgAdmin"
    echo "2. Import schema: database/postgres_schema.sql"
    echo "3. Update password in: database/config.js"
    echo "4. Create admin user: npm run migrate"
    echo "5. Start API server: npm run server"
else
    echo ""
    echo "❌ Database connection failed"
    echo "Check:"
    echo "  - PostgreSQL is running"
    echo "  - Database 'stratejiplus' exists"
    echo "  - Password in database/config.js is correct"
fi

