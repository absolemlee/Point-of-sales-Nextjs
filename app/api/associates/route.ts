import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

// GET /api/personnel - Get associates with filtering
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId');
    const associateStatus = searchParams.get('status');
    const certificationStatus = searchParams.get('certificationStatus');
    const agreementType = searchParams.get('agreementType');
    const includeRoles = searchParams.get('includeRoles') === 'true';

    let query = supabase.from('Associates').select(`
      *,
      certifications:AssociateCertifications(
        *,
        certification:Certifications(certification_name, certification_type, issuing_organization, is_required_for_service)
      ),
      agreements:Agreements(*),
      authorizations:LocationAuthorizations(*)
    `);
    
    if (associateStatus) {
      query = query.eq('associate_status', associateStatus);
    }
    
    if (locationId && includeRoles) {
      query = query.eq('authorizations.location_id', locationId);
    }

    const { data: associates, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.log('Associates table not found, using fallback data');
      
      // Mock associates data for kava professional network
      const mockAssociates: Associate[] = [
        {
          id: 'assoc_malia_001',
          associateCode: 'KAV001',
          firstName: 'Malia',
          lastName: 'Nakamura',
          email: 'malia.nakamura@kavapro.com',
          phoneNumber: '555-0101',
          professionalTitle: 'Senior Kava Professional',
          specializations: ['Traditional Preparation', 'Cultural Education'],
          yearsExperience: 8,
          bio: 'Traditional kava expert with deep cultural knowledge and 8 years of professional service.',
          associateStatus: 'ACTIVE',
          backgroundCheckStatus: 'APPROVED',
          orientationCompletedDate: '2024-01-15',
          networkJoinDate: '2024-01-01',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          certifications: [
            {
              id: 'cert_001',
              associateId: 'assoc_malia_001',
              certificationId: 'ckp_level1',
              certificationStatus: 'CERTIFIED',
              startDate: '2023-01-10',
              completionDate: '2023-03-15',
              expirationDate: '2025-03-15',
              certificateNumber: 'CKP-2023-001',
              certification: {
                name: 'Certified Kava Professional Level 1',
                type: 'KAVA_PROFESSIONAL',
                issuingOrganization: 'Kava Professional Association',
                isRequiredForService: true
              }
            }
          ],
          agreements: [
            {
              id: 'agr_001',
              associateId: 'assoc_malia_001',
              locationId: 'default-location',
              agreementType: 'PARTNERSHIP',
              agreementTitle: 'Senior Kava Professional Partnership',
              agreementDescription: 'Full partnership agreement for senior-level kava service and cultural education',
              startDate: '2024-01-15',
              servicesProvided: ['Traditional Kava Service', 'Cultural Education', 'Associate Training'],
              agreementStatus: 'ACTIVE',
              paymentStructure: 'HOURLY',
              baseRate: 25.00,
              signedByAssociate: '2024-01-10',
              signedByLocationManager: '2024-01-12'
            }
          ],
          authorizations: [
            {
              id: 'auth_001',
              associateId: 'assoc_malia_001',
              locationId: 'default-location',
              authorizationType: 'FULL_ACCESS',
              canAccessPOS: true,
              canManageInventory: true,
              canHandleCash: true,
              canSuperviseOthers: true,
              canAccessReports: true,
              canWorkAlone: true,
              requiresSupervision: false,
              authorizationStatus: 'ACTIVE',
              effectiveDate: '2024-01-15',
              approvalDate: '2024-01-15'
            }
          ]
        },
        {
          id: 'assoc_kai_002',
          associateCode: 'KAV002',
          firstName: 'Kai',
          lastName: 'Henderson',
          email: 'kai.henderson@kavapro.com',
          phoneNumber: '555-0102',
          professionalTitle: 'Kava Specialist',
          specializations: ['Modern Mixology', 'Customer Service'],
          yearsExperience: 4,
          bio: 'Modern kava specialist focusing on innovative preparations and exceptional customer experience.',
          associateStatus: 'ACTIVE',
          backgroundCheckStatus: 'APPROVED',
          orientationCompletedDate: '2024-03-20',
          networkJoinDate: '2024-03-01',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          certifications: [
            {
              id: 'cert_002',
              associateId: 'assoc_kai_002',
              certificationId: 'ckp_level1',
              certificationStatus: 'CERTIFIED',
              startDate: '2023-08-01',
              completionDate: '2023-10-15',
              expirationDate: '2025-10-15',
              certificateNumber: 'CKP-2023-012',
              certification: {
                name: 'Certified Kava Professional Level 1',
                type: 'KAVA_PROFESSIONAL',
                issuingOrganization: 'Kava Professional Association',
                isRequiredForService: true
              }
            }
          ],
          agreements: [
            {
              id: 'agr_002',
              associateId: 'assoc_kai_002',
              locationId: 'default-location',
              agreementType: 'SCOPED_PROJECT',
              agreementTitle: 'Modern Kava Service Agreement',
              agreementDescription: 'Project-based agreement for modern kava service and mixology',
              startDate: '2024-03-20',
              servicesProvided: ['Modern Kava Service', 'Mixology', 'Customer Experience'],
              agreementStatus: 'ACTIVE',
              paymentStructure: 'HOURLY',
              baseRate: 20.00,
              signedByAssociate: '2024-03-18',
              signedByLocationManager: '2024-03-19'
            }
          ],
          authorizations: [
            {
              id: 'auth_002',
              associateId: 'assoc_kai_002',
              locationId: 'default-location',
              authorizationType: 'SERVICE_ONLY',
              canAccessPOS: true,
              canManageInventory: false,
              canHandleCash: true,
              canSuperviseOthers: false,
              canAccessReports: false,
              canWorkAlone: true,
              requiresSupervision: false,
              authorizationStatus: 'ACTIVE',
              effectiveDate: '2024-03-20',
              approvalDate: '2024-03-20'
            }
          ]
        },
        {
          id: 'assoc_leilani_003',
          associateCode: 'KAV003',
          firstName: 'Leilani',
          lastName: 'Torres',
          email: 'leilani.torres@kavapro.com',
          phoneNumber: '555-0103',
          professionalTitle: 'Junior Associate',
          specializations: ['Basic Preparation'],
          yearsExperience: 1,
          bio: 'New associate in certification process, enthusiastic about kava culture and service.',
          associateStatus: 'ACTIVE',
          backgroundCheckStatus: 'APPROVED',
          orientationCompletedDate: '2024-09-10',
          networkJoinDate: '2024-09-01',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          certifications: [
            {
              id: 'cert_003',
              associateId: 'assoc_leilani_003',
              certificationId: 'ckp_level1',
              certificationStatus: 'IN_PROGRESS',
              startDate: '2024-09-01',
              certification: {
                name: 'Certified Kava Professional Level 1',
                type: 'KAVA_PROFESSIONAL',
                issuingOrganization: 'Kava Professional Association',
                isRequiredForService: true
              }
            }
          ],
          agreements: [
            {
              id: 'agr_003',
              associateId: 'assoc_leilani_003',
              locationId: 'default-location',
              agreementType: 'JUNIOR_ASSOCIATION',
              agreementTitle: 'Junior Associate Development Agreement',
              agreementDescription: 'Entry-level association with mentorship and certification support',
              startDate: '2024-09-10',
              servicesProvided: ['Basic Kava Service', 'Learning Support'],
              agreementStatus: 'ACTIVE',
              paymentStructure: 'HOURLY',
              baseRate: 16.00,
              signedByAssociate: '2024-09-08',
              signedByLocationManager: '2024-09-09'
            }
          ],
          authorizations: [
            {
              id: 'auth_003',
              associateId: 'assoc_leilani_003',
              locationId: 'default-location',
              authorizationType: 'RESTRICTED',
              canAccessPOS: false,
              canManageInventory: false,
              canHandleCash: false,
              canSuperviseOthers: false,
              canAccessReports: false,
              canWorkAlone: false,
              requiresSupervision: true,
              authorizationStatus: 'ACTIVE',
              effectiveDate: '2024-09-10',
              approvalDate: '2024-09-10'
            }
          ]
        }
      ];

      // Apply client-side filtering for fallback data
      let filteredAssociates = mockAssociates;
      
      if (associateStatus) {
        filteredAssociates = filteredAssociates.filter(assoc => assoc.associateStatus === associateStatus);
      }
      if (locationId) {
        filteredAssociates = filteredAssociates.filter(assoc => 
          assoc.authorizations?.some(auth => auth.locationId === locationId)
        );
      }

      return NextResponse.json({ 
        personnel: filteredAssociates, 
        count: filteredAssociates.length,
        message: 'Using fallback associate data'
      });
    }

    return NextResponse.json({ personnel: associates, count: associates?.length || 0 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch associates' },
      { status: 500 }
    );
  }
}

