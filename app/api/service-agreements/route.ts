import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// GET /api/service-agreements - Fetch service agreements with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const associateId = searchParams.get('associateId');
    const locationId = searchParams.get('locationId');
    const status = searchParams.get('status');
    const includeCompleted = searchParams.get('includeCompleted') === 'true';

    let whereClause: any = {};

    // Filter by associate
    if (associateId) {
      whereClause.associateId = associateId;
    }

    // Filter by location
    if (locationId) {
      whereClause.locationId = locationId;
    }

    // Filter by status
    if (status) {
      whereClause.agreementStatus = status;
    } else if (!includeCompleted) {
      // By default, exclude completed agreements unless specifically requested
      whereClause.agreementStatus = { not: 'COMPLETED' };
    }

    const serviceAgreements = await prisma.serviceAgreement.findMany({
      where: whereClause,
      include: {
        serviceOffer: {
          include: {
            service: {
              select: {
                serviceName: true,
                serviceCode: true,
                category: true,
                complexity: true,
                shortDescription: true,
                estimatedDurationHours: true,
                executionInstructions: true
              }
            }
          }
        },
        serviceExecution: true,
        serviceReviews: true
      },
      orderBy: [
        { agreementStatus: 'asc' }, // Active agreements first
        { agreedStartTime: 'asc' }  // Earliest start time first
      ]
    });

    return NextResponse.json({
      success: true,
      data: serviceAgreements,
      count: serviceAgreements.length
    });

  } catch (error) {
    console.error('Error fetching service agreements:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch service agreements' },
      { status: 500 }
    );
  }
}

