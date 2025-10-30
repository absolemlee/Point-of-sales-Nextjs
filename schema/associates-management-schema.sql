-- Professional Associates Management Schema for Kava Network
-- Designed for service-based agreements rather than traditional employment

-- ============================================
-- ASSOCIATES (Professional Service Providers)
-- ============================================

CREATE TABLE Associates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    associate_code VARCHAR(20) UNIQUE NOT NULL, -- KAV001, KAV002, etc.
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    preferred_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    date_of_birth DATE,
    
    -- Professional Information
    professional_title VARCHAR(100), -- 'Certified Kava Professional', 'Kava Specialist', 'Junior Associate'
    specializations TEXT[], -- ['Traditional Preparation', 'Modern Mixology', 'Cultural Education']
    years_experience INTEGER DEFAULT 0,
    bio TEXT, -- Professional background
    
    -- Contact & Emergency
    address JSONB, -- Flexible address structure
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(50),
    
    -- Agreement Status
    associate_status VARCHAR(20) DEFAULT 'PENDING' CHECK (associate_status IN (
        'PENDING',     -- Application submitted
        'ACTIVE',      -- Currently providing services
        'INACTIVE',    -- Temporarily not providing services
        'SUSPENDED',   -- Agreement suspended
        'TERMINATED'   -- Agreement ended
    )),
    
    -- Onboarding & Compliance
    background_check_status VARCHAR(20) DEFAULT 'PENDING' CHECK (background_check_status IN (
        'PENDING', 'APPROVED', 'REJECTED', 'EXPIRED'
    )),
    background_check_date DATE,
    orientation_completed_date DATE,
    
    -- System Data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID, -- Reference to admin who added
    
    -- Professional Network
    referral_source VARCHAR(100), -- How they found the network
    network_join_date DATE DEFAULT CURRENT_DATE
);

-- ============================================
-- CERTIFICATIONS (Professional Qualifications)
-- ============================================

CREATE TABLE Certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certification_name VARCHAR(100) NOT NULL,
    certification_type VARCHAR(50) NOT NULL CHECK (certification_type IN (
        'KAVA_PROFESSIONAL',    -- Primary kava service certification
        'CULTURAL_EDUCATION',   -- Cultural knowledge and education
        'SAFETY_COMPLIANCE',    -- Health and safety protocols
        'MIXOLOGY',            -- Advanced preparation techniques
        'BUSINESS_OPERATIONS',  -- Location management skills
        'CUSTOMER_SERVICE'      -- Service excellence
    )),
    issuing_organization VARCHAR(100) NOT NULL,
    description TEXT,
    prerequisites TEXT[],
    validity_period_months INTEGER, -- NULL for lifetime certifications
    is_required_for_service BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ASSOCIATE CERTIFICATIONS (Tracking & Status)
-- ============================================

CREATE TABLE AssociateCertifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    associate_id UUID NOT NULL REFERENCES Associates(id) ON DELETE CASCADE,
    certification_id UUID NOT NULL REFERENCES Certifications(id) ON DELETE CASCADE,
    
    -- Certification Status
    certification_status VARCHAR(20) DEFAULT 'IN_PROGRESS' CHECK (certification_status IN (
        'IN_PROGRESS',   -- Currently working toward certification
        'CERTIFIED',     -- Successfully certified
        'EXPIRED',       -- Certification has expired
        'SUSPENDED',     -- Certification suspended
        'REVOKED'        -- Certification revoked
    )),
    
    -- Important Dates
    start_date DATE NOT NULL,
    completion_date DATE,
    expiration_date DATE,
    last_renewal_date DATE,
    next_renewal_due DATE,
    
    -- Documentation
    certificate_number VARCHAR(50),
    issuing_instructor VARCHAR(100),
    verification_documents JSONB, -- URLs to certificates, etc.
    notes TEXT,
    
    -- Tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(associate_id, certification_id)
);

