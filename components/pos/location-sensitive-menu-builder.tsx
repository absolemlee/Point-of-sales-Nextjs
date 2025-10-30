'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  ChefHat, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  DollarSign,
  Package,
  Coffee,
  Utensils,
  ShoppingBag,
  Monitor,
  Save,
  Copy,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react';

interface LocationType {
  id: string;
  name: string;
  icon: React.ReactNode;
  categories: string[];
  typical_items: string[];
  preparation_focus: 'speed' | 'quality' | 'customization';
}

interface MenuCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  applicable_locations: string[];
  time_restrictions?: {
    breakfast?: { start: string; end: string };
    lunch?: { start: string; end: string };
    dinner?: { start: string; end: string };
  };
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  base_price: number;
  location_pricing: { [key: string]: number };
  preparation_time: number;
  applicable_locations: string[];
  allergens: string[];
  modifiers: MenuModifier[];
  availability: {
    [key: string]: {
      enabled: boolean;
      stock_level?: number;
      time_restrictions?: string[];
    };
  };
  customizable: boolean;
  popularity_score: number;
}

interface MenuModifier {
  id: string;
  name: string;
  price_adjustment: number;
  category: 'size' | 'extra' | 'substitute' | 'remove';
  applicable_items: string[];
}

export function LocationSensitiveMenuBuilder() {
  const [selectedLocationType, setSelectedLocationType] = useState<string>('cafe');
  const [currentMenu, setCurrentMenu] = useState<MenuItem[]>([]);
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [menuPreview, setMenuPreview] = useState<string>('current');

  const locationTypes: LocationType[] = [
    {
      id: 'cafe',
      name: 'Café',
      icon: <Coffee className="h-4 w-4" />,
      categories: ['Coffee', 'Tea', 'Pastries', 'Light Meals'],
      typical_items: ['Espresso', 'Latte', 'Croissant', 'Sandwich'],
      preparation_focus: 'speed'
    },
    {
      id: 'restaurant',
      name: 'Restaurant',
      icon: <Utensils className="h-4 w-4" />,
      categories: ['Appetizers', 'Main Courses', 'Desserts', 'Beverages'],
      typical_items: ['Salad', 'Pasta', 'Steak', 'Wine'],
      preparation_focus: 'quality'
    },
    {
      id: 'quick_service',
      name: 'Quick Service',
      icon: <ShoppingBag className="h-4 w-4" />,
      categories: ['Fast Food', 'Sides', 'Drinks', 'Combos'],
      typical_items: ['Burger', 'Fries', 'Soda', 'Wrap'],
      preparation_focus: 'speed'
    },
    {
      id: 'kiosk',
      name: 'Kiosk',
      icon: <Monitor className="h-4 w-4" />,
      categories: ['Grab & Go', 'Snacks', 'Beverages'],
      typical_items: ['Energy Bar', 'Chips', 'Water', 'Coffee'],
      preparation_focus: 'speed'
    }
  ];

  const menuCategories: MenuCategory[] = [
    {
      id: 'coffee',
      name: 'Coffee & Espresso',
      icon: <Coffee className="h-4 w-4" />,
      applicable_locations: ['cafe', 'restaurant', 'kiosk'],
      time_restrictions: {
        breakfast: { start: '06:00', end: '11:00' },
        lunch: { start: '11:00', end: '16:00' }
      }
    },
    {
      id: 'food',
      name: 'Food Items',
      icon: <Utensils className="h-4 w-4" />,
      applicable_locations: ['cafe', 'restaurant', 'quick_service']
    },
    {
      id: 'beverages',
      name: 'Cold Beverages',
      icon: <Package className="h-4 w-4" />,
      applicable_locations: ['cafe', 'restaurant', 'quick_service', 'kiosk']
    }
  ];

  const mockMenuItems: MenuItem[] = [
    {
      id: 'item-1',
      name: 'Americano',
      description: 'Rich espresso with hot water',
      category: 'coffee',
      base_price: 3.50,
      location_pricing: {
        'cafe': 3.50,
        'restaurant': 4.00,
        'kiosk': 3.25
      },
      preparation_time: 2,
      applicable_locations: ['cafe', 'restaurant', 'kiosk'],
      allergens: [],
      modifiers: [
        { id: 'mod-1', name: 'Extra Shot', price_adjustment: 0.75, category: 'extra', applicable_items: ['item-1'] },
        { id: 'mod-2', name: 'Decaf', price_adjustment: 0, category: 'substitute', applicable_items: ['item-1'] }
      ],
      availability: {
        'cafe': { enabled: true, stock_level: 100 },
        'restaurant': { enabled: true, stock_level: 50 },
        'kiosk': { enabled: true, stock_level: 30 }
      },
      customizable: true,
      popularity_score: 8.5
    },
    {
      id: 'item-2',
      name: 'Grilled Chicken Salad',
      description: 'Fresh mixed greens with grilled chicken breast',
      category: 'food',
      base_price: 12.95,
      location_pricing: {
        'restaurant': 12.95,
        'cafe': 11.50,
        'quick_service': 9.95
      },
      preparation_time: 8,
      applicable_locations: ['restaurant', 'cafe', 'quick_service'],
      allergens: ['nuts'],
      modifiers: [
        { id: 'mod-3', name: 'Extra Chicken', price_adjustment: 3.00, category: 'extra', applicable_items: ['item-2'] },
        { id: 'mod-4', name: 'No Nuts', price_adjustment: 0, category: 'remove', applicable_items: ['item-2'] }
      ],
      availability: {
        'restaurant': { enabled: true, stock_level: 25, time_restrictions: ['lunch', 'dinner'] },
        'cafe': { enabled: true, stock_level: 15, time_restrictions: ['lunch'] },
        'quick_service': { enabled: false, stock_level: 0 }
      },
      customizable: true,
      popularity_score: 7.2
    }
  ];

  useEffect(() => {
    setCurrentMenu(mockMenuItems.filter(item => 
      item.applicable_locations.includes(selectedLocationType)
    ));
  }, [selectedLocationType]);

  const getLocationTypeConfig = (typeId: string) => {
    return locationTypes.find(type => type.id === typeId);
  };

  const ItemDialog = ({ item, onSave, onClose }: { item: MenuItem | null, onSave: (item: MenuItem) => void, onClose: () => void }) => {
    const [formData, setFormData] = useState<Partial<MenuItem>>(
      item || {
        name: '',
        description: '',
        category: '',
        base_price: 0,
        preparation_time: 0,
        applicable_locations: [selectedLocationType],
        allergens: [],
        modifiers: [],
        customizable: false,
        popularity_score: 5
      }
    );

    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{item ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Item Name</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {menuCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="base_price">Base Price ($)</Label>
                <Input
                  id="base_price"
                  type="number"
                  step="0.01"
                  value={formData.base_price || 0}
                  onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="prep_time">Preparation Time (minutes)</Label>
                <Input
                  id="prep_time"
                  type="number"
                  value={formData.preparation_time || 0}
                  onChange={(e) => setFormData({ ...formData, preparation_time: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <Label>Applicable Location Types</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {locationTypes.map((type) => (
                  <Badge
                    key={type.id}
                    variant={formData.applicable_locations?.includes(type.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      const current = formData.applicable_locations || [];
                      const updated = current.includes(type.id)
                        ? current.filter(id => id !== type.id)
                        : [...current, type.id];
                      setFormData({ ...formData, applicable_locations: updated });
                    }}
                  >
                    {type.icon}
                    <span className="ml-1">{type.name}</span>
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Location-Specific Pricing</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {locationTypes.map((type) => (
                  <div key={type.id} className="flex items-center space-x-2">
                    <Label className="w-20">{type.name}:</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder={formData.base_price?.toString() || '0'}
                      value={formData.location_pricing?.[type.id] || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        location_pricing: {
                          ...formData.location_pricing,
                          [type.id]: parseFloat(e.target.value) || formData.base_price || 0
                        }
                      })}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.customizable || false}
                onCheckedChange={(checked) => setFormData({ ...formData, customizable: checked })}
              />
              <Label>Allow Customization</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={() => onSave(formData as MenuItem)}>
                <Save className="h-4 w-4 mr-2" />
                Save Item
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6">
      {/* Location Type Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ChefHat className="h-5 w-5" />
            <span>Location-Sensitive Menu Builder</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-4">
            {locationTypes.map((type) => (
              <Button
                key={type.id}
                variant={selectedLocationType === type.id ? "default" : "outline"}
                className="flex items-center space-x-2"
                onClick={() => setSelectedLocationType(type.id)}
              >
                {type.icon}
                <span>{type.name}</span>
              </Button>
            ))}
          </div>

          {selectedLocationType && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">
                {getLocationTypeConfig(selectedLocationType)?.name} Configuration
              </h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Focus:</span>
                  <Badge variant="outline" className="ml-2">
                    {getLocationTypeConfig(selectedLocationType)?.preparation_focus}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Categories:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {getLocationTypeConfig(selectedLocationType)?.categories.map((cat, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Typical Items:</span>
                  <div className="text-xs text-gray-600 mt-1">
                    {getLocationTypeConfig(selectedLocationType)?.typical_items.join(', ')}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Menu Items Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Menu Items for {getLocationTypeConfig(selectedLocationType)?.name}</CardTitle>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setMenuPreview(menuPreview === 'current' ? 'customer' : 'current')}
              >
                {menuPreview === 'current' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {menuPreview === 'current' ? 'Customer View' : 'Management View'}
              </Button>
              <Button size="sm" onClick={() => setShowItemDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentMenu.map((item) => (
              <div key={item.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium">{item.name}</h4>
                      <Badge variant={item.availability[selectedLocationType]?.enabled ? "default" : "secondary"}>
                        {item.availability[selectedLocationType]?.enabled ? 'Available' : 'Unavailable'}
                      </Badge>
                      {item.customizable && (
                        <Badge variant="outline">Customizable</Badge>
                      )}
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-gray-500" />
                        <span className="text-xs text-gray-500">{item.preparation_time}min</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-3 w-3 text-green-600" />
                        <span className="font-medium">
                          ${item.location_pricing[selectedLocationType]?.toFixed(2) || item.base_price.toFixed(2)}
                        </span>
                        {item.location_pricing[selectedLocationType] !== item.base_price && (
                          <span className="text-xs text-gray-500">
                            (Base: ${item.base_price.toFixed(2)})
                          </span>
                        )}
                      </div>
                      
                      {item.availability[selectedLocationType]?.stock_level !== undefined && (
                        <div className="flex items-center space-x-1">
                          <Package className="h-3 w-3 text-blue-600" />
                          <span>Stock: {item.availability[selectedLocationType].stock_level}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-1">
                        <span className="text-xs">Popularity:</span>
                        <Badge variant="outline">{item.popularity_score}/10</Badge>
                      </div>
                    </div>

                    {item.allergens.length > 0 && (
                      <div className="flex items-center space-x-2 mt-2">
                        <AlertTriangle className="h-3 w-3 text-yellow-600" />
                        <span className="text-xs text-yellow-600">
                          Contains: {item.allergens.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingItem(item);
                        setShowItemDialog(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {showItemDialog && (
        <ItemDialog
          item={editingItem}
          onSave={(item) => {
            // Handle save logic here
            setShowItemDialog(false);
            setEditingItem(null);
          }}
          onClose={() => {
            setShowItemDialog(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}