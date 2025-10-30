'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Minus, 
  ShoppingCart, 
  DollarSign, 
  Clock,
  Star,
  Heart,
  Info,
  ArrowLeft,
  CreditCard,
  Smartphone,
  Banknote,
  Check
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image?: string;
  available: boolean;
  preparationTime?: number;
  allergens?: string[];
  nutritionInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  customizations?: {
    id: string;
    name: string;
    options: {
      id: string;
      name: string;
      price: number;
    }[];
  }[];
}

interface CartItem {
  product: Product;
  quantity: number;
  customizations: { [key: string]: string };
  specialInstructions?: string;
  totalPrice: number;
}

interface CustomerOrderingProps {
  locationId: string;
  mode?: 'kiosk' | 'mobile' | 'tablet';
}

export function CustomerOrderingInterface({ locationId, mode = 'kiosk' }: CustomerOrderingProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('popular');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCustomization, setShowCustomization] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orderProgress, setOrderProgress] = useState<'ordering' | 'payment' | 'confirmed'>('ordering');

  const categories = [
    { id: 'popular', name: 'Popular', icon: '🔥' },
    { id: 'beverages', name: 'Beverages', icon: '☕' },
    { id: 'food', name: 'Food', icon: '🍽️' },
    { id: 'desserts', name: 'Desserts', icon: '🍰' },
    { id: 'sides', name: 'Sides', icon: '🍟' },
  ];

  useEffect(() => {
    fetchProducts();
  }, [locationId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/locations/${locationId}/products`);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product, customizations: { [key: string]: string } = {}, specialInstructions?: string) => {
    const customizationPrice = Object.values(customizations).reduce((total, optionId) => {
      // Calculate additional price from customizations
      const customization = product.customizations?.find(c => 
        c.options.some(o => o.id === optionId)
      );
      const option = customization?.options.find(o => o.id === optionId);
      return total + (option?.price || 0);
    }, 0);

    const totalPrice = product.price + customizationPrice;

    const existingItemIndex = cart.findIndex(item => 
      item.product.id === product.id && 
      JSON.stringify(item.customizations) === JSON.stringify(customizations)
    );

    if (existingItemIndex >= 0) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += 1;
      updatedCart[existingItemIndex].totalPrice += totalPrice;
      setCart(updatedCart);
    } else {
      setCart([...cart, {
        product,
        quantity: 1,
        customizations,
        specialInstructions,
        totalPrice
      }]);
    }

    setShowCustomization(false);
    setSelectedProduct(null);
  };

  const removeFromCart = (index: number) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
  };

  const updateQuantity = (index: number, change: number) => {
    const updatedCart = [...cart];
    const item = updatedCart[index];
    const newQuantity = item.quantity + change;
    
    if (newQuantity <= 0) {
      removeFromCart(index);
    } else {
      const unitPrice = item.totalPrice / item.quantity;
      item.quantity = newQuantity;
      item.totalPrice = unitPrice * newQuantity;
      setCart(updatedCart);
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.totalPrice, 0);
  };

  const filteredProducts = products.filter(product => 
    selectedCategory === 'popular' ? product.available : 
    product.category.toLowerCase() === selectedCategory && product.available
  );

  const handleProductSelect = (product: Product) => {
    if (product.customizations && product.customizations.length > 0) {
      setSelectedProduct(product);
      setShowCustomization(true);
    } else {
      addToCart(product);
    }
  };

  const CustomizationDialog = () => {
    const [customizations, setCustomizations] = useState<{ [key: string]: string }>({});
    const [specialInstructions, setSpecialInstructions] = useState('');

    if (!selectedProduct) return null;

    return (
      <Dialog open={showCustomization} onOpenChange={setShowCustomization}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowLeft 
                className="h-5 w-5 cursor-pointer" 
                onClick={() => setShowCustomization(false)}
              />
              Customize {selectedProduct.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold">${selectedProduct.price.toFixed(2)}</div>
              {selectedProduct.preparationTime && (
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Clock className="h-4 w-4" />
                  {selectedProduct.preparationTime} min
                </div>
              )}
            </div>

            {selectedProduct.customizations?.map((customization) => (
              <div key={customization.id} className="space-y-2">
                <h4 className="font-medium">{customization.name}</h4>
                <div className="grid grid-cols-1 gap-2">
                  {customization.options.map((option) => (
                    <Button
                      key={option.id}
                      variant={customizations[customization.id] === option.id ? "default" : "outline"}
                      className="justify-between"
                      onClick={() => setCustomizations({
                        ...customizations,
                        [customization.id]: option.id
                      })}
                    >
                      <span>{option.name}</span>
                      {option.price > 0 && <span>+${option.price.toFixed(2)}</span>}
                    </Button>
                  ))}
                </div>
              </div>
            ))}

            <div className="space-y-2">
              <label className="text-sm font-medium">Special Instructions</label>
              <Textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any special requests..."
                className="min-h-[80px]"
              />
            </div>

            <Button 
              className="w-full" 
              size="lg"
              onClick={() => addToCart(selectedProduct, customizations, specialInstructions)}
            >
              Add to Order - ${(selectedProduct.price + 
                Object.values(customizations).reduce((total, optionId) => {
                  const option = selectedProduct.customizations
                    ?.flatMap(c => c.options)
                    .find(o => o.id === optionId);
                  return total + (option?.price || 0);
                }, 0)
              ).toFixed(2)}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const CartDialog = () => (
    <Dialog open={showCart} onOpenChange={setShowCart}>
      <DialogContent className="max-w-md mx-auto max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeft 
              className="h-5 w-5 cursor-pointer" 
              onClick={() => setShowCart(false)}
            />
            Your Order ({cart.length} items)
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-96">
          <div className="space-y-4">
            {cart.map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{item.product.name}</div>
                  <div className="text-sm text-muted-foreground">
                    ${(item.totalPrice / item.quantity).toFixed(2)} each
                  </div>
                  {Object.keys(item.customizations).length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Customizations applied
                    </div>
                  )}
                  {item.specialInstructions && (
                    <div className="text-xs text-muted-foreground italic">
                      "{item.specialInstructions}"
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateQuantity(index, -1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateQuantity(index, 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="text-right">
                  <div className="font-medium">${item.totalPrice.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {cart.length > 0 && (
          <div className="space-y-4">
            <Separator />
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total:</span>
              <span>${getTotalPrice().toFixed(2)}</span>
            </div>
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => {
                setShowCart(false);
                setShowPayment(true);
              }}
            >
              Proceed to Payment
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  const PaymentDialog = () => (
    <Dialog open={showPayment} onOpenChange={setShowPayment}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeft 
              className="h-5 w-5 cursor-pointer" 
              onClick={() => setShowPayment(false)}
            />
            Payment
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-3xl font-bold">${getTotalPrice().toFixed(2)}</div>
            <div className="text-muted-foreground">{cart.length} items</div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Button className="h-16 text-lg" variant="outline">
              <CreditCard className="h-6 w-6 mr-3" />
              Credit/Debit Card
            </Button>
            <Button className="h-16 text-lg" variant="outline">
              <Smartphone className="h-6 w-6 mr-3" />
              Mobile Payment
            </Button>
            <Button className="h-16 text-lg" variant="outline">
              <Banknote className="h-6 w-6 mr-3" />
              Cash
            </Button>
          </div>

          <Button 
            className="w-full" 
            size="lg"
            onClick={() => {
              setOrderProgress('confirmed');
              setShowPayment(false);
              // Process order here
            }}
          >
            <Check className="h-5 w-5 mr-2" />
            Confirm Order
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <ShoppingCart className="h-12 w-12 animate-pulse mx-auto mb-4" />
          <p>Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col ${mode === 'kiosk' ? 'max-w-4xl mx-auto' : ''}`}>
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Order Here</h1>
            <p className="text-primary-foreground/80">Touch to start your order</p>
          </div>
          <Button
            variant="secondary"
            onClick={() => setShowCart(true)}
            className="relative"
          >
            <ShoppingCart className="h-6 w-6" />
            {cart.length > 0 && (
              <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0">
                {cart.length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Categories */}
      <div className="border-b bg-background">
        <ScrollArea className="w-full">
          <div className="flex gap-2 p-4">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="flex-shrink-0"
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
          {filteredProducts.map((product) => (
            <Card 
              key={product.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleProductSelect(product)}
            >
              <CardContent className="p-4">
                <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-4xl">{
                      product.category === 'beverages' ? '☕' :
                      product.category === 'food' ? '🍽️' :
                      product.category === 'desserts' ? '🍰' : '🍽️'
                    }</div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium text-sm leading-tight">{product.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-lg">${product.price.toFixed(2)}</div>
                    {product.preparationTime && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {product.preparationTime}m
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <div className="border-t bg-background p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{cart.length} items in cart</div>
              <div className="text-sm text-muted-foreground">
                Total: ${getTotalPrice().toFixed(2)}
              </div>
            </div>
            <Button onClick={() => setShowCart(true)}>
              Review Order
            </Button>
          </div>
        </div>
      )}

      <CustomizationDialog />
      <CartDialog />
      <PaymentDialog />
    </div>
  );
}