-- ============================================
-- AGREEMENTS (Service Contracts & Partnerships)
-- ============================================

CREATE TABLE Agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    associate_id UUID NOT NULL REFERENCES Associates(id) ON DELETE CASCADE,
    location_id UUID NOT NULL, -- References Location table
    
    -- Agreement Type & Details
    agreement_type VARCHAR(30) NOT NULL CHECK (agreement_type IN (
        'PARTNERSHIP',          -- Full partnership agreement
        'SCOPED_PROJECT',       -- Specific project-based work
        'JUNIOR_ASSOCIATION',   -- Entry-level association
        'CONSULTING',          -- Advisory/consulting services
        'SEASONAL',            -- Seasonal service agreements
        'EVENT_BASED'          -- Special events only
    )),
    
    agreement_title VARCHAR(200) NOT NULL,
    agreement_description TEXT,
    
    -- Terms & Conditions
    start_date DATE NOT NULL,
    end_date DATE, -- NULL for ongoing agreements
    auto_renewal BOOLEAN DEFAULT false,
    renewal_period_months INTEGER,
    
    -- Service Terms
    services_provided TEXT[], -- Array of services offered
    service_rate_structure JSONB, -- Flexible rate structure
    minimum_service_hours_per_week INTEGER DEFAULT 0,
    maximum_service_hours_per_week INTEGER,
    
    -- Location & Access
    authorized_location_types TEXT[], -- Which location types they can serve
    restricted_areas TEXT[], -- Any area restrictions
    supervision_required BOOLEAN DEFAULT false,
    can_open_location BOOLEAN DEFAULT false,
    can_close_location BOOLEAN DEFAULT false,
    
    -- Agreement Status
    agreement_status VARCHAR(20) DEFAULT 'DRAFT' CHECK (agreement_status IN (
        'DRAFT',       -- Being prepared
        'PENDING',     -- Awaiting signatures
        'ACTIVE',      -- Currently in effect
        'SUSPENDED',   -- Temporarily suspended
        'TERMINATED',  -- Ended
        'EXPIRED'      -- Naturally expired
    )),
    
    -- Legal & Compliance
    signed_by_associate DATE,
    signed_by_location_manager DATE,
    signed_by_network_admin DATE,
    liability_insurance_required BOOLEAN DEFAULT true,
    insurance_verification_date DATE,
    
    -- Financial Terms
    payment_structure VARCHAR(20) CHECK (payment_structure IN (
        'HOURLY', 'DAILY', 'PROJECT', 'REVENUE_SHARE', 'PARTNERSHIP_DRAW'
    )),
    base_rate DECIMAL(10,2),
    bonus_structure JSONB,
    expense_reimbursement_policy TEXT,
    
    -- Performance & Reviews
    performance_review_frequency_months INTEGER DEFAULT 6,
    last_review_date DATE,
    next_review_due DATE,
    
    -- System Tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    
    UNIQUE(associate_id, location_id, agreement_type, start_date)
);

-- ============================================
-- LOCATION AUTHORIZATIONS (Access Control)
-- ============================================

