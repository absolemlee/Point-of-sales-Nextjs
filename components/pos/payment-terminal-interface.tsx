'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CreditCard, 
  Smartphone, 
  Banknote, 
  Receipt, 
  DollarSign,
  Percent,
  Calculator,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Printer,
  RefreshCw,
  Clock,
  User,
  Gift,
  Zap
} from 'lucide-react';

interface PaymentItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discounts?: {
    type: 'PERCENTAGE' | 'FIXED';
    value: number;
    reason: string;
  }[];
}

interface PaymentOrder {
  id: string;
  orderNumber: string;
  items: PaymentItem[];
  subtotal: number;
  tax: number;
  discounts: number;
  tips: number;
  total: number;
  customerName?: string;
  orderType: 'DINE_IN' | 'TAKEOUT' | 'DELIVERY' | 'DRIVE_THRU';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
}

interface PaymentMethod {
  id: string;
  type: 'CASH' | 'CARD' | 'MOBILE' | 'GIFT_CARD' | 'LOYALTY';
  name: string;
  icon: any;
  enabled: boolean;
  processingFee?: number;
}

interface PaymentTerminalProps {
  locationId: string;
  stationId?: string;
  workerId?: string;
}

export function PaymentTerminalInterface({ locationId, stationId, workerId }: PaymentTerminalProps) {
  const [currentOrder, setCurrentOrder] = useState<PaymentOrder | null>(null);
  const [paymentMethods] = useState<PaymentMethod[]>([
    { id: 'cash', type: 'CASH', name: 'Cash', icon: Banknote, enabled: true },
    { id: 'card', type: 'CARD', name: 'Credit/Debit', icon: CreditCard, enabled: true },
    { id: 'mobile', type: 'MOBILE', name: 'Mobile Pay', icon: Smartphone, enabled: true },
    { id: 'gift', type: 'GIFT_CARD', name: 'Gift Card', icon: Gift, enabled: true },
    { id: 'loyalty', type: 'LOYALTY', name: 'Loyalty Points', icon: Zap, enabled: true },
  ]);
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [discountReason, setDiscountReason] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showSplitPayment, setShowSplitPayment] = useState(false);
  const [loyaltyCustomer, setLoyaltyCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const tipPresets = [0.15, 0.18, 0.20, 0.25];

  useEffect(() => {
    // Listen for orders ready for payment
    fetchPendingOrder();
  }, [locationId, stationId]);

  const fetchPendingOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/payment/pending?locationId=${locationId}&stationId=${stationId || ''}`);
      const data = await response.json();
      if (data.order) {
        setCurrentOrder(data.order);
      }
    } catch (error) {
      console.error('Error fetching pending order:', error);
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async () => {
    if (!currentOrder || !selectedPaymentMethod) return;

    setIsProcessing(true);
    try {
      const paymentData = {
        orderId: currentOrder.id,
        paymentMethod: selectedPaymentMethod,
        amount: currentOrder.total + tipAmount - discountAmount,
        tipAmount,
        discountAmount,
        discountReason,
        cashReceived: selectedPaymentMethod === 'cash' ? parseFloat(cashReceived) : undefined,
        workerId,
        locationId
      };

      const response = await fetch('/api/payment/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();
      
      if (result.success) {
        setShowReceipt(true);
        setTimeout(() => {
          resetPaymentForm();
          fetchPendingOrder();
        }, 3000);
      } else {
        alert('Payment failed: ' + result.error);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      alert('Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetPaymentForm = () => {
    setSelectedPaymentMethod('');
    setCashReceived('');
    setTipAmount(0);
    setDiscountAmount(0);
    setDiscountReason('');
    setShowReceipt(false);
    setLoyaltyCustomer(null);
  };

  const getOrderTotal = () => {
    if (!currentOrder) return 0;
    return currentOrder.total + tipAmount - discountAmount;
  };

  const getCashChange = () => {
    if (selectedPaymentMethod !== 'cash' || !cashReceived) return 0;
    return parseFloat(cashReceived) - getOrderTotal();
  };

  const NumericKeypad = ({ onInput, onClear, onEnter }: { 
    onInput: (value: string) => void; 
    onClear: () => void; 
    onEnter: () => void; 
  }) => (
    <div className="grid grid-cols-3 gap-2">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, '0', '.', 'Clear'].map((key, index) => (
        <Button
          key={index}
          variant="outline"
          size="lg"
          className="h-16 text-xl"
          onClick={() => {
            if (key === 'Clear') onClear();
            else if (key === 'Enter') onEnter();
            else onInput(key.toString());
          }}
        >
          {key === 'Clear' ? <XCircle className="h-6 w-6" /> : key}
        </Button>
      ))}
      <Button
        variant="default"
        size="lg"
        className="h-16 text-xl"
        onClick={onEnter}
      >
        <CheckCircle className="h-6 w-6" />
      </Button>
    </div>
  );

  const ReceiptDialog = () => (
    <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Payment Successful
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <div className="text-2xl font-bold">${getOrderTotal().toFixed(2)}</div>
            <div className="text-muted-foreground">Payment Processed</div>
          </div>
          
          {selectedPaymentMethod === 'cash' && getCashChange() > 0 && (
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded">
              <div className="text-lg font-bold text-green-700">
                Change Due: ${getCashChange().toFixed(2)}
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                // Print receipt logic
                console.log('Printing receipt...');
              }}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button 
              className="flex-1"
              onClick={() => setShowReceipt(false)}
            >
              Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <CreditCard className="h-12 w-12 animate-pulse mx-auto mb-4" />
          <p>Loading payment terminal...</p>
        </div>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background">
        <div className="text-center">
          <CreditCard className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-2">Payment Terminal Ready</h2>
          <p className="text-muted-foreground mb-6">Waiting for orders to process payment...</p>
          <Button onClick={fetchPendingOrder}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Check for Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background">
      {/* Left Panel - Order Summary */}
      <div className="w-1/2 border-r">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Order #{currentOrder.orderNumber}</h2>
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                {currentOrder.customerName || 'Walk-in Customer'}
                <Badge variant="outline">{currentOrder.orderType}</Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">${getOrderTotal().toFixed(2)}</div>
              <div className="text-muted-foreground">Total Amount</div>
            </div>
          </div>

          <ScrollArea className="h-96">
            <div className="space-y-3">
              {currentOrder.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.quantity}x @ ${item.unitPrice.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${item.totalPrice.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <Separator className="my-4" />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${currentOrder.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>${currentOrder.tax.toFixed(2)}</span>
            </div>
            {tipAmount > 0 && (
              <div className="flex justify-between">
                <span>Tip:</span>
                <span>${tipAmount.toFixed(2)}</span>
              </div>
            )}
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>${getOrderTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Payment Processing */}
      <div className="w-1/2 p-6">
        <h3 className="text-xl font-bold mb-6">Payment Method</h3>
        
        <div className="space-y-4">
          {/* Payment Method Selection */}
          <div className="grid grid-cols-2 gap-3">
            {paymentMethods.filter(method => method.enabled).map((method) => (
              <Button
                key={method.id}
                variant={selectedPaymentMethod === method.id ? "default" : "outline"}
                className="h-20 flex flex-col items-center gap-2"
                onClick={() => setSelectedPaymentMethod(method.id)}
              >
                <method.icon className="h-6 w-6" />
                <span>{method.name}</span>
              </Button>
            ))}
          </div>

          {/* Tip Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Add Tip</label>
            <div className="grid grid-cols-4 gap-2">
              {tipPresets.map((preset) => (
                <Button
                  key={preset}
                  variant={tipAmount === currentOrder.total * preset ? "default" : "outline"}
                  onClick={() => setTipAmount(currentOrder.total * preset)}
                >
                  {(preset * 100).toFixed(0)}%
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Custom tip amount"
                value={tipAmount || ''}
                onChange={(e) => setTipAmount(parseFloat(e.target.value) || 0)}
              />
              <Button 
                variant="outline"
                onClick={() => setTipAmount(0)}
              >
                No Tip
              </Button>
            </div>
          </div>

          {/* Discount */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Discount</label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Discount amount"
                value={discountAmount || ''}
                onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
              />
              <Input
                placeholder="Reason"
                value={discountReason}
                onChange={(e) => setDiscountReason(e.target.value)}
              />
            </div>
          </div>

          {/* Cash Payment Details */}
          {selectedPaymentMethod === 'cash' && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Cash Received</label>
              <Input
                type="number"
                placeholder="Enter amount received"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                className="text-xl text-center"
              />
              {cashReceived && (
                <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="text-lg font-bold">
                    Change: ${getCashChange().toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Process Payment Button */}
          <Button
            className="w-full h-16 text-xl"
            onClick={processPayment}
            disabled={!selectedPaymentMethod || isProcessing || 
              (selectedPaymentMethod === 'cash' && (!cashReceived || getCashChange() < 0))}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="h-6 w-6 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="h-6 w-6 mr-2" />
                Process Payment - ${getOrderTotal().toFixed(2)}
              </>
            )}
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={resetPaymentForm}>
              Clear
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => setShowSplitPayment(true)}>
              Split Payment
            </Button>
          </div>
        </div>
      </div>

      <ReceiptDialog />
    </div>
  );
}