// POST /api/service-agreements - Create a new service agreement (associate applying for offer)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = [
      'serviceOfferId', 'associateId', 'agreedAmount', 'agreedStartTime'
    ];

    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Check if service offer exists and is still open
    const serviceOffer = await prisma.serviceOffer.findUnique({
      where: { id: body.serviceOfferId },
      include: {
        service: true,
        serviceAgreements: {
          where: {
            agreementStatus: { in: ['PROPOSED', 'ACCEPTED', 'ACTIVE'] }
          }
        }
      }
    });

    if (!serviceOffer) {
      return NextResponse.json(
        { success: false, error: 'Service offer not found' },
        { status: 404 }
      );
    }

    if (serviceOffer.offerStatus !== 'OPEN') {
      return NextResponse.json(
        { success: false, error: 'Service offer is no longer open' },
        { status: 400 }
      );
    }

    // Check if offer has expired
    if (serviceOffer.expiresAt && new Date() > serviceOffer.expiresAt) {
      // Update offer status to expired
      await prisma.serviceOffer.update({
        where: { id: body.serviceOfferId },
        data: { offerStatus: 'EXPIRED' }
      });
      
      return NextResponse.json(
        { success: false, error: 'Service offer has expired' },
        { status: 400 }
      );
    }

    // Check if associate has already applied for this offer
    const existingAgreement = await prisma.serviceAgreement.findUnique({
      where: {
        serviceOfferId_associateId: {
          serviceOfferId: body.serviceOfferId,
          associateId: body.associateId
        }
      }
    });

    if (existingAgreement) {
      return NextResponse.json(
        { success: false, error: 'You have already applied for this service offer' },
        { status: 409 }
      );
    }

    // Check if maximum applicants reached
    if (serviceOffer.serviceAgreements.length >= serviceOffer.maxApplicants) {
      return NextResponse.json(
        { success: false, error: 'Maximum number of applicants reached' },
        { status: 400 }
      );
    }

    // Check if associate is excluded
    if (serviceOffer.excludedAssociates.includes(body.associateId)) {
      return NextResponse.json(
        { success: false, error: 'You are not eligible to apply for this service offer' },
        { status: 403 }
      );
    }

    // Validate agreed amount (should not be significantly different from offered amount)
    const agreedAmount = parseFloat(body.agreedAmount);
    const offeredAmount = parseFloat(serviceOffer.offeredAmount.toString());
    const maxVariation = offeredAmount * 0.15; // Allow 15% variation for negotiation

    if (Math.abs(agreedAmount - offeredAmount) > maxVariation) {
      return NextResponse.json(
        { success: false, error: 'Agreed amount varies too much from offered amount. Please negotiate within reasonable limits.' },
        { status: 400 }
      );
    }

    // Validate start time
    const agreedStart = new Date(body.agreedStartTime);
    const preferredStart = new Date(serviceOffer.preferredStartDate);
    
    if (agreedStart < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Agreed start time cannot be in the past' },
        { status: 400 }
      );
    }

    // Calculate estimated completion time
    const durationHours = body.estimatedDurationHours || serviceOffer.customDurationEstimate || serviceOffer.service.estimatedDurationHours;
    const estimatedCompletion = new Date(agreedStart.getTime() + (durationHours * 60 * 60 * 1000));

    const newAgreement = await prisma.serviceAgreement.create({
      data: {
        serviceOfferId: body.serviceOfferId,
        associateId: body.associateId,
        locationId: serviceOffer.locationId,
        agreedAmount: agreedAmount,
        agreedStartTime: agreedStart,
        estimatedCompletionTime: estimatedCompletion,
        specificInstructions: body.specificInstructions,
        agreedDeliverables: body.agreedDeliverables || [],
        qualityRequirements: body.qualityRequirements,
        cancellationPolicy: body.cancellationPolicy,
        latePenaltyTerms: body.latePenaltyTerms,
        qualityGuaranteeTerms: body.qualityGuaranteeTerms,
        agreementStatus: 'PROPOSED',
        associateAcceptedAt: new Date(),
        negotiationNotes: body.proposalMessage ? [body.proposalMessage] : []
      },
      include: {
        serviceOffer: {
          include: {
            service: true
          }
        }
      }
    });

    // Update service offer applicant count and status
    const updatedApplicantCount = serviceOffer.currentApplicants + 1;
    const newOfferStatus = updatedApplicantCount >= serviceOffer.maxApplicants ? 'PENDING' : 'OPEN';

    await prisma.serviceOffer.update({
      where: { id: body.serviceOfferId },
      data: {
        currentApplicants: updatedApplicantCount,
        offerStatus: newOfferStatus
      }
    });

    return NextResponse.json({
      success: true,
      data: newAgreement,
      message: 'Service agreement proposal submitted successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating service agreement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create service agreement' },
      { status: 500 }
    );
  }
}