CREATE TABLE LocationAuthorizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    associate_id UUID NOT NULL REFERENCES Associates(id) ON DELETE CASCADE,
    location_id UUID NOT NULL, -- References Location table
    agreement_id UUID REFERENCES Agreements(id) ON DELETE CASCADE,
    
    -- Authorization Details
    authorization_type VARCHAR(30) NOT NULL CHECK (authorization_type IN (
        'FULL_ACCESS',      -- Complete location access
        'SERVICE_ONLY',     -- Service areas only
        'TRAINING',         -- Training/observation access
        'RESTRICTED',       -- Limited specific areas
        'EMERGENCY_ONLY'    -- Emergency situations only
    )),
    
    -- Access Permissions
    can_access_pos BOOLEAN DEFAULT false,
    can_manage_inventory BOOLEAN DEFAULT false,
    can_handle_cash BOOLEAN DEFAULT false,
    can_supervise_others BOOLEAN DEFAULT false,
    can_access_reports BOOLEAN DEFAULT false,
    
    -- Schedule Permissions
    can_work_alone BOOLEAN DEFAULT false,
    requires_supervision BOOLEAN DEFAULT true,
    authorized_time_ranges JSONB, -- When they can provide services
    
    -- Status & Validity
    authorization_status VARCHAR(20) DEFAULT 'PENDING' CHECK (authorization_status IN (
        'PENDING', 'ACTIVE', 'SUSPENDED', 'REVOKED', 'EXPIRED'
    )),
    
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiration_date DATE,
    
    -- Approval Chain
    approved_by_location_manager UUID,
    approved_by_network_admin UUID,
    approval_date DATE,
    
    -- System Tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(associate_id, location_id)
);

-- ============================================
-- SERVICE SCHEDULES (Professional Service Times)
-- ============================================

CREATE TABLE ServiceSchedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    associate_id UUID NOT NULL REFERENCES Associates(id) ON DELETE CASCADE,
    location_id UUID NOT NULL,
    agreement_id UUID REFERENCES Agreements(id) ON DELETE CASCADE,
    
    -- Schedule Details
    schedule_date DATE NOT NULL,
    scheduled_start_time TIME NOT NULL,
    scheduled_end_time TIME NOT NULL,
    scheduled_break_duration_minutes INTEGER DEFAULT 30,
    
    -- Service Information
    service_type VARCHAR(30) NOT NULL CHECK (service_type IN (
        'REGULAR_SERVICE',    -- Standard kava service
        'OPENING_SERVICE',    -- Location opening duties
        'CLOSING_SERVICE',    -- Location closing duties
        'TRAINING_SESSION',   -- Training or mentoring
        'SPECIAL_EVENT',      -- Special events
        'CONSULTING',         -- Advisory services
        'MAINTENANCE'         -- Equipment/facility maintenance
    )),
    
    service_role VARCHAR(100) NOT NULL, -- 'Lead Kava Professional', 'Cultural Educator', etc.
    primary_responsibilities TEXT[],
    
    -- Actual Service Tracking
    actual_start_time TIME,
    actual_end_time TIME,
    actual_break_duration_minutes INTEGER DEFAULT 0,
    
    -- Service Status
    service_status VARCHAR(20) DEFAULT 'SCHEDULED' CHECK (service_status IN (
        'SCHEDULED',     -- Planned service
        'CONFIRMED',     -- Associate confirmed availability
        'IN_PROGRESS',   -- Currently providing service
        'COMPLETED',     -- Service completed successfully
        'CANCELLED',     -- Service cancelled
        'NO_SHOW',       -- Associate didn't show up
        'RESCHEDULED'    -- Moved to different time
    )),
    
    -- Professional Requirements
    requires_supervision BOOLEAN DEFAULT false,
    supervision_provided_by UUID REFERENCES Associates(id),
    minimum_certification_level VARCHAR(50),
    
    -- Service Notes & Quality
    pre_service_notes TEXT,
    post_service_notes TEXT,
    service_quality_rating INTEGER CHECK (service_quality_rating BETWEEN 1 AND 5),
    customer_feedback TEXT,
    
    -- Financial Tracking
    service_rate DECIMAL(10,2),
    total_compensation DECIMAL(10,2),
    compensation_status VARCHAR(20) DEFAULT 'PENDING' CHECK (compensation_status IN (
        'PENDING', 'PROCESSED', 'PAID', 'DISPUTED'
    )),
    
    -- Approval & Verification
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- System Tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SERVICE TIME TRACKING (Professional Service Logs)
-- ============================================

