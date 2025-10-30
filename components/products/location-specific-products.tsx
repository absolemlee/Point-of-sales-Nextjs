'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Package, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Upload
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface LocationProduct {
  id: string;
  productId: string;
  locationId: string;
  name: string;
  category: string;
  basePrice: number;
  locationPrice: number;
  baseStock: number;
  locationStock: number;
  minStock: number;
  maxStock: number;
  isAvailable: boolean;
  lastRestocked: string;
  salesVelocity: number; // units per day
  profitMargin: number;
}

interface Location {
  id: string;
  name: string;
  type: string;
  status: string;
}

export function LocationSpecificProductManagement() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [products, setProducts] = useState<LocationProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<LocationProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<LocationProduct | null>(null);

  // Mock data - replace with actual API calls
  useEffect(() => {
    setLocations([
      { id: 'loc-1', name: 'Downtown Coffee Shop', type: 'STATIC', status: 'ACTIVE' },
      { id: 'loc-2', name: 'Mall Kiosk', type: 'POPUP', status: 'ACTIVE' },
      { id: 'loc-3', name: 'University Partnership', type: 'VENUE_PARTNERSHIP', status: 'SCHEDULED' }
    ]);

    setProducts([
      {
        id: 'lp-1', productId: 'prod-1', locationId: 'loc-1', name: 'Espresso',
        category: 'Coffee', basePrice: 3.50, locationPrice: 3.50, baseStock: 100,
        locationStock: 45, minStock: 10, maxStock: 100, isAvailable: true,
        lastRestocked: '2024-10-15', salesVelocity: 15.5, profitMargin: 65.2
      },
      {
        id: 'lp-2', productId: 'prod-1', locationId: 'loc-2', name: 'Espresso',
        category: 'Coffee', basePrice: 3.50, locationPrice: 3.75, baseStock: 100,
        locationStock: 30, minStock: 15, maxStock: 80, isAvailable: true,
        lastRestocked: '2024-10-14', salesVelocity: 12.3, profitMargin: 71.5
      },
      {
        id: 'lp-3', productId: 'prod-2', locationId: 'loc-1', name: 'Cappuccino',
        category: 'Coffee', basePrice: 4.00, locationPrice: 4.00, baseStock: 80,
        locationStock: 35, minStock: 8, maxStock: 80, isAvailable: true,
        lastRestocked: '2024-10-16', salesVelocity: 11.2, profitMargin: 62.8
      },
      {
        id: 'lp-4', productId: 'prod-3', locationId: 'loc-1', name: 'Croissant',
        category: 'Pastry', basePrice: 2.50, locationPrice: 2.50, baseStock: 30,
        locationStock: 5, minStock: 10, maxStock: 50, isAvailable: true,
        lastRestocked: '2024-10-12', salesVelocity: 8.7, profitMargin: 58.3
      }
    ]);
    
    // Set default location
    setSelectedLocation('loc-1');
  }, []);

  // Filter products based on selected location, search, category, and filter
  useEffect(() => {
    let filtered = products.filter(p => p.locationId === selectedLocation);
    
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    if (selectedFilter !== 'all') {
      switch (selectedFilter) {
        case 'low-stock':
          filtered = filtered.filter(p => p.locationStock <= p.minStock);
          break;
        case 'out-of-stock':
          filtered = filtered.filter(p => p.locationStock === 0);
          break;
        case 'price-difference':
          filtered = filtered.filter(p => p.locationPrice !== p.basePrice);
          break;
        case 'unavailable':
          filtered = filtered.filter(p => !p.isAvailable);
          break;
      }
    }
    
    setFilteredProducts(filtered);
  }, [products, selectedLocation, searchTerm, selectedCategory, selectedFilter]);

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];
  const selectedLocationName = locations.find(l => l.id === selectedLocation)?.name || 'Select Location';

  const getStockStatus = (product: LocationProduct) => {
    if (product.locationStock === 0) return { status: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (product.locationStock <= product.minStock) return { status: 'Low Stock', color: 'bg-orange-100 text-orange-800' };
    if (product.locationStock >= product.maxStock * 0.8) return { status: 'Well Stocked', color: 'bg-green-100 text-green-800' };
    return { status: 'Normal', color: 'bg-gray-100 text-gray-800' };
  };

  const handleUpdateProduct = (productId: string, updates: Partial<LocationProduct>) => {
    setProducts(products.map(p => 
      p.id === productId ? { ...p, ...updates } : p
    ));
  };

  const handleAddProduct = (newProduct: Partial<LocationProduct>) => {
    const product: LocationProduct = {
      id: `lp-${Date.now()}`,
      productId: `prod-${Date.now()}`,
      locationId: selectedLocation,
      ...newProduct
    } as LocationProduct;
    
    setProducts([...products, product]);
    setIsAddProductOpen(false);
  };

  const ProductEditDialog = ({ product, isOpen, onClose }: { 
    product: LocationProduct | null, 
    isOpen: boolean, 
    onClose: () => void 
  }) => {
    const [formData, setFormData] = useState<Partial<LocationProduct>>({});

    useEffect(() => {
      if (product) {
        setFormData(product);
      }
    }, [product]);

    const handleSave = () => {
      if (product && formData) {
        handleUpdateProduct(product.id, formData);
        onClose();
      }
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {product ? `Edit ${product.name}` : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category || ''}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="locationPrice">Location Price ($)</Label>
              <Input
                id="locationPrice"
                type="number"
                step="0.01"
                value={formData.locationPrice || ''}
                onChange={(e) => setFormData({...formData, locationPrice: parseFloat(e.target.value)})}
              />
            </div>
            
            <div>
              <Label htmlFor="locationStock">Current Stock</Label>
              <Input
                id="locationStock"
                type="number"
                value={formData.locationStock || ''}
                onChange={(e) => setFormData({...formData, locationStock: parseInt(e.target.value)})}
              />
            </div>
            
            <div>
              <Label htmlFor="minStock">Minimum Stock</Label>
              <Input
                id="minStock"
                type="number"
                value={formData.minStock || ''}
                onChange={(e) => setFormData({...formData, minStock: parseInt(e.target.value)})}
              />
            </div>
            
            <div>
              <Label htmlFor="maxStock">Maximum Stock</Label>
              <Input
                id="maxStock"
                type="number"
                value={formData.maxStock || ''}
                onChange={(e) => setFormData({...formData, maxStock: parseInt(e.target.value)})}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Location Product Management</h1>
            <p className="text-gray-600 mt-1">Manage inventory, pricing, and availability by location</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button onClick={() => setIsAddProductOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Location Selector & Summary */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Location Overview</CardTitle>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-blue-600" />
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(location => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredProducts.length}
                </div>
                <div className="text-sm text-gray-600">Total Products</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {filteredProducts.filter(p => p.locationStock <= p.minStock).length}
                </div>
                <div className="text-sm text-gray-600">Low Stock Items</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {filteredProducts.filter(p => p.locationStock === 0).length}
                </div>
                <div className="text-sm text-gray-600">Out of Stock</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {filteredProducts.filter(p => p.locationPrice !== p.basePrice).length}
                </div>
                <div className="text-sm text-gray-600">Custom Pricing</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters & Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
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
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                  <SelectItem value="price-difference">Custom Pricing</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Products for {selectedLocationName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Product</th>
                    <th className="text-left py-3 px-4">Category</th>
                    <th className="text-left py-3 px-4">Stock Status</th>
                    <th className="text-left py-3 px-4">Current Stock</th>
                    <th className="text-left py-3 px-4">Base Price</th>
                    <th className="text-left py-3 px-4">Location Price</th>
                    <th className="text-left py-3 px-4">Sales Velocity</th>
                    <th className="text-left py-3 px-4">Profit Margin</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product);
                    const priceDifference = product.locationPrice !== product.basePrice;
                    
                    return (
                      <tr key={product.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-500">
                              Last restocked: {product.lastRestocked}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary">{product.category}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={stockStatus.color}>
                            {stockStatus.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-center">
                            <div className="font-bold">{product.locationStock}</div>
                            <div className="text-xs text-gray-500">
                              Min: {product.minStock} | Max: {product.maxStock}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">${product.basePrice.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <div className={priceDifference ? 'text-blue-600 font-medium' : ''}>
                            ${product.locationPrice.toFixed(2)}
                            {priceDifference && (
                              <div className="text-xs text-blue-500">
                                {product.locationPrice > product.basePrice ? '+' : ''}
                                {((product.locationPrice - product.basePrice) / product.basePrice * 100).toFixed(1)}%
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-center">
                            <div className="font-medium">{product.salesVelocity?.toFixed(1) || 'N/A'}</div>
                            <div className="text-xs text-gray-500">units/day</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-center">
                            <div className="font-medium text-green-600">
                              {product.profitMargin?.toFixed(1) || 'N/A'}%
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingProduct(product)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No products found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Product Dialog */}
        <ProductEditDialog
          product={editingProduct}
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
        />
        
        {/* Add Product Dialog */}
        <ProductEditDialog
          product={null}
          isOpen={isAddProductOpen}
          onClose={() => setIsAddProductOpen(false)}
        />
      </div>
    </div>
  );
}