// PUT /api/service-agreements - Update service agreement (approve, reject, update terms)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Agreement ID is required' },
        { status: 400 }
      );
    }

    const existingAgreement = await prisma.serviceAgreement.findUnique({
      where: { id },
      include: {
        serviceOffer: true
      }
    });

    if (!existingAgreement) {
      return NextResponse.json(
        { success: false, error: 'Service agreement not found' },
        { status: 404 }
      );
    }

    let updatedAgreement;

    switch (action) {
      case 'approve':
        // Location approves the agreement
        if (existingAgreement.agreementStatus !== 'PROPOSED') {
          return NextResponse.json(
            { success: false, error: 'Agreement is not in proposed status' },
            { status: 400 }
          );
        }

        updatedAgreement = await prisma.serviceAgreement.update({
          where: { id },
          data: {
            agreementStatus: 'ACCEPTED',
            locationApprovedAt: new Date(),
            approvedBy: body.approvedBy
          }
        });

        // Update service offer status to accepted
        await prisma.serviceOffer.update({
          where: { id: existingAgreement.serviceOfferId },
          data: { offerStatus: 'ACCEPTED' }
        });

        break;

      case 'reject':
        // Location rejects the agreement
        updatedAgreement = await prisma.serviceAgreement.update({
          where: { id },
          data: {
            agreementStatus: 'CANCELLED',
            negotiationNotes: [
              ...existingAgreement.negotiationNotes,
              body.rejectionReason || 'Agreement rejected'
            ]
          }
        });

        // Decrease applicant count on service offer
        await prisma.serviceOffer.update({
          where: { id: existingAgreement.serviceOfferId },
          data: {
            currentApplicants: Math.max(0, existingAgreement.serviceOffer.currentApplicants - 1),
            offerStatus: 'OPEN' // Reopen if it was pending
          }
        });

        break;

      case 'start':
        // Mark service as started
        if (existingAgreement.agreementStatus !== 'ACCEPTED') {
          return NextResponse.json(
            { success: false, error: 'Agreement must be accepted before starting' },
            { status: 400 }
          );
        }

        updatedAgreement = await prisma.serviceAgreement.update({
          where: { id },
          data: {
            agreementStatus: 'ACTIVE',
            actualStartTime: new Date()
          }
        });

        // Create service execution record
        await prisma.serviceExecution.create({
          data: {
            serviceAgreementId: id,
            startedAt: new Date(),
            completionPercentage: 0
          }
        });

        // Update service offer status
        await prisma.serviceOffer.update({
          where: { id: existingAgreement.serviceOfferId },
          data: { offerStatus: 'IN_PROGRESS' }
        });

        break;

      case 'complete':
        // Mark service as completed
        if (existingAgreement.agreementStatus !== 'ACTIVE') {
          return NextResponse.json(
            { success: false, error: 'Agreement must be active to complete' },
            { status: 400 }
          );
        }

        updatedAgreement = await prisma.serviceAgreement.update({
          where: { id },
          data: {
            agreementStatus: 'COMPLETED',
            actualCompletionTime: new Date(),
            finalAmountPaid: body.finalAmountPaid || existingAgreement.agreedAmount
          }
        });

        // Update service execution
        await prisma.serviceExecution.updateMany({
          where: { serviceAgreementId: id },
          data: {
            completedAt: new Date(),
            completionPercentage: 100
          }
        });

        // Update service offer status
        await prisma.serviceOffer.update({
          where: { id: existingAgreement.serviceOfferId },
          data: { offerStatus: 'COMPLETED' }
        });

        break;

      case 'update':
        // General update of agreement terms
        updatedAgreement = await prisma.serviceAgreement.update({
          where: { id },
          data: {
            ...updateData,
            negotiationNotes: body.negotiationNote ? 
              [...existingAgreement.negotiationNotes, body.negotiationNote] : 
              existingAgreement.negotiationNotes
          }
        });
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action specified' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: updatedAgreement,
      message: `Service agreement ${action}d successfully`
    });

  } catch (error) {
    console.error('Error updating service agreement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update service agreement' },
      { status: 500 }
    );
  }
}

// DELETE /api/service-agreements - Cancel a service agreement
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const reason = searchParams.get('reason');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Agreement ID is required' },
        { status: 400 }
      );
    }

    const existingAgreement = await prisma.serviceAgreement.findUnique({
      where: { id },
      include: { serviceOffer: true }
    });

    if (!existingAgreement) {
      return NextResponse.json(
        { success: false, error: 'Service agreement not found' },
        { status: 404 }
      );
    }

    // Only allow cancellation of agreements that haven't started
    if (existingAgreement.agreementStatus === 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Cannot cancel active service agreement' },
        { status: 400 }
      );
    }

    const cancelledAgreement = await prisma.serviceAgreement.update({
      where: { id },
      data: {
        agreementStatus: 'CANCELLED',
        negotiationNotes: [
          ...existingAgreement.negotiationNotes,
          reason || 'Agreement cancelled'
        ]
      }
    });

    // Update service offer applicant count and status
    await prisma.serviceOffer.update({
      where: { id: existingAgreement.serviceOfferId },
      data: {
        currentApplicants: Math.max(0, existingAgreement.serviceOffer.currentApplicants - 1),
        offerStatus: existingAgreement.serviceOffer.currentApplicants > 1 ? 'PENDING' : 'OPEN'
      }
    });

    return NextResponse.json({
      success: true,
      data: cancelledAgreement,
      message: 'Service agreement cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling service agreement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cancel service agreement' },
      { status: 500 }
    );
  }
}