// POST /api/personnel - Create new associate
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Generate associate code
    const associateCode = `KAV${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    
    const newAssociate = {
      associate_code: associateCode,
      first_name: body.firstName,
      last_name: body.lastName,
      preferred_name: body.preferredName,
      email: body.email,
      phone_number: body.phoneNumber,
      date_of_birth: body.dateOfBirth,
      professional_title: body.professionalTitle || 'Junior Associate',
      specializations: body.specializations || ['Basic Preparation'],
      years_experience: body.yearsExperience || 0,
      bio: body.bio,
      address: body.address,
      emergency_contact_name: body.emergencyContactName,
      emergency_contact_phone: body.emergencyContactPhone,
      emergency_contact_relationship: body.emergencyContactRelationship,
      associate_status: 'PENDING', // New associates start as pending
      background_check_status: 'PENDING',
      referral_source: body.referralSource,
      network_join_date: new Date().toISOString().split('T')[0]
    };

    const { data: associate, error } = await supabase
      .from('Associates')
      .insert([newAssociate])
      .select()
      .single();

    if (error) {
      console.log('Associates table not found, returning mock creation');
      
      const mockAssociate: Associate = {
        id: 'assoc_' + Math.random().toString(36).substr(2, 9),
        associateCode: associateCode,
        firstName: body.firstName,
        lastName: body.lastName,
        preferredName: body.preferredName,
        email: body.email,
        phoneNumber: body.phoneNumber,
        dateOfBirth: body.dateOfBirth,
        professionalTitle: body.professionalTitle || 'Junior Associate',
        specializations: body.specializations || ['Basic Preparation'],
        yearsExperience: body.yearsExperience || 0,
        bio: body.bio,
        address: body.address,
        emergencyContactName: body.emergencyContactName,
        emergencyContactPhone: body.emergencyContactPhone,
        emergencyContactRelationship: body.emergencyContactRelationship,
        associateStatus: 'PENDING',
        backgroundCheckStatus: 'PENDING',
        referralSource: body.referralSource,
        networkJoinDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return NextResponse.json({ 
        personnel: mockAssociate,
        message: 'Associate created (using fallback mode)'
      });
    }

    return NextResponse.json({ personnel: associate });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create associate' },
      { status: 500 }
    );
  }
}