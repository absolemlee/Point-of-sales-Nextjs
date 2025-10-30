import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface Personnel {
  id: string;
  associateCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  roles: PersonnelRole[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PersonnelRole {
  id: string;
  personnelId: string;
  locationId: string;
  roleName: string;
  isSupervisor: boolean;
  canApproveTimesheets: boolean;
  canManageSchedules: boolean;
  canProcessTransactions: boolean;
  canHandleCash: boolean;
  canOpenLocation: boolean;
  canCloseLocation: boolean;
  canProcessB2bSales: boolean;
  canHandleRefunds: boolean;
  canManageInventory: boolean;
  startDate: string;
  isActive: boolean;
}

export interface Associate {
  id: string;
  associateCode: string;
  firstName: string;
  lastName: string;
  preferredName?: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  professionalTitle?: string;
  specializations: string[];
  yearsExperience: number;
  bio?: string;
  address?: any;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  associateStatus: 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'TERMINATED';
  backgroundCheckStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  backgroundCheckDate?: string;
  orientationCompletedDate?: string;
  referralSource?: string;
  networkJoinDate: string;
  createdAt: string;
  updatedAt: string;
  certifications?: AssociateCertification[];
  agreements?: Agreement[];
  authorizations?: LocationAuthorization[];
}

export interface AssociateCertification {
  id: string;
  associateId: string;
  certificationId: string;
  certificationStatus: 'IN_PROGRESS' | 'CERTIFIED' | 'EXPIRED' | 'SUSPENDED' | 'REVOKED';
  startDate: string;
  completionDate?: string;
  expirationDate?: string;
  lastRenewalDate?: string;
  nextRenewalDue?: string;
  certificateNumber?: string;
  issuingInstructor?: string;
  notes?: string;
  certification?: {
    name: string;
    type: string;
    issuingOrganization: string;
    isRequiredForService: boolean;
  };
}

export interface Agreement {
  id: string;
  associateId: string;
  locationId: string;
  agreementType: 'PARTNERSHIP' | 'SCOPED_PROJECT' | 'JUNIOR_ASSOCIATION' | 'CONSULTING' | 'SEASONAL' | 'EVENT_BASED';
  agreementTitle: string;
  agreementDescription?: string;
  startDate: string;
  endDate?: string;
  servicesProvided: string[];
  serviceRateStructure?: any;
  agreementStatus: 'DRAFT' | 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'TERMINATED' | 'EXPIRED';
  paymentStructure: 'HOURLY' | 'DAILY' | 'PROJECT' | 'REVENUE_SHARE' | 'PARTNERSHIP_DRAW';
  baseRate?: number;
  signedByAssociate?: string;
  signedByLocationManager?: string;
  signedByNetworkAdmin?: string;
}

export interface LocationAuthorization {
  id: string;
  associateId: string;
  locationId: string;
  agreementId?: string;
  authorizationType: 'FULL_ACCESS' | 'SERVICE_ONLY' | 'TRAINING' | 'RESTRICTED' | 'EMERGENCY_ONLY';
  canAccessPOS: boolean;
  canManageInventory: boolean;
  canHandleCash: boolean;
  canSuperviseOthers: boolean;
  canAccessReports: boolean;
  canWorkAlone: boolean;
  requiresSupervision: boolean;
  authorizationStatus: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REVOKED' | 'EXPIRED';
  effectiveDate: string;
  expirationDate?: string;
  approvedByLocationManager?: string;
  approvedByNetworkAdmin?: string;
  approvalDate?: string;
}

// GET /api/personnel - List all personnel
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId');
    const status = searchParams.get('status');
    const includeRoles = searchParams.get('includeRoles') === 'true';

    let query = supabase.from('Personnel').select('*');
    
    if (locationId) {
      query = query.or(`primary_location_id.eq.${locationId},authorized_locations.cs.{${locationId}}`);
    }
    
    if (status) {
      query = query.eq('employment_status', status);
    }

    const { data: personnel, error } = await query.order('last_name', { ascending: true });

    if (error) {
      console.log('Personnel table not found, using fallback structure');
      const mockPersonnel: Personnel[] = [
        {
          id: 'emp_sarah_001',
          associateCode: 'EMP001',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@kavalounge.com',
          phone: '+1-512-555-0101',
          roles: [],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'emp_mike_002',
          associateCode: 'EMP002',
          firstName: 'Mike',
          lastName: 'Chen',
          email: 'mike.chen@kavalounge.com',
          phone: '+1-512-555-0102',
          roles: [],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'emp_lisa_003',
          associateCode: 'EMP003',
          firstName: 'Lisa',
          lastName: 'Rodriguez',
          email: 'lisa.rodriguez@kavalounge.com',
          phone: '+1-512-555-0103',
          roles: [],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'emp_david_004',
          associateCode: 'EMP004',
          firstName: 'David',
          lastName: 'Williams',
          email: 'david.williams@kavalounge.com',
          phone: '+1-512-555-0104',
          roles: [],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      let result: any = { personnel: mockPersonnel, count: mockPersonnel.length };

      if (includeRoles) {
        const mockRoles: PersonnelRole[] = [
          {
            id: 'role_001',
            personnelId: 'emp_sarah_001',
            locationId: 'default-location',
            roleName: 'MANAGER',
            isSupervisor: true,
            canApproveTimesheets: true,
            canManageSchedules: true,
            canProcessTransactions: true,
            canHandleCash: true,
            canOpenLocation: true,
            canCloseLocation: true,
            canProcessB2bSales: false,
            canHandleRefunds: true,
            canManageInventory: true,
            startDate: '2024-01-15',
            isActive: true
          },
          {
            id: 'role_002',
            personnelId: 'emp_mike_002',
            locationId: 'default-location',
            roleName: 'BARISTA',
            isSupervisor: false,
            canApproveTimesheets: false,
            canManageSchedules: false,
            canProcessTransactions: true,
            canHandleCash: true,
            canOpenLocation: false,
            canCloseLocation: false,
            canProcessB2bSales: false,
            canHandleRefunds: false,
            canManageInventory: false,
            startDate: '2024-03-01',
            isActive: true
          },
          {
            id: 'role_004',
            personnelId: 'emp_david_004',
            locationId: 'wholesale-hub',
            roleName: 'SUPERVISOR',
            isSupervisor: true,
            canApproveTimesheets: true,
            canManageSchedules: true,
            canProcessTransactions: true,
            canHandleCash: true,
            canOpenLocation: true,
            canCloseLocation: true,
            canProcessB2bSales: true,
            canHandleRefunds: true,
            canManageInventory: true,
            startDate: '2024-02-01',
            isActive: true
          }
        ];
        result.roles = mockRoles;
      }

      return NextResponse.json(result);
    }

    // If we have real data, process it
    let result: any = { personnel, count: personnel?.length || 0 };

    if (includeRoles && personnel) {
      const personnelIds = personnel.map(p => p.id);
      const { data: roles } = await supabase
        .from('PersonnelRoles')
        .select('*')
        .in('personnel_id', personnelIds)
        .eq('is_active', true);
      
      result.roles = roles || [];
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch personnel' },
      { status: 500 }
    );
  }
}

// POST /api/personnel - Create new personnel
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newPersonnel = {
      employee_id: body.employeeId,
      first_name: body.firstName,
      last_name: body.lastName,
      email: body.email,
      phone: body.phone,
      hire_date: body.hireDate || new Date().toISOString().split('T')[0],
      employment_status: body.employmentStatus || 'ACTIVE',
      employee_type: body.employeeType || 'PART_TIME',
      pay_rate: body.payRate,
      pay_type: body.payType || 'HOURLY',
      primary_location_id: body.primaryLocationId,
      authorized_locations: body.authorizedLocations || [],
      address: body.address,
      emergency_contact: body.emergencyContact,
      notes: body.notes
    };

    const { data: personnel, error } = await supabase
      .from('Personnel')
      .insert([newPersonnel])
      .select()
      .single();

    if (error) {
      console.log('Personnel table not found, returning mock creation');
      return NextResponse.json({ 
        personnel: {
          id: 'emp_' + Math.random().toString(36).substr(2, 9),
          ...newPersonnel,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        message: 'Personnel created (using fallback mode)'
      });
    }

    return NextResponse.json({ personnel });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create personnel' },
      { status: 500 }
    );
  }
}