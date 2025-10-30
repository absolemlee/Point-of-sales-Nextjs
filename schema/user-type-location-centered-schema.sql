-- User Type System for Location-Centered Management
-- Supports both local location autonomy and central organizational oversight

-- ============================================
-- USER TYPES & ACCESS CONTROL
-- ============================================

-- User Types in the Organization
CREATE TYPE user_type AS ENUM (
    'LOCATION_MANAGER',     -- Manages specific location(s) with full local authority
    'CENTRAL_OPERATIONS',   -- Multi-location oversight and coordination
    'ASSOCIATE',           -- Service provider with location-specific access
    'SYSTEM_ADMIN',        -- Technical administration and system maintenance
    'REGIONAL_MANAGER',    -- Manages multiple locations in a region
    'TRAINING_COORDINATOR' -- Manages training and certification across locations
);

-- Access Levels for Different Operations
CREATE TYPE access_level AS ENUM (
    'FULL',        -- Complete authority over the resource
    'MODIFY',      -- Can change existing resources
    'VIEW_EDIT',   -- Can view and make limited edits
    'VIEW_ONLY',   -- Read-only access
    'NONE'         -- No access
);

-- User Management Table (extends Associates for access control)
CREATE TABLE UserAccounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    associate_id UUID REFERENCES Associates(id), -- Links to associate profile if applicable
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    
    -- User Type & Status
    user_type user_type NOT NULL,
    account_status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (account_status IN (
        'ACTIVE',     -- Can access system
        'SUSPENDED',  -- Temporarily blocked
        'INACTIVE',   -- Account disabled
        'PENDING'     -- Awaiting activation
    )),
    
    -- Profile Information
    display_name VARCHAR(200),
    profile_data JSONB, -- Additional profile information
    
    -- System Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    password_hash VARCHAR(255), -- For authentication
    
    -- Multi-factor authentication
    mfa_enabled BOOLEAN DEFAULT false,
    mfa_secret VARCHAR(100)
);

-- Location Access Permissions (who can access what locations)
CREATE TABLE LocationAccessPermissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_account_id UUID NOT NULL REFERENCES UserAccounts(id),
    location_id TEXT NOT NULL, -- References Location(id)
    
    -- Access Levels for Different Operations
    location_management_access access_level DEFAULT 'NONE',
    personnel_management_access access_level DEFAULT 'NONE',
    role_declaration_access access_level DEFAULT 'NONE',
    financial_access access_level DEFAULT 'NONE',
    inventory_access access_level DEFAULT 'NONE',
    scheduling_access access_level DEFAULT 'NONE',
    reporting_access access_level DEFAULT 'NONE',
    
    -- Special Permissions
    can_override_policies BOOLEAN DEFAULT false,
    can_approve_agreements BOOLEAN DEFAULT false,
    can_hire_associates BOOLEAN DEFAULT false,
    
    -- Permission Scope
    is_primary_manager BOOLEAN DEFAULT false, -- Primary person responsible for this location
    permission_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    permission_end_date DATE, -- NULL for indefinite access
    
    -- Assignment Details
    assigned_by UUID REFERENCES UserAccounts(id), -- Who granted these permissions
    assignment_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_account_id, location_id) -- One permission record per user per location
);

-- Central Operations Scope (for multi-location oversight)
CREATE TABLE CentralOperationsScope (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_account_id UUID NOT NULL REFERENCES UserAccounts(id),
    
    -- Geographic Scope
    regional_scope TEXT[], -- Regions they oversee
    location_type_scope TEXT[], -- Types of locations (STATIC, POPUP, etc.)
    
    -- Functional Scope
    can_view_all_locations BOOLEAN DEFAULT false,
    can_manage_executives BOOLEAN DEFAULT false,
    can_transfer_personnel BOOLEAN DEFAULT false,
    can_approve_budgets BOOLEAN DEFAULT false,
    can_access_analytics BOOLEAN DEFAULT false,
    can_manage_certifications BOOLEAN DEFAULT false,
    
    -- Reporting Authority
    reports_to UUID REFERENCES UserAccounts(id),
    direct_reports UUID[], -- Array of user account IDs
    
    -- Operational Limits
    max_budget_approval_amount DECIMAL(12,2),
    approval_required_above_amount DECIMAL(12,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_account_id) -- One central operations record per user
);

-- ============================================
-- LOCATION-CENTERED MANAGEMENT TABLES
-- ============================================