CREATE TABLE ServiceTimeEntries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    associate_id UUID NOT NULL REFERENCES Associates(id) ON DELETE CASCADE,
    location_id UUID NOT NULL,
    service_schedule_id UUID REFERENCES ServiceSchedules(id) ON DELETE CASCADE,
    
    -- Time Entry Details
    entry_type VARCHAR(20) NOT NULL CHECK (entry_type IN (
        'SERVICE_START',    -- Begin providing service
        'BREAK_START',      -- Start break/meal period
        'BREAK_END',        -- End break/meal period
        'SERVICE_END',      -- End service provision
        'CONSULTATION_START', -- Begin consultation
        'CONSULTATION_END'    -- End consultation
    )),
    
    entry_time TIMESTAMP WITH TIME ZONE NOT NULL,
    entry_method VARCHAR(20) DEFAULT 'MANUAL' CHECK (entry_method IN (
        'MANUAL',          -- Manually entered
        'MOBILE_APP',      -- Through mobile application
        'BIOMETRIC',       -- Biometric verification
        'BADGE_SCAN',      -- ID badge scan
        'QR_CODE'          -- QR code scan
    )),
    
    -- Location & Verification
    entry_location POINT, -- GPS coordinates if available
    ip_address INET,
    device_info JSONB,
    verification_photo_url TEXT,
    
    -- Service Context
    service_description TEXT,
    customers_served INTEGER,
    special_circumstances TEXT,
    
    -- Quality & Compliance
    safety_protocols_followed BOOLEAN DEFAULT true,
    cleanliness_standards_met BOOLEAN DEFAULT true,
    cultural_protocols_observed BOOLEAN DEFAULT true,
    
    -- Adjustments & Corrections
    is_adjustment BOOLEAN DEFAULT false,
    original_entry_time TIMESTAMP WITH TIME ZONE,
    adjustment_reason TEXT,
    adjusted_by UUID REFERENCES Associates(id),
    requires_approval BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES Associates(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- System Tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- AVAILABILITY (Associate Availability Management)
-- ============================================

CREATE TABLE AssociateAvailability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    associate_id UUID NOT NULL REFERENCES Associates(id) ON DELETE CASCADE,
    location_id UUID, -- NULL means available for any location
    
    -- Availability Type
    availability_type VARCHAR(20) NOT NULL CHECK (availability_type IN (
        'RECURRING',    -- Regular weekly availability
        'SPECIFIC_DATE', -- Specific date availability
        'DATE_RANGE',   -- Range of dates
        'BLACKOUT'      -- Not available (vacation, etc.)
    )),
    
    -- Time Details
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
    specific_date DATE,
    start_date DATE,
    end_date DATE,
    start_time TIME,
    end_time TIME,
    
    -- Availability Status
    availability_status VARCHAR(20) DEFAULT 'AVAILABLE' CHECK (availability_status IN (
        'AVAILABLE',     -- Available for service
        'PREFERRED',     -- Preferred time slot
        'LIMITED',       -- Limited availability
        'UNAVAILABLE',   -- Not available
        'CONDITIONAL'    -- Available under certain conditions
    )),
    
    -- Service Preferences
    preferred_service_types TEXT[],
    maximum_hours_per_day INTEGER,
    requires_advance_notice_hours INTEGER DEFAULT 24,
    
    -- Travel & Location
    willing_to_travel BOOLEAN DEFAULT false,
    maximum_travel_distance_miles INTEGER,
    travel_compensation_required BOOLEAN DEFAULT true,
    
    -- Notes & Conditions
    availability_notes TEXT,
    conditions TEXT,
    
    -- Priority & Preferences
    priority_level INTEGER DEFAULT 5 CHECK (priority_level BETWEEN 1 AND 10),
    
    -- System Tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure logical constraints
    CHECK (
        (availability_type = 'RECURRING' AND day_of_week IS NOT NULL) OR
        (availability_type = 'SPECIFIC_DATE' AND specific_date IS NOT NULL) OR
        (availability_type IN ('DATE_RANGE', 'BLACKOUT') AND start_date IS NOT NULL AND end_date IS NOT NULL)
    )
);

