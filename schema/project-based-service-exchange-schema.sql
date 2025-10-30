-- Project-Based Service Exchange Schema
-- Replaces hourly rate model with service definitions, duration ranges, and location offers

-- ============================================
-- SERVICE DEFINITION SYSTEM
-- ============================================

-- Service Categories for organization
CREATE TYPE service_category AS ENUM (
    'FOOD_PREPARATION',
    'CUSTOMER_SERVICE', 
    'CLEANING_MAINTENANCE',
    'INVENTORY_MANAGEMENT',
    'SETUP_BREAKDOWN',
    'DELIVERY_LOGISTICS',
    'ADMINISTRATIVE',
    'TRAINING_SUPPORT',
    'MARKETING_PROMOTION',
    'TECHNICAL_SUPPORT'
);

-- Service complexity levels affecting pricing
CREATE TYPE service_complexity AS ENUM (
    'BASIC',        -- Simple, routine tasks
    'INTERMEDIATE', -- Moderate skill required
    'ADVANCED',     -- High skill, specialized knowledge
    'EXPERT'        -- Highly specialized, critical tasks
);

-- Service urgency levels
CREATE TYPE service_urgency AS ENUM (
    'ROUTINE',      -- Normal timeline
    'PRIORITY',     -- Faster completion desired
    'URGENT',       -- Quick turnaround needed
    'EMERGENCY'     -- Immediate completion required
);

-- Base Service Definitions (templates that locations can offer)
CREATE TABLE Services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Service Identity
    service_name VARCHAR(200) NOT NULL,
    service_code VARCHAR(50) UNIQUE NOT NULL, -- For easy reference
    category service_category NOT NULL,
    complexity service_complexity NOT NULL,
    
    -- Service Description
    short_description TEXT NOT NULL,
    detailed_description TEXT,
    required_skills TEXT[], -- Array of skill requirements
    required_certifications TEXT[], -- Array of certification requirements
    
    -- Duration and Timing
    estimated_duration_hours DECIMAL(4,2) NOT NULL, -- Base estimate in hours
    duration_range_min_hours DECIMAL(4,2) NOT NULL, -- Minimum expected time
    duration_range_max_hours DECIMAL(4,2) NOT NULL, -- Maximum expected time
    
    -- Flexibility settings
    requires_specific_start_time BOOLEAN DEFAULT false,
    can_be_split_across_days BOOLEAN DEFAULT false,
    requires_continuous_work BOOLEAN DEFAULT true,
    
    -- Service Instructions
    preparation_instructions TEXT,
    execution_instructions TEXT NOT NULL,
    completion_requirements TEXT,
    quality_standards TEXT,
    
    -- Deliverables and Outputs
    expected_deliverables TEXT[],
    success_criteria TEXT[],
    
    -- Resource Requirements
    required_equipment TEXT[],
    required_materials TEXT[],
    location_requirements TEXT, -- What the location needs to provide
    
    -- Pricing Guidelines (for reference)
    suggested_base_rate DECIMAL(10,2),
    complexity_multiplier DECIMAL(3,2) DEFAULT 1.0,
    
    -- Service Status
    is_active BOOLEAN DEFAULT true,
    requires_approval BOOLEAN DEFAULT false,
    
    -- Metadata
    created_by UUID REFERENCES UserAccounts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    version_number INTEGER DEFAULT 1
);

-- ============================================
-- LOCATION SERVICE OFFERS
-- ============================================

-- Status of service offers from locations
CREATE TYPE offer_status AS ENUM (
    'OPEN',         -- Available for associates to accept
    'PENDING',      -- Associate has applied, awaiting location approval
    'ACCEPTED',     -- Offer accepted, service scheduled
    'IN_PROGRESS',  -- Service is being executed
    'COMPLETED',    -- Service finished successfully
    'CANCELLED',    -- Offer was cancelled
    'EXPIRED'       -- Offer time period has passed
);

