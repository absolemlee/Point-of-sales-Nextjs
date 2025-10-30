import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// GET /api/service-execution - Get service execution details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agreementId = searchParams.get('agreementId');
    const associateId = searchParams.get('associateId');

    if (agreementId) {
      // Get specific execution by agreement ID
      const execution = await prisma.serviceExecution.findUnique({
        where: { serviceAgreementId: agreementId },
        include: {
          serviceAgreement: {
            include: {
              serviceOffer: {
                include: {
                  service: true
                }
              }
            }
          }
        }
      });

      if (!execution) {
        return NextResponse.json(
          { success: false, error: 'Service execution not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: execution
      });

    } else if (associateId) {
      // Get all executions for an associate
      const executions = await prisma.serviceExecution.findMany({
        where: {
          serviceAgreement: {
            associateId: associateId
          }
        },
        include: {
          serviceAgreement: {
            include: {
              serviceOffer: {
                include: {
                  service: {
                    select: {
                      serviceName: true,
                      serviceCode: true,
                      category: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return NextResponse.json({
        success: true,
        data: executions,
        count: executions.length
      });

    } else {
      return NextResponse.json(
        { success: false, error: 'Either agreementId or associateId is required' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error fetching service execution:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch service execution' },
      { status: 500 }
    );
  }
}

// PUT /api/service-execution - Update service execution progress
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { agreementId, action, ...updateData } = body;

    if (!agreementId) {
      return NextResponse.json(
        { success: false, error: 'Agreement ID is required' },
        { status: 400 }
      );
    }

    const execution = await prisma.serviceExecution.findUnique({
      where: { serviceAgreementId: agreementId },
      include: {
        serviceAgreement: true
      }
    });

    if (!execution) {
      return NextResponse.json(
        { success: false, error: 'Service execution not found' },
        { status: 404 }
      );
    }

    // Validate that the service agreement is active
    if (execution.serviceAgreement.agreementStatus !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Service agreement is not active' },
        { status: 400 }
      );
    }

    let updatedExecution;

    switch (action) {
      case 'updateProgress':
        // Update progress percentage and notes
        const { completionPercentage, currentPhase, progressNote } = updateData;

        if (completionPercentage !== undefined) {
          if (completionPercentage < 0 || completionPercentage > 100) {
            return NextResponse.json(
              { success: false, error: 'Completion percentage must be between 0 and 100' },
              { status: 400 }
            );
          }
        }

        updatedExecution = await prisma.serviceExecution.update({
          where: { serviceAgreementId: agreementId },
          data: {
            completionPercentage: completionPercentage ?? execution.completionPercentage,
            currentPhase,
            associateNotes: execution.associateNotes ? 
              [...(execution.associateNotes as any[]), progressNote] : 
              [progressNote],
            updatedAt: new Date()
          }
        });
        break;

      case 'addMilestone':
        // Add completed milestone
        const { milestone } = updateData;
        if (!milestone) {
          return NextResponse.json(
            { success: false, error: 'Milestone description is required' },
            { status: 400 }
          );
        }

        updatedExecution = await prisma.serviceExecution.update({
          where: { serviceAgreementId: agreementId },
          data: {
            milestonesCompleted: [...(execution.milestonesCompleted as any[]), milestone],
            updatedAt: new Date()
          }
        });
        break;

      case 'logTime':
        // Log hours worked
        const { hoursWorked, description } = updateData;
        if (!hoursWorked || hoursWorked <= 0) {
          return NextResponse.json(
            { success: false, error: 'Valid hours worked is required' },
            { status: 400 }
          );
        }

        const newTotalHours = (execution.hoursLogged || 0) + hoursWorked;

        updatedExecution = await prisma.serviceExecution.update({
          where: { serviceAgreementId: agreementId },
          data: {
            hoursLogged: newTotalHours,
            associateNotes: description ? 
              [...(execution.associateNotes as any[]), `Hours logged: ${hoursWorked}h - ${description}`] : 
              [...(execution.associateNotes as any[]), `Hours logged: ${hoursWorked}h`],
            updatedAt: new Date()
          }
        });
        break;

      case 'reportIssue':
        // Report an issue encountered during execution
        const { issue, severity } = updateData;
        if (!issue) {
          return NextResponse.json(
            { success: false, error: 'Issue description is required' },
            { status: 400 }
          );
        }

        const issueReport = {
          timestamp: new Date().toISOString(),
          issue,
          severity: severity || 'MEDIUM',
          reportedBy: body.reportedBy
        };

        updatedExecution = await prisma.serviceExecution.update({
          where: { serviceAgreementId: agreementId },
          data: {
            issuesEncountered: [...(execution.issuesEncountered as any[]), issue],
            progressReports: [...(execution.progressReports as any[]), issueReport],
            updatedAt: new Date()
          }
        });
        break;

      case 'addExpense':
        // Add expense incurred during service execution
        const { expenseAmount, expenseDescription, expenseCategory } = updateData;
        if (!expenseAmount || expenseAmount <= 0) {
          return NextResponse.json(
            { success: false, error: 'Valid expense amount is required' },
            { status: 400 }
          );
        }

        const newTotalExpenses = (execution.expensesIncurred || 0) + expenseAmount;

        const expenseRecord = {
          timestamp: new Date().toISOString(),
          amount: expenseAmount,
          description: expenseDescription,
          category: expenseCategory,
          addedBy: body.addedBy
        };

        updatedExecution = await prisma.serviceExecution.update({
          where: { serviceAgreementId: agreementId },
          data: {
            expensesIncurred: newTotalExpenses,
            progressReports: [...(execution.progressReports as any[]), expenseRecord],
            updatedAt: new Date()
          }
        });
        break;

      case 'pause':
        // Pause the service execution
        if (execution.pausedAt && !execution.resumedAt) {
          return NextResponse.json(
            { success: false, error: 'Service execution is already paused' },
            { status: 400 }
          );
        }

        updatedExecution = await prisma.serviceExecution.update({
          where: { serviceAgreementId: agreementId },
          data: {
            pausedAt: new Date(),
            resumedAt: null,
            associateNotes: [...(execution.associateNotes as any[]), body.pauseReason || 'Service execution paused'],
            updatedAt: new Date()
          }
        });
        break;

      case 'resume':
        // Resume paused service execution
        if (!execution.pausedAt || execution.resumedAt) {
          return NextResponse.json(
            { success: false, error: 'Service execution is not currently paused' },
            { status: 400 }
          );
        }

        updatedExecution = await prisma.serviceExecution.update({
          where: { serviceAgreementId: agreementId },
          data: {
            resumedAt: new Date(),
            associateNotes: [...(execution.associateNotes as any[]), body.resumeNote || 'Service execution resumed'],
            updatedAt: new Date()
          }
        });
        break;

      case 'qualityCheck':
        // Add quality checkpoint
        const { checkpointName, checkpointStatus, checkpointNotes, checkedBy } = updateData;
        if (!checkpointName || !checkpointStatus) {
          return NextResponse.json(
            { success: false, error: 'Checkpoint name and status are required' },
            { status: 400 }
          );
        }

        const qualityCheckpoint = {
          timestamp: new Date().toISOString(),
          name: checkpointName,
          status: checkpointStatus, // PASSED, FAILED, NEEDS_REVIEW
          notes: checkpointNotes,
          checkedBy
        };

        updatedExecution = await prisma.serviceExecution.update({
          where: { serviceAgreementId: agreementId },
          data: {
            qualityCheckpoints: [...(execution.qualityCheckpoints as any[]), qualityCheckpoint],
            updatedAt: new Date()
          }
        });
        break;

      case 'locationFeedback':
        // Add feedback from location
        const { feedback, rating } = updateData;
        if (!feedback) {
          return NextResponse.json(
            { success: false, error: 'Feedback is required' },
            { status: 400 }
          );
        }

        updatedExecution = await prisma.serviceExecution.update({
          where: { serviceAgreementId: agreementId },
          data: {
            locationFeedback: [...(execution.locationFeedback as any[]), feedback],
            satisfactionRating: rating || execution.satisfactionRating,
            updatedAt: new Date()
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
      data: updatedExecution,
      message: `Service execution ${action} completed successfully`
    });

  } catch (error) {
    console.error('Error updating service execution:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update service execution' },
      { status: 500 }
    );
  }
}

// POST /api/service-execution - Create a progress report or structured update
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agreementId, reportType, reportData } = body;

    if (!agreementId || !reportType || !reportData) {
      return NextResponse.json(
        { success: false, error: 'Agreement ID, report type, and report data are required' },
        { status: 400 }
      );
    }

    const execution = await prisma.serviceExecution.findUnique({
      where: { serviceAgreementId: agreementId }
    });

    if (!execution) {
      return NextResponse.json(
        { success: false, error: 'Service execution not found' },
        { status: 404 }
      );
    }

    const progressReport = {
      timestamp: new Date().toISOString(),
      type: reportType,
      data: reportData,
      submittedBy: body.submittedBy
    };

    const updatedExecution = await prisma.serviceExecution.update({
      where: { serviceAgreementId: agreementId },
      data: {
        progressReports: [...(execution.progressReports as any[]), progressReport],
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedExecution,
      message: 'Progress report added successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating progress report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create progress report' },
      { status: 500 }
    );
  }
}