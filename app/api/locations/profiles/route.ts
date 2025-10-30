import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface LocationProfile {
  id: string;
  name: string;
  type: 'STATIC' | 'POPUP' | 'VENUE_PARTNERSHIP' | 'EVENT' | 'MOBILE';
  status: 'ACTIVE' | 'INACTIVE' | 'SCHEDULED' | 'CLOSED' | 'MAINTENANCE';
  
  // Location Details
  address: string;
  coordinates: { lat: number; lng: number };
  timezone: string;
  
  // Operating Information
  operatingHours: {
    [key: string]: { 
      isOpen: boolean; 
      open: string; 
      close: string;
      breaks?: Array<{ start: string; end: string; }>;
    };
  };
  
  // Contact & Settings
  contactInfo: {
    phone?: string;
    email?: string;
    manager: string;
    managerId: string;
  };
  
  // Capabilities
  capabilities: {
    hasKitchen: boolean;
    hasSeating: boolean;
    hasDelivery: boolean;
    hasPickup: boolean;
    hasDriveThru: boolean;
    acceptsCash: boolean;
    acceptsCard: boolean;
    acceptsMobile: boolean;
    hasWifi: boolean;
    hasPrinter: boolean;
    hasKDS: boolean; // Kitchen Display System
  };
  
  // POS Configuration
  posConfiguration: {
    terminalId: string;
    merchantId: string;
    taxRate: number;
    tipOptions: number[];
    receiptFooter: string;
    requireSignature: boolean;
    enableInventoryTracking: boolean;
  };
  
  // Staff Information
  staffing: {
    currentStaff: number;
    scheduledStaff: number;
    requiredStaff: number;
    maxCapacity: number;
  };
  
  // Performance Data
  performance: {
    dailyTarget: number;
    weeklyTarget: number;
    monthlyTarget: number;
    averageTicket: number;
    peakHours: string[];
  };
  
  createdAt: string;
  updatedAt: string;
}