-- Location-specific service offers
CREATE TABLE ServiceOffers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Service Reference
    service_id UUID NOT NULL REFERENCES Services(id),
    location_id TEXT NOT NULL, -- References Location(id) from existing schema
    
    -- Offer Details
    offer_title VARCHAR(300), -- Custom title for this specific offer
    custom_instructions TEXT, -- Location-specific additional instructions
    
    -- Timing Requirements
    preferred_start_date DATE NOT NULL,
    preferred_start_time TIME,
    latest_start_date DATE, -- Flexibility window
    must_complete_by TIMESTAMP WITH TIME ZONE,
    
    -- Flexible timing options
    can_start_anytime_in_range BOOLEAN DEFAULT false,
    acceptable_start_times TIME[], -- Array of acceptable start times
    
    -- Compensation
    offered_amount DECIMAL(10,2) NOT NULL,
    payment_structure VARCHAR(50) DEFAULT 'FIXED' CHECK (payment_structure IN (
        'FIXED',        -- One fixed amount
        'HOURLY_CAPPED', -- Hourly rate with max hours
        'MILESTONE',     -- Payment on completion of stages
        'PERFORMANCE'    -- Based on quality/speed metrics
    )),
    
    -- Additional compensation details
    hourly_rate DECIMAL(8,2), -- If using hourly structure
    max_hours DECIMAL(4,2),   -- Maximum billable hours
    bonus_conditions JSONB,   -- Performance bonuses
    expense_reimbursement BOOLEAN DEFAULT false,
    
    -- Service Customization
    custom_duration_estimate DECIMAL(4,2), -- Override service default
    location_specific_requirements TEXT[],
    additional_equipment_provided TEXT[],
    
    -- Associate Requirements
    minimum_experience_level INTEGER DEFAULT 0, -- Years of experience
    required_location_experience BOOLEAN DEFAULT false, -- Must have worked at this location
    preferred_associates UUID[], -- Array of UserAccount IDs
    excluded_associates UUID[], -- Associates who cannot take this offer
    
    -- Offer Management
    offer_status offer_status DEFAULT 'OPEN',
    urgency service_urgency DEFAULT 'ROUTINE',
    max_applicants INTEGER DEFAULT 1,
    current_applicants INTEGER DEFAULT 0,
    
    -- Posting Details
    posted_by UUID NOT NULL REFERENCES UserAccounts(id),
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Internal notes
    internal_notes TEXT, -- For location management use
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SERVICE AGREEMENTS & EXECUTION
-- ============================================

-- Status of service agreements
CREATE TYPE agreement_status AS ENUM (
    'PROPOSED',     -- Associate has applied
    'NEGOTIATING',  -- Terms being discussed
    'ACCEPTED',     -- Both parties agreed
    'ACTIVE',       -- Service is in progress
    'COMPLETED',    -- Service finished
    'CANCELLED',    -- Agreement cancelled
    'DISPUTED'      -- There's a disagreement
);

-- Service Agreements between locations and associates
CREATE TABLE ServiceAgreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Core References
    service_offer_id UUID NOT NULL REFERENCES ServiceOffers(id),
    associate_id UUID NOT NULL REFERENCES UserAccounts(id),
    location_id TEXT NOT NULL, -- References Location(id)
    
    -- Agreement Terms
    agreed_amount DECIMAL(10,2) NOT NULL,
    agreed_start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    estimated_completion_time TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Service Details
    specific_instructions TEXT,
    agreed_deliverables TEXT[],
    quality_requirements TEXT,
    
    -- Terms and Conditions
    cancellation_policy TEXT,
    late_penalty_terms TEXT,
    quality_guarantee_terms TEXT,
    
    -- Status Tracking
    agreement_status agreement_status DEFAULT 'PROPOSED',
    
    -- Approval Workflow
    associate_accepted_at TIMESTAMP WITH TIME ZONE,
    location_approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES UserAccounts(id),
    
    -- Negotiation History
    negotiation_notes TEXT[],
    revised_terms JSONB[],
    
    -- Performance Tracking
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_completion_time TIMESTAMP WITH TIME ZONE,
    final_amount_paid DECIMAL(10,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(service_offer_id, associate_id) -- One agreement per associate per offer
);

