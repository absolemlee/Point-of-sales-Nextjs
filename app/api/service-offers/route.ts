import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// GET /api/service-offers - Fetch service offers with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId');
    const status = searchParams.get('status');
    const urgency = searchParams.get('urgency');
    const associateId = searchParams.get('associateId'); // For associates to see their applicable offers
    const includeExpired = searchParams.get('includeExpired') === 'true';

    let whereClause: any = {};

    // Filter by location if specified
    if (locationId) {
      whereClause.locationId = locationId;
    }

    // Filter by status
    if (status) {
      whereClause.offerStatus = status;
    } else if (!includeExpired) {
      // By default, exclude expired offers
      whereClause.offerStatus = { not: 'EXPIRED' };
    }

    // Filter by urgency
    if (urgency) {
      whereClause.urgency = urgency;
    }

    // Filter out expired offers based on expiresAt date
    if (!includeExpired) {
      whereClause.OR = [
        { expiresAt: null }, // No expiration date
        { expiresAt: { gte: new Date() } } // Not yet expired
      ];
    }

    const serviceOffers = await prisma.serviceOffer.findMany({
      where: whereClause,
      include: {
        service: {
          select: {
            id: true,
            serviceName: true,
            serviceCode: true,
            category: true,
            complexity: true,
            shortDescription: true,
            estimatedDurationHours: true,
            durationRangeMinHours: true,
            durationRangeMaxHours: true,
            requiredSkills: true,
            requiredCertifications: true
          }
        },
        serviceAgreements: {
          where: associateId ? { associateId } : undefined,
          select: {
            id: true,
            agreementStatus: true,
            associateId: true
          }
        }
      },
      orderBy: [
        { urgency: 'desc' }, // Most urgent first
        { postedAt: 'desc' }  // Most recent first
      ]
    });

    // If associateId is provided, filter out offers where associate is excluded
    // or where specific associates are required and this associate is not included
    let filteredOffers = serviceOffers;
    if (associateId) {
      filteredOffers = serviceOffers.filter((offer: any) => {
        // Check if associate is excluded
        if (offer.excludedAssociates.includes(associateId)) {
          return false;
        }
        
        // If specific associates are preferred and this associate is not in the list
        if (offer.preferredAssociates.length > 0 && !offer.preferredAssociates.includes(associateId)) {
          return false;
        }
        
        return true;
      });
    }

    return NextResponse.json({
      success: true,
      data: filteredOffers,
      count: filteredOffers.length
    });

  } catch (error) {
    console.error('Error fetching service offers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch service offers' },
      { status: 500 }
    );
  }
}

