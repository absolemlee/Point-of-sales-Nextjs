'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  DollarSign, 
  CreditCard, 
  Users, 
  Clock, 
  Shield, 
  Printer, 
  Wifi,
  Monitor,
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Key,
  MapPin,
  Package,
  Receipt,
  Smartphone
} from 'lucide-react';

interface LocationConfig {
  id: string;
  name: string;
  type: 'cafe' | 'restaurant' | 'quick_service' | 'retail' | 'kiosk';
  address: string;
  timezone: string;
  
  // Financial Settings
  tax_rate: number;
  service_charge: number;
  tip_options: number[];
  currency: string;
  
  // Payment Settings
  payment_methods: {
    cash: boolean;
    credit_card: boolean;
    debit_card: boolean;
    mobile_pay: boolean;
    gift_cards: boolean;
    cryptocurrency: boolean;
  };
  
  // Operational Settings
  operating_hours: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
  break_schedules: {
    break_duration: number;
    max_concurrent_breaks: number;
    required_coverage: number;
  };
  
  // Security & Access
  manager_overrides: {
    void_transactions: boolean;
    refunds: boolean;
    discounts: boolean;
    price_changes: boolean;
    cash_drawer: boolean;
  };
  access_levels: {
    [key: string]: string[];
  };
  
  // Hardware Settings
  hardware: {
    receipt_printer: { enabled: boolean; ip?: string; model?: string };
    cash_drawer: { enabled: boolean; auto_open?: boolean };
    barcode_scanner: { enabled: boolean; model?: string };
    customer_display: { enabled: boolean; show_prices?: boolean };
    kitchen_printer: { enabled: boolean; ip?: string };
  };
  
  // POS Interface Settings
  interface: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    quick_buttons: string[];
    default_view: 'grid' | 'list';
    item_images: boolean;
    sound_effects: boolean;
  };
  
  // Inventory & Menu
  inventory: {
    low_stock_threshold: number;
    auto_disable_items: boolean;
    cost_tracking: boolean;
    waste_tracking: boolean;
  };
  
  // Reporting
  reporting: {
    daily_reports: boolean;
    shift_reports: boolean;
    email_reports: string[];
    backup_frequency: 'hourly' | 'daily' | 'weekly';
  };
}

