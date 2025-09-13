# Clothing Store Admin - Bundle Arrival Management System

A modern, responsive web application for managing bundle arrival details in a clothing store. Built with React, Tailwind CSS, and Supabase for the backend.

## Features

### 🎯 Core Functionality

- **Bundle Arrival Entry**: Complete form for recording incoming bundles with all required fields
- **Smart Party Name Autocomplete**: Saves and suggests previously entered party names
- **Account Type Color Coding**: Visual distinction for S (light yellow), T (greenish blue), R (light pink)
- **10 Lorry Type Options**: Predefined dropdown with common lorry types

### 🔍 Advanced Filtering

- **Date-wise Filtering**: Filter by specific dates
- **Month-wise Filtering**: Filter by entire months with total amounts
- **Lorry Type Filtering**: Filter by specific lorry types
- **Party Name Filtering**: Filter by party names
- **Account Type Filtering**: Filter by S, T, R account types with color coding

### 📊 Data Management

- **Responsive Data Table**: Mobile-friendly table with pagination
- **Search Functionality**: Global search across all fields
- **Export to CSV**: Download filtered data as CSV files
- **Edit & Delete**: Manage existing entries
- **Real-time Updates**: Instant data refresh after operations

### 📈 Analytics Dashboard

- **Summary Cards**: Key metrics display
- **Total Amount Calculations**: Automatic calculation for filtered data
- **Entry Counts**: Track total entries and unique parties/lorries

## Technology Stack

- **Frontend**: React 18, Tailwind CSS, Lucide React Icons
- **Backend**: Supabase (PostgreSQL database)
- **Date Handling**: date-fns
- **Styling**: Custom Tailwind configuration with account type colors

## Setup Instructions

### 1. Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### 2. Clone and Install

```bash
# Install dependencies
npm install
```

### 3. Supabase Setup

#### Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key

#### Database Schema

Run the following SQL in your Supabase SQL editor:

```sql
CREATE TABLE IF NOT EXISTS bundle_arrivals (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  lorry_type VARCHAR(100) NOT NULL,
  lorry_no VARCHAR(50) NOT NULL,
  phone_no VARCHAR(20) NOT NULL,
  party_name VARCHAR(200) NOT NULL,
  account_type VARCHAR(1) CHECK (account_type IN ('S', 'T', 'R')) NOT NULL,
  bundle VARCHAR(100) NOT NULL,
  invoice_no VARCHAR(100) NOT NULL,
  invoice_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bundle_arrivals_date ON bundle_arrivals(date);
CREATE INDEX IF NOT EXISTS idx_bundle_arrivals_lorry_type ON bundle_arrivals(lorry_type);
CREATE INDEX IF NOT EXISTS idx_bundle_arrivals_party_name ON bundle_arrivals(party_name);
CREATE INDEX IF NOT EXISTS idx_bundle_arrivals_account_type ON bundle_arrivals(account_type);
```

### 4. Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Run the Application

```bash
npm start
```

The application will be available at `http://localhost:3000`

## Usage Guide

### Adding New Bundle Arrivals

1. Fill out the "Bundle Arrival Details" form
2. Select date, lorry type from dropdown
3. Enter lorry receipt number, phone number
4. Type party name (autocomplete will show suggestions)
5. Select account type (S/T/R) with color coding
6. Enter bundle details, invoice number, invoice date, and amount
7. Click "Save Entry"

### Filtering Data

1. Click "Show Filters" in the filter panel
2. Use any combination of filters:
   - **Date**: Select specific date
   - **Month**: Select entire month
   - **Lorry Type**: Choose from dropdown
   - **Party Name**: Select from saved parties
   - **Account Type**: Click S, T, or R buttons
3. View active filters below the panel
4. Click "Clear All" to reset filters

### Data Management

- **Search**: Use the search bar in the table header
- **Export**: Click "Export" to download CSV
- **Edit**: Click edit icon (pencil) on any row
- **Delete**: Click delete icon (trash) on any row
- **Pagination**: Navigate through pages if data exceeds 10 entries

## Account Type Colors

- **S**: Light Yellow (`#fef3c7`)
- **T**: Greenish Blue (`#a7f3d0`)
- **R**: Light Pink (`#fce7f3`)

## Lorry Types Included

1. AKR
2. PNP
3. VRL
4. MSS
5. LAXMI CARCO
6. BLUEDART
7. BY HAND
8. JUPITER
9. LCM
10. KLS
11. KAVITHA
12. LPL
13. GLS
14. RATHEMEENA
15. SVT
16. VMB
17. A1 Travels
18. By Bus
19. Professional

## Responsive Design

The application is fully responsive and works on:

- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## File Structure

```
src/
├── components/
│   ├── BundleForm.js      # Main entry form
│   ├── FilterPanel.js     # Filter controls
│   ├── DataTable.js       # Data display table
│   └── SummaryCards.js    # Analytics cards
├── utils.js               # Utility functions
├── supabase.js           # Supabase configuration
├── App.js                # Main application
├── index.js              # Entry point
└── index.css             # Global styles
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team or create an issue in the repository.
