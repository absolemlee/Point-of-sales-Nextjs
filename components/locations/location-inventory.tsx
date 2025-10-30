'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Search, Package, AlertTriangle, Beaker, Leaf } from 'lucide-react';
import { Location } from './location-dashboard';
import { Progress } from '@/components/ui/progress';

interface LocationInventory {
  id: string;
  locationId: string;
  productId: string;
  allocatedQuantity: number;
  currentQuantity: number;
  usageType: 'INGREDIENT' | 'MIXER' | 'RETAIL' | 'SUPPLY';
  unitType: string;
  costPerUnit?: number;
  sellingPrice?: number;
  strainType?: string;
  potency?: string;
  expirationDate?: string;
  notes?: string;
  product?: any;
}

interface LocationInventoryProps {
  location: Location;
  onBack: () => void;
}

export function LocationInventory({ location, onBack }: LocationInventoryProps) {
  const [inventory, setInventory] = useState<LocationInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [usageFilter, setUsageFilter] = useState<string>('');
  const [strainFilter, setStrainFilter] = useState<string>('');
  const [showLowStock, setShowLowStock] = useState(false);

  const fetchInventory = async () => {
    try {
      const params = new URLSearchParams();
      if (usageFilter) params.append('usageType', usageFilter);
      if (strainFilter) params.append('strainType', strainFilter);
      if (showLowStock) params.append('lowStock', 'true');

      const response = await fetch(`/api/locations/${location.id}/inventory?${params}`);
      const data = await response.json();
      setInventory(data.inventory || []);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [location.id, usageFilter, strainFilter, showLowStock]);

  const filteredInventory = inventory.filter(item => {
    const productName = item.product?.name || '';
    const strainType = item.strainType || '';
    const searchText = `${productName} ${strainType}`.toLowerCase();
    return searchText.includes(searchTerm.toLowerCase());
  });

  const getUsageTypeColor = (usageType: string) => {
    switch (usageType) {
      case 'INGREDIENT':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'MIXER':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'RETAIL':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'SUPPLY':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUsageTypeIcon = (usageType: string) => {
    switch (usageType) {
      case 'INGREDIENT':
        return <Leaf className="h-4 w-4" />;
      case 'MIXER':
        return <Beaker className="h-4 w-4" />;
      case 'RETAIL':
        return <Package className="h-4 w-4" />;
      case 'SUPPLY':
        return <Package className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStockLevel = (current: number, allocated: number) => {
    const percentage = (current / allocated) * 100;
    return Math.min(100, Math.max(0, percentage));
  };

  const getStockColor = (percentage: number) => {
    if (percentage <= 20) return 'text-red-600';
    if (percentage <= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const strainTypes = Array.from(new Set(inventory.map(item => item.strainType).filter(Boolean)));
  const usageTypes = Array.from(new Set(inventory.map(item => item.usageType)));

  const getLocationTypeInventoryTips = () => {
    switch (location.type) {
      case 'STATIC':
        return {
          title: 'Static Location Inventory',
          tips: [
            'Focus on raw ingredients: Kava root powder, Kratom powders',
            'Stock natural mixers and supplements for custom blends',
            'Maintain higher quantities for consistent service',
            'Track strain varieties and potency levels'
          ]
        };
      case 'POPUP':
        return {
          title: 'Pop-up Event Inventory',
          tips: [
            'Prioritize ready-to-serve products: Leilo cans, pre-made drinks',
            'Limited space - focus on high-turnover items',
            'Include retail products for additional revenue',
            'Plan quantities based on expected attendance'
          ]
        };
      case 'VENUE_PARTNERSHIP':
        return {
          title: 'Venue Partnership Inventory',
          tips: [
            'Coordinate with venue requirements and restrictions',
            'Balance pre-made and customizable options',
            'Consider venue\'s target audience preferences',
            'Flexible inventory based on partnership terms'
          ]
        };
      default:
        return { title: 'Location Inventory', tips: [] };
    }
  };

  const inventoryTips = getLocationTypeInventoryTips();

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
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
            {location.name} - Inventory Management
          </h1>
          <p className="text-gray-600">
            Manage allocated inventory for this {location.type.toLowerCase().replace('_', ' ')} location
          </p>
        </div>
      </div>

      {/* Location Type Specific Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">{inventoryTips.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-blue-700 space-y-1">
            {inventoryTips.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{inventory.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingredients</p>
                <p className="text-2xl font-bold text-green-600">
                  {inventory.filter(item => item.usageType === 'INGREDIENT').length}
                </p>
              </div>
              <Leaf className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-red-600">
                  {inventory.filter(item => getStockLevel(item.currentQuantity, item.allocatedQuantity) <= 20).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Strains</p>
                <p className="text-2xl font-bold text-purple-600">{strainTypes.length}</p>
              </div>
              <Beaker className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search inventory..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={usageFilter} onValueChange={setUsageFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by usage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Usage Types</SelectItem>
                <SelectItem value="INGREDIENT">Ingredients</SelectItem>
                <SelectItem value="MIXER">Mixers</SelectItem>
                <SelectItem value="RETAIL">Retail</SelectItem>
                <SelectItem value="SUPPLY">Supplies</SelectItem>
              </SelectContent>
            </Select>

            {strainTypes.length > 0 && (
              <Select value={strainFilter} onValueChange={setStrainFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by strain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Strains</SelectItem>
                  {strainTypes.map(strain => (
                    <SelectItem key={strain} value={strain!}>
                      {strain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Button
              variant={showLowStock ? "default" : "outline"}
              onClick={() => setShowLowStock(!showLowStock)}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Low Stock
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInventory.map((item) => {
          const stockPercentage = getStockLevel(item.currentQuantity, item.allocatedQuantity);
          const isLowStock = stockPercentage <= 20;
          
          return (
            <Card key={item.id} className={`hover:shadow-lg transition-shadow ${isLowStock ? 'border-red-200 bg-red-50' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getUsageTypeIcon(item.usageType)}
                      {item.product?.name}
                    </CardTitle>
                    <CardDescription>
                      {item.strainType && (
                        <span className="font-medium text-purple-600">{item.strainType} strain</span>
                      )}
                    </CardDescription>
                  </div>
                  <Badge className={getUsageTypeColor(item.usageType)}>
                    {item.usageType}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Stock Level */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Stock Level</span>
                    <span className={getStockColor(stockPercentage)}>
                      {item.currentQuantity}/{item.allocatedQuantity} {item.unitType}
                    </span>
                  </div>
                  <Progress value={stockPercentage} className="h-2" />
                  {isLowStock && (
                    <div className="flex items-center gap-1 text-red-600 text-sm">
                      <AlertTriangle className="h-3 w-3" />
                      Low stock alert
                    </div>
                  )}
                </div>

                {/* Potency & Details */}
                {item.potency && (
                  <div className="text-sm">
                    <span className="font-medium">Potency:</span> {item.potency}
                  </div>
                )}

                {/* Pricing */}
                <div className="flex justify-between text-sm">
                  {item.costPerUnit && (
                    <div>
                      <span className="text-gray-600">Cost:</span> ${item.costPerUnit.toFixed(2)}/{item.unitType}
                    </div>
                  )}
                  {item.sellingPrice && (
                    <div>
                      <span className="text-gray-600">Sell:</span> ${item.sellingPrice.toFixed(2)}
                    </div>
                  )}
                </div>

                {/* Expiration */}
                {item.expirationDate && (
                  <div className="text-sm text-gray-600">
                    Expires: {new Date(item.expirationDate).toLocaleDateString()}
                  </div>
                )}

                {/* Notes */}
                {item.notes && (
                  <div className="text-sm text-gray-600 italic">
                    {item.notes}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Restock
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Adjust
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredInventory.length === 0 && !loading && (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="text-6xl">📦</div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">No inventory found</h3>
              <p className="text-gray-600 mt-1">
                {searchTerm || usageFilter || strainFilter
                  ? 'Try adjusting your filters'
                  : 'Allocate inventory to this location to get started'
                }
              </p>
            </div>
            {!searchTerm && !usageFilter && !strainFilter && (
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Allocate Inventory
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}