// POST /api/service-offers - Create a new service offer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = [
      'serviceId', 'locationId', 'preferredStartDate', 
      'offeredAmount', 'postedBy'
    ];

    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate that the service exists and is active
    const service = await prisma.service.findUnique({
      where: { id: body.serviceId }
    });

    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      );
    }

    if (!service.isActive) {
      return NextResponse.json(
        { success: false, error: 'Cannot create offer for inactive service' },
        { status: 400 }
      );
    }

    // Validate dates
    const preferredStartDate = new Date(body.preferredStartDate);
    const now = new Date();
    
    if (preferredStartDate < now) {
      return NextResponse.json(
        { success: false, error: 'Preferred start date cannot be in the past' },
        { status: 400 }
      );
    }

    // Validate latest start date if provided
    if (body.latestStartDate) {
      const latestStartDate = new Date(body.latestStartDate);
      if (latestStartDate < preferredStartDate) {
        return NextResponse.json(
          { success: false, error: 'Latest start date cannot be before preferred start date' },
          { status: 400 }
        );
      }
    }

    // Validate expiration date if provided
    if (body.expiresAt) {
      const expiresAt = new Date(body.expiresAt);
      if (expiresAt <= now) {
        return NextResponse.json(
          { success: false, error: 'Expiration date must be in the future' },
          { status: 400 }
        );
      }
    }

    // Validate offered amount
    if (body.offeredAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Offered amount must be greater than zero' },
        { status: 400 }
      );
    }

    const newServiceOffer = await prisma.serviceOffer.create({
      data: {
        serviceId: body.serviceId,
        locationId: body.locationId,
        offerTitle: body.offerTitle,
        customInstructions: body.customInstructions,
        preferredStartDate: preferredStartDate,
        preferredStartTime: body.preferredStartTime,
        latestStartDate: body.latestStartDate ? new Date(body.latestStartDate) : null,
        mustCompleteBy: body.mustCompleteBy ? new Date(body.mustCompleteBy) : null,
        canStartAnytimeInRange: body.canStartAnytimeInRange || false,
        acceptableStartTimes: body.acceptableStartTimes || [],
        offeredAmount: body.offeredAmount,
        paymentStructure: body.paymentStructure || 'FIXED',
        hourlyRate: body.hourlyRate,
        maxHours: body.maxHours,
        bonusConditions: body.bonusConditions,
        expenseReimbursement: body.expenseReimbursement || false,
        customDurationEstimate: body.customDurationEstimate,
        locationSpecificRequirements: body.locationSpecificRequirements || [],
        additionalEquipmentProvided: body.additionalEquipmentProvided || [],
        minimumExperienceLevel: body.minimumExperienceLevel || 0,
        requiredLocationExperience: body.requiredLocationExperience || false,
        preferredAssociates: body.preferredAssociates || [],
        excludedAssociates: body.excludedAssociates || [],
        offerStatus: 'OPEN',
        urgency: body.urgency || 'ROUTINE',
        maxApplicants: body.maxApplicants || 1,
        currentApplicants: 0,
        postedBy: body.postedBy,
        postedAt: new Date(),
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        internalNotes: body.internalNotes
      },
      include: {
        service: {
          select: {
            serviceName: true,
            serviceCode: true,
            category: true,
            complexity: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: newServiceOffer,
      message: 'Service offer created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating service offer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create service offer' },
      { status: 500 }
    );
  }
}

// PUT /api/service-offers - Update an existing service offer
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Offer ID is required' },
        { status: 400 }
      );
    }

    // Check if offer exists
    const existingOffer = await prisma.serviceOffer.findUnique({
      where: { id },
      include: {
        serviceAgreements: {
          where: {
            agreementStatus: { in: ['ACCEPTED', 'ACTIVE'] }
          }
        }
      }
    });

    if (!existingOffer) {
      return NextResponse.json(
        { success: false, error: 'Service offer not found' },
        { status: 404 }
      );
    }

    // Prevent updates if offer has active agreements
    if (existingOffer.serviceAgreements.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot update offer with active agreements' },
        { status: 409 }
      );
    }

    // Validate dates if being updated
    if (updateData.preferredStartDate) {
      const preferredStartDate = new Date(updateData.preferredStartDate);
      if (preferredStartDate < new Date()) {
        return NextResponse.json(
          { success: false, error: 'Preferred start date cannot be in the past' },
          { status: 400 }
        );
      }
    }

    const updatedOffer = await prisma.serviceOffer.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        service: {
          select: {
            serviceName: true,
            serviceCode: true,
            category: true,
            complexity: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedOffer,
      message: 'Service offer updated successfully'
    });

  } catch (error) {
    console.error('Error updating service offer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update service offer' },
      { status: 500 }
    );
  }
}

// DELETE /api/service-offers - Cancel/delete a service offer
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Offer ID is required' },
        { status: 400 }
      );
    }

    // Check if offer has any active agreements
    const activeAgreements = await prisma.serviceAgreement.count({
      where: {
        serviceOfferId: id,
        agreementStatus: { in: ['ACCEPTED', 'ACTIVE'] }
      }
    });

    if (activeAgreements > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete offer with active agreements' },
        { status: 409 }
      );
    }

    // Update status to cancelled instead of hard delete
    const cancelledOffer = await prisma.serviceOffer.update({
      where: { id },
      data: { 
        offerStatus: 'CANCELLED',
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: cancelledOffer,
      message: 'Service offer cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling service offer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cancel service offer' },
      { status: 500 }
    );
  }
}