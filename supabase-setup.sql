-- Create libraries table for storing registered library addresses
CREATE TABLE IF NOT EXISTS libraries (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample libraries for testing
INSERT INTO libraries (name, address, description) VALUES
  ('Public Library DAO', '0x0000000000000000000000000000000000000001', 'Community-owned public library for sharing knowledge'),
  ('University Library', '0x0000000000000000000000000000000000000002', 'Academic research library for students and researchers'),
  ('Community Learning Center', '0x0000000000000000000000000000000000000003', 'Educational resources for underserved communities')
ON CONFLICT (address) DO NOTHING;

-- Optional: Add index on address for faster lookups
CREATE INDEX IF NOT EXISTS idx_libraries_address ON libraries(address);

-- Optional: Enable Row Level Security (RLS) if needed
-- ALTER TABLE libraries ENABLE ROW LEVEL SECURITY;

-- Optional: Create policy to allow public read access
-- CREATE POLICY "Allow public read access" ON libraries FOR SELECT USING (true);
