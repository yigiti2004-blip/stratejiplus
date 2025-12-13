# How to Use psql (PostgreSQL Command Line)

## Connect to Database

```bash
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
psql -U yigitilseven -d stratejiplus
```

## Important: Run Commands ONE at a Time!

Don't paste multiple commands with comments. Run each command separately.

## Basic Commands

### 1. List All Tables
```sql
\dt
```

### 2. View Users Table
```sql
SELECT * FROM users;
```

### 3. View Units Table
```sql
SELECT * FROM units;
```

### 4. View Specific Columns
```sql
SELECT user_id, full_name, email, role_id FROM users;
```

### 5. Count Records
```sql
SELECT COUNT(*) FROM users;
```

### 6. Quit psql
```sql
\q
```

## More Useful Commands

### Describe a Table Structure
```sql
\d users
```

### List All Databases
```sql
\l
```

### List All Tables (with details)
```sql
\dt+
```

### View Table Data (first 10 rows)
```sql
SELECT * FROM users LIMIT 10;
```

### View Strategic Areas
```sql
SELECT * FROM strategic_areas;
```

### View All Tables with Row Counts
```sql
SELECT 
  'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'units', COUNT(*) FROM units
UNION ALL
SELECT 'strategic_areas', COUNT(*) FROM strategic_areas
UNION ALL
SELECT 'strategic_objectives', COUNT(*) FROM strategic_objectives;
```

## Tips

1. **End SQL commands with semicolon (`;`)**
2. **Run one command at a time**
3. **Use `\q` to quit**
4. **Use `\?` for help**
5. **Use `\h` for SQL help**

## Example Session

```
stratejiplus=# \dt
stratejiplus=# SELECT * FROM users;
stratejiplus=# SELECT * FROM units;
stratejiplus=# \q
```

---

**Remember**: Run each command separately, press Enter after each one!