-- ============================================
-- SAMPLE DATA FOR KAVA PROFESSIONAL NETWORK
-- ============================================

-- Sample Certifications
INSERT INTO Certifications (certification_name, certification_type, issuing_organization, description, validity_period_months, is_required_for_service) VALUES
('Certified Kava Professional Level 1', 'KAVA_PROFESSIONAL', 'Kava Professional Association', 'Basic kava preparation and service certification', 24, true),
('Traditional Kava Cultural Education', 'CULTURAL_EDUCATION', 'Pacific Cultural Institute', 'Cultural knowledge and traditional practices', NULL, false),
('Kava Safety & Compliance', 'SAFETY_COMPLIANCE', 'Kava Safety Board', 'Health, safety, and regulatory compliance', 12, true),
('Advanced Kava Mixology', 'MIXOLOGY', 'Kava Artisan Guild', 'Advanced preparation techniques and modern applications', 36, false),
('Kava Business Operations', 'BUSINESS_OPERATIONS', 'Kava Business Institute', 'Location management and business operations', 24, false);

-- Sample Associates
INSERT INTO Associates (
    associate_code, first_name, last_name, email, phone_number, 
    professional_title, specializations, years_experience, bio,
    associate_status, background_check_status, orientation_completed_date
) VALUES
('KAV001', 'Malia', 'Nakamura', 'malia.nakamura@kavapro.com', '555-0101',
 'Senior Kava Professional', ARRAY['Traditional Preparation', 'Cultural Education'], 8,
 'Traditional kava expert with deep cultural knowledge and 8 years of professional service.',
 'ACTIVE', 'APPROVED', '2024-01-15'),

('KAV002', 'Kai', 'Henderson', 'kai.henderson@kavapro.com', '555-0102',
 'Kava Specialist', ARRAY['Modern Mixology', 'Customer Service'], 4,
 'Modern kava specialist focusing on innovative preparations and exceptional customer experience.',
 'ACTIVE', 'APPROVED', '2024-03-20'),

('KAV003', 'Leilani', 'Torres', 'leilani.torres@kavapro.com', '555-0103',
 'Junior Associate', ARRAY['Basic Preparation'], 1,
 'New associate in certification process, enthusiastic about kava culture and service.',
 'ACTIVE', 'APPROVED', '2024-09-10'),

('KAV004', 'David', 'Kim', 'david.kim@kavapro.com', '555-0104',
 'Consulting Professional', ARRAY['Business Operations', 'Training'], 6,
 'Business operations specialist providing consulting services and associate training.',
 'ACTIVE', 'APPROVED', '2024-02-28');

-- Sample Associate Certifications
INSERT INTO AssociateCertifications (associate_id, certification_id, certification_status, start_date, completion_date, expiration_date, certificate_number) VALUES
((SELECT id FROM Associates WHERE associate_code = 'KAV001'), (SELECT id FROM Certifications WHERE certification_name = 'Certified Kava Professional Level 1'), 'CERTIFIED', '2023-01-10', '2023-03-15', '2025-03-15', 'CKP-2023-001'),
((SELECT id FROM Associates WHERE associate_code = 'KAV001'), (SELECT id FROM Certifications WHERE certification_name = 'Traditional Kava Cultural Education'), 'CERTIFIED', '2023-02-01', '2023-04-20', NULL, 'TKCE-2023-001'),
((SELECT id FROM Associates WHERE associate_code = 'KAV002'), (SELECT id FROM Certifications WHERE certification_name = 'Certified Kava Professional Level 1'), 'CERTIFIED', '2023-08-01', '2023-10-15', '2025-10-15', 'CKP-2023-012'),
((SELECT id FROM Associates WHERE associate_code = 'KAV002'), (SELECT id FROM Certifications WHERE certification_name = 'Advanced Kava Mixology'), 'CERTIFIED', '2024-01-15', '2024-04-20', '2027-04-20', 'AKM-2024-003'),
((SELECT id FROM Associates WHERE associate_code = 'KAV003'), (SELECT id FROM Certifications WHERE certification_name = 'Certified Kava Professional Level 1'), 'IN_PROGRESS', '2024-09-01', NULL, NULL, NULL);

