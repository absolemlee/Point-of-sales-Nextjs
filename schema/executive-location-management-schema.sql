-- Executive Location Management and Role-Based Service Schema
-- Extends the Associates Management Schema with location-specific role assignments
-- Supports Executive Director (CEO-level) oversight and flexible role declarations

-- ============================================
-- EXECUTIVE LOCATION MANAGEMENT
-- ============================================

-- Service Roles Available for Static Locations
CREATE TYPE service_role_type AS ENUM (
    'KAVATENDER',      -- Making beverages only
    'KAVARISTA',       -- Client interaction + beverage creation
    'HOST',            -- Shift management + all other capabilities
    'EXECUTIVE_DIRECTOR' -- CEO-level location management
);

-- Role Capability Mapping (what each role can do)
CREATE TABLE ServiceRoleCapabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_type service_role_type NOT NULL,
    capability_name VARCHAR(100) NOT NULL, -- 'BEVERAGE_PREPARATION', 'CLIENT_INTERACTION', 'SHIFT_MANAGEMENT', 'LOCATION_OVERSIGHT', etc.
    is_required BOOLEAN DEFAULT true, -- Required vs optional capability
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role_type, capability_name)
);

-- Location Role Declarations (what roles each static location needs)
CREATE TABLE LocationRoleDeclarations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id TEXT NOT NULL, -- References Location(id) from location schema
    role_type service_role_type NOT NULL,
    positions_needed INTEGER DEFAULT 1,
    priority_level INTEGER DEFAULT 5 CHECK (priority_level BETWEEN 1 AND 10), -- 1=critical, 10=nice-to-have
    hourly_rate_min DECIMAL(8,2),
    hourly_rate_max DECIMAL(8,2),
    shift_requirements JSONB, -- Flexible schedule requirements
    
    -- Role fusion support (combining multiple role types)
    is_fused_role BOOLEAN DEFAULT false,
    fused_with_roles service_role_type[], -- Array of roles this position combines
    
    -- Special requirements
    certification_requirements TEXT[],
    experience_requirements TEXT,
    
    -- Status
    declaration_status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (declaration_status IN (
        'ACTIVE',     -- Currently seeking to fill
        'FILLED',     -- All positions filled
        'SUSPENDED',  -- Temporarily not filling
        'CANCELLED'   -- No longer needed
    )),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    declared_by UUID REFERENCES Associates(id), -- Executive Director who made declaration
    
    UNIQUE(location_id, role_type) -- One declaration per role per location
);

-- Executive Location Assignments (KAVAPR Executive Directors)
CREATE TABLE ExecutiveLocationAssignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    associate_id UUID NOT NULL REFERENCES Associates(id),
    location_id TEXT NOT NULL, -- References Location(id)
    
    -- Executive Authority
    executive_title VARCHAR(100) DEFAULT 'Executive Director',
    has_ceo_authority BOOLEAN DEFAULT true, -- Full location management authority
    oversight_level VARCHAR(20) DEFAULT 'FULL' CHECK (oversight_level IN (
        'FULL',       -- Complete authority
        'OPERATIONAL', -- Day-to-day operations only
        'ADVISORY'    -- Consulting role only
    )),
    
    -- Assignment Details
    assignment_start_date DATE NOT NULL,
    assignment_end_date DATE, -- NULL for indefinite assignment
    is_primary_executive BOOLEAN DEFAULT true, -- Primary vs secondary executive
    
    -- Authority Scope
    can_declare_roles BOOLEAN DEFAULT true,
    can_hire_associates BOOLEAN DEFAULT true,
    can_modify_schedules BOOLEAN DEFAULT true,
    can_approve_agreements BOOLEAN DEFAULT true,
    can_override_policies BOOLEAN DEFAULT true,
    
    -- Status
    assignment_status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (assignment_status IN (
        'ACTIVE',     -- Currently assigned
        'TRANSITIONING', -- In handover process
        'SUSPENDED',  -- Temporarily inactive
        'COMPLETED'   -- Assignment ended
    )),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(location_id, is_primary_executive) WHERE is_primary_executive = true -- Only one primary executive per location
);

