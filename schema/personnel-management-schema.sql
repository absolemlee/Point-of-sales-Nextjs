-- Personnel and Shift Management Schema for Location-Centric Operations
-- This schema supports multi-location employee management, shift scheduling, and time tracking

-- Employee/Personnel table with location assignments
CREATE TABLE IF NOT EXISTS Personnel (
  id TEXT PRIMARY KEY DEFAULT ('emp_' || generate_random_uuid()),
  employee_id TEXT UNIQUE NOT NULL, -- Human-readable employee ID (EMP001, etc)
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
  employment_status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'INACTIVE', 'TERMINATED', 'ON_LEAVE'
  employee_type TEXT NOT NULL DEFAULT 'PART_TIME', -- 'FULL_TIME', 'PART_TIME', 'CONTRACTOR', 'MANAGER', 'SUPERVISOR'
  pay_rate DECIMAL(10,2),
  pay_type TEXT DEFAULT 'HOURLY', -- 'HOURLY', 'SALARY', 'COMMISSION'
  
  -- Location assignments
  primary_location_id TEXT REFERENCES Location(id),
  authorized_locations TEXT[] DEFAULT '{}', -- Array of location IDs they can work at
  
  -- Contact and emergency info
  address JSONB,
  emergency_contact JSONB,
  
  -- System fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  notes TEXT
);