-- Sample Agreements
INSERT INTO Agreements (
    associate_id, location_id, agreement_type, agreement_title, agreement_description,
    start_date, services_provided, service_rate_structure, agreement_status,
    payment_structure, base_rate, signed_by_associate, signed_by_location_manager
) VALUES
((SELECT id FROM Associates WHERE associate_code = 'KAV001'), 'default-location', 'PARTNERSHIP',
 'Senior Kava Professional Partnership', 'Full partnership agreement for senior-level kava service and cultural education',
 '2024-01-15', ARRAY['Traditional Kava Service', 'Cultural Education', 'Associate Training'],
 '{"base_hourly": 25.00, "cultural_education_bonus": 5.00, "training_bonus": 10.00}',
 'ACTIVE', 'HOURLY', 25.00, '2024-01-10', '2024-01-12'),

((SELECT id FROM Associates WHERE associate_code = 'KAV002'), 'default-location', 'SCOPED_PROJECT',
 'Modern Kava Service Agreement', 'Project-based agreement for modern kava service and mixology',
 '2024-03-20', ARRAY['Modern Kava Service', 'Mixology', 'Customer Experience'],
 '{"base_hourly": 20.00, "mixology_bonus": 3.00}',
 'ACTIVE', 'HOURLY', 20.00, '2024-03-18', '2024-03-19'),

((SELECT id FROM Associates WHERE associate_code = 'KAV003'), 'default-location', 'JUNIOR_ASSOCIATION',
 'Junior Associate Development Agreement', 'Entry-level association with mentorship and certification support',
 '2024-09-10', ARRAY['Basic Kava Service', 'Learning Support'],
 '{"base_hourly": 16.00, "certification_bonus": 2.00}',
 'ACTIVE', 'HOURLY', 16.00, '2024-09-08', '2024-09-09');

-- Sample Location Authorizations
INSERT INTO LocationAuthorizations (
    associate_id, location_id, authorization_type, can_access_pos, can_handle_cash,
    can_supervise_others, can_work_alone, requires_supervision, authorization_status,
    effective_date, approved_by_location_manager, approval_date
) VALUES
((SELECT id FROM Associates WHERE associate_code = 'KAV001'), 'default-location', 'FULL_ACCESS',
 true, true, true, true, false, 'ACTIVE', '2024-01-15', 'manager-001', '2024-01-15'),

((SELECT id FROM Associates WHERE associate_code = 'KAV002'), 'default-location', 'SERVICE_ONLY',
 true, true, false, true, false, 'ACTIVE', '2024-03-20', 'manager-001', '2024-03-20'),

((SELECT id FROM Associates WHERE associate_code = 'KAV003'), 'default-location', 'RESTRICTED',
 false, false, false, false, true, 'ACTIVE', '2024-09-10', 'manager-001', '2024-09-10');

-- Sample Service Schedules for Today
INSERT INTO ServiceSchedules (
    associate_id, location_id, schedule_date, scheduled_start_time, scheduled_end_time,
    service_type, service_role, primary_responsibilities, service_status, service_rate
) VALUES
((SELECT id FROM Associates WHERE associate_code = 'KAV001'), 'default-location', CURRENT_DATE,
 '07:00', '15:00', 'OPENING_SERVICE', 'Lead Kava Professional',
 ARRAY['Location Opening', 'Cultural Education', 'Associate Supervision'], 'SCHEDULED', 25.00),

((SELECT id FROM Associates WHERE associate_code = 'KAV002'), 'default-location', CURRENT_DATE,
 '10:00', '18:00', 'REGULAR_SERVICE', 'Kava Specialist',
 ARRAY['Modern Kava Service', 'Mixology', 'Customer Experience'], 'SCHEDULED', 20.00),