-- Service Role Offers (preferred associate offers for specific roles)
CREATE TABLE ServiceRoleOffers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_role_declaration_id UUID NOT NULL REFERENCES LocationRoleDeclarations(id),
    offered_to_associate_id UUID NOT NULL REFERENCES Associates(id),
    
    -- Offer Details
    offered_hourly_rate DECIMAL(8,2),
    offered_schedule JSONB, -- Specific schedule offer
    special_terms TEXT, -- Any unique agreement terms
    
    -- Offer Status
    offer_status VARCHAR(20) DEFAULT 'PENDING' CHECK (offer_status IN (
        'PENDING',    -- Offer extended, awaiting response
        'ACCEPTED',   -- Associate accepted offer
        'DECLINED',   -- Associate declined offer
        'WITHDRAWN',  -- Location withdrew offer
        'EXPIRED'     -- Offer timed out
    )),
    
    -- Timeline
    offer_date DATE NOT NULL DEFAULT CURRENT_DATE,
    response_deadline DATE,
    response_date DATE,
    
    -- Authority
    offered_by UUID NOT NULL REFERENCES Associates(id), -- Executive Director making offer
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Active Role Assignments (current service engagements)
CREATE TABLE ActiveRoleAssignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_role_declaration_id UUID NOT NULL REFERENCES LocationRoleDeclarations(id),
    associate_id UUID NOT NULL REFERENCES Associates(id),
    
    -- Assignment Details
    assigned_role service_role_type NOT NULL,
    agreed_hourly_rate DECIMAL(8,2),
    agreed_schedule JSONB,
    
    -- Performance & Quality
    performance_rating DECIMAL(3,2) CHECK (performance_rating BETWEEN 1.0 AND 5.0),
    quality_metrics JSONB, -- Role-specific quality measurements
    training_completion_status JSONB,
    
    -- Assignment Status
    assignment_status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (assignment_status IN (
        'ACTIVE',        -- Currently assigned and working
        'PROBATIONARY',  -- Trial period
        'PERFORMANCE_REVIEW', -- Under evaluation
        'SUSPENDED',     -- Temporarily inactive
        'COMPLETED',     -- Assignment ended successfully
        'TERMINATED'     -- Assignment ended with issues
    )),
    
    -- Timeline
    assignment_start_date DATE NOT NULL,
    assignment_end_date DATE, -- NULL for ongoing assignments
    last_performance_review DATE,
    
    -- Authority
    assigned_by UUID NOT NULL REFERENCES Associates(id), -- Executive Director who made assignment
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(location_role_declaration_id, associate_id) -- One assignment per associate per role declaration
);

-- Qualified Associate Pool (associates eligible for specific roles)
CREATE TABLE QualifiedAssociatePool (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    associate_id UUID NOT NULL REFERENCES Associates(id),
    role_type service_role_type NOT NULL,
    
    -- Qualification Details
    qualification_level VARCHAR(20) DEFAULT 'QUALIFIED' CHECK (qualification_level IN (
        'TRAINEE',       -- Learning the role
        'QUALIFIED',     -- Can perform role
        'EXPERT',        -- Advanced proficiency
        'TRAINER'        -- Can train others
    )),
    
    -- Experience
    years_in_role DECIMAL(4,2) DEFAULT 0,
    locations_worked TEXT[], -- Previous location experience
    specializations TEXT[], -- Role-specific specializations
    
    -- Availability
    geographic_availability TEXT[], -- Locations willing to work
    schedule_availability JSONB, -- When available to work
    max_hours_per_week INTEGER DEFAULT 40,
    
    -- Preferences
    preferred_locations TEXT[],
    preferred_hourly_rate_min DECIMAL(8,2),
    willing_to_travel BOOLEAN DEFAULT false,
    travel_radius_miles INTEGER DEFAULT 0,
    
    -- Status
    availability_status VARCHAR(20) DEFAULT 'AVAILABLE' CHECK (availability_status IN (
        'AVAILABLE',     -- Ready for assignments
        'PARTIALLY_AVAILABLE', -- Limited availability
        'UNAVAILABLE',   -- Not seeking assignments
        'COMMITTED'      -- Fully assigned elsewhere
    )),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(associate_id, role_type) -- One qualification record per associate per role
);

-- ============================================
-- SYSTEM CAPABILITY DEFINITIONS
-- ============================================