-- Employee roles and permissions
CREATE TABLE IF NOT EXISTS PersonnelRoles (
  id TEXT PRIMARY KEY DEFAULT ('role_' || generate_random_uuid()),
  personnel_id TEXT NOT NULL REFERENCES Personnel(id) ON DELETE CASCADE,
  location_id TEXT NOT NULL REFERENCES Location(id) ON DELETE CASCADE,
  role_name TEXT NOT NULL, -- 'BARISTA', 'MANAGER', 'SUPERVISOR', 'CASHIER', 'PREP_COOK', 'TRAINER'
  is_supervisor BOOLEAN DEFAULT false,
  can_approve_timesheets BOOLEAN DEFAULT false,
  can_manage_schedules BOOLEAN DEFAULT false,
  can_process_transactions BOOLEAN DEFAULT true,
  can_handle_cash BOOLEAN DEFAULT true,
  can_open_location BOOLEAN DEFAULT false,
  can_close_location BOOLEAN DEFAULT false,
  
  -- Permissions for different transaction types
  can_process_b2b_sales BOOLEAN DEFAULT false,
  can_handle_refunds BOOLEAN DEFAULT false,
  can_manage_inventory BOOLEAN DEFAULT false,
  
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shift scheduling system
CREATE TABLE IF NOT EXISTS Shifts (
  id TEXT PRIMARY KEY DEFAULT ('shift_' || generate_random_uuid()),
  location_id TEXT NOT NULL REFERENCES Location(id),
  personnel_id TEXT NOT NULL REFERENCES Personnel(id),
  
  -- Shift timing
  shift_date DATE NOT NULL,
  scheduled_start_time TIME NOT NULL,
  scheduled_end_time TIME NOT NULL,
  scheduled_break_duration_minutes INTEGER DEFAULT 30,
  
  -- Actual timing (filled when employee clocks in/out)
  actual_start_time TIMESTAMP WITH TIME ZONE,
  actual_end_time TIMESTAMP WITH TIME ZONE,
  actual_break_duration_minutes INTEGER DEFAULT 0,
  
  -- Shift details
  shift_type TEXT DEFAULT 'REGULAR', -- 'REGULAR', 'OPENING', 'CLOSING', 'SPLIT', 'DOUBLE'
  position TEXT NOT NULL, -- 'BARISTA', 'MANAGER', 'SUPERVISOR', 'CASHIER'
  hourly_rate DECIMAL(10,2),
  
  -- Status tracking
  shift_status TEXT DEFAULT 'SCHEDULED', -- 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'NO_SHOW', 'CANCELLED'
  is_supervisor_shift BOOLEAN DEFAULT false,
  requires_supervisor_present BOOLEAN DEFAULT false,
  
  -- Approval workflow
  approved_by TEXT REFERENCES Personnel(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(location_id, personnel_id, shift_date, scheduled_start_time)
);

-- Time clock entries for precise time tracking
CREATE TABLE IF NOT EXISTS TimeClockEntries (
  id TEXT PRIMARY KEY DEFAULT ('clock_' || generate_random_uuid()),
  personnel_id TEXT NOT NULL REFERENCES Personnel(id),
  location_id TEXT NOT NULL REFERENCES Location(id),
  shift_id TEXT REFERENCES Shifts(id),
  
  -- Clock entry details
  clock_type TEXT NOT NULL, -- 'CLOCK_IN', 'BREAK_START', 'BREAK_END', 'CLOCK_OUT'
  clock_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Location tracking
  clock_method TEXT DEFAULT 'MANUAL', -- 'MANUAL', 'BIOMETRIC', 'BADGE', 'MOBILE_APP'
  ip_address TEXT,
  device_info JSONB,
  
  -- Supervisor approval for adjustments
  is_adjustment BOOLEAN DEFAULT false,
  original_time TIMESTAMP WITH TIME ZONE,
  adjustment_reason TEXT,
  adjusted_by TEXT REFERENCES Personnel(id),
  approved_by TEXT REFERENCES Personnel(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Timesheet summaries for payroll processing
CREATE TABLE IF NOT EXISTS Timesheets (
  id TEXT PRIMARY KEY DEFAULT ('timesheet_' || generate_random_uuid()),
  personnel_id TEXT NOT NULL REFERENCES Personnel(id),
  location_id TEXT NOT NULL REFERENCES Location(id),
  
  -- Period covered
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  
  -- Calculated hours
  regular_hours DECIMAL(5,2) DEFAULT 0,
  overtime_hours DECIMAL(5,2) DEFAULT 0,
  break_hours DECIMAL(5,2) DEFAULT 0,
  total_hours DECIMAL(5,2) DEFAULT 0,
  
  -- Pay calculations
  regular_pay DECIMAL(10,2) DEFAULT 0,
  overtime_pay DECIMAL(10,2) DEFAULT 0,
  total_pay DECIMAL(10,2) DEFAULT 0,
  
  -- Status tracking
  timesheet_status TEXT DEFAULT 'DRAFT', -- 'DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PAID'
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_by TEXT REFERENCES Personnel(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  
  -- Payroll integration
  payroll_period TEXT,
  pay_date DATE,
  
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(personnel_id, week_start_date)
);

-- Shift coverage requirements for each location
CREATE TABLE IF NOT EXISTS LocationShiftRequirements (
  id TEXT PRIMARY KEY DEFAULT ('req_' || generate_random_uuid()),
  location_id TEXT NOT NULL REFERENCES Location(id),
  
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
  shift_start_time TIME NOT NULL,
  shift_end_time TIME NOT NULL,
  
  -- Staffing requirements
  minimum_staff_count INTEGER DEFAULT 1,
  preferred_staff_count INTEGER DEFAULT 2,
  requires_supervisor BOOLEAN DEFAULT false,
  requires_key_holder BOOLEAN DEFAULT false,
  
  -- Position requirements
  required_positions TEXT[] DEFAULT '{}', -- ['BARISTA', 'CASHIER', 'MANAGER']
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Personnel performance and disciplinary tracking
CREATE TABLE IF NOT EXISTS PersonnelActions (
  id TEXT PRIMARY KEY DEFAULT ('action_' || generate_random_uuid()),
  personnel_id TEXT NOT NULL REFERENCES Personnel(id),
  location_id TEXT REFERENCES Location(id),
  
  action_type TEXT NOT NULL, -- 'HIRE', 'PROMOTION', 'DISCIPLINARY', 'RECOGNITION', 'TERMINATION', 'TRANSFER'
  action_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Details
  title TEXT NOT NULL,
  description TEXT,
  severity_level TEXT, -- 'INFO', 'WARNING', 'SERIOUS', 'CRITICAL'
  
  -- Involved parties
  initiated_by TEXT NOT NULL REFERENCES Personnel(id),
  approved_by TEXT REFERENCES Personnel(id),
  
  -- Follow-up
  requires_follow_up BOOLEAN DEFAULT false,
  follow_up_date DATE,
  follow_up_completed BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_personnel_location ON Personnel(primary_location_id);
CREATE INDEX IF NOT EXISTS idx_personnel_status ON Personnel(employment_status);
CREATE INDEX IF NOT EXISTS idx_shifts_location_date ON Shifts(location_id, shift_date);
CREATE INDEX IF NOT EXISTS idx_shifts_personnel_date ON Shifts(personnel_id, shift_date);
CREATE INDEX IF NOT EXISTS idx_clock_entries_personnel_time ON TimeClockEntries(personnel_id, clock_time);
CREATE INDEX IF NOT EXISTS idx_timesheets_personnel_week ON Timesheets(personnel_id, week_start_date);

-- Comments for documentation
COMMENT ON TABLE Personnel IS 'Employee records with location assignments and basic info';
COMMENT ON TABLE PersonnelRoles IS 'Role-based permissions for employees at specific locations';
COMMENT ON TABLE Shifts IS 'Scheduled and actual shift records with timing and status';
COMMENT ON TABLE TimeClockEntries IS 'Detailed time clock entries for precise time tracking';
COMMENT ON TABLE Timesheets IS 'Weekly timesheet summaries for payroll processing';
COMMENT ON TABLE LocationShiftRequirements IS 'Minimum staffing requirements for each location and time slot';

-- Sample data for a kava lounge operation
INSERT INTO Personnel (employee_id, first_name, last_name, email, phone, employee_type, pay_rate, primary_location_id, authorized_locations) VALUES
('EMP001', 'Sarah', 'Johnson', 'sarah.johnson@kavalounge.com', '+1-512-555-0101', 'MANAGER', 22.00, 'default-location', ARRAY['default-location', 'farmers-market']),
('EMP002', 'Mike', 'Chen', 'mike.chen@kavalounge.com', '+1-512-555-0102', 'FULL_TIME', 18.00, 'default-location', ARRAY['default-location']),
('EMP003', 'Lisa', 'Rodriguez', 'lisa.rodriguez@kavalounge.com', '+1-512-555-0103', 'PART_TIME', 16.00, 'default-location', ARRAY['default-location', 'farmers-market']),
('EMP004', 'David', 'Williams', 'david.williams@kavalounge.com', '+1-512-555-0104', 'SUPERVISOR', 20.00, 'wholesale-hub', ARRAY['wholesale-hub', 'default-location']);

INSERT INTO PersonnelRoles (personnel_id, location_id, role_name, is_supervisor, can_approve_timesheets, can_manage_schedules, can_open_location, can_close_location, can_process_b2b_sales) VALUES
((SELECT id FROM Personnel WHERE employee_id = 'EMP001'), 'default-location', 'MANAGER', true, true, true, true, true, false),
((SELECT id FROM Personnel WHERE employee_id = 'EMP002'), 'default-location', 'BARISTA', false, false, false, false, false, false),
((SELECT id FROM Personnel WHERE employee_id = 'EMP003'), 'default-location', 'BARISTA', false, false, false, false, false, false),
((SELECT id FROM Personnel WHERE employee_id = 'EMP004'), 'wholesale-hub', 'SUPERVISOR', true, true, true, true, true, true);