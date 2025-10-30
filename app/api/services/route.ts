import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// GET /api/services - Fetch all active services with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const complexity = searchParams.get('complexity');
    const isActive = searchParams.get('active') !== 'false';
    const search = searchParams.get('search');

    const whereClause: any = {
      ...(isActive && { isActive: true }),
      ...(category && { category }),
      ...(complexity && { complexity }),
      ...(search && {
        OR: [
          { serviceName: { contains: search, mode: 'insensitive' } },
          { shortDescription: { contains: search, mode: 'insensitive' } },
          { serviceCode: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const services = await prisma.service.findMany({
      where: whereClause,
      orderBy: [
        { category: 'asc' },
        { complexity: 'asc' },
        { serviceName: 'asc' }
      ],
      include: {
        serviceOffers: {
          where: { offerStatus: 'OPEN' },
          select: { id: true, offeredAmount: true, locationId: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: services,
      count: services.length
    });

  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

// POST /api/services - Create a new service
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = [
      'serviceName', 'serviceCode', 'category', 'complexity',
      'shortDescription', 'executionInstructions', 
      'estimatedDurationHours', 'durationRangeMinHours', 'durationRangeMaxHours'
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate duration ranges
    if (body.durationRangeMinHours > body.durationRangeMaxHours) {
      return NextResponse.json(
        { success: false, error: 'Minimum duration cannot be greater than maximum duration' },
        { status: 400 }
      );
    }

    if (body.estimatedDurationHours < body.durationRangeMinHours || 
        body.estimatedDurationHours > body.durationRangeMaxHours) {
      return NextResponse.json(
        { success: false, error: 'Estimated duration must be within the specified range' },
        { status: 400 }
      );
    }

    // Check if service code already exists
    const existingService = await prisma.service.findUnique({
      where: { serviceCode: body.serviceCode }
    });

    if (existingService) {
      return NextResponse.json(
        { success: false, error: 'Service code already exists' },
        { status: 409 }
      );
    }

    const newService = await prisma.service.create({
      data: {
        serviceName: body.serviceName,
        serviceCode: body.serviceCode,
        category: body.category,
        complexity: body.complexity,
        shortDescription: body.shortDescription,
        detailedDescription: body.detailedDescription,
        requiredSkills: body.requiredSkills || [],
        requiredCertifications: body.requiredCertifications || [],
        estimatedDurationHours: body.estimatedDurationHours,
        durationRangeMinHours: body.durationRangeMinHours,
        durationRangeMaxHours: body.durationRangeMaxHours,
        requiresSpecificStartTime: body.requiresSpecificStartTime || false,
        canBeSplitAcrossDays: body.canBeSplitAcrossDays || false,
        requiresContinuousWork: body.requiresContinuousWork ?? true,
        preparationInstructions: body.preparationInstructions,
        executionInstructions: body.executionInstructions,
        completionRequirements: body.completionRequirements,
        qualityStandards: body.qualityStandards,
        expectedDeliverables: body.expectedDeliverables || [],
        successCriteria: body.successCriteria || [],
        requiredEquipment: body.requiredEquipment || [],
        requiredMaterials: body.requiredMaterials || [],
        locationRequirements: body.locationRequirements,
        suggestedBaseRate: body.suggestedBaseRate,
        complexityMultiplier: body.complexityMultiplier || 1.0,
        isActive: body.isActive ?? true,
        requiresApproval: body.requiresApproval || false,
        createdBy: body.createdBy // Should be set from authenticated user context
      }
    });

    return NextResponse.json({
      success: true,
      data: newService,
      message: 'Service created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating service:', error);
    
    // Handle Prisma validation errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { success: false, error: 'Service code must be unique' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create service' },
      { status: 500 }
    );
  }
}

// PUT /api/services - Update an existing service
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Service ID is required' },
        { status: 400 }
      );
    }

    // Check if service exists
    const existingService = await prisma.service.findUnique({
      where: { id }
    });

    if (!existingService) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      );
    }

    // Validate duration ranges if they're being updated
    if (updateData.durationRangeMinHours && updateData.durationRangeMaxHours) {
      if (updateData.durationRangeMinHours > updateData.durationRangeMaxHours) {
        return NextResponse.json(
          { success: false, error: 'Minimum duration cannot be greater than maximum duration' },
          { status: 400 }
        );
      }
    }

    // Increment version number for tracking changes
    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        ...updateData,
        versionNumber: existingService.versionNumber + 1,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedService,
      message: 'Service updated successfully'
    });

  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update service' },
      { status: 500 }
    );
  }
}

// DELETE /api/services - Soft delete a service (set isActive to false)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Service ID is required' },
        { status: 400 }
      );
    }

    // Check if service has active offers
    const activeOffers = await prisma.serviceOffer.count({
      where: {
        serviceId: id,
        offerStatus: { in: ['OPEN', 'PENDING', 'ACCEPTED', 'IN_PROGRESS'] }
      }
    });

    if (activeOffers > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete service with active offers' },
        { status: 409 }
      );
    }

    // Soft delete by setting isActive to false
    const deletedService = await prisma.service.update({
      where: { id },
      data: { 
        isActive: false,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: deletedService,
      message: 'Service deactivated successfully'
    });

  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete service' },
      { status: 500 }
    );
  }
}