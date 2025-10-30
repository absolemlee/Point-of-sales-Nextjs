-- Enhanced Location Architecture for Multi-Channel Enterprise Platform
-- This schema supports B2B, B2C, internal transfers, provider fulfillment, and online commerce

-- Expanded Location Types
CREATE TYPE location_type AS ENUM (
  'STATIC',              -- Physical storefronts
  'POPUP',               -- Temporary events, markets
  'VENUE_PARTNERSHIP',   -- Hosted locations
  'B2B_HUB',            -- Wholesale/distribution centers
  'FULFILLMENT_CENTER', -- Internal logistics hubs
  'ONLINE_STOREFRONT',  -- E-commerce with location fulfillment
  'MOBILE_UNIT',        -- Food trucks, mobile kava bars
  'FRANCHISE',          -- Licensed franchise locations
  'CORPORATE_HQ'        -- Central management office
);

-- Business Capabilities each location can support
CREATE TYPE business_capability AS ENUM (
  'RETAIL_SALES',        -- Direct consumer sales
  'WHOLESALE',           -- B2B bulk sales
  'ONLINE_FULFILLMENT',  -- E-commerce order processing
  'INTERNAL_TRANSFERS',  -- Location-to-location inventory
  'PROVIDER_SOURCING',   -- External supplier relationships
  'EVENT_CATERING',      -- On-site service delivery
  'MANUFACTURING',       -- Product creation/preparation
  'DISTRIBUTION',        -- Logistics and shipping
  'CUSTOMER_SERVICE',    -- Support and returns
  'TRAINING_CENTER'      -- Staff and franchise training
);

-- Enhanced Location table with enterprise capabilities
ALTER TABLE Location ADD COLUMN IF NOT EXISTS business_capabilities business_capability[];
ALTER TABLE Location ADD COLUMN IF NOT EXISTS fulfillment_radius_miles INTEGER DEFAULT 0;
ALTER TABLE Location ADD COLUMN IF NOT EXISTS supports_online_orders BOOLEAN DEFAULT false;
ALTER TABLE Location ADD COLUMN IF NOT EXISTS supports_b2b_sales BOOLEAN DEFAULT false;
ALTER TABLE Location ADD COLUMN IF NOT EXISTS supports_internal_transfers BOOLEAN DEFAULT true;
ALTER TABLE Location ADD COLUMN IF NOT EXISTS primary_market_focus TEXT; -- 'B2C', 'B2B', 'MIXED'
ALTER TABLE Location ADD COLUMN IF NOT EXISTS parent_location_id TEXT REFERENCES Location(id);
ALTER TABLE Location ADD COLUMN IF NOT EXISTS cost_center_code TEXT;
ALTER TABLE Location ADD COLUMN IF NOT EXISTS profit_sharing_percentage DECIMAL(5,2) DEFAULT 0.00;