-- Location Management Team (who's responsible for each location)
CREATE TABLE LocationManagementTeam (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id TEXT NOT NULL, -- References Location(id)
    user_account_id UUID NOT NULL REFERENCES UserAccounts(id),
    
    -- Management Role
    management_role VARCHAR(100) NOT NULL, -- 'Location Manager', 'Assistant Manager', 'Shift Supervisor'
    role_description TEXT,
    
    -- Authority Level
    has_hiring_authority BOOLEAN DEFAULT false,
    has_budget_authority BOOLEAN DEFAULT false,
    has_schedule_authority BOOLEAN DEFAULT false,
    budget_limit DECIMAL(10,2),
    
    -- Assignment Details
    assignment_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    assignment_end_date DATE, -- NULL for ongoing assignment
    is_acting_manager BOOLEAN DEFAULT false, -- Temporary assignment
    
    -- Performance & Responsibility
    performance_metrics JSONB,
    responsibilities TEXT[],
    kpis_measured TEXT[], -- Key Performance Indicators they're measured on
    
    -- Status
    assignment_status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (assignment_status IN (
        'ACTIVE',        -- Currently managing
        'TRANSITIONING', -- Handover period
        'SUSPENDED',     -- Temporarily reassigned
        'COMPLETED'      -- Assignment ended
    )),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES UserAccounts(id)
);

-- Location Operational Status (current state of each location)
CREATE TABLE LocationOperationalStatus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id TEXT NOT NULL REFERENCES Location(id),
    
    -- Current Status
    operational_status VARCHAR(20) DEFAULT 'OPERATIONAL' CHECK (operational_status IN (
        'OPERATIONAL',     -- Normal operations
        'LIMITED_SERVICE', -- Reduced capacity
        'MAINTENANCE',     -- Closed for maintenance
        'EMERGENCY',       -- Emergency closure
        'SEASONAL_CLOSED', -- Planned seasonal closure
        'PERMANENTLY_CLOSED' -- Location shut down
    )),
    
    -- Staffing Status
    current_staff_count INTEGER DEFAULT 0,
    minimum_staff_required INTEGER DEFAULT 1,
    optimal_staff_count INTEGER DEFAULT 3,
    
    -- Service Capabilities
    available_services TEXT[], -- Services currently offered
    temporarily_unavailable_services TEXT[], -- Services temporarily not available
    
    -- Notes and Updates
    status_notes TEXT,
    last_status_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES UserAccounts(id),
    
    -- Metrics
    daily_capacity_percentage DECIMAL(5,2), -- % of normal capacity
    service_quality_score DECIMAL(3,2), -- 1.0 to 5.0 rating
    
    status_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    UNIQUE(location_id, status_date) -- One status record per location per day
);

-- ============================================
-- SAMPLE DATA & ACCESS PATTERNS
-- ============================================

-- Create default user accounts
INSERT INTO UserAccounts (id, username, email, user_type, display_name) VALUES
('usr_central_001', 'central.ops', 'central@kavapr.com', 'CENTRAL_OPERATIONS', 'Central Operations'),
('usr_loc_main', 'main.manager', 'main.manager@kavapr.com', 'LOCATION_MANAGER', 'Main Store Manager'),
('usr_loc_wholesale', 'wholesale.manager', 'wholesale@kavapr.com', 'LOCATION_MANAGER', 'Wholesale Hub Manager'),
('usr_sysadmin', 'sysadmin', 'admin@kavapr.com', 'SYSTEM_ADMIN', 'System Administrator');

-- Link existing associates to user accounts where applicable
UPDATE UserAccounts SET associate_id = (
    SELECT id FROM Associates WHERE associate_code = 'KAV001'
) WHERE username = 'main.manager';

UPDATE UserAccounts SET associate_id = (
    SELECT id FROM Associates WHERE associate_code = 'KAV002'
) WHERE username = 'wholesale.manager';

-- Set up location access permissions
INSERT INTO LocationAccessPermissions (
    user_account_id, location_id, 
    location_management_access, personnel_management_access, 
    role_declaration_access, financial_access, 
    inventory_access, scheduling_access, reporting_access,
    can_override_policies, can_approve_agreements, can_hire_associates,
    is_primary_manager
) VALUES
-- Main Store Manager (full local authority)
(
    (SELECT id FROM UserAccounts WHERE username = 'main.manager'),
    'loc_main_store',
    'FULL', 'FULL', 'FULL', 'MODIFY', 'FULL', 'FULL', 'FULL',
    true, true, true, true
),
-- Wholesale Hub Manager (full local authority)
(
    (SELECT id FROM UserAccounts WHERE username = 'wholesale.manager'),
    'loc_wholesale_hub',
    'FULL', 'FULL', 'FULL', 'MODIFY', 'FULL', 'FULL', 'FULL',
    true, true, true, true
);

-- Set up central operations scope
INSERT INTO CentralOperationsScope (
    user_account_id,
    can_view_all_locations, can_manage_executives, can_transfer_personnel,
    can_approve_budgets, can_access_analytics, can_manage_certifications,
    max_budget_approval_amount, approval_required_above_amount
) VALUES
(
    (SELECT id FROM UserAccounts WHERE username = 'central.ops'),
    true, true, true, true, true, true,
    50000.00, 10000.00
);

-- Set up location management teams
INSERT INTO LocationManagementTeam (
    location_id, user_account_id, management_role,
    has_hiring_authority, has_budget_authority, has_schedule_authority,
    budget_limit, responsibilities
) VALUES
(
    'loc_main_store',
    (SELECT id FROM UserAccounts WHERE username = 'main.manager'),
    'Location Manager',
    true, true, true, 25000.00,
    ARRAY['Daily Operations', 'Staff Management', 'Customer Experience', 'Financial Performance']
),
(
    'loc_wholesale_hub',
    (SELECT id FROM UserAccounts WHERE username = 'wholesale.manager'),
    'Location Manager',
    true, true, true, 30000.00,
    ARRAY['Wholesale Operations', 'B2B Relations', 'Inventory Management', 'Distribution Coordination']
);

-- ============================================
-- COMMENTS & DOCUMENTATION
-- ============================================

COMMENT ON TABLE UserAccounts IS 'User accounts with type-based access control supporting both location-centered and central operations';
COMMENT ON TABLE LocationAccessPermissions IS 'Granular permissions for location-specific access and operations';
COMMENT ON TABLE CentralOperationsScope IS 'Multi-location oversight capabilities for central operations staff';
COMMENT ON TABLE LocationManagementTeam IS 'Local management structure for each location with clear authority boundaries';
COMMENT ON TABLE LocationOperationalStatus IS 'Real-time operational status tracking for each location';