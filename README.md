# StratejiPlus - Kurumsal Performans Yönetim Sistemi

## Overview

StratejiPlus is a strategic planning and performance management system built with React and Vite. The application uses **localStorage** for data persistence, meaning **no SQL database connection is required** - it's ready to run on localhost for UI display and testing.

## Features

- Strategic Planning Management
- Budget Management
- Risk Management
- User Management
- Reporting Module
- Annual Business Plan
- Strategic Plan Monitoring
- Revision Management

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Default Login Credentials

- **Email**: `admin@stratejiplus.com`
- **Password**: `admin123`

## Data Storage

The application uses **localStorage** for all data storage. No database connection is required. All data is initialized automatically on first load with sample data including:

- Organizations/Units
- Users
- Strategic Areas
- Strategic Objectives
- Targets
- Indicators
- Activities
- Budget Chapters
- Expenses
- Risks

## Data Format

The application uses the following data structure:

- **Users**: `{ userId, fullName, email, roleId, unitId, status, password, ... }`
- **Units**: `{ unitId, unitName, unitCode, status, ... }`
- **Strategic Areas**: `{ id, code, name, organizationId, ... }`
- **Strategic Objectives**: `{ id, code, name, strategicAreaId, ... }`
- **Targets**: `{ id, code, name, objectiveId, ... }`
- **Indicators**: `{ id, code, name, targetId, ... }`
- **Activities**: `{ id, code, name, targetId, ... }`

## Future SQL Integration

When you're ready to integrate SQL:

1. The data structure is already well-defined
2. All hooks can be updated to make API calls instead of reading from localStorage
3. The `data-initializer.js` can be replaced with database seeding scripts
4. Authentication can be moved to a backend service

## Project Structure

```
src/
├── components/          # React components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and data initialization
├── data/               # Static data files
└── utils/              # Helper utilities
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Notes

- All data is stored in browser localStorage
- Data persists across page refreshes
- To reset data, clear browser localStorage
- The app automatically initializes with sample data on first load

