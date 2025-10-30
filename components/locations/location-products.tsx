'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Search, Package, DollarSign, Clock, Eye, EyeOff } from 'lucide-react';
import { Location } from './location-dashboard';

interface LocationProduct {
  id: string;
  locationId: string;
  productId: string;
  locationName?: string;
  locationPrice?: number;
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'OUT_OF_STOCK';
  category?: string;
  prepTime?: number;
  dailyLimit?: number;
  currentStock?: number;
  sortOrder: number;
  isVisible: boolean;
  product?: any;
}

interface LocationProductsProps {
  location: Location;
  onBack: () => void;
}

export function LocationProducts({ location, onBack }: LocationProductsProps) {
  const [products, setProducts] = useState<LocationProduct[]>([]);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [showAddProduct, setShowAddProduct] = useState(false);

  const fetchLocationProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (categoryFilter) params.append('category', categoryFilter);

      const response = await fetch(`/api/locations/${location.id}/products?${params}`);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to fetch location products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableProducts = async () => {
    try {
      const response = await fetch('/api/product');
      const data = await response.json();
      setAvailableProducts(data.products || []);
    } catch (error) {
      console.error('Failed to fetch available products:', error);
    }
  };

  useEffect(() => {
    fetchLocationProducts();
    fetchAvailableProducts();
  }, [location.id, statusFilter, categoryFilter]);

  const filteredProducts = products.filter(product => {
    const name = product.locationName || product.product?.name || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'UNAVAILABLE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'OUT_OF_STOCK':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleStatusChange = async (productId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/locations/${location.id}/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchLocationProducts();
      }
    } catch (error) {
      console.error('Failed to update product status:', error);
    }
  };

  const handleVisibilityToggle = async (productId: string, isVisible: boolean) => {
    try {
      const response = await fetch(`/api/locations/${location.id}/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isVisible }),
      });

      if (response.ok) {
        await fetchLocationProducts();
      }
    } catch (error) {
      console.error('Failed to update product visibility:', error);
    }
  };

  const handleAddProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/locations/${location.id}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          productId,
          status: 'AVAILABLE',
          isVisible: true
        }),
      });

      if (response.ok) {
        await fetchLocationProducts();
        setShowAddProduct(false);
      }
    } catch (error) {
      console.error('Failed to add product to location:', error);
    }
  };

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
  const existingProductIds = new Set(products.map(p => p.productId));
  const newAvailableProducts = availableProducts.filter(p => !existingProductIds.has(p.id));

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Locations
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {location.name} - Menu Management
          </h1>
          <p className="text-gray-600">
            Manage products available at this location
          </p>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
                <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category!}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={() => setShowAddProduct(!showAddProduct)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Product Section */}
      {showAddProduct && (
        <Card>
          <CardHeader>
            <CardTitle>Add Products to Location</CardTitle>
            <CardDescription>
              Select products to make available at this location
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {newAvailableProducts.map((product) => (
                <Card key={product.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-gray-600">${product.price}</p>
                      <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddProduct(product.id)}
                    >
                      Add
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
            {newAvailableProducts.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                All available products are already added to this location
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {product.locationName || product.product?.name}
                  </CardTitle>
                  <CardDescription>
                    {product.category || 'General'}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(product.status)}>
                  {product.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Price and Stock */}
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-medium">
                    ${(product.locationPrice || product.product?.price || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span>Stock: {product.currentStock || product.product?.stock || 0}</span>
                </div>
              </div>

              {/* Prep Time */}
              {product.prepTime && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{product.prepTime} min prep</span>
                </div>
              )}

              {/* Daily Limit */}
              {product.dailyLimit && (
                <div className="text-sm text-gray-600">
                  Daily limit: {product.dailyLimit}
                </div>
              )}

              {/* Controls */}
              <div className="flex gap-2">
                <Select
                  value={product.status}
                  onValueChange={(value) => handleStatusChange(product.id, value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Available</SelectItem>
                    <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
                    <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleVisibilityToggle(product.id, !product.isVisible)}
                >
                  {product.isVisible ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && !loading && (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="text-6xl">📋</div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">No products found</h3>
              <p className="text-gray-600 mt-1">
                {searchTerm || statusFilter || categoryFilter
                  ? 'Try adjusting your filters'
                  : 'Add products to this location to get started'
                }
              </p>
            </div>
            {!searchTerm && !statusFilter && !categoryFilter && (
              <Button onClick={() => setShowAddProduct(true)} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add First Product
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}