export function POSConfigurationPanel() {
  const [config, setConfig] = useState<LocationConfig>({
    id: 'loc-1',
    name: 'Downtown Café',
    type: 'cafe',
    address: '123 Main St, Downtown',
    timezone: 'America/New_York',
    
    tax_rate: 8.5,
    service_charge: 0,
    tip_options: [15, 18, 20, 25],
    currency: 'USD',
    
    payment_methods: {
      cash: true,
      credit_card: true,
      debit_card: true,
      mobile_pay: true,
      gift_cards: false,
      cryptocurrency: false
    },
    
    operating_hours: {
      monday: { open: '07:00', close: '19:00', closed: false },
      tuesday: { open: '07:00', close: '19:00', closed: false },
      wednesday: { open: '07:00', close: '19:00', closed: false },
      thursday: { open: '07:00', close: '19:00', closed: false },
      friday: { open: '07:00', close: '21:00', closed: false },
      saturday: { open: '08:00', close: '21:00', closed: false },
      sunday: { open: '08:00', close: '18:00', closed: false }
    },
    
    break_schedules: {
      break_duration: 15,
      max_concurrent_breaks: 1,
      required_coverage: 2
    },
    
    manager_overrides: {
      void_transactions: true,
      refunds: true,
      discounts: false,
      price_changes: true,
      cash_drawer: true
    },
    
    access_levels: {
      cashier: ['process_sales', 'view_menu', 'clock_management'],
      supervisor: ['process_sales', 'view_menu', 'clock_management', 'void_transactions', 'basic_reports'],
      manager: ['all_operations', 'staff_management', 'reports', 'configuration'],
      admin: ['system_admin', 'all_locations', 'user_management']
    },
    
    hardware: {
      receipt_printer: { enabled: true, ip: '192.168.1.100', model: 'Epson TM-T88V' },
      cash_drawer: { enabled: true, auto_open: true },
      barcode_scanner: { enabled: false, model: '' },
      customer_display: { enabled: false, show_prices: true },
      kitchen_printer: { enabled: false, ip: '' }
    },
    
    interface: {
      theme: 'light',
      language: 'en',
      quick_buttons: ['americano', 'latte', 'croissant', 'void'],
      default_view: 'grid',
      item_images: true,
      sound_effects: true
    },
    
    inventory: {
      low_stock_threshold: 10,
      auto_disable_items: true,
      cost_tracking: true,
      waste_tracking: false
    },
    
    reporting: {
      daily_reports: true,
      shift_reports: true,
      email_reports: ['manager@cafe.com'],
      backup_frequency: 'daily'
    }
  });

  const [activeSection, setActiveSection] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);

  const updateConfig = (section: string, field: string, value: any) => {
    setConfig(prev => {
      const currentSection = prev[section as keyof LocationConfig];
      const sectionUpdate = typeof currentSection === 'object' && currentSection !== null 
        ? { ...currentSection, [field]: value }
        : { [field]: value };
      
      return {
        ...prev,
        [section]: sectionUpdate
      };
    });
    setHasChanges(true);
  };

  const updateRootConfig = (field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const saveConfiguration = () => {
    // Save configuration logic here
    console.log('Saving configuration:', config);
    setHasChanges(false);
  };

  const resetConfiguration = () => {
    // Reset to defaults logic here
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Settings className="h-6 w-6" />
              <div>
                <CardTitle>POS Configuration Center</CardTitle>
                <p className="text-sm text-gray-600">Complete location and system settings</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {hasChanges && (
                <Badge variant="destructive" className="flex items-center space-x-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>Unsaved Changes</span>
                </Badge>
              )}
              <Button variant="outline" onClick={resetConfiguration}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button onClick={saveConfiguration} disabled={!hasChanges}>
                <Save className="h-4 w-4 mr-2" />
                Save Configuration
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Configuration Tabs */}
      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="hardware">Hardware</TabsTrigger>
          <TabsTrigger value="interface">Interface</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Location Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location-name">Location Name</Label>
                  <Input
                    id="location-name"
                    value={config.name}
                    onChange={(e) => updateRootConfig('name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="location-type">Location Type</Label>
                  <Select value={config.type} onValueChange={(value) => updateRootConfig('type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cafe">Café</SelectItem>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="quick_service">Quick Service</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="kiosk">Kiosk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={config.address}
                  onChange={(e) => updateRootConfig('address', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={config.timezone} onValueChange={(value) => updateRootConfig('timezone', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Operating Hours</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(config.operating_hours).map(([day, hours]) => (
                  <div key={day} className="flex items-center space-x-4">
                    <div className="w-20 font-medium capitalize">{day}</div>
                    <Switch
                      checked={!hours.closed}
                      onCheckedChange={(checked) =>
                        updateConfig('operating_hours', day, { ...hours, closed: !checked })
                      }
                    />
                    {!hours.closed && (
                      <>
                        <Input
                          type="time"
                          value={hours.open}
                          onChange={(e) =>
                            updateConfig('operating_hours', day, { ...hours, open: e.target.value })
                          }
                          className="w-32"
                        />
                        <span>to</span>
                        <Input
                          type="time"
                          value={hours.close}
                          onChange={(e) =>
                            updateConfig('operating_hours', day, { ...hours, close: e.target.value })
                          }
                          className="w-32"
                        />
                      </>
                    )}
                    {hours.closed && (
                      <Badge variant="secondary">Closed</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Pricing & Tax Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                  <Input
                    id="tax-rate"
                    type="number"
                    step="0.01"
                    value={config.tax_rate}
                    onChange={(e) => updateRootConfig('tax_rate', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="service-charge">Service Charge (%)</Label>
                  <Input
                    id="service-charge"
                    type="number"
                    step="0.01"
                    value={config.service_charge}
                    onChange={(e) => updateRootConfig('service_charge', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={config.currency} onValueChange={(value) => updateRootConfig('currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Payment Methods</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(config.payment_methods).map(([method, enabled]) => (
                  <div key={method} className="flex items-center justify-between">
                    <Label className="capitalize">{method.replace('_', ' ')}</Label>
                    <Switch
                      checked={enabled}
                      onCheckedChange={(checked) =>
                        updateConfig('payment_methods', method, checked)
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Staff & Break Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="break-duration">Break Duration (minutes)</Label>
                  <Input
                    id="break-duration"
                    type="number"
                    value={config.break_schedules.break_duration}
                    onChange={(e) =>
                      updateConfig('break_schedules', 'break_duration', parseInt(e.target.value))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="max-breaks">Max Concurrent Breaks</Label>
                  <Input
                    id="max-breaks"
                    type="number"
                    value={config.break_schedules.max_concurrent_breaks}
                    onChange={(e) =>
                      updateConfig('break_schedules', 'max_concurrent_breaks', parseInt(e.target.value))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="required-coverage">Required Coverage</Label>
                  <Input
                    id="required-coverage"
                    type="number"
                    value={config.break_schedules.required_coverage}
                    onChange={(e) =>
                      updateConfig('break_schedules', 'required_coverage', parseInt(e.target.value))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Inventory Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="low-stock">Low Stock Threshold</Label>
                  <Input
                    id="low-stock"
                    type="number"
                    value={config.inventory.low_stock_threshold}
                    onChange={(e) =>
                      updateConfig('inventory', 'low_stock_threshold', parseInt(e.target.value))
                    }
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Auto-disable out of stock items</Label>
                    <Switch
                      checked={config.inventory.auto_disable_items}
                      onCheckedChange={(checked) =>
                        updateConfig('inventory', 'auto_disable_items', checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Cost tracking</Label>
                    <Switch
                      checked={config.inventory.cost_tracking}
                      onCheckedChange={(checked) =>
                        updateConfig('inventory', 'cost_tracking', checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Waste tracking</Label>
                    <Switch
                      checked={config.inventory.waste_tracking}
                      onCheckedChange={(checked) =>
                        updateConfig('inventory', 'waste_tracking', checked)
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Manager Override Requirements</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(config.manager_overrides).map(([action, required]) => (
                  <div key={action} className="flex items-center justify-between">
                    <Label className="capitalize">{action.replace('_', ' ')}</Label>
                    <Switch
                      checked={required}
                      onCheckedChange={(checked) =>
                        updateConfig('manager_overrides', action, checked)
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <span>Access Level Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(config.access_levels).map(([role, permissions]) => (
                  <div key={role} className="p-3 border rounded-lg">
                    <div className="font-medium capitalize mb-2">{role}</div>
                    <div className="flex flex-wrap gap-2">
                      {permissions.map((permission, idx) => (
                        <Badge key={idx} variant="outline">
                          {permission.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hardware" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Printer className="h-5 w-5" />
                <span>Hardware Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(config.hardware).map(([device, settings]) => (
                <div key={device} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium capitalize">{device.replace('_', ' ')}</h4>
                    <Switch
                      checked={settings.enabled}
                      onCheckedChange={(checked) =>
                        updateConfig('hardware', device, { ...settings, enabled: checked })
                      }
                    />
                  </div>
                  {settings.enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      {'ip' in settings && settings.ip !== undefined && (
                        <div>
                          <Label>IP Address</Label>
                          <Input
                            value={settings.ip}
                            onChange={(e) =>
                              updateConfig('hardware', device, { ...settings, ip: e.target.value })
                            }
                          />
                        </div>
                      )}
                      {'model' in settings && settings.model !== undefined && (
                        <div>
                          <Label>Model</Label>
                          <Input
                            value={settings.model}
                            onChange={(e) =>
                              updateConfig('hardware', device, { ...settings, model: e.target.value })
                            }
                          />
                        </div>
                      )}
                      {'auto_open' in settings && settings.auto_open !== undefined && (
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={settings.auto_open}
                            onCheckedChange={(checked) =>
                              updateConfig('hardware', device, { ...settings, auto_open: checked })
                            }
                          />
                          <Label>Auto-open</Label>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interface" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Monitor className="h-5 w-5" />
                <span>POS Interface Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Theme</Label>
                  <Select
                    value={config.interface.theme}
                    onValueChange={(value) => updateConfig('interface', 'theme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Default View</Label>
                  <Select
                    value={config.interface.default_view}
                    onValueChange={(value) => updateConfig('interface', 'default_view', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Grid</SelectItem>
                      <SelectItem value="list">List</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Show item images</Label>
                  <Switch
                    checked={config.interface.item_images}
                    onCheckedChange={(checked) =>
                      updateConfig('interface', 'item_images', checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Sound effects</Label>
                  <Switch
                    checked={config.interface.sound_effects}
                    onCheckedChange={(checked) =>
                      updateConfig('interface', 'sound_effects', checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}