// GET /api/locations/profiles - Get comprehensive location profiles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId');
    const includeMetrics = searchParams.get('includeMetrics') === 'true';

    // Mock comprehensive location data - in production this would come from database
    const mockProfiles: LocationProfile[] = [
      {
        id: 'loc-downtown-cafe',
        name: 'Downtown Kava Café',
        type: 'STATIC',
        status: 'ACTIVE',
        address: '123 Main Street, Downtown District, Austin, TX 78701',
        coordinates: { lat: 30.2672, lng: -97.7431 },
        timezone: 'America/Chicago',
        operatingHours: {
          monday: { isOpen: true, open: '06:00', close: '22:00' },
          tuesday: { isOpen: true, open: '06:00', close: '22:00' },
          wednesday: { isOpen: true, open: '06:00', close: '22:00' },
          thursday: { isOpen: true, open: '06:00', close: '22:00' },
          friday: { isOpen: true, open: '06:00', close: '24:00' },
          saturday: { isOpen: true, open: '07:00', close: '24:00' },
          sunday: { isOpen: true, open: '08:00', close: '21:00' }
        },
        contactInfo: {
          phone: '+1-512-555-0123',
          email: 'downtown@kavalounge.com',
          manager: 'Alice Johnson',
          managerId: 'mgr-alice-001'
        },
        capabilities: {
          hasKitchen: true,
          hasSeating: true,
          hasDelivery: true,
          hasPickup: true,
          hasDriveThru: false,
          acceptsCash: true,
          acceptsCard: true,
          acceptsMobile: true,
          hasWifi: true,
          hasPrinter: true,
          hasKDS: true
        },
        posConfiguration: {
          terminalId: 'TRM-DTC-001',
          merchantId: 'MRC-KAVA-DTC',
          taxRate: 8.25,
          tipOptions: [15, 18, 20, 25],
          receiptFooter: 'Thank you for visiting Downtown Kava Café!',
          requireSignature: false,
          enableInventoryTracking: true
        },
        staffing: {
          currentStaff: 6,
          scheduledStaff: 8,
          requiredStaff: 5,
          maxCapacity: 12
        },
        performance: {
          dailyTarget: 3000,
          weeklyTarget: 21000,
          monthlyTarget: 90000,
          averageTicket: 28.50,
          peakHours: ['07:00-09:00', '12:00-14:00', '17:00-19:00']
        },
        createdAt: '2024-01-15T08:00:00.000Z',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'loc-university-kiosk',
        name: 'University Campus Kiosk',
        type: 'STATIC',
        status: 'ACTIVE',
        address: 'Student Union Building, UT Campus, Austin, TX 78712',
        coordinates: { lat: 30.2849, lng: -97.7341 },
        timezone: 'America/Chicago',
        operatingHours: {
          monday: { isOpen: true, open: '07:00', close: '20:00' },
          tuesday: { isOpen: true, open: '07:00', close: '20:00' },
          wednesday: { isOpen: true, open: '07:00', close: '20:00' },
          thursday: { isOpen: true, open: '07:00', close: '20:00' },
          friday: { isOpen: true, open: '07:00', close: '18:00' },
          saturday: { isOpen: true, open: '09:00', close: '17:00' },
          sunday: { isOpen: true, open: '10:00', close: '19:00' }
        },
        contactInfo: {
          phone: '+1-512-555-0456',
          email: 'campus@kavalounge.com',
          manager: 'Bob Martinez',
          managerId: 'mgr-bob-002'
        },
        capabilities: {
          hasKitchen: false,
          hasSeating: false,
          hasDelivery: false,
          hasPickup: true,
          hasDriveThru: false,
          acceptsCash: true,
          acceptsCard: true,
          acceptsMobile: true,
          hasWifi: false,
          hasPrinter: true,
          hasKDS: false
        },
        posConfiguration: {
          terminalId: 'TRM-UNI-001',
          merchantId: 'MRC-KAVA-UNI',
          taxRate: 8.25,
          tipOptions: [10, 15, 18, 20],
          receiptFooter: 'Fuel your studies with Kava!',
          requireSignature: false,
          enableInventoryTracking: true
        },
        staffing: {
          currentStaff: 3,
          scheduledStaff: 4,
          requiredStaff: 2,
          maxCapacity: 6
        },
        performance: {
          dailyTarget: 1500,
          weeklyTarget: 9000,
          monthlyTarget: 38000,
          averageTicket: 18.75,
          peakHours: ['08:00-10:00', '14:00-16:00']
        },
        createdAt: '2024-02-01T10:00:00.000Z',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'loc-mall-popup',
        name: 'Riverside Mall Pop-up',
        type: 'POPUP',
        status: 'ACTIVE',
        address: 'Riverside Mall, Food Court Level 2, Austin, TX 78741',
        coordinates: { lat: 30.2241, lng: -97.7561 },
        timezone: 'America/Chicago',
        operatingHours: {
          monday: { isOpen: true, open: '10:00', close: '21:00' },
          tuesday: { isOpen: true, open: '10:00', close: '21:00' },
          wednesday: { isOpen: true, open: '10:00', close: '21:00' },
          thursday: { isOpen: true, open: '10:00', close: '21:00' },
          friday: { isOpen: true, open: '10:00', close: '22:00' },
          saturday: { isOpen: true, open: '10:00', close: '22:00' },
          sunday: { isOpen: true, open: '11:00', close: '20:00' }
        },
        contactInfo: {
          phone: '+1-512-555-0789',
          email: 'popup@kavalounge.com',
          manager: 'Carol Davis',
          managerId: 'mgr-carol-003'
        },
        capabilities: {
          hasKitchen: false,
          hasSeating: true,
          hasDelivery: false,
          hasPickup: true,
          hasDriveThru: false,
          acceptsCash: true,
          acceptsCard: true,
          acceptsMobile: true,
          hasWifi: true,
          hasPrinter: true,
          hasKDS: false
        },
        posConfiguration: {
          terminalId: 'TRM-POP-001',
          merchantId: 'MRC-KAVA-POP',
          taxRate: 8.25,
          tipOptions: [15, 18, 20],
          receiptFooter: 'Pop-up powered by Kava!',
          requireSignature: false,
          enableInventoryTracking: false
        },
        staffing: {
          currentStaff: 2,
          scheduledStaff: 3,
          requiredStaff: 2,
          maxCapacity: 4
        },
        performance: {
          dailyTarget: 800,
          weeklyTarget: 5600,
          monthlyTarget: 22000,
          averageTicket: 16.25,
          peakHours: ['12:00-14:00', '17:00-20:00']
        },
        createdAt: '2024-03-01T12:00:00.000Z',
        updatedAt: new Date().toISOString()
      }
    ];

    // Filter by location if specified
    const filteredProfiles = locationId 
      ? mockProfiles.filter(p => p.id === locationId)
      : mockProfiles;

    if (includeMetrics) {
      // In production, would fetch real-time metrics and merge with profiles
      // For now, return profiles with a flag indicating metrics should be fetched separately
      return NextResponse.json({
        profiles: filteredProfiles,
        count: filteredProfiles.length,
        metricsAvailable: true,
        metricsEndpoint: '/api/locations/metrics'
      });
    }

    return NextResponse.json({
      profiles: filteredProfiles,
      count: filteredProfiles.length
    });

  } catch (error) {
    console.error('Error fetching location profiles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch location profiles' },
      { status: 500 }
    );
  }
}

// POST /api/locations/profiles - Create or update location profile
export async function POST(request: NextRequest) {
  try {
    const profile: Partial<LocationProfile> = await request.json();

    // In production, this would validate and save to database
    // For now, return success with generated ID
    
    const newProfile: LocationProfile = {
      id: profile.id || `loc-${Date.now()}`,
      name: profile.name || 'New Location',
      type: profile.type || 'STATIC',
      status: profile.status || 'INACTIVE',
      address: profile.address || '',
      coordinates: profile.coordinates || { lat: 0, lng: 0 },
      timezone: profile.timezone || 'America/Chicago',
      operatingHours: profile.operatingHours || {},
      contactInfo: profile.contactInfo || { manager: '', managerId: '' },
      capabilities: profile.capabilities || {
        hasKitchen: false,
        hasSeating: false,
        hasDelivery: false,
        hasPickup: true,
        hasDriveThru: false,
        acceptsCash: true,
        acceptsCard: true,
        acceptsMobile: false,
        hasWifi: false,
        hasPrinter: true,
        hasKDS: false
      },
      posConfiguration: profile.posConfiguration || {
        terminalId: '',
        merchantId: '',
        taxRate: 0,
        tipOptions: [15, 18, 20],
        receiptFooter: '',
        requireSignature: false,
        enableInventoryTracking: true
      },
      staffing: profile.staffing || {
        currentStaff: 0,
        scheduledStaff: 0,
        requiredStaff: 1,
        maxCapacity: 10
      },
      performance: profile.performance || {
        dailyTarget: 1000,
        weeklyTarget: 7000,
        monthlyTarget: 30000,
        averageTicket: 25.00,
        peakHours: []
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      profile: newProfile
    });

  } catch (error) {
    console.error('Error creating/updating location profile:', error);
    return NextResponse.json(
      { error: 'Failed to create/update location profile' },
      { status: 500 }
    );
  }
}