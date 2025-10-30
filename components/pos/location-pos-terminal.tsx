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
import { useUser } from '@/lib/auth/user-context';
import { 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  DollarSign, 
  Receipt, 
  Clock,
  MapPin,
  Users,
  Settings,
  ShoppingCart,
  Package,
  Percent,
  Calculator,
  Printer,
  Wifi,
  WifiOff,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  image?: string;
  available: boolean;
  inventory?: number;
}

interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
  modifications?: string[];
}

interface LocationInfo {
  id: string;
  name: string;
  address: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  manager: string;
  taxRate: number;
  tipOptions: number[];
  capabilities: {
    acceptsCash: boolean;
    acceptsCard: boolean;
    acceptsMobile: boolean;
    hasWifi: boolean;
    hasPrinter: boolean;
  };
}

interface SystemStatus {
  posSystem: 'online' | 'offline' | 'warning';
  paymentProcessor: 'online' | 'offline' | 'warning';
  printer: 'online' | 'offline' | 'warning';
  network: 'online' | 'offline' | 'warning';
}

export function LocationPOSTerminal({ locationId }: { locationId: string }) {
  const { user } = useUser();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    posSystem: 'online',
    paymentProcessor: 'online',
    printer: 'online',
    network: 'online'
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile'>('card');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocationData();
    fetchProducts();
    
    // Simulate real-time system status updates
    const statusInterval = setInterval(updateSystemStatus, 10000);
    return () => clearInterval(statusInterval);
  }, [locationId]);

  const fetchLocationData = async () => {
    try {
      const response = await fetch(`/api/locations/profiles?locationId=${locationId}`);
      if (response.ok) {
        const data = await response.json();
        const locationProfile = data.profiles.find((p: any) => p.id === locationId);
        if (locationProfile) {
          setLocation({
            id: locationProfile.id,
            name: locationProfile.name,
            address: locationProfile.address,
            status: locationProfile.status,
            manager: locationProfile.contactInfo.manager,
            taxRate: locationProfile.posConfiguration.taxRate,
            tipOptions: locationProfile.posConfiguration.tipOptions,
            capabilities: locationProfile.capabilities
          });
        }
      }
    } catch (error) {
      console.error('Error fetching location data:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Mock product data - replace with actual API call
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Signature Coffee',
          price: 4.50,
          category: 'Beverages',
          description: 'Our house blend coffee',
          available: true,
          inventory: 50
        },
        {
          id: '2',
          name: 'Croissant',
          price: 3.25,
          category: 'Pastries',
          description: 'Fresh baked croissant',
          available: true,
          inventory: 12
        },
        {
          id: '3',
          name: 'Caesar Salad',
          price: 12.95,
          category: 'Lunch',
          description: 'Fresh romaine with caesar dressing',
          available: true,
          inventory: 8
        },
        {
          id: '4',
          name: 'Iced Latte',
          price: 5.25,
          category: 'Beverages',
          description: 'Cold espresso with milk',
          available: true,
          inventory: 30
        },
        {
          id: '5',
          name: 'Sandwich Combo',
          price: 14.50,
          category: 'Lunch',
          description: 'Turkey sandwich with chips and drink',
          available: false,
          inventory: 0
        }
      ];
      setProducts(mockProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSystemStatus = () => {
    // Simulate occasional system issues
    const randomStatus = () => {
      const rand = Math.random();
      if (rand < 0.85) return 'online';
      if (rand < 0.95) return 'warning';
      return 'offline';
    };

    setSystemStatus({
      posSystem: randomStatus(),
      paymentProcessor: randomStatus(),
      printer: randomStatus(),
      network: randomStatus()
    });
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map(item => 
      item.product.id === productId 
        ? { ...item, quantity }
        : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const getDiscountAmount = () => {
    return getSubtotal() * (discount / 100);
  };

  const getTaxAmount = () => {
    const discountedSubtotal = getSubtotal() - getDiscountAmount();
    return discountedSubtotal * (location?.taxRate || 0) / 100;
  };

  const getTotal = () => {
    return getSubtotal() - getDiscountAmount() + getTaxAmount();
  };

  const processPayment = async () => {
    if (cart.length === 0) return;

    setIsProcessingPayment(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would integrate with actual payment processor
      const transaction = {
        locationId,
        items: cart,
        subtotal: getSubtotal(),
        discount: getDiscountAmount(),
        tax: getTaxAmount(),
        total: getTotal(),
        paymentMethod,
        cashReceived: paymentMethod === 'cash' ? parseFloat(cashReceived) : undefined,
        timestamp: new Date().toISOString(),
        cashierId: user?.id,
        cashierName: user?.name
      };

      console.log('Processing transaction:', transaction);
      
      // Clear cart after successful payment
      clearCart();
      setShowPaymentDialog(false);
      setCashReceived('');
      
      // Show success message or receipt
      alert('Payment processed successfully!');
      
    } catch (error) {
      console.error('Payment processing error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'offline': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const categories = Array.from(new Set(products.map(p => p.category)));
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const changeAmount = paymentMethod === 'cash' && cashReceived 
    ? parseFloat(cashReceived) - getTotal() 
    : 0;

  if (loading || !location) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Package className="h-12 w-12 animate-pulse mx-auto mb-4" />
          <p>Loading POS Terminal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Product Selection Area */}
      <div className="flex-1 p-4 overflow-hidden">
        {/* Header */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{location.name}</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {location.address}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="text-sm">{location.manager}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <div className="grid grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              {getStatusIcon(systemStatus.posSystem)}
              <span className="text-sm">POS System</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(systemStatus.paymentProcessor)}
              <span className="text-sm">Payment</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(systemStatus.printer)}
              <span className="text-sm">Printer</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(systemStatus.network)}
              <span className="text-sm">Network</span>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All Items
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="bg-white rounded-lg p-4 shadow-sm flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map(product => (
                <Card 
                  key={product.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    !product.available ? 'opacity-50' : ''
                  }`}
                  onClick={() => product.available && addToCart(product)}
                >
                  <CardContent className="p-4">
                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="font-medium text-sm mb-1">{product.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
                      {product.inventory !== undefined && (
                        <Badge variant={product.inventory > 10 ? 'secondary' : 'destructive'}>
                          {product.inventory}
                        </Badge>
                      )}
                    </div>
                    {!product.available && (
                      <Badge variant="destructive" className="w-full mt-2">
                        Out of Stock
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Cart Area */}
      <div className="w-96 bg-white border-l p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Current Order</h2>
          {cart.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearCart}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-muted-foreground">No items in cart</p>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 mb-4">
              <div className="space-y-2">
                {cart.map(item => (
                  <Card key={item.product.id}>
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{item.product.name}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="font-medium">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>

            {/* Discount */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="h-4 w-4" />
                <span className="text-sm font-medium">Discount</span>
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="0"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                />
                <span className="self-center text-sm">%</span>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${getSubtotal().toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount ({discount}%):</span>
                  <span>-${getDiscountAmount().toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Tax ({location.taxRate}%):</span>
                <span>${getTaxAmount().toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>${getTotal().toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Button */}
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => setShowPaymentDialog(true)}
              disabled={cart.length === 0}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Process Payment
            </Button>
          </>
        )}
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between font-bold">
                <span>Total Amount:</span>
                <span>${getTotal().toFixed(2)}</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Payment Method</label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {location.capabilities.acceptsCash && (
                  <Button
                    variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('cash')}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Cash
                  </Button>
                )}
                {location.capabilities.acceptsCard && (
                  <Button
                    variant={paymentMethod === 'card' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Card
                  </Button>
                )}
                {location.capabilities.acceptsMobile && (
                  <Button
                    variant={paymentMethod === 'mobile' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('mobile')}
                  >
                    Mobile
                  </Button>
                )}
              </div>
            </div>

            {paymentMethod === 'cash' && (
              <div>
                <label className="text-sm font-medium">Cash Received</label>
                <Input
                  type="number"
                  step="0.01"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder="0.00"
                  className="mt-2"
                />
                {changeAmount > 0 && (
                  <div className="mt-2 p-2 bg-green-50 rounded">
                    <span className="text-sm font-medium">
                      Change: ${changeAmount.toFixed(2)}
                    </span>
                  </div>
                )}
                {changeAmount < 0 && cashReceived && (
                  <div className="mt-2 p-2 bg-red-50 rounded">
                    <span className="text-sm font-medium text-red-600">
                      Insufficient amount
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowPaymentDialog(false)}
                disabled={isProcessingPayment}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={processPayment}
                disabled={
                  isProcessingPayment ||
                  (paymentMethod === 'cash' && changeAmount < 0)
                }
              >
                {isProcessingPayment ? (
                  <>
                    <Calculator className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Receipt className="h-4 w-4 mr-2" />
                    Complete Sale
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}