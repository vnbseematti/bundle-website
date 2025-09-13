import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Debug: Check if environment variables are loaded
console.log("Supabase URL:", supabaseUrl ? "Loaded" : "Missing");
console.log("Supabase Key:", supabaseAnonKey ? "Loaded" : "Missing");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables!");
  console.error("Please check your .env file");
}

// Validate URL format
if (supabaseUrl && !supabaseUrl.startsWith("https://")) {
  console.error(
    "❌ Invalid Supabase URL format! URL must start with 'https://'"
  );
  console.error("Current URL:", supabaseUrl);
}

if (supabaseUrl && !supabaseUrl.includes(".supabase.co")) {
  console.error("❌ Invalid Supabase URL! URL must contain '.supabase.co'");
  console.error("Current URL:", supabaseUrl);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database schema for bundle_arrivals table
export const createTableSchema = `
CREATE TABLE IF NOT EXISTS bundle_arrivals (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  lorry_type VARCHAR(100) NOT NULL,
  lorry_no VARCHAR(50) NOT NULL,
  city VARCHAR(100) NOT NULL,
  party_name VARCHAR(200) NOT NULL,
  account_type VARCHAR(1) CHECK (account_type IN ('S', 'T', 'R')) NOT NULL,
  bundle VARCHAR(100) NOT NULL,
  invoice_no VARCHAR(100) NOT NULL,
  invoice_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  phone_no VARCHAR(20),
  status VARCHAR(20) CHECK (status IN ('OPEN', 'PENDING')) DEFAULT 'OPEN',
  itemtype VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_bundle_arrivals_date ON bundle_arrivals(date);
CREATE INDEX IF NOT EXISTS idx_bundle_arrivals_lorry_type ON bundle_arrivals(lorry_type);
CREATE INDEX IF NOT EXISTS idx_bundle_arrivals_party_name ON bundle_arrivals(party_name);
CREATE INDEX IF NOT EXISTS idx_bundle_arrivals_account_type ON bundle_arrivals(account_type);
CREATE INDEX IF NOT EXISTS idx_bundle_arrivals_status ON bundle_arrivals(status);
`;