((SELECT id FROM Associates WHERE associate_code = 'KAV003'), 'default-location', CURRENT_DATE,
 '12:00', '20:00', 'REGULAR_SERVICE', 'Junior Associate',
 ARRAY['Basic Kava Service', 'Learning Support'], 'SCHEDULED', 16.00);

-- Sample Associate Availability
INSERT INTO AssociateAvailability (
    associate_id, availability_type, day_of_week, start_time, end_time,
    availability_status, preferred_service_types, maximum_hours_per_day
) VALUES
-- Malia's regular availability
((SELECT id FROM Associates WHERE associate_code = 'KAV001'), 'RECURRING', 1, '07:00', '16:00', 'AVAILABLE', ARRAY['Traditional Kava Service', 'Cultural Education'], 9),
((SELECT id FROM Associates WHERE associate_code = 'KAV001'), 'RECURRING', 3, '07:00', '16:00', 'AVAILABLE', ARRAY['Traditional Kava Service', 'Cultural Education'], 9),
((SELECT id FROM Associates WHERE associate_code = 'KAV001'), 'RECURRING', 5, '07:00', '16:00', 'PREFERRED', ARRAY['Traditional Kava Service', 'Cultural Education'], 9),

-- Kai's regular availability
((SELECT id FROM Associates WHERE associate_code = 'KAV002'), 'RECURRING', 2, '10:00', '19:00', 'AVAILABLE', ARRAY['Modern Kava Service', 'Mixology'], 8),
((SELECT id FROM Associates WHERE associate_code = 'KAV002'), 'RECURRING', 4, '10:00', '19:00', 'AVAILABLE', ARRAY['Modern Kava Service', 'Mixology'], 8),
((SELECT id FROM Associates WHERE associate_code = 'KAV002'), 'RECURRING', 6, '10:00', '19:00', 'PREFERRED', ARRAY['Modern Kava Service', 'Mixology'], 8),

-- Leilani's regular availability
((SELECT id FROM Associates WHERE associate_code = 'KAV003'), 'RECURRING', 0, '12:00', '21:00', 'AVAILABLE', ARRAY['Basic Kava Service'], 8),
((SELECT id FROM Associates WHERE associate_code = 'KAV003'), 'RECURRING', 6, '12:00', '21:00', 'AVAILABLE', ARRAY['Basic Kava Service'], 8);

-- Create indexes for performance
CREATE INDEX idx_associates_status ON Associates(associate_status);
CREATE INDEX idx_associates_code ON Associates(associate_code);
CREATE INDEX idx_associate_certifications_status ON AssociateCertifications(certification_status);
CREATE INDEX idx_agreements_status ON Agreements(agreement_status);
CREATE INDEX idx_agreements_type ON Agreements(agreement_type);
CREATE INDEX idx_location_authorizations_status ON LocationAuthorizations(authorization_status);
CREATE INDEX idx_service_schedules_date ON ServiceSchedules(schedule_date);
CREATE INDEX idx_service_schedules_status ON ServiceSchedules(service_status);
CREATE INDEX idx_service_time_entries_time ON ServiceTimeEntries(entry_time);
CREATE INDEX idx_associate_availability_type ON AssociateAvailability(availability_type);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_associates_updated_at BEFORE UPDATE ON Associates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_associate_certifications_updated_at BEFORE UPDATE ON AssociateCertifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agreements_updated_at BEFORE UPDATE ON Agreements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_location_authorizations_updated_at BEFORE UPDATE ON LocationAuthorizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_schedules_updated_at BEFORE UPDATE ON ServiceSchedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_time_entries_updated_at BEFORE UPDATE ON ServiceTimeEntries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_associate_availability_updated_at BEFORE UPDATE ON AssociateAvailability FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();