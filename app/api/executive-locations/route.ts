// Executive Location Management API
// Handles role declarations, executive assignments, and service role offers

import { NextRequest, NextResponse } from 'next/server';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ServiceRoleDeclaration {
  id: string;
  locationId: string;
  roleType: 'KAVATENDER' | 'KAVARISTA' | 'HOST' | 'EXECUTIVE_DIRECTOR';
  positionsNeeded: number;
  priorityLevel: number; // 1-10
  hourlyRateMin: number;
  hourlyRateMax: number;
  shiftRequirements: any; // JSONB
  isFusedRole: boolean;
  fusedWithRoles: string[];
  certificationRequirements: string[];
  experienceRequirements: string;
  declarationStatus: 'ACTIVE' | 'FILLED' | 'SUSPENDED' | 'CANCELLED';
  declaredBy: string; // Executive Director ID
  createdAt: string;
  updatedAt: string;
}

export interface ExecutiveAssignment {
  id: string;
  associateId: string;
  locationId: string;
  executiveTitle: string;
  hasCeoAuthority: boolean;
  oversightLevel: 'FULL' | 'OPERATIONAL' | 'ADVISORY';
  assignmentStartDate: string;
  assignmentEndDate?: string;
  isPrimaryExecutive: boolean;
  canDeclareRoles: boolean;
  canHireAssociates: boolean;
  canModifySchedules: boolean;
  canApproveAgreements: boolean;
  canOverridePolicies: boolean;
  assignmentStatus: 'ACTIVE' | 'TRANSITIONING' | 'SUSPENDED' | 'COMPLETED';
}

export interface ServiceRoleOffer {
  id: string;
  locationRoleDeclarationId: string;
  offeredToAssociateId: string;
  offeredHourlyRate: number;
  offeredSchedule: any; // JSONB
  specialTerms: string;
  offerStatus: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'WITHDRAWN' | 'EXPIRED';
  offerDate: string;
  responseDeadline: string;
  responseDate?: string;
  offeredBy: string; // Executive Director ID
}

export interface QualifiedAssociate {
  id: string;
  associateId: string;
  roleType: 'KAVATENDER' | 'KAVARISTA' | 'HOST' | 'EXECUTIVE_DIRECTOR';
  qualificationLevel: 'TRAINEE' | 'QUALIFIED' | 'EXPERT' | 'TRAINER';
  yearsInRole: number;
  locationsWorked: string[];
  specializations: string[];
  geographicAvailability: string[];
  scheduleAvailability: any; // JSONB
  maxHoursPerWeek: number;
  preferredLocations: string[];
  preferredHourlyRateMin: number;
  willingToTravel: boolean;
  travelRadiusMiles: number;
  availabilityStatus: 'AVAILABLE' | 'PARTIALLY_AVAILABLE' | 'UNAVAILABLE' | 'COMMITTED';
}

// ============================================
// MOCK DATA FOR DEVELOPMENT
// ============================================

const mockRoleDeclarations: ServiceRoleDeclaration[] = [
  {
    id: 'rd001',
    locationId: 'loc_main_store',
    roleType: 'HOST',
    positionsNeeded: 2,
    priorityLevel: 2, // High priority
    hourlyRateMin: 18.00,
    hourlyRateMax: 25.00,
    shiftRequirements: {
      shifts: ['MORNING', 'EVENING'],
      weekendsRequired: true,
      minimumHoursPerWeek: 25
    },
    isFusedRole: true,
    fusedWithRoles: ['KAVARISTA', 'KAVATENDER'], // Host that also tends and creates
    certificationRequirements: ['KAVA_PROFESSIONAL', 'FOOD_SAFETY'],
    experienceRequirements: 'Minimum 2 years kava service experience',
    declarationStatus: 'ACTIVE',
    declaredBy: 'KAV001', // Malia Nakamura as Executive Director
    createdAt: '2024-10-15T08:00:00Z',
    updatedAt: '2024-10-15T08:00:00Z'
  },
  {
    id: 'rd002',
    locationId: 'loc_main_store',
    roleType: 'KAVARISTA',
    positionsNeeded: 3,
    priorityLevel: 3,
    hourlyRateMin: 16.00,
    hourlyRateMax: 22.00,
    shiftRequirements: {
      shifts: ['MORNING', 'AFTERNOON', 'EVENING'],
      weekendsRequired: false,
      minimumHoursPerWeek: 20
    },
    isFusedRole: false,
    fusedWithRoles: [],
    certificationRequirements: ['KAVA_BASICS', 'CUSTOMER_SERVICE'],
    experienceRequirements: 'Minimum 6 months customer-facing experience',
    declarationStatus: 'ACTIVE',
    declaredBy: 'KAV001',
    createdAt: '2024-10-15T08:30:00Z',
    updatedAt: '2024-10-15T08:30:00Z'
  },
  {
    id: 'rd003',
    locationId: 'loc_wholesale_hub',
    roleType: 'KAVATENDER',
    positionsNeeded: 1,
    priorityLevel: 4,
    hourlyRateMin: 15.00,
    hourlyRateMax: 19.00,
    shiftRequirements: {
      shifts: ['MORNING'],
      weekendsRequired: false,
      minimumHoursPerWeek: 30
    },
    isFusedRole: false,
    fusedWithRoles: [],
    certificationRequirements: ['KAVA_PREPARATION'],
    experienceRequirements: 'Traditional kava preparation knowledge preferred',
    declarationStatus: 'FILLED',
    declaredBy: 'KAV002', // Kai Henderson as Executive Director
    createdAt: '2024-10-14T10:00:00Z',
    updatedAt: '2024-10-16T14:00:00Z'
  }
];