-- Insert default role capabilities
INSERT INTO ServiceRoleCapabilities (role_type, capability_name, description) VALUES
-- KAVATENDER capabilities
('KAVATENDER', 'BEVERAGE_PREPARATION', 'Traditional and modern kava beverage preparation'),
('KAVATENDER', 'KITCHEN_OPERATIONS', 'Kitchen safety, hygiene, and equipment operation'),
('KAVATENDER', 'QUALITY_CONTROL', 'Ensuring beverage quality and consistency'),

-- KAVARISTA capabilities (includes Kavatender + client interaction)
('KAVARISTA', 'BEVERAGE_PREPARATION', 'Traditional and modern kava beverage preparation'),
('KAVARISTA', 'KITCHEN_OPERATIONS', 'Kitchen safety, hygiene, and equipment operation'),
('KAVARISTA', 'QUALITY_CONTROL', 'Ensuring beverage quality and consistency'),
('KAVARISTA', 'CLIENT_INTERACTION', 'Member/client service and cultural education'),
('KAVARISTA', 'CULTURAL_PROTOCOL', 'Kava ceremony and cultural tradition knowledge'),
('KAVARISTA', 'SALES_SUPPORT', 'Product recommendations and upselling'),

-- HOST capabilities (includes Kavarista + management)
('HOST', 'BEVERAGE_PREPARATION', 'Traditional and modern kava beverage preparation'),
('HOST', 'KITCHEN_OPERATIONS', 'Kitchen safety, hygiene, and equipment operation'),
('HOST', 'QUALITY_CONTROL', 'Ensuring beverage quality and consistency'),
('HOST', 'CLIENT_INTERACTION', 'Member/client service and cultural education'),
('HOST', 'CULTURAL_PROTOCOL', 'Kava ceremony and cultural tradition knowledge'),
('HOST', 'SALES_SUPPORT', 'Product recommendations and upselling'),
('HOST', 'SHIFT_MANAGEMENT', 'Managing shift operations and team coordination'),
('HOST', 'CONFLICT_RESOLUTION', 'Handling customer and staff issues'),
('HOST', 'INVENTORY_OVERSIGHT', 'Monitoring and managing location inventory'),
('HOST', 'CASH_MANAGEMENT', 'POS operations and cash handling'),

-- EXECUTIVE_DIRECTOR capabilities (CEO-level)
('EXECUTIVE_DIRECTOR', 'LOCATION_OVERSIGHT', 'Complete location management authority'),
('EXECUTIVE_DIRECTOR', 'STRATEGIC_PLANNING', 'Long-term location strategy and growth'),
('EXECUTIVE_DIRECTOR', 'PERSONNEL_MANAGEMENT', 'Hiring, firing, and performance management'),
('EXECUTIVE_DIRECTOR', 'FINANCIAL_MANAGEMENT', 'Budget, P&L, and financial reporting'),
('EXECUTIVE_DIRECTOR', 'COMPLIANCE_OVERSIGHT', 'Legal, safety, and regulatory compliance'),
('EXECUTIVE_DIRECTOR', 'PARTNERSHIP_DEVELOPMENT', 'Building strategic relationships'),
('EXECUTIVE_DIRECTOR', 'QUALITY_ASSURANCE', 'Maintaining brand and service standards'),
('EXECUTIVE_DIRECTOR', 'CRISIS_MANAGEMENT', 'Handling emergencies and critical situations');

-- ============================================
-- COMMENTS & DOCUMENTATION
-- ============================================

COMMENT ON TABLE ServiceRoleCapabilities IS 'Defines what capabilities each service role requires and provides';
COMMENT ON TABLE LocationRoleDeclarations IS 'Roles each static location declares it needs to operate effectively';
COMMENT ON TABLE ExecutiveLocationAssignments IS 'KAVAPR Executive Directors assigned to oversee static locations with CEO authority';
COMMENT ON TABLE ServiceRoleOffers IS 'Preferred offers to specific associates for declared roles';
COMMENT ON TABLE ActiveRoleAssignments IS 'Current service role assignments and performance tracking';
COMMENT ON TABLE QualifiedAssociatePool IS 'Associates qualified for specific roles and their availability';