-- Service Execution Tracking
CREATE TABLE ServiceExecution (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Core References
    service_agreement_id UUID NOT NULL REFERENCES ServiceAgreements(id),
    
    -- Time Tracking
    started_at TIMESTAMP WITH TIME ZONE,
    paused_at TIMESTAMP WITH TIME ZONE,
    resumed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Progress Tracking
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    current_phase VARCHAR(200),
    milestones_completed TEXT[],
    
    -- Quality and Performance
    quality_checkpoints JSONB[], -- Array of quality check records
    performance_notes TEXT[],
    issues_encountered TEXT[],
    
    -- Resource Usage
    equipment_used TEXT[],
    materials_consumed JSONB, -- Track quantities used
    additional_resources_needed TEXT[],
    
    -- Associate Updates
    associate_notes TEXT[],
    progress_reports JSONB[], -- Structured progress updates
    
    -- Location Feedback
    location_feedback TEXT[],
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    
    -- Financial Tracking
    hours_logged DECIMAL(5,2),
    expenses_incurred DECIMAL(8,2),
    bonus_earned DECIMAL(8,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SERVICE REVIEWS & RATINGS
-- ============================================

-- Reviews from both locations and associates
CREATE TABLE ServiceReviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Core References
    service_agreement_id UUID NOT NULL REFERENCES ServiceAgreements(id),
    reviewer_id UUID NOT NULL REFERENCES UserAccounts(id),
    
    -- Review Type
    reviewer_type VARCHAR(20) NOT NULL CHECK (reviewer_type IN ('LOCATION', 'ASSOCIATE')),
    
    -- Ratings (1-5 scale)
    overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    timeliness_rating INTEGER CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
    
    -- Written Feedback
    written_review TEXT,
    positive_aspects TEXT[],
    areas_for_improvement TEXT[],
    
    -- Recommendation
    would_work_again BOOLEAN,
    would_recommend BOOLEAN,
    
    -- Review Metadata
    is_verified BOOLEAN DEFAULT false,
    review_helpful_votes INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(service_agreement_id, reviewer_id) -- One review per person per agreement
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Service lookup indexes
CREATE INDEX idx_services_category ON Services(category);
CREATE INDEX idx_services_complexity ON Services(complexity);
CREATE INDEX idx_services_active ON Services(is_active);

-- Service offer indexes
CREATE INDEX idx_service_offers_status ON ServiceOffers(offer_status);
CREATE INDEX idx_service_offers_location ON ServiceOffers(location_id);
CREATE INDEX idx_service_offers_dates ON ServiceOffers(preferred_start_date, latest_start_date);
CREATE INDEX idx_service_offers_urgency ON ServiceOffers(urgency);

-- Agreement indexes
CREATE INDEX idx_service_agreements_status ON ServiceAgreements(agreement_status);
CREATE INDEX idx_service_agreements_associate ON ServiceAgreements(associate_id);
CREATE INDEX idx_service_agreements_location ON ServiceAgreements(location_id);
CREATE INDEX idx_service_agreements_dates ON ServiceAgreements(agreed_start_time);

-- Execution tracking indexes
CREATE INDEX idx_service_execution_agreement ON ServiceExecution(service_agreement_id);
CREATE INDEX idx_service_execution_progress ON ServiceExecution(completion_percentage);

-- Review indexes
CREATE INDEX idx_service_reviews_rating ON ServiceReviews(overall_rating);
CREATE INDEX idx_service_reviews_agreement ON ServiceReviews(service_agreement_id);
CREATE INDEX idx_service_reviews_reviewer ON ServiceReviews(reviewer_id);