const mockExecutiveAssignments: ExecutiveAssignment[] = [
  {
    id: 'ea001',
    associateId: 'KAV001', // Malia Nakamura
    locationId: 'loc_main_store',
    executiveTitle: 'Executive Director',
    hasCeoAuthority: true,
    oversightLevel: 'FULL',
    assignmentStartDate: '2024-09-01',
    isPrimaryExecutive: true,
    canDeclareRoles: true,
    canHireAssociates: true,
    canModifySchedules: true,
    canApproveAgreements: true,
    canOverridePolicies: true,
    assignmentStatus: 'ACTIVE'
  },
  {
    id: 'ea002',
    associateId: 'KAV002', // Kai Henderson
    locationId: 'loc_wholesale_hub',
    executiveTitle: 'Executive Director',
    hasCeoAuthority: true,
    oversightLevel: 'FULL',
    assignmentStartDate: '2024-09-15',
    isPrimaryExecutive: true,
    canDeclareRoles: true,
    canHireAssociates: true,
    canModifySchedules: true,
    canApproveAgreements: true,
    canOverridePolicies: true,
    assignmentStatus: 'ACTIVE'
  },
  {
    id: 'ea003',
    associateId: 'KAV003', // Leilani Torres
    locationId: 'loc_farmers_market',
    executiveTitle: 'Pop-up Coordinator',
    hasCeoAuthority: false,
    oversightLevel: 'OPERATIONAL',
    assignmentStartDate: '2024-10-01',
    isPrimaryExecutive: true,
    canDeclareRoles: false,
    canHireAssociates: false,
    canModifySchedules: true,
    canApproveAgreements: false,
    canOverridePolicies: false,
    assignmentStatus: 'ACTIVE'
  }
];

const mockServiceOffers: ServiceRoleOffer[] = [
  {
    id: 'so001',
    locationRoleDeclarationId: 'rd001',
    offeredToAssociateId: 'KAV004', // Preferred associate for Host position
    offeredHourlyRate: 23.00,
    offeredSchedule: {
      shifts: ['EVENING'],
      daysPerWeek: 5,
      hoursPerWeek: 30
    },
    specialTerms: 'Leadership bonus after 90 days if performance exceeds expectations',
    offerStatus: 'PENDING',
    offerDate: '2024-10-16',
    responseDeadline: '2024-10-23',
    offeredBy: 'KAV001'
  },
  {
    id: 'so002',
    locationRoleDeclarationId: 'rd002',
    offeredToAssociateId: 'KAV005', // Preferred associate for Kavarista position
    offeredHourlyRate: 20.00,
    offeredSchedule: {
      shifts: ['MORNING', 'AFTERNOON'],
      daysPerWeek: 4,
      hoursPerWeek: 24
    },
    specialTerms: 'Training provided for cultural education component',
    offerStatus: 'ACCEPTED',
    offerDate: '2024-10-14',
    responseDeadline: '2024-10-21',
    responseDate: '2024-10-15',
    offeredBy: 'KAV001'
  }
];

const mockQualifiedAssociates: QualifiedAssociate[] = [
  {
    id: 'qa001',
    associateId: 'KAV006',
    roleType: 'KAVARISTA',
    qualificationLevel: 'EXPERT',
    yearsInRole: 3.5,
    locationsWorked: ['loc_main_store', 'loc_farmers_market'],
    specializations: ['Cultural Education', 'Traditional Ceremonies', 'Customer Relations'],
    geographicAvailability: ['Austin', 'San Antonio'],
    scheduleAvailability: {
      weekdays: ['MORNING', 'AFTERNOON'],
      weekends: ['AFTERNOON']
    },
    maxHoursPerWeek: 35,
    preferredLocations: ['loc_main_store'],
    preferredHourlyRateMin: 19.00,
    willingToTravel: true,
    travelRadiusMiles: 50,
    availabilityStatus: 'AVAILABLE'
  },
  {
    id: 'qa002',
    associateId: 'KAV007',
    roleType: 'HOST',
    qualificationLevel: 'QUALIFIED',
    yearsInRole: 1.8,
    locationsWorked: ['loc_wholesale_hub'],
    specializations: ['Team Leadership', 'Conflict Resolution', 'Inventory Management'],
    geographicAvailability: ['Austin', 'Round Rock', 'Cedar Park'],
    scheduleAvailability: {
      weekdays: ['EVENING'],
      weekends: ['MORNING', 'AFTERNOON', 'EVENING']
    },
    maxHoursPerWeek: 40,
    preferredLocations: ['loc_main_store', 'loc_wholesale_hub'],
    preferredHourlyRateMin: 21.00,
    willingToTravel: false,
    travelRadiusMiles: 0,
    availabilityStatus: 'PARTIALLY_AVAILABLE'
  }
];