-- Transaction Channel Tracking
CREATE TABLE IF NOT EXISTS LocationTransactionChannels (
  id TEXT PRIMARY KEY DEFAULT ('ltc_' || generate_random_uuid()),
  location_id TEXT NOT NULL REFERENCES Location(id),
  channel_type TEXT NOT NULL, -- 'POS', 'ONLINE', 'B2B', 'INTERNAL', 'PROVIDER'
  is_enabled BOOLEAN DEFAULT true,
  configuration JSONB, -- Channel-specific settings
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Location Service Offerings (what products/services each location provides)
CREATE TABLE IF NOT EXISTS LocationServiceOfferings (
  id TEXT PRIMARY KEY DEFAULT ('lso_' || generate_random_uuid()),
  location_id TEXT NOT NULL REFERENCES Location(id),
  service_type TEXT NOT NULL, -- 'KAVA_BAR', 'KRATOM_RETAIL', 'EDUCATION', 'EVENTS', 'WHOLESALE'
  is_primary_service BOOLEAN DEFAULT false,
  capacity_limit INTEGER,
  pricing_tier TEXT, -- 'STANDARD', 'PREMIUM', 'WHOLESALE'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cross-Location Fulfillment Rules
CREATE TABLE IF NOT EXISTS LocationFulfillmentRules (
  id TEXT PRIMARY KEY DEFAULT ('lfr_' || generate_random_uuid()),
  source_location_id TEXT NOT NULL REFERENCES Location(id),
  target_location_id TEXT NOT NULL REFERENCES Location(id),
  fulfillment_type TEXT NOT NULL, -- 'TRANSFER', 'DROP_SHIP', 'SHARED_INVENTORY'
  priority_level INTEGER DEFAULT 5, -- 1-10, higher is more priority
  max_fulfillment_time_hours INTEGER DEFAULT 24,
  cost_per_unit DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Provider Network (External suppliers, vendors, partners)
CREATE TABLE IF NOT EXISTS LocationProviderNetwork (
  id TEXT PRIMARY KEY DEFAULT ('lpn_' || generate_random_uuid()),
  location_id TEXT NOT NULL REFERENCES Location(id),
  provider_name TEXT NOT NULL,
  provider_type TEXT NOT NULL, -- 'SUPPLIER', 'DISTRIBUTOR', 'SERVICE_PARTNER', 'CUSTOMER_B2B'
  contact_info JSONB,
  terms_and_conditions TEXT,
  payment_terms TEXT,
  is_preferred BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Location Performance Metrics (for central back-office monitoring)
CREATE TABLE IF NOT EXISTS LocationPerformanceMetrics (
  id TEXT PRIMARY KEY DEFAULT ('lpm_' || generate_random_uuid()),
  location_id TEXT NOT NULL REFERENCES Location(id),
  metric_date DATE NOT NULL,
  revenue_total DECIMAL(12,2) DEFAULT 0,
  revenue_b2c DECIMAL(12,2) DEFAULT 0,
  revenue_b2b DECIMAL(12,2) DEFAULT 0,
  revenue_online DECIMAL(12,2) DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  customer_count INTEGER DEFAULT 0,
  inventory_turnover_rate DECIMAL(5,2),
  fulfillment_accuracy_rate DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(location_id, metric_date)
);

-- Comments explaining the enterprise architecture
COMMENT ON TABLE Location IS 'Central location registry supporting multi-channel commerce, B2B/B2C sales, and internal operations';
COMMENT ON TABLE LocationTransactionChannels IS 'Defines what transaction types each location supports (POS, online, B2B, internal transfers)';
COMMENT ON TABLE LocationServiceOfferings IS 'Services each location provides (kava bar, retail, education, events, wholesale)';
COMMENT ON TABLE LocationFulfillmentRules IS 'Cross-location fulfillment capabilities for inventory sharing and transfers';
COMMENT ON TABLE LocationProviderNetwork IS 'External partners, suppliers, and B2B customers for each location';
COMMENT ON TABLE LocationPerformanceMetrics IS 'Daily performance tracking for central back-office monitoring';

-- Example data for a comprehensive kava/kratom enterprise
INSERT INTO Location (id, name, type, status, address, business_capabilities, supports_online_orders, supports_b2b_sales, primary_market_focus) VALUES
('loc_main_store', 'Main Kava Lounge', 'STATIC', 'ACTIVE', '123 Main St, Austin TX', 
 ARRAY['RETAIL_SALES', 'EVENT_CATERING', 'CUSTOMER_SERVICE'], true, false, 'B2C'),
('loc_wholesale_hub', 'Distribution Center', 'B2B_HUB', 'ACTIVE', '456 Industrial Blvd, Austin TX',
 ARRAY['WHOLESALE', 'DISTRIBUTION', 'INTERNAL_TRANSFERS'], false, true, 'B2B'),
('loc_online_store', 'E-Commerce Fulfillment', 'ONLINE_STOREFRONT', 'ACTIVE', 'Virtual Location',
 ARRAY['ONLINE_FULFILLMENT', 'CUSTOMER_SERVICE'], true, true, 'MIXED'),
('loc_farmers_market', 'Weekend Farmers Market', 'POPUP', 'SCHEDULED', 'Rotating Market Locations',
 ARRAY['RETAIL_SALES', 'EVENT_CATERING'], false, false, 'B2C');