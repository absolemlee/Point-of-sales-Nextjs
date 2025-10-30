import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderId,
      paymentMethod,
      amount,
      tipAmount,
      discountAmount,
      discountReason,
      cashReceived,
      workerId,
      locationId
    } = body;

    if (!orderId || !paymentMethod || !amount || !locationId) {
      return NextResponse.json(
        { success: false, error: 'Missing required payment information' },
        { status: 400 }
      );
    }

    // Validate cash payments
    if (paymentMethod === 'CASH' && (!cashReceived || cashReceived < amount)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient cash received' },
        { status: 400 }
      );
    }

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order is already paid
    const paidAmount = order.payments
      .filter((p: any) => p.status === 'COMPLETED')
      .reduce((sum: number, p: any) => sum + Number(p.amount), 0);

    if (paidAmount >= Number(order.totalAmount)) {
      return NextResponse.json(
        { success: false, error: 'Order is already fully paid' },
        { status: 400 }
      );
    }

    // Mock payment processing - replace with real payment processor
    const paymentResult = await processPayment({
      orderId,
      paymentMethod,
      amount,
      tipAmount: tipAmount || 0,
      discountAmount: discountAmount || 0,
      discountReason,
      cashReceived,
      workerId,
      locationId
    });

    if (paymentResult.success) {
      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          orderId,
          amount: Number(amount),
          method: paymentMethod,
          status: 'COMPLETED',
          transactionId: paymentResult.transactionId,
          processorResponse: paymentResult.processorResponse || {},
          processedBy: workerId,
          processedAt: new Date()
        }
      });

      // Update order if fully paid
      const newPaidAmount = paidAmount + Number(amount);
      if (newPaidAmount >= Number(order.totalAmount)) {
        await prisma.order.update({
          where: { id: orderId },
          data: { 
            status: 'READY' // Assuming order is ready once paid
          }
        });
      }

      return NextResponse.json({
        success: true,
        transactionId: paymentResult.transactionId,
        paymentId: payment.id,
        message: 'Payment processed successfully',
        change: paymentMethod === 'CASH' && cashReceived ? cashReceived - amount : 0
      });
    } else {
      // Create failed payment record for audit
      await prisma.payment.create({
        data: {
          orderId,
          amount: Number(amount),
          method: paymentMethod,
          status: 'FAILED',
          processorResponse: paymentResult.processorResponse || { error: paymentResult.error },
          processedBy: workerId,
          processedAt: new Date()
        }
      });

      return NextResponse.json(
        { success: false, error: paymentResult.error },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { success: false, error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}

// Mock payment processing function
async function processPayment(paymentData: any) {
  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock different payment method processing
  switch (paymentData.paymentMethod) {
    case 'CASH':
      return {
        success: true,
        transactionId: `CASH_${Date.now()}`,
        change: paymentData.cashReceived - paymentData.amount,
        processorResponse: { method: 'cash', cashReceived: paymentData.cashReceived }
      };
    
    case 'CREDIT_CARD':
    case 'DEBIT_CARD':
      // Simulate occasional card decline
      if (Math.random() < 0.05) { // 5% chance of decline
        return {
          success: false,
          error: 'Card declined - insufficient funds',
          processorResponse: { error: 'DECLINED', code: 'INSUFFICIENT_FUNDS' }
        };
      }
      return {
        success: true,
        transactionId: `CARD_${Date.now()}`,
        last4: '1234',
        processorResponse: { method: 'card', last4: '1234', approved: true }
      };
    
    case 'MOBILE_PAY':
      return {
        success: true,
        transactionId: `MOBILE_${Date.now()}`,
        provider: 'Apple Pay',
        processorResponse: { method: 'mobile', provider: 'Apple Pay', approved: true }
      };
    
    case 'GIFT_CARD':
      return {
        success: true,
        transactionId: `GIFT_${Date.now()}`,
        remainingBalance: 45.67,
        processorResponse: { method: 'gift_card', remainingBalance: 45.67 }
      };
    
    default:
      return {
        success: false,
        error: 'Unsupported payment method',
        processorResponse: { error: 'UNSUPPORTED_METHOD' }
      };
  }
}