// ============================================
// API ROUTE HANDLERS
// ============================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  const locationId = searchParams.get('locationId');
  const roleType = searchParams.get('roleType');

  try {
    switch (endpoint) {
      case 'role-declarations':
        const declarations = locationId 
          ? mockRoleDeclarations.filter(d => d.locationId === locationId)
          : mockRoleDeclarations;
        return NextResponse.json({
          success: true,
          data: declarations,
          message: 'Role declarations retrieved successfully'
        });

      case 'executive-assignments':
        const assignments = locationId
          ? mockExecutiveAssignments.filter(a => a.locationId === locationId)
          : mockExecutiveAssignments;
        return NextResponse.json({
          success: true,
          data: assignments,
          message: 'Executive assignments retrieved successfully'
        });

      case 'service-offers':
        return NextResponse.json({
          success: true,
          data: mockServiceOffers,
          message: 'Service offers retrieved successfully'
        });

      case 'qualified-associates':
        const qualified = roleType
          ? mockQualifiedAssociates.filter(q => q.roleType === roleType)
          : mockQualifiedAssociates;
        return NextResponse.json({
          success: true,
          data: qualified,
          message: 'Qualified associates retrieved successfully'
        });

      default:
        return NextResponse.json({
          success: true,
          data: {
            roleDeclarations: mockRoleDeclarations,
            executiveAssignments: mockExecutiveAssignments,
            serviceOffers: mockServiceOffers,
            qualifiedAssociates: mockQualifiedAssociates
          },
          message: 'Executive location management data retrieved successfully'
        });
    }
  } catch (error) {
    console.error('Error fetching executive location data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch executive location data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'declare-role':
        // Executive Director declares a new role needed for their location
        const newDeclaration: ServiceRoleDeclaration = {
          id: `rd${String(mockRoleDeclarations.length + 1).padStart(3, '0')}`,
          ...data,
          declarationStatus: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        mockRoleDeclarations.push(newDeclaration);
        
        return NextResponse.json({
          success: true,
          data: newDeclaration,
          message: `Role declaration created: ${data.positionsNeeded} ${data.roleType} position(s) for location ${data.locationId}`
        }, { status: 201 });

      case 'assign-executive':
        // Assign an Executive Director to a location
        const newAssignment: ExecutiveAssignment = {
          id: `ea${String(mockExecutiveAssignments.length + 1).padStart(3, '0')}`,
          ...data,
          assignmentStatus: 'ACTIVE'
        };
        mockExecutiveAssignments.push(newAssignment);
        
        return NextResponse.json({
          success: true,
          data: newAssignment,
          message: `Executive Director assigned to location ${data.locationId} with ${data.oversightLevel} authority`
        }, { status: 201 });

      case 'make-offer':
        // Executive Director makes preferred offer to specific associate
        const newOffer: ServiceRoleOffer = {
          id: `so${String(mockServiceOffers.length + 1).padStart(3, '0')}`,
          ...data,
          offerStatus: 'PENDING',
          offerDate: new Date().toISOString().split('T')[0]
        };
        mockServiceOffers.push(newOffer);
        
        return NextResponse.json({
          success: true,
          data: newOffer,
          message: `Service offer extended to associate ${data.offeredToAssociateId} for role ${data.locationRoleDeclarationId}`
        }, { status: 201 });

      case 'update-offer-status':
        // Associate responds to offer or executive modifies offer
        const { offerId, status, responseData } = data;
        const offer = mockServiceOffers.find(o => o.id === offerId);
        if (offer) {
          offer.offerStatus = status;
          if (responseData) {
            offer.responseDate = new Date().toISOString().split('T')[0];
          }
          
          return NextResponse.json({
            success: true,
            data: offer,
            message: `Offer ${offerId} status updated to ${status}`
          });
        }
        
        return NextResponse.json(
          { success: false, message: 'Offer not found' },
          { status: 404 }
        );

      case 'update-role-declaration':
        // Executive Director modifies role declaration
        const { declarationId, updates } = data;
        const declaration = mockRoleDeclarations.find(d => d.id === declarationId);
        if (declaration) {
          Object.assign(declaration, updates);
          declaration.updatedAt = new Date().toISOString();
          
          return NextResponse.json({
            success: true,
            data: declaration,
            message: `Role declaration ${declarationId} updated successfully`
          });
        }
        
        return NextResponse.json(
          { success: false, message: 'Role declaration not found' },
          { status: 404 }
        );

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action specified' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing executive location request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process executive location request' },
      { status: 500 }
    );
  }
}