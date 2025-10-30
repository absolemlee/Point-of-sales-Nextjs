'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  User, 
  Clock, 
  ShoppingCart, 
  CreditCard, 
  Receipt, 
  Settings,
  Search,
  Plus,
  Minus,
  Trash2,
  Users
} from 'lucide-react';
import { toast } from 'react-toastify';

interface Location {
  id: string;
  name: string;
  type: 'STATIC' | 'POPUP' | 'VENUE_PARTNERSHIP';
  status: 'ACTIVE' | 'INACTIVE';
  address: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
  locationStock?: { [locationId: string]: number };
  locationPrice?: { [locationId: string]: number };
}

interface CartItem {
  product: Product;
  quantity: number;
  locationPrice: number;
}

interface Staff {
  id: string;
  name: string;
  role: string;
  locationAccess: string[];
}

export function LocationBasedPOS() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [taxRate, setTaxRate] = useState(0.1); // 10% default tax
  const [transactionId, setTransactionId] = useState<string | null>(null);

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Load locations
    setLocations([
      {
        id: 'loc-1',
        name: 'Downtown Coffee Shop',
        type: 'STATIC',
        status: 'ACTIVE',
        address: '123 Main St, Downtown'
      },
      {
        id: 'loc-2', 
        name: 'Mall Kiosk',
        type: 'POPUP',
        status: 'ACTIVE',
        address: 'Central Mall, Level 2'
      },
      {
        id: 'loc-3',
        name: 'University Partnership',
        type: 'VENUE_PARTNERSHIP',
        status: 'ACTIVE',
        address: 'State University Campus'
      }
    ]);

    // Set current staff
    setCurrentStaff({
      id: 'staff-1',
      name: 'John Smith',
      role: 'Cashier',
      locationAccess: ['loc-1', 'loc-2']
    });

    // Load products with location-specific data
    setProducts([
      {
        id: 'prod-1',
        name: 'Espresso',
        price: 3.50,
        stock: 100,
        category: 'Coffee',
        locationStock: { 'loc-1': 50, 'loc-2': 30, 'loc-3': 20 },
        locationPrice: { 'loc-1': 3.50, 'loc-2': 3.75, 'loc-3': 3.25 }
      },
      {
        id: 'prod-2', 
        name: 'Cappuccino',
        price: 4.00,
        stock: 80,
        category: 'Coffee',
        locationStock: { 'loc-1': 40, 'loc-2': 25, 'loc-3': 15 },
        locationPrice: { 'loc-1': 4.00, 'loc-2': 4.25, 'loc-3': 3.75 }
      },
      {
        id: 'prod-3',
        name: 'Croissant',
        price: 2.50,
        stock: 30,
        category: 'Pastry',
        locationStock: { 'loc-1': 15, 'loc-2': 10, 'loc-3': 5 },
        locationPrice: { 'loc-1': 2.50, 'loc-2': 2.75, 'loc-3': 2.25 }
      }
    ]);

    // Generate transaction ID
    setTransactionId(`TXN-${Date.now()}`);
  }, []);

  const getLocationStock = (product: Product, locationId: string): number => {
    return product.locationStock?.[locationId] || 0;
  };

  const getLocationPrice = (product: Product, locationId: string): number => {
    return product.locationPrice?.[locationId] || product.price;
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const hasStock = selectedLocation ? getLocationStock(product, selectedLocation.id) > 0 : true;
    return matchesSearch && matchesCategory && hasStock;
  });

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  const addToCart = (product: Product) => {
    if (!selectedLocation) {
      toast.error('Please select a location first');
      return;
    }

    const locationStock = getLocationStock(product, selectedLocation.id);
    const locationPrice = getLocationPrice(product, selectedLocation.id);
    
    if (locationStock <= 0) {
      toast.error('Product out of stock at this location');
      return;
    }

    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= locationStock) {
        toast.error('Not enough stock available');
        return;
      }
      setCart(cart.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { 
        product, 
        quantity: 1, 
        locationPrice 
      }]);
    }
  };

  const updateCartQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.product.id !== productId));
      return;
    }

    const cartItem = cart.find(item => item.product.id === productId);
    if (!cartItem || !selectedLocation) return;

    const locationStock = getLocationStock(cartItem.product, selectedLocation.id);
    
    if (newQuantity > locationStock) {
      toast.error('Not enough stock available');
      return;
    }

    setCart(cart.map(item => 
      item.product.id === productId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.locationPrice * item.quantity), 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const processPayment = async (paymentMethod: 'cash' | 'card') => {
    if (!selectedLocation || cart.length === 0) {
      toast.error('Cannot process payment - missing location or empty cart');
      return;
    }

    setIsProcessingPayment(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would integrate with actual payment processing and inventory updates
      toast.success(`Payment processed successfully via ${paymentMethod}`);
      
      // Clear cart and generate new transaction ID
      clearCart();
      setTransactionId(`TXN-${Date.now()}`);
      
    } catch (error) {
      toast.error('Payment processing failed');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Location Info & Product Selection */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Location & Staff Header */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <Select
                      value={selectedLocation?.id || ''}
                      onValueChange={(value) => {
                        const location = locations.find(l => l.id === value);
                        setSelectedLocation(location || null);
                        clearCart(); // Clear cart when switching locations
                      }}
                    >
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Select Location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations
                          .filter(location => currentStaff?.locationAccess.includes(location.id))
                          .map(location => (
                            <SelectItem key={location.id} value={location.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{location.name}</span>
                                <span className="text-sm text-gray-500">{location.address}</span>
                              </div>
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedLocation && (
                    <Badge variant={selectedLocation.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {selectedLocation.status}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">{currentStaff?.name}</span>
                  <Badge variant="outline">{currentStaff?.role}</Badge>
                </div>
              </div>
              
              {selectedLocation && (
                <div className="text-sm text-gray-600 mt-2">
                  <div className="flex items-center space-x-4">
                    <span>{selectedLocation.address}</span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{new Date().toLocaleTimeString()}</span>
                    </span>
                  </div>
                </div>
              )}
            </CardHeader>
          </Card>

          {/* Product Search & Categories */}
          {selectedLocation && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle>Products</CardTitle>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredProducts.map(product => {
                    const locationStock = getLocationStock(product, selectedLocation.id);
                    const locationPrice = getLocationPrice(product, selectedLocation.id);
                    
                    return (
                      <Card 
                        key={product.id} 
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => addToCart(product)}
                      >
                        <CardContent className="p-4">
                          <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                            <div className="text-4xl">☕</div>
                          </div>
                          <h3 className="font-medium text-sm mb-1">{product.name}</h3>
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-green-600">
                              ${locationPrice.toFixed(2)}
                            </span>
                            <Badge variant={locationStock > 10 ? 'default' : 'destructive'} className="text-xs">
                              {locationStock} left
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Cart & Checkout */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <ShoppingCart className="h-5 w-5" />
                  <span>Cart</span>
                </span>
                {cart.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardTitle>
              {transactionId && (
                <div className="text-sm text-gray-500">
                  Transaction: {transactionId}
                </div>
              )}
            </CardHeader>
            
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Cart is empty</p>
                  <p className="text-sm">Add products to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.product.id} className="flex items-center justify-between py-2 border-b">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.product.name}</h4>
                        <p className="text-sm text-gray-500">
                          ${item.locationPrice.toFixed(2)} each
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        
                        <Button
                          variant="outline"
                          size="sm" 
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.product.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="text-right ml-4">
                        <span className="font-medium">
                          ${(item.locationPrice * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax ({(taxRate * 100).toFixed(0)}%):</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <Button
                      className="w-full"
                      onClick={() => processPayment('card')}
                      disabled={isProcessingPayment}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      {isProcessingPayment ? 'Processing...' : 'Pay by Card'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => processPayment('cash')}
                      disabled={isProcessingPayment}
                    >
                      💵 Pay Cash
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className="w-full"
                      disabled={isProcessingPayment}
                    >
                      <Receipt className="h-4 w-4 mr-2" />
                      Hold Transaction
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Quick Actions */}
          {selectedLocation && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    <Users className="h-4 w-4 mr-1" />
                    Staff
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